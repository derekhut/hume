```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/utils/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const currentUser = request.headers.get("x-user");

    if (!id || !currentUser) {
      return NextResponse.json(
        { error: "Invalid post ID or user not authenticated" },
        { status: 400 }
      );
    }

    const client = await db.connect();
    try {
      const result = await client.query(
        `SELECT EXISTS (
          SELECT 1 FROM likes
          WHERE post_id = $1
          AND user_id = (SELECT id FROM users WHERE username = $2)
        )`,
        [id, currentUser]
      );

      return NextResponse.json({
        hasLiked: result.rows[0].exists
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in GET /api/posts/[id]/like/check:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 }
    );
  }
}
```
