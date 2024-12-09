import { getDb } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Check if username exists
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // First try to find existing user
    let result = await db.query(
      `
      SELECT 
        u.id,
        u.username,
        u.nickname,
        u.avatar_url,
        u.bio,
        u.zodiac,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT p.id) as posts_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM users u
      LEFT JOIN posts p ON p.user_id = u.id
      LEFT JOIN comments c ON c.user_id = u.id
      WHERE u.username = $1
      GROUP BY u.id
      `,
      [username]
    );

    // If user doesn't exist, create a new one with default avatar
    if (result.rowCount === 0) {
      // Insert new user with default avatar
      const insertResult = await db.query(
        `
        INSERT INTO users (username, nickname, bio, avatar_url)
        VALUES ($1, $1, 'New user', '/default-avatar.png')
        RETURNING 
          id, 
          username, 
          nickname, 
          avatar_url,
          bio, 
          zodiac, 
          created_at, 
          updated_at
        `,
        [username]
      );
      
      result = {
        ...insertResult,
        rows: [{
          ...insertResult.rows[0],
          posts_count: '0',
          comments_count: '0'
        }]
      };
    }

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "User not found and could not be created" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Error in GET /api/users/[username]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
