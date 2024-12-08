import { NextResponse } from "next/server";
import { getDb } from "@/utils/db";

export async function POST(request: Request) {
  try {
    const { post_id, content } = await request.json();

    const db = getDb();
    if (!db) {
      throw new Error("Database connection is undefined");
    }

    // First, create or get a test user (in production, this would come from authentication)
    const userResult = await db.query(
      `
      INSERT INTO users (username, avatar_url)
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE 
      SET avatar_url = EXCLUDED.avatar_url
      RETURNING id, username, avatar_url
      `,
      ["testuser", "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser"]
    );

    const user = userResult.rows[0];

    // Create the comment
    const commentResult = await db.query(
      `
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
      `,
      [post_id, user.id, content]
    );

    const newComment = {
      ...commentResult.rows[0],
      user_id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
    };

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
