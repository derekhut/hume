import { NextResponse } from "next/server";
import { getAllPosts } from "@/utils/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    const posts = await getAllPosts(username || undefined);
    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(" Error fetching posts:", error);
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
