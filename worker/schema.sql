-- D1 schema for vov-comments. Apply once with:
--   wrangler d1 execute vov-comments-db --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug   TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  body        TEXT    NOT NULL,
  ip_hash     TEXT    NOT NULL,
  parent_id   INTEGER,
  depth       INTEGER NOT NULL DEFAULT 0,
  status      TEXT    NOT NULL DEFAULT 'visible',  -- visible | hidden | spam
  created_at  INTEGER NOT NULL,                    -- unix epoch seconds
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post_status_created
  ON comments(post_slug, status, created_at);

CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON comments(parent_id);

-- Forum threads. Replies to a thread are stored in `comments` with
-- post_slug = 'thread-<thread_id>' — so the existing comment widget
-- (form, nesting cap, moderation) works unchanged for thread replies.

CREATE TABLE IF NOT EXISTS threads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  body        TEXT    NOT NULL,
  ip_hash     TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'visible',   -- visible | hidden | spam
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_threads_status_created
  ON threads(status, created_at DESC);

