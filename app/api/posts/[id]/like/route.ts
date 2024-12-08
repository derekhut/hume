import { NextResponse } from "next/server";
import { getDb } from "@/utils/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params to fix the Next.js warning
    const { id } = await Promise.resolve(params);

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
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
