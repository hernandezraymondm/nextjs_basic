import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { httpStatus } from "@/config/http.config";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: httpStatus.UNAUTHORIZED }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: httpStatus.UNAUTHORIZED }
    );
  }

  const { name } = await req.json();

  const updatedUser = await prisma.user.update({
    where: { id: auth.userId },
    data: { name },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(updatedUser);
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: httpStatus.UNAUTHORIZED }
    );
  }

  const updates = await req.json();

  const updatedUser = await prisma.user.update({
    where: { id: auth.userId },
    data: updates,
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(updatedUser);
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: httpStatus.UNAUTHORIZED }
    );
  }

  await prisma.user.delete({ where: { id: auth.userId } });

  return NextResponse.json({ success: true });
}
