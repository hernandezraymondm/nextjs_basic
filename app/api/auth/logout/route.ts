import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    await prisma.session.deleteMany({ where: { refreshToken } });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("refreshToken", "", { maxAge: 0 });

  return response;
}
