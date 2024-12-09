import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received request:", body);

    // Handle existing user login (username only)
    if ("username" in body) {
      const { username } = body;
      if (!username) {
        return NextResponse.json(
          { message: "Username is required" },
          { status: 400 }
        );
      }

      // Check if username exists
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id, username, is_active")
        .eq("username", username)
        .single();

      if (userError || !existingUser) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      if (!existingUser.is_active) {
        return NextResponse.json(
          { message: "Account is inactive" },
          { status: 403 }
        );
      }

      return NextResponse.json({ 
        success: true,
        user: {
          id: existingUser.id,
          username: existingUser.username
        }
      });
    }

    // Handle new user registration (invitation code only)
    if ("invitationCode" in body) {
      const { invitationCode } = body;
      if (!invitationCode) {
        return NextResponse.json(
          { message: "Invitation code is required" },
          { status: 400 }
        );
      }

      // Check invitation code
      const { data: invitation, error: invitationError } = await supabase
        .from("invitations")
        .select("*")
        .eq("invitation_code", invitationCode)
        .single();

      if (invitationError || !invitation) {
        return NextResponse.json(
          { message: "Invalid invitation code" },
          { status: 400 }
        );
      }

      // Check if code is already used
      if (invitation.is_used) {
        return NextResponse.json(
          { message: "Invitation code has already been used" },
          { status: 400 }
        );
      }

      // Check if code is expired
      if (new Date(invitation.expires_at) < new Date()) {
        return NextResponse.json(
          { message: "Invitation code has expired" },
          { status: 400 }
        );
      }

      return NextResponse.json({ 
        success: true,
        invitation: {
          id: invitation.id,
          school_id: invitation.school_id,
          inviter_id: invitation.inviter_id
        }
      });
    }

    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
