import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user.isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
