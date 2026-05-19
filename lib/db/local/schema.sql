-- Local SQLite schema mirroring the Supabase schema.
-- Types are adapted for SQLite (TEXT for uuid/timestamptz, INTEGER for boolean/smallint).
-- users and sessions tables are local-only (Supabase uses auth.users).

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  ai_usage_this_month INTEGER DEFAULT 0,
  ai_usage_reset_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  title TEXT NOT NULL DEFAULT 'My Resume',
  raw_content TEXT NOT NULL DEFAULT '',
  template_id TEXT NOT NULL DEFAULT 'minimal',
  cloned_from_id TEXT REFERENCES resumes(id),
  is_public INTEGER DEFAULT 0,
  public_slug TEXT UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_model_stats (
  model_id TEXT NOT NULL PRIMARY KEY,
  provider TEXT NOT NULL,
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used TEXT NOT NULL DEFAULT (datetime('now')),
  suggestions_accepted INTEGER NOT NULL DEFAULT 0,
  suggestions_rejected INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mcp_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT
);

CREATE TABLE IF NOT EXISTS user_providers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  adapter_type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_preview TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
