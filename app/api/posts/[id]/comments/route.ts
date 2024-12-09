import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/utils/db";

// Fetch comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Define params as a Promise
) {
  try {
    // Await resolution of params
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Fetch comments for the given post
    const result = await db.query(
      `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.user_id,
        u.username,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
      `,
      [postId]
    );

    return NextResponse.json({
      success: true,
      comments: result.rows,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Add a new comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Define params as a Promise
) {
  try {
    const { content, userId } = await request.json();
    const { id: postId } = await params; // Await params resolution

    // Validate required fields
    if (!content || !userId || !postId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Insert new comment and return user info at the top level
    const result = await db.query(
      `
      WITH new_comment AS (
        INSERT INTO comments (content, user_id, post_id)
        VALUES ($1, $2, $3)
        RETURNING id, content, created_at, user_id
      )
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.user_id,
        u.username,
        u.avatar_url
      FROM new_comment c
      JOIN users u ON c.user_id = u.id
      `,
      [content, userId, postId]
    );

    return NextResponse.json({
      success: true,
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
