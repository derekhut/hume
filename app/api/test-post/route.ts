import { NextResponse } from "next/server";
import { insertPost, getDb } from "@/utils/db";
import { generateAvatarUrl } from "@/utils/random";

// Function to generate a random UUID (for testing only)
function generateTestUserId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      throw new Error("Database connection is undefined");
    }

    // First, create a test user
    const userResult = await db.query(
      `
      INSERT INTO users (username, avatar_url)
      VALUES ($1, $2)
      RETURNING id
      `,
      ['testuser', generateAvatarUrl('testuser')]
    );

    const userId = userResult.rows[0].id;

    // Create test post data
    const testPost = {
      content: "This is a test post " + new Date().toISOString(),
      user_id: userId,
      image_url: null,
    };

    console.log("📝 Attempting to insert test post:", testPost);

    // Insert the post
    const newPost = await insertPost(testPost);

    console.log("✅ Successfully inserted post:", newPost);

    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.error("❌ Error inserting test post:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
