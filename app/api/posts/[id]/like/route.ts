import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/utils/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    // Get the post ID from params and user from headers
    const { id } = await params;
    const currentUser = request.headers.get("x-user");

    if (!id || !currentUser) {
      return NextResponse.json(
        { error: "Invalid post ID or user not authenticated" },
        { status: 400 }
      );
    }

    // Use a client from the pool
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Check if user already liked the post
      const existingLike = await client.query(
        `SELECT * FROM likes WHERE post_id = $1 AND user_id = (SELECT id FROM users WHERE username = $2)`,
        [id, currentUser]
      );

      if (existingLike.rows.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Already liked this post" },
          { status: 400 }
        );
      }

      // Insert like record and increment likes count
      await client.query(
        `INSERT INTO likes (post_id, user_id)
         SELECT $1, id FROM users WHERE username = $2`,
        [id, currentUser]
      );

      const result = await client.query(
        `UPDATE posts
         SET likes_count = likes_count + 1
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        post: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in POST /api/posts/[id]/like:", error);
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
  }
}
