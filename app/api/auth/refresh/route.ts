import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken, generateAccessToken } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const user = await verifyRefreshToken(refreshToken);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }

  const accessToken = await generateAccessToken(user.id);

  return NextResponse.json({ accessToken });
}
