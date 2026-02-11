import type { User } from "@repo/shared";
import { db } from "./db";

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: number;
}

const insertUser = db.prepare(
  "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
);
const findByEmail = db.prepare<UserRow, [string]>(
  "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?"
);

function toUser(row: UserRow): User {
  return { id: row.id, email: row.email, name: row.name, createdAt: new Date(row.created_at) };
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<User> {
  const existing = findByEmail.get(email);
  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await Bun.password.hash(password);
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date(),
  };

  insertUser.run(user.id, email, name, passwordHash, user.createdAt.getTime());
  return user;
}

export async function authenticate(
  email: string,
  password: string,
): Promise<User> {
  const row = findByEmail.get(email);
  if (!row) {
    throw new Error("Invalid credentials");
  }

  const valid = await Bun.password.verify(password, row.password_hash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  return toUser(row);
}
