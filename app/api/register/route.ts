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
    const { username, gender, birthday, invitationCode } = await request.json();
    console.log("Received registration request:", {
      username,
      gender,
      birthday,
      invitationCode,
    });

    // Validate input
    if (!username || !gender || !birthday || !invitationCode) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if username exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists" },
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

    // Create new user
    const { data: newUser, error: createUserError } = await supabase
      .from("users")
      .insert([
        {
          username,
          gender,
          birthday,
          is_active: true,
          invited_by: invitation.inviter_id,
          school_id: invitation.school_id,
        },
      ])
      .select()
      .single();

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      throw createUserError;
    }

    console.log("Created new user:", newUser);

    // Mark invitation as used
    const { error: inviteError } = await supabase
      .from("invitations")
      .update({ is_used: true })
      .eq("id", invitation.id);

    if (inviteError) {
      console.error("Error updating invitation:", inviteError);
      throw inviteError;
    }

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
