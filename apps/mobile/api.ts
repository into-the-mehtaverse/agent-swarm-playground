import type { AuthResponse, ApiError, User, Room } from "@repo/shared";

const API_URL = "http://localhost:3000";

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json()) as ApiError;
    throw new Error(body.message);
  }

  return res.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export function fetchUser(token: string): Promise<User> {
  return request<User>("/user", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchRooms(token: string): Promise<Room[]> {
  return request<Room[]>("/rooms", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createRoom(token: string, name: string): Promise<Room> {
  return request<Room>("/rooms", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}
