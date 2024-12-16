import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/utils/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    const { id } = params;
    const currentUser = request.headers.get("x-user");

    if (!id || !currentUser) {
      return NextResponse.json(
        { error: "Invalid post ID or user not authenticated" },
        { status: 400 }
      );
    }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Check if post exists and belongs to the current user
      const post = await client.query(
        `SELECT * FROM posts WHERE id = $1 AND user_id = (SELECT id FROM users WHERE username = $2)`,
        [id, currentUser]
      );

      if (post.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Post not found or unauthorized" },
          { status: 404 }
        );
      }

      // Delete the post
      await client.query(
        `DELETE FROM posts WHERE id = $1`,
        [id]
      );

      await client.query("COMMIT");

      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in DELETE /api/posts/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
