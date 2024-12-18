import { prisma } from "@/lib/prisma";
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

    const chats = await prisma.chat.findMany({
      select: {
        id: true,
        userId: true,
        messages: true,
        createdAt: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to last 100 chats
    });

    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      userId: chat.userId,
      userEmail: chat.user.email,
      messages: chat.messages,
      createdAt: chat.createdAt.toISOString(),
    }));

    return Response.json({ chats: formattedChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
