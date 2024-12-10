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
    const currentUser = request.headers.get("x-user");
    const query = `
      SELECT 
        u.id,
        u.username,
        u.nickname,
        u.avatar_url,
        u.bio,
        u.zodiac,
        u.school_code,
        s.name as school_name,
        u.created_at,
        u.updated_at,
        (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count,
        EXISTS(
          SELECT 1 FROM followers f3 
          WHERE f3.follower_id = (
            SELECT id FROM users WHERE username = $2
          )
          AND f3.following_id = u.id
        ) as is_following
      FROM users u
      LEFT JOIN schools s ON u.school_code = s.code
      WHERE u.username = $1
      GROUP BY u.id, s.name
    `;
    let result = await db.query(
      query,
      [username, currentUser || ""] // Pass current user for is_following check
    );

    // If user doesn't exist, create a new one with default avatar
    if (result.rowCount === 0) {
      const defaultAvatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${username}`;
      const insertResult = await db.query(
        `
        INSERT INTO users (username, avatar_url)
        VALUES ($1, $2)
        RETURNING *
        `,
        [username, defaultAvatar]
      );

      result = {
        rows: [
          {
            ...insertResult.rows[0],
            school_name: null,
            followers_count: 0,
            following_count: 0,
            is_following: false,
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };
    }

    // Convert count fields to numbers
    const profile = {
      ...result.rows[0],
      followers_count: parseInt(result.rows[0].followers_count),
      following_count: parseInt(result.rows[0].following_count)
    };

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error("Error in GET /api/users/[username]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
