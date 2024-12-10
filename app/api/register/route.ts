import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const nickname = formData.nickname;
    const school_code = formData.school_code;
    const gender = formData.gender === 0 ? "female" : "male"; 
    const birthday = formData.birthday;

    // Generate a random 4-digit username
    const username = Math.floor(1000 + Math.random() * 9000).toString();

    // Verify school code exists
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("code")
      .eq("code", school_code)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { error: "Invalid school code" },
        { status: 400 }
      );
    }

    // Create the user with all information
    const { error: insertError } = await supabase.from("users").insert({
      username,
      nickname,
      school_code,
      gender,
      birthday,
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Update invitation code status to used
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ is_used: true })
      .eq("invitation_code", formData.invitation_code);

    if (updateError) {
      console.error("Failed to update invitation status:", updateError);
      // We don't return error here as user is already created
    }

    return NextResponse.json({
      message: "Registration successful",
      username,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
