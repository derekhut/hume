import { NextResponse } from "next/server";
import { insertPost, getDb } from "@/utils/db";

export async function POST(request: Request) {
  try {
    const { content, image_url, user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      throw new Error("Database connection is undefined");
    }

    // Get user information
    const userResult = await db.query(
      `SELECT id, username, avatar_url, nickname FROM users WHERE id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Create the post
    const post = await insertPost({
      content,
      user_id,
      image_url,
    });

    // Return the post with user information
    return NextResponse.json({
      success: true,
      post: {
        ...post,
        username: user.nickname || user.username,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}
