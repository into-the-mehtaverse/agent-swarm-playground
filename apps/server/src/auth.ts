import { SignJWT, jwtVerify } from "jose";
import type { User } from "@repo/shared";

const secret = new TextEncoder().encode("super-secret");

export async function signToken(user: User): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<User> {
  const { payload } = await jwtVerify(token, secret);
  return {
    id: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string,
    createdAt: new Date(),
  };
}
