// vov-comments worker - anonymous comments + discussions + newsletter backend for virtueofvague.com.
//
// Routes:
//   Comments (per post)
//     POST   /api/comments                          submit a comment
//     GET    /api/comments?post=<slug>              list visible comments for a post
//   Discussions (forum threads)
//     POST   /api/threads                           create a thread
//     GET    /api/threads                           list threads (sorted by reply count desc)
//     GET    /api/threads/:id                       fetch one thread + its replies (tree)
//   Newsletter (single opt-in)
//     POST   /api/subscribe                         subscribe an email
//     GET    /api/unsubscribe?token=<id>            soft-unsubscribe an email
//   Admin (bearer auth)
//     GET    /api/admin/comments                    list ALL comments (any status)
//     POST   /api/admin/comments/:id/status         update comment status
//     DELETE /api/admin/comments/:id                hard-delete a comment
//     GET    /api/admin/threads                     list ALL threads (any status)
//     POST   /api/admin/threads/:id/status          update thread status
//     DELETE /api/admin/threads/:id                 hard-delete a thread (and its replies)
//     GET    /api/admin/subscribers                 list all subscribers
//     POST   /api/admin/subscribers/:id/status      change subscriber status
//     DELETE /api/admin/subscribers/:id             hard-delete a subscriber
//
// Thread replies are stored in the `comments` table with post_slug = 'thread-<id>',
// so the same anti-abuse pipeline + nesting cap applies to them.
//
// Defense layers (in order on POST):
//   1. CORS origin allow-list
//   2. Body parsing + field validation (length, type, <=2 URLs)
//   3. Turnstile token verification
//   4. Per-IP rate limits (5min per-post, 1hr global, 24hr global)
//   5. Parent lookup for nesting cap (max depth 3 = level 4)
//   6. Plain-text sanitization (strip HTML tags, normalize whitespace)
//   7. IP hashed with secret salt before storage (no raw IPs persisted)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    try {
      // Public endpoints
      if (url.pathname === '/api/comments' && request.method === 'POST') {
        return await handleSubmit(request, env, cors);
      }
      if (url.pathname === '/api/comments' && request.method === 'GET') {
        return await handleList(request, env, cors);
      }

      // Newsletter endpoints (public)
      if (url.pathname === '/api/subscribe' && request.method === 'POST') {
        return await handleSubscribe(request, env, cors);
      }
      if (url.pathname === '/api/unsubscribe' && request.method === 'GET') {
        return await handleUnsubscribe(request, env, cors);
      }

      // Thread endpoints (public)
      if (url.pathname === '/api/threads' && request.method === 'POST') {
        return await handleThreadCreate(request, env, cors);
      }
      if (url.pathname === '/api/threads' && request.method === 'GET') {
        return await handleThreadList(request, env, cors);
      }
      const threadGetMatch = url.pathname.match(/^\/api\/threads\/(\d+)$/);
      if (threadGetMatch && request.method === 'GET') {
        return await handleThreadGet(request, env, cors, parseInt(threadGetMatch[1], 10));
      }

      // Admin endpoints
      if (url.pathname === '/api/admin/comments' && request.method === 'GET') {
        return await handleAdminList(request, env, cors);
      }
      const statusMatch = url.pathname.match(/^\/api\/admin\/comments\/(\d+)\/status$/);
      if (statusMatch && request.method === 'POST') {
        return await handleAdminStatus(request, env, cors, parseInt(statusMatch[1], 10));
      }
      const deleteMatch = url.pathname.match(/^\/api\/admin\/comments\/(\d+)$/);
      if (deleteMatch && request.method === 'DELETE') {
        return await handleAdminDelete(request, env, cors, parseInt(deleteMatch[1], 10));
      }
      if (url.pathname === '/api/admin/threads' && request.method === 'GET') {
        return await handleAdminThreadList(request, env, cors);
      }
      const threadStatusMatch = url.pathname.match(/^\/api\/admin\/threads\/(\d+)\/status$/);
      if (threadStatusMatch && request.method === 'POST') {
        return await handleAdminThreadStatus(request, env, cors, parseInt(threadStatusMatch[1], 10));
      }
      const threadDeleteMatch = url.pathname.match(/^\/api\/admin\/threads\/(\d+)$/);
      if (threadDeleteMatch && request.method === 'DELETE') {
        return await handleAdminThreadDelete(request, env, cors, parseInt(threadDeleteMatch[1], 10));
      }
      if (url.pathname === '/api/admin/subscribers' && request.method === 'GET') {
        return await handleAdminSubscribersList(request, env, cors);
      }
      const subStatusMatch = url.pathname.match(/^\/api\/admin\/subscribers\/(\d+)\/status$/);
      if (subStatusMatch && request.method === 'POST') {
        return await handleAdminSubscribersStatus(request, env, cors, parseInt(subStatusMatch[1], 10));
      }
      const subDeleteMatch = url.pathname.match(/^\/api\/admin\/subscribers\/(\d+)$/);
      if (subDeleteMatch && request.method === 'DELETE') {
        return await handleAdminSubscribersDelete(request, env, cors, parseInt(subDeleteMatch[1], 10));
      }

      // Health
      if (url.pathname === '/api/health') {
        return json({ ok: true }, 200, cors);
      }

      return json({ error: 'not_found' }, 404, cors);
    } catch (e) {
      return json({ error: 'server_error', detail: String(e && e.message || e) }, 500, cors);
    }
  },
};

// --- Submit ---------------------------------------------------------------

async function handleSubmit(request, env, cors) {
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return json({ error: 'bad_content_type' }, 415, cors);
  }
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'bad_json' }, 400, cors); }

  const name = sanitizeText(payload.name || '', parseInt(env.MAX_NAME_LENGTH, 10));
  const body = sanitizeText(payload.body || '', parseInt(env.MAX_BODY_LENGTH, 10));
  const postSlug = typeof payload.post_slug === 'string'
    ? payload.post_slug.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 80)
    : '';
  const parentId = Number.isInteger(payload.parent_id) ? payload.parent_id : null;
  const turnstileToken = typeof payload.turnstile_token === 'string' ? payload.turnstile_token : '';

  if (!name) return json({ error: 'name_required' }, 400, cors);
  if (!body) return json({ error: 'body_required' }, 400, cors);
  if (!postSlug) return json({ error: 'post_slug_required' }, 400, cors);
  if (countUrls(body) > parseInt(env.MAX_URLS, 10)) {
    return json({ error: 'too_many_links' }, 400, cors);
  }

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';

  if (!turnstileToken) return json({ error: 'turnstile_required' }, 400, cors);
  const ok = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);
  if (!ok) return json({ error: 'turnstile_failed' }, 403, cors);

  const ipHash = await sha256(`${ip}:${env.IP_SALT}`);

  const rl = await checkAndIncrementRateLimit(env, ipHash, postSlug);
  if (!rl.allowed) return json({ error: 'rate_limited', window: rl.window }, 429, cors);

  let depth = 0;
  if (parentId) {
    const parent = await env.DB.prepare(
      'SELECT id, depth, post_slug FROM comments WHERE id = ? AND status = ?'
    ).bind(parentId, 'visible').first();
    if (!parent) return json({ error: 'parent_not_found' }, 400, cors);
    if (parent.post_slug !== postSlug) return json({ error: 'parent_mismatch' }, 400, cors);
    depth = parent.depth + 1;
    if (depth > parseInt(env.MAX_DEPTH, 10)) {
      return json({ error: 'nesting_too_deep' }, 400, cors);
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const result = await env.DB.prepare(
    'INSERT INTO comments (post_slug, name, body, ip_hash, parent_id, depth, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(postSlug, name, body, ipHash, parentId, depth, 'visible', now).run();

  return json({
    id: result.meta.last_row_id,
    post_slug: postSlug,
    name,
    body,
    parent_id: parentId,
    depth,
    status: 'visible',
    created_at: now,
  }, 201, cors);
}

// --- List (public) --------------------------------------------------------

async function handleList(request, env, cors) {
  const url = new URL(request.url);
  const postSlug = (url.searchParams.get('post') || '').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 80);
  if (!postSlug) return json({ error: 'post_required' }, 400, cors);

  const rows = await env.DB.prepare(
    'SELECT id, name, body, parent_id, depth, created_at FROM comments WHERE post_slug = ? AND status = ? ORDER BY created_at ASC'
  ).bind(postSlug, 'visible').all();

  return json({ post_slug: postSlug, comments: rows.results || [] }, 200, cors);
}

// --- Newsletter (public) --------------------------------------------------

async function handleSubscribe(request, env, cors) {
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return json({ error: 'bad_content_type' }, 415, cors);
  }
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'bad_json' }, 400, cors); }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase().slice(0, 254) : '';
  const source = typeof payload.source === 'string' ? payload.source.replace(/[^a-zA-Z0-9_:\-]/g, '').slice(0, 80) : '';
  const turnstileToken = typeof payload.turnstile_token === 'string' ? payload.turnstile_token : '';

  if (!isValidEmail(email)) return json({ error: 'invalid_email' }, 400, cors);

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';

  if (!turnstileToken) return json({ error: 'turnstile_required' }, 400, cors);
  const ok = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);
  if (!ok) return json({ error: 'turnstile_failed' }, 403, cors);

  const ipHash = await sha256(`${ip}:${env.IP_SALT}`);

  // Per-IP rate limit: 3 signups per hour, 5 per day (low ceiling — most people sub once).
  const rl = await checkAndIncrementSubscribeRateLimit(env, ipHash);
  if (!rl.allowed) return json({ error: 'rate_limited', window: rl.window }, 429, cors);

  const now = Math.floor(Date.now() / 1000);

  // Try insert; if duplicate email, surface a friendly result instead of error.
  try {
    const result = await env.DB.prepare(
      "INSERT INTO subscribers (email, status, ip_hash, source, created_at) VALUES (?, 'active', ?, ?, ?)"
    ).bind(email, ipHash, source || null, now).run();
    return json({ id: result.meta.last_row_id, status: 'subscribed' }, 201, cors);
  } catch (e) {
    // Unique-index violation = email already subscribed. Idempotent success.
    if (String(e.message || '').toLowerCase().includes('unique')) {
      // If they were unsubscribed, reactivate.
      await env.DB.prepare(
        "UPDATE subscribers SET status = 'active', unsubscribed_at = NULL WHERE LOWER(email) = ?"
      ).bind(email).run();
      return json({ status: 'already_subscribed' }, 200, cors);
    }
    throw e;
  }
}

async function handleUnsubscribe(request, env, cors) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  // Token is just the subscriber id for now (single-opt-in, low security). Could swap for HMAC later.
  const id = parseInt(token, 10);
  if (!Number.isFinite(id) || id <= 0) return json({ error: 'invalid_token' }, 400, cors);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    "UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ? WHERE id = ?"
  ).bind(now, id).run();
  return json({ status: 'unsubscribed' }, 200, cors);
}

async function checkAndIncrementSubscribeRateLimit(env, ipHash) {
  const buckets = [
    { key: `rl:sub:1h:${ipHash}`,  ttl: 3600,  max: 3, window: '1hour'  },
    { key: `rl:sub:24h:${ipHash}`, ttl: 86400, max: 5, window: '24hour' },
  ];
  for (const b of buckets) {
    const cur = parseInt(await env.VOV_RATELIMIT.get(b.key), 10) || 0;
    if (cur >= b.max) return { allowed: false, window: b.window };
  }
  for (const b of buckets) {
    const cur = parseInt(await env.VOV_RATELIMIT.get(b.key), 10) || 0;
    await env.VOV_RATELIMIT.put(b.key, String(cur + 1), { expirationTtl: b.ttl });
  }
  return { allowed: true };
}

function isValidEmail(s) {
  // Permissive RFC-ish check; the real validation is delivery succeeding.
  return typeof s === 'string'
    && s.length >= 5 && s.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// --- Threads (public) -----------------------------------------------------

async function handleThreadCreate(request, env, cors) {
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return json({ error: 'bad_content_type' }, 415, cors);
  }
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'bad_json' }, 400, cors); }

  const title = sanitizeText(payload.title || '', 120);
  const name = sanitizeText(payload.name || '', parseInt(env.MAX_NAME_LENGTH, 10));
  const body = sanitizeText(payload.body || '', parseInt(env.MAX_BODY_LENGTH, 10));
  const turnstileToken = typeof payload.turnstile_token === 'string' ? payload.turnstile_token : '';

  if (!title) return json({ error: 'title_required' }, 400, cors);
  if (!name)  return json({ error: 'name_required' }, 400, cors);
  if (!body)  return json({ error: 'body_required' }, 400, cors);
  if (countUrls(body) > parseInt(env.MAX_URLS, 10)) {
    return json({ error: 'too_many_links' }, 400, cors);
  }

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';

  if (!turnstileToken) return json({ error: 'turnstile_required' }, 400, cors);
  const ok = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);
  if (!ok) return json({ error: 'turnstile_failed' }, 403, cors);

  const ipHash = await sha256(`${ip}:${env.IP_SALT}`);

  const rl = await checkAndIncrementThreadRateLimit(env, ipHash);
  if (!rl.allowed) return json({ error: 'rate_limited', window: rl.window }, 429, cors);

  const now = Math.floor(Date.now() / 1000);
  const result = await env.DB.prepare(
    'INSERT INTO threads (title, name, body, ip_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(title, name, body, ipHash, 'visible', now).run();

  return json({
    id: result.meta.last_row_id,
    title, name, body,
    reply_count: 0,
    last_reply_at: null,
    status: 'visible',
    created_at: now,
  }, 201, cors);
}

async function handleThreadList(request, env, cors) {
  // Compute reply_count and last_reply_at on the fly (low volume).
  // Sort by reply_count DESC, then created_at DESC.
  const sql = `
    SELECT
      t.id, t.title, t.name, t.body, t.created_at,
      (SELECT COUNT(*) FROM comments c
        WHERE c.post_slug = 'thread-' || t.id AND c.status = 'visible') AS reply_count,
      (SELECT MAX(c.created_at) FROM comments c
        WHERE c.post_slug = 'thread-' || t.id AND c.status = 'visible') AS last_reply_at
    FROM threads t
    WHERE t.status = 'visible'
    ORDER BY reply_count DESC, t.created_at DESC
    LIMIT 200
  `;
  const rows = await env.DB.prepare(sql).all();
  return json({ threads: rows.results || [] }, 200, cors);
}

async function handleThreadGet(request, env, cors, id) {
  const t = await env.DB.prepare(
    'SELECT id, title, name, body, status, created_at FROM threads WHERE id = ?'
  ).bind(id).first();
  if (!t || t.status !== 'visible') return json({ error: 'thread_not_found' }, 404, cors);

  const replies = await env.DB.prepare(
    'SELECT id, name, body, parent_id, depth, created_at FROM comments WHERE post_slug = ? AND status = ? ORDER BY created_at ASC'
  ).bind(`thread-${id}`, 'visible').all();

  return json({
    thread: {
      id: t.id,
      title: t.title,
      name: t.name,
      body: t.body,
      created_at: t.created_at,
    },
    replies: replies.results || [],
  }, 200, cors);
}

async function checkAndIncrementThreadRateLimit(env, ipHash) {
  const buckets = [
    { key: `rl:thread:1h:${ipHash}`,  ttl: 3600,  max: parseInt(env.RATE_LIMIT_THREAD_1H, 10),  window: '1hour'  },
    { key: `rl:thread:24h:${ipHash}`, ttl: 86400, max: parseInt(env.RATE_LIMIT_THREAD_24H, 10), window: '24hour' },
  ];
  for (const b of buckets) {
    const cur = parseInt(await env.VOV_RATELIMIT.get(b.key), 10) || 0;
    if (cur >= b.max) return { allowed: false, window: b.window };
  }
  for (const b of buckets) {
    const cur = parseInt(await env.VOV_RATELIMIT.get(b.key), 10) || 0;
    await env.VOV_RATELIMIT.put(b.key, String(cur + 1), { expirationTtl: b.ttl });
  }
  return { allowed: true };
}

// --- Admin ----------------------------------------------------------------

function adminAuthOk(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/);
  if (!m) return false;
  return constantTimeEqual(m[1], env.ADMIN_TOKEN);
}

async function handleAdminList(request, env, cors) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const post = url.searchParams.get('post');

  let sql = 'SELECT id, post_slug, name, body, parent_id, depth, status, created_at FROM comments';
  const where = [];
  const args = [];
  if (status) { where.push('status = ?'); args.push(status); }
  if (post)   { where.push('post_slug = ?'); args.push(post); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY created_at DESC LIMIT 500';

  const stmt = env.DB.prepare(sql);
  const rows = args.length ? await stmt.bind(...args).all() : await stmt.all();
  return json({ comments: rows.results || [] }, 200, cors);
}

async function handleAdminStatus(request, env, cors, id) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'bad_json' }, 400, cors); }
  const status = payload.status;
  if (!['visible', 'hidden', 'spam'].includes(status)) {
    return json({ error: 'bad_status' }, 400, cors);
  }
  await env.DB.prepare('UPDATE comments SET status = ? WHERE id = ?').bind(status, id).run();
  return json({ id, status }, 200, cors);
}

async function handleAdminDelete(request, env, cors, id) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  return json({ id, deleted: true }, 200, cors);
}

async function handleAdminThreadList(request, env, cors) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  let sql = `
    SELECT
      t.id, t.title, t.name, t.body, t.status, t.created_at,
      (SELECT COUNT(*) FROM comments c
        WHERE c.post_slug = 'thread-' || t.id) AS reply_count
    FROM threads t
  `;
  const args = [];
  if (status) { sql += ' WHERE t.status = ?'; args.push(status); }
  sql += ' ORDER BY t.created_at DESC LIMIT 500';

  const stmt = env.DB.prepare(sql);
  const rows = args.length ? await stmt.bind(...args).all() : await stmt.all();
  return json({ threads: rows.results || [] }, 200, cors);
}

async function handleAdminThreadStatus(request, env, cors, id) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'bad_json' }, 400, cors); }
  const status = payload.status;
  if (!['visible', 'hidden', 'spam'].includes(status)) {
    return json({ error: 'bad_status' }, 400, cors);
  }
  await env.DB.prepare('UPDATE threads SET status = ? WHERE id = ?').bind(status, id).run();
  return json({ id, status }, 200, cors);
}

async function handleAdminThreadDelete(request, env, cors, id) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  // Delete replies first, then thread.
  await env.DB.prepare('DELETE FROM comments WHERE post_slug = ?').bind(`thread-${id}`).run();
  await env.DB.prepare('DELETE FROM threads WHERE id = ?').bind(id).run();
  return json({ id, deleted: true }, 200, cors);
}

async function handleAdminSubscribersList(request, env, cors) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  let sql = 'SELECT id, email, status, source, created_at, unsubscribed_at FROM subscribers';
  const args = [];
  if (status) { sql += ' WHERE status = ?'; args.push(status); }
  sql += ' ORDER BY created_at DESC LIMIT 1000';

  const stmt = env.DB.prepare(sql);
  const rows = args.length ? await stmt.bind(...args).all() : await stmt.all();
  return json({ subscribers: rows.results || [] }, 200, cors);
}

async function handleAdminSubscribersStatus(request, env, cors, id) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'bad_json' }, 400, cors); }
  const status = payload.status;
  if (!['active', 'unsubscribed', 'bounced'].includes(status)) {
    return json({ error: 'bad_status' }, 400, cors);
  }
  const now = Math.floor(Date.now() / 1000);
  if (status === 'unsubscribed' || status === 'bounced') {
    await env.DB.prepare('UPDATE subscribers SET status = ?, unsubscribed_at = ? WHERE id = ?').bind(status, now, id).run();
  } else {
    await env.DB.prepare('UPDATE subscribers SET status = ?, unsubscribed_at = NULL WHERE id = ?').bind(status, id).run();
  }
  return json({ id, status }, 200, cors);
}

async function handleAdminSubscribersDelete(request, env, cors, id) {
  if (!adminAuthOk(request, env)) return json({ error: 'unauthorized' }, 401, cors);
  await env.DB.prepare('DELETE FROM subscribers WHERE id = ?').bind(id).run();
  return json({ id, deleted: true }, 200, cors);
}

// --- Rate limiting (KV) ---------------------------------------------------

async function checkAndIncrementRateLimit(env, ipHash, postSlug) {
  const buckets = [
    { key: `rl:5m:${ipHash}:${postSlug}`, ttl: 300,   max: parseInt(env.RATE_LIMIT_5M_PER_POST, 10), window: '5min/post' },
    { key: `rl:1h:${ipHash}`,             ttl: 3600,  max: parseInt(env.RATE_LIMIT_1H, 10),         window: '1hour'      },
    { key: `rl:24h:${ipHash}`,            ttl: 86400, max: parseInt(env.RATE_LIMIT_24H, 10),        window: '24hour'     },
  ];

  for (const b of buckets) {
    const cur = parseInt(await env.VOV_RATELIMIT.get(b.key), 10) || 0;
    if (cur >= b.max) return { allowed: false, window: b.window };
  }
  for (const b of buckets) {
    const cur = parseInt(await env.VOV_RATELIMIT.get(b.key), 10) || 0;
    await env.VOV_RATELIMIT.put(b.key, String(cur + 1), { expirationTtl: b.ttl });
  }
  return { allowed: true };
}

// --- Turnstile ------------------------------------------------------------

async function verifyTurnstile(token, secret, ip) {
  if (!secret) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  if (!resp.ok) return false;
  const data = await resp.json();
  return data.success === true;
}

// --- Utilities ------------------------------------------------------------

function sanitizeText(s, maxLen) {
  if (typeof s !== 'string') return '';
  let t = s.replace(/<[^>]*>/g, '');
  // Strip control chars (keep tab=9 and LF=10).
  t = Array.from(t).filter(c => {
    const code = c.charCodeAt(0);
    return code === 9 || code === 10 || (code >= 32 && code !== 127);
  }).join('');
  t = t.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (t.length > maxLen) t = t.slice(0, maxLen);
  return t;
}

function countUrls(text) {
  const m = text.match(/https?:\/\/\S+/gi);
  return m ? m.length : 0;
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
  const allow = allowed.includes(origin) ? origin : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });
}
