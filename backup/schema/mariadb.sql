CREATE TABLE IF NOT EXISTS groups (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  owner_id VARCHAR(100) NOT NULL,
  state LONGTEXT NOT NULL,
  revision INT NOT NULL DEFAULT 1,
  created_at BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(100) PRIMARY KEY,
  group_id VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  name VARCHAR(70) NOT NULL,
  username VARCHAR(40) NOT NULL UNIQUE,
  email VARCHAR(120) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  player_id VARCHAR(100),
  active TINYINT NOT NULL DEFAULT 1,
  created_at BIGINT NOT NULL,
  avatar_updated_at BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT accounts_group_fk FOREIGN KEY (group_id) REFERENCES groups(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX IF NOT EXISTS accounts_group ON accounts(group_id);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL,
  expires_at BIGINT NOT NULL,
  CONSTRAINT sessions_account_fk FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(100) PRIMARY KEY,
  group_id VARCHAR(100) NOT NULL,
  account_id VARCHAR(100),
  kind VARCHAR(40) NOT NULL,
  body TEXT NOT NULL,
  match_id VARCHAR(100),
  created_at BIGINT NOT NULL,
  CONSTRAINT messages_group_fk FOREIGN KEY (group_id) REFERENCES groups(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX IF NOT EXISTS messages_group_time ON messages(group_id, created_at);

CREATE TABLE IF NOT EXISTS signals (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  group_id VARCHAR(100) NOT NULL,
  room VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  client VARCHAR(80) NOT NULL,
  type VARCHAR(20) NOT NULL,
  data TEXT,
  created_at BIGINT NOT NULL,
  CONSTRAINT signals_group_fk FOREIGN KEY (group_id) REFERENCES groups(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX IF NOT EXISTS signals_room ON signals(group_id, room, id);

CREATE TABLE IF NOT EXISTS tournament_history (
  group_id VARCHAR(100) NOT NULL,
  event_key VARCHAR(100) NOT NULL,
  name VARCHAR(80) NOT NULL,
  state LONGTEXT NOT NULL,
  ended_at BIGINT NOT NULL,
  PRIMARY KEY (group_id, event_key),
  CONSTRAINT tournament_history_group_fk FOREIGN KEY (group_id) REFERENCES groups(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_responses (
  group_id VARCHAR(100) NOT NULL,
  event_key VARCHAR(100) NOT NULL,
  player_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  reason VARCHAR(300) NOT NULL DEFAULT '',
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (group_id, event_key, player_id),
  CONSTRAINT event_responses_group_fk FOREIGN KEY (group_id) REFERENCES groups(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX IF NOT EXISTS event_responses_event ON event_responses(group_id, event_key);

CREATE TABLE IF NOT EXISTS practice_rooms (
  id VARCHAR(100) PRIMARY KEY,
  group_id VARCHAR(100) NOT NULL,
  creator_account_id VARCHAR(100) NOT NULL,
  opponent_account_id VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  state LONGTEXT,
  turn_account_id VARCHAR(100),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  CONSTRAINT practice_rooms_group_fk FOREIGN KEY (group_id) REFERENCES groups(id),
  CONSTRAINT practice_rooms_creator_fk FOREIGN KEY (creator_account_id) REFERENCES accounts(id),
  CONSTRAINT practice_rooms_opponent_fk FOREIGN KEY (opponent_account_id) REFERENCES accounts(id),
  CONSTRAINT practice_rooms_turn_fk FOREIGN KEY (turn_account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX IF NOT EXISTS idx_practice_rooms_group_updated ON practice_rooms(group_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_practice_rooms_opponent_status ON practice_rooms(opponent_account_id, status);

CREATE TABLE IF NOT EXISTS access_requests (
  id VARCHAR(100) PRIMARY KEY,
  group_id VARCHAR(100) NOT NULL,
  kind VARCHAR(30) NOT NULL,
  name VARCHAR(70) NOT NULL,
  username VARCHAR(40) NOT NULL DEFAULT '',
  email VARCHAR(120) NOT NULL DEFAULT '',
  phone VARCHAR(20) NOT NULL DEFAULT '',
  message VARCHAR(500) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  CONSTRAINT access_requests_group_fk FOREIGN KEY (group_id) REFERENCES groups(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX IF NOT EXISTS access_requests_group_status ON access_requests(group_id, status, created_at);
