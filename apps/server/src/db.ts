import { Database } from "bun:sqlite";

export const db = new Database("chat.db");

db.exec("PRAGMA journal_mode=WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    room_id TEXT
  )
`);

db.exec("CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC)");
db.exec("CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp ON messages(room_id, timestamp DESC)");

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

// Seed default "General" room
const generalExists = db.prepare("SELECT id FROM rooms WHERE name = 'General'").get();
if (!generalExists) {
  db.prepare("INSERT INTO rooms (id, name, created_at) VALUES (?, ?, ?)").run(
    crypto.randomUUID(),
    "General",
    Date.now()
  );
}
