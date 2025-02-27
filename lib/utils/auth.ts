import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { prisma } from "../prisma";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { config } from "@/config/app.config";

export async function generateAccessToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .setJti(randomBytes(16).toString("hex"))
    .sign(new TextEncoder().encode(config.SECRET.ACCESS_TOKEN_SECRET));
}

export async function generateRefreshToken(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setJti(randomBytes(16).toString("hex"))
    .sign(new TextEncoder().encode(config.SECRET.REFRESH_TOKEN_SECRET));

  const hashedToken = createHash("sha256").update(token).digest("hex");

  await prisma.session.create({
    data: {
      userId,
      refreshToken: hashedToken,
      expiresAt: config.REFRESH_DB_SESSION_EXPIRY,
    },
  });

  return token;
}

export async function verifyAccessToken(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(config.SECRET.ACCESS_TOKEN_SECRET)
    );
    return verified.payload as { userId: string };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(config.SECRET.REFRESH_TOKEN_SECRET)
    );
    if (!verified) {
      return null;
    }

    const hashedToken = createHash("sha256").update(token).digest("hex");
    const session = await prisma.session.findUnique({
      where: { refreshToken: hashedToken },
      include: { user: true },
    });

    if (!session || new Date() > session.expiresAt) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(req: NextRequest) {
  const accessToken = req.headers.get("Authorization")?.split(" ")[1];
  if (accessToken) {
    const user = await verifyAccessToken(accessToken);

    if (user) return user;
  }
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (refreshToken) {
    const user = await verifyRefreshToken(refreshToken);
    if (user) {
      const newAccessToken = await generateAccessToken(user.id);
      return { userId: user.id, newAccessToken };
    }
  }

  return null;
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}
