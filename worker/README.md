# vov-comments worker

Anonymous comments backend for virtueofvague.com. Runs on Cloudflare Workers,
backed by D1 (SQLite) and KV (rate limit). Free tier covers far more traffic
than this site will ever see.

## One-time setup (after creating Worker, D1, KV, Turnstile in dashboard)

1. Install + auth wrangler (once globally):
   ```powershell
   npm install -g wrangler
   wrangler login
   ```

2. Apply the schema to the live D1 database:
   ```powershell
   wrangler d1 execute vov-comments-db --remote --file=schema.sql
   ```

3. Set the three secrets (interactive prompts, values never leave your machine):
   ```powershell
   wrangler secret put TURNSTILE_SECRET
   wrangler secret put ADMIN_TOKEN
   wrangler secret put IP_SALT
   ```

4. Deploy:
   ```powershell
   wrangler deploy
   ```

   First deploy publishes to:
   `https://vov-comments.virtueofvague.workers.dev`

5. Smoke test:
   ```powershell
   curl https://vov-comments.virtueofvague.workers.dev/api/health
   ```
   Expect `{"ok":true}`.

## Day-to-day

- View live logs:        `wrangler tail`
- Redeploy after edits:  `wrangler deploy`
- Query D1 from CLI:     `wrangler d1 execute vov-comments-db --remote --command="SELECT id, post_slug, name, status FROM comments ORDER BY id DESC LIMIT 20"`
- Rotate a secret:       `wrangler secret put TURNSTILE_SECRET` (overwrites)

## Endpoints

| Method | Path                                  | Auth | Purpose                       |
|--------|---------------------------------------|------|-------------------------------|
| POST   | `/api/comments`                       | -    | Submit a comment              |
| GET    | `/api/comments?post=<slug>`           | -    | List visible comments         |
| GET    | `/api/admin/comments`                 | Bearer | List all (any status)       |
| POST   | `/api/admin/comments/:id/status`      | Bearer | Set status (visible/hidden/spam) |
| DELETE | `/api/admin/comments/:id`             | Bearer | Hard-delete                   |
| GET    | `/api/health`                         | -    | Heartbeat                     |

## Rate limits (per-IP, hashed)

- 1 comment per post per 5 min
- 3 comments per hour (any post)
- 10 comments per 24 hours (any post)

Tunable in `wrangler.toml` `[vars]`.

## Spam / abuse defenses

- Cloudflare Turnstile (managed challenge) verified server-side
- Body capped at 2000 chars, name at 40
- More than 2 URLs in body -> rejected
- HTML tags stripped, control chars removed
- IPs hashed with `IP_SALT` before storage (no raw PII)
- 4-level nesting cap (depth 0..3)
- Admin auth via constant-time bearer compare
