import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await verifyJWT(token);
    if (!admin.isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await req.json();
    const defaultPassword = "changeme123"; // Users should change this on first login
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
