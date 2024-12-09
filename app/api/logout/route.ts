import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // In the future, we can add more cleanup here
    // like invalidating tokens, etc.
    
    return NextResponse.json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
