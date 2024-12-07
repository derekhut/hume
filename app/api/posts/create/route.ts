import { NextResponse } from "next/server";
import { insertPost, getDb } from "@/utils/db";

export async function POST(request: Request) {
  try {
    const { content, image_url } = await request.json();

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

    // Create the post
    const post = await insertPost({
      content,
      user_id: user.id,
      image_url,
    });

    // Return the post with user information
    return NextResponse.json({
      success: true,
      post: {
        ...post,
        username: user.username,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
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
