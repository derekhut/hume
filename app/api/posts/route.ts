import { NextResponse } from "next/server";
import { getAllPosts } from "@/utils/db";

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
