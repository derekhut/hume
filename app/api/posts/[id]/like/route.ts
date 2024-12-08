import { NextResponse, Request } from "next/server";
import { getDb } from "@/utils/db";

export async function POST(request: Request) {
  try {
    // Get the post ID from the URL path segments
    const urlParts = request.url.split('/');
    const id = urlParts[urlParts.indexOf('posts') + 1];

    if (!id || id === 'like') {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      throw new Error("Database connection is undefined");
    }

    // Increment likes count
    const result = await db.query(
      `
      UPDATE posts
      SET likes_count = likes_count + 1
      WHERE id = $1
      RETURNING likes_count
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      likes_count: result.rows[0].likes_count,
    });
  } catch (error) {
    console.error("Error liking post:", error);
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