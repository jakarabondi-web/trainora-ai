ALTER TABLE assessment_attempts ADD COLUMN competency_scores_json TEXT;
ALTER TABLE assessment_attempts ADD COLUMN percentile REAL;
ALTER TABLE assessment_attempts ADD COLUMN rank_band TEXT;
ALTER TABLE assessment_attempts ADD COLUMN completion_seconds INTEGER;
ALTER TABLE assessment_attempts ADD COLUMN flags_json TEXT;
ALTER TABLE applicants ADD COLUMN assessment_rank TEXT;
ALTER TABLE applicants ADD COLUMN assessment_percentile REAL;
ALTER TABLE applicants ADD COLUMN access_tier TEXT NOT NULL DEFAULT 'onboarding';

CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  auth_method TEXT NOT NULL,
  mfa_level TEXT NOT NULL DEFAULT 'single_factor',
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX auth_sessions_user_idx ON auth_sessions(user_id);
CREATE INDEX auth_sessions_token_idx ON auth_sessions(token_hash);
