import { NextResponse } from 'next/server';
import { getDb } from '@/utils/db';

export async function PUT(request: Request) {
  try {
    const {
      username,
      nickname,
      school_id,
      zodiac,
      mbti,
      bio,
      interests,
      avatar_url
    } = await request.json();

    const db = getDb();
    if (!db) {
      throw new Error("Database connection is undefined");
    }

    // Update user profile
    const result = await db.query(
      `
      UPDATE users 
      SET 
        nickname = $1,
        school_id = $2,
        zodiac = $3,
        mbti = $4,
        bio = $5,
        interests = $6,
        avatar_url = $7
      WHERE username = $8
      RETURNING *
      `,
      [nickname, school_id, zodiac, mbti, bio, interests, avatar_url, username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get school name if school_id is present
    let schoolName = null;
    if (result.rows[0].school_id) {
      const schoolResult = await db.query(
        'SELECT name FROM schools WHERE id = $1',
        [result.rows[0].school_id]
      );
      if (schoolResult.rows.length > 0) {
        schoolName = schoolResult.rows[0].name;
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...result.rows[0],
        school_name: schoolName
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
