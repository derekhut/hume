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
    const { username, invitationCode } = await request.json();
    console.log("Received request:", { username, invitationCode });

    // Validate input
    if (!username || !invitationCode) {
      return NextResponse.json(
        { message: "Username and invitation code are required" },
        { status: 400 }
      );
    }

    // Check if username exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    console.log("Existing user:", existingUser, "Error:", userError);

    // Check invitation code
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("invitation_code", invitationCode)
      .single();

    console.log("Invitation:", invitation, "Error:", invitationError);

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

    if (existingUser) {
      // If user exists, just return success
      return NextResponse.json({ success: true });
    }

    // Create new user
    const { data: newUser, error: createUserError } = await supabase
      .from("users")
      .insert([{ username, is_active: true }])
      .select()
      .single();

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      throw createUserError;
    }

    console.log("Created new user:", newUser);

    // Mark invitation as used
    const updateData = {
      is_used: true
    };
    console.log("Updating invitation with data:", updateData);

    const { data: updatedInvitation, error: inviteError } = await supabase
      .from("invitations")
      .update(updateData)
      .eq("id", invitation.id)
      .select()
      .single();

    console.log("Update result:", { updatedInvitation, error: inviteError });

    if (inviteError) {
      console.error("Error updating invitation:", inviteError);
      throw inviteError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
