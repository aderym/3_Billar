CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_id TEXT NOT NULL, state TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','player')), name TEXT NOT NULL, username TEXT NOT NULL UNIQUE, email TEXT UNIQUE, phone TEXT UNIQUE, password_hash TEXT NOT NULL, salt TEXT NOT NULL, player_id TEXT, active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, avatar_updated_at INTEGER NOT NULL DEFAULT 0, FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE INDEX IF NOT EXISTS accounts_group ON accounts(group_id);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, expires_at INTEGER NOT NULL, FOREIGN KEY(account_id) REFERENCES accounts(id));
CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id);
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, account_id TEXT, kind TEXT NOT NULL, body TEXT NOT NULL, match_id TEXT, created_at INTEGER NOT NULL, FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE INDEX IF NOT EXISTS messages_group_time ON messages(group_id,created_at);
CREATE TABLE IF NOT EXISTS signals (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id TEXT NOT NULL, room TEXT NOT NULL, role TEXT NOT NULL, client TEXT NOT NULL, type TEXT NOT NULL, data TEXT, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS signals_room ON signals(group_id,room,id);
CREATE TABLE IF NOT EXISTS tournament_history (group_id TEXT NOT NULL, event_key TEXT NOT NULL, name TEXT NOT NULL, state TEXT NOT NULL, ended_at INTEGER NOT NULL, PRIMARY KEY(group_id,event_key));
CREATE TABLE IF NOT EXISTS event_responses (group_id TEXT NOT NULL, event_key TEXT NOT NULL, player_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('accepted','declined')), reason TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL, PRIMARY KEY(group_id,event_key,player_id));
CREATE INDEX IF NOT EXISTS event_responses_event ON event_responses(group_id,event_key);
CREATE TABLE IF NOT EXISTS practice_rooms (id TEXT PRIMARY KEY NOT NULL, group_id TEXT NOT NULL, creator_account_id TEXT NOT NULL, opponent_account_id TEXT, status TEXT NOT NULL DEFAULT 'pending', state TEXT, turn_account_id TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, FOREIGN KEY(group_id) REFERENCES groups(id), FOREIGN KEY(creator_account_id) REFERENCES accounts(id), FOREIGN KEY(opponent_account_id) REFERENCES accounts(id), FOREIGN KEY(turn_account_id) REFERENCES accounts(id));
CREATE INDEX IF NOT EXISTS idx_practice_rooms_group_updated ON practice_rooms(group_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_practice_rooms_opponent_status ON practice_rooms(opponent_account_id, status);
CREATE TABLE IF NOT EXISTS access_requests (id TEXT PRIMARY KEY NOT NULL, group_id TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('player_signup','password_reset')), name TEXT NOT NULL, username TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','resolved','dismissed')), created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE INDEX IF NOT EXISTS access_requests_group_status ON access_requests(group_id,status,created_at);
-- Hidden owner record. Existing venue, player, match, and media rows are untouched.
INSERT OR IGNORE INTO groups (id,name,owner_id,state,revision,created_at)
VALUES ('__owner__','OSP owner','__owner__','{"name":"OSP owner","players":[],"tables":[],"rounds":[]}',1,0);
-- The owner account is provisioned by the application on first request.
CREATE TABLE IF NOT EXISTS billing_config (id INTEGER PRIMARY KEY CHECK(id=1), public_key TEXT NOT NULL DEFAULT '', secret_cipher TEXT NOT NULL DEFAULT '', webhook_cipher TEXT NOT NULL DEFAULT '', monthly_cents INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS venue_billing (group_id TEXT PRIMARY KEY, customer_id TEXT, subscription_id TEXT UNIQUE, status TEXT NOT NULL DEFAULT 'unpaid', current_period_end INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS billing_methods (id INTEGER PRIMARY KEY CHECK(id=1), direct_payment_url TEXT NOT NULL DEFAULT '', cashapp TEXT NOT NULL DEFAULT '', zelle TEXT NOT NULL DEFAULT '', payment_note TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO billing_methods (id,direct_payment_url,cashapp,zelle,payment_note,updated_at) VALUES (1,'','','','',0);
CREATE TABLE IF NOT EXISTS venue_access_control (group_id TEXT PRIMARY KEY, manual_state TEXT NOT NULL DEFAULT 'auto' CHECK(manual_state IN ('auto','active','inactive')), note TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL DEFAULT 0, FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE TABLE IF NOT EXISTS venue_admin_permissions (account_id TEXT PRIMARY KEY, group_id TEXT NOT NULL, can_manage_admins INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL DEFAULT 0, FOREIGN KEY(account_id) REFERENCES accounts(id), FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE INDEX IF NOT EXISTS venue_admin_permissions_group ON venue_admin_permissions(group_id);
CREATE TABLE IF NOT EXISTS venue_manual_terms (group_id TEXT PRIMARY KEY, access_until INTEGER NOT NULL DEFAULT 0, FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE TABLE IF NOT EXISTS venue_payments (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, method TEXT NOT NULL, amount_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'usd', paid_at INTEGER NOT NULL, period_end INTEGER NOT NULL DEFAULT 0, note TEXT NOT NULL DEFAULT '', stripe_invoice_id TEXT UNIQUE, receipt_url TEXT, FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE TABLE IF NOT EXISTS payment_proofs (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, account_id TEXT NOT NULL, method TEXT NOT NULL CHECK(method IN ('direct','cashapp','zelle')), amount_cents INTEGER NOT NULL DEFAULT 0, reference TEXT NOT NULL DEFAULT '', file_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','rejected')), submitted_at INTEGER NOT NULL, reviewed_at INTEGER NOT NULL DEFAULT 0, FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE INDEX IF NOT EXISTS payment_proofs_group_date ON payment_proofs(group_id,submitted_at DESC);
CREATE INDEX IF NOT EXISTS venue_payments_group_paid ON venue_payments(group_id,paid_at DESC);

CREATE TABLE IF NOT EXISTS owner_security (account_id TEXT PRIMARY KEY NOT NULL, must_change_password INTEGER NOT NULL DEFAULT 1, FOREIGN KEY(account_id) REFERENCES accounts(id));
UPDATE billing_methods SET direct_payment_url='' WHERE direct_payment_url='https://app.autobooks.co/pay/e-and-i-construction' AND updated_at=0;
CREATE TABLE IF NOT EXISTS payment_audit (id TEXT PRIMARY KEY NOT NULL, group_id TEXT NOT NULL, payment_id TEXT NOT NULL, action TEXT NOT NULL CHECK(action IN ('edited','deleted')), before_json TEXT NOT NULL, after_json TEXT, owner_account_id TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, FOREIGN KEY(group_id) REFERENCES groups(id));
CREATE INDEX IF NOT EXISTS payment_audit_group_created ON payment_audit(group_id,created_at DESC);

CREATE TABLE IF NOT EXISTS venue_branding (group_id TEXT PRIMARY KEY, logo_updated_at INTEGER NOT NULL DEFAULT 0, FOREIGN KEY(group_id) REFERENCES groups(id));
