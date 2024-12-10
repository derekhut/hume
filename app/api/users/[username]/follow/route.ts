import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/utils/db";

// Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Get target user's ID
    const db = getDb();
    const userResult = await db.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const targetUserId = userResult.rows[0].id;

    // Get current user from request headers
    const currentUser = request.headers.get("x-user");
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const currentUserResult = await db.query(
      `SELECT id FROM users WHERE username = $1`,
      [decodeURIComponent(currentUser)]
    );

    if (currentUserResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    const currentUserId = currentUserResult.rows[0].id;

    // Check if already following
    const existingFollow = await db.query(
      `SELECT 1 FROM followers 
       WHERE follower_id = $1 AND following_id = $2`,
      [currentUserId, targetUserId]
    );

    if (existingFollow.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Already following this user" },
        { status: 400 }
      );
    }

    // Create follow relationship
    await db.query(
      `INSERT INTO followers (follower_id, following_id)
       VALUES ($1, $2)`,
      [currentUserId, targetUserId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

// Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Get target user's ID
    const db = getDb();
    const userResult = await db.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const targetUserId = userResult.rows[0].id;

    // Get current user from request headers
    const currentUser = request.headers.get("x-user");
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const currentUserResult = await db.query(
      `SELECT id FROM users WHERE username = $1`,
      [decodeURIComponent(currentUser)]
    );

    if (currentUserResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    const currentUserId = currentUserResult.rows[0].id;

    // Delete follow relationship
    const result = await db.query(
      `DELETE FROM followers 
       WHERE follower_id = $1 AND following_id = $2
       RETURNING *`,
      [currentUserId, targetUserId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "Not following this user" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}
