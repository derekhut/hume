import { createClient, PostgrestError } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: PostgrestError | Error) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Type definitions
type Post = {
  id: string; // UUID
  content: string;
  username: string;
  avatarUrl: string; // Changed from avatar_url
  imageUrl?: string; // Changed from image_url
  likes: number;
  created_at: string;
};

type Comment = {
  id: string; // UUID
  postId: string; // Changed from post_id, UUID
  content: string;
  username: string;
  avatarUrl: string; // Changed from avatar_url
  created_at: string;
};

type Image = {
  id: string; // UUID
  imageUrl: string; // Changed from img_url
  llmName: string; // Changed from llm_name
  created_at: string;
};

// Database helper functions
export const db = {
  createPost: async (post: {
    content: string;
    username: string;
    avatarUrl: string;
    imageUrl?: string;
  }): Promise<Post> => {
    console.log("📝 Creating new post:", {
      ...post,
      content: post.content.substring(0, 50) + "...",
    });
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            content: post.content,
            username: post.username,
            avatarUrl: post.avatarUrl,
            imageUrl: post.imageUrl,
            likes: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating post:", error.message);
        throw new DatabaseError("Failed to create post", error);
      }

      if (!data) {
        console.error("❌ No data returned from post creation");
        throw new DatabaseError("No data returned from post creation");
      }

      console.log("✅ Successfully created post:", data.id);
      return data as Post;
    } catch (error) {
      console.error(
        "❌ Unexpected error in createPost:",
        error instanceof Error ? error.message : "Unknown error"
      );
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Unexpected error while creating post",
        error instanceof Error ? error : undefined
      );
    }
  },

  createComment: async (comment: {
    postId: string;
    content: string;
    username: string;
    avatarUrl: string;
  }): Promise<Comment> => {
    console.log("💬 Creating new comment for post:", comment.postId);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            postId: comment.postId,
            content: comment.content,
            username: comment.username,
            avatarUrl: comment.avatarUrl,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating comment:", error.message);
        throw new DatabaseError("Failed to create comment", error);
      }

      if (!data) {
        console.error("❌ No data returned from comment creation");
        throw new DatabaseError("No data returned from comment creation");
      }

      console.log("✅ Successfully created comment:", data.id);
      return data as Comment;
    } catch (error) {
      console.error(
        "❌ Unexpected error in createComment:",
        error instanceof Error ? error.message : "Unknown error"
      );
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Unexpected error while creating comment",
        error instanceof Error ? error : undefined
      );
    }
  },

  createImage: async (
    imageUrl: string,
    llmName: string = ""
  ): Promise<Image> => {
    console.log("📸 Creating new image record:", imageUrl);
    try {
      const { data, error } = await supabase
        .from("images")
        .insert([
          {
            imageUrl: imageUrl,
            llmName: llmName,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating image record:", error.message);
        throw new DatabaseError("Failed to create image record", error);
      }

      if (!data) {
        console.error("❌ No data returned from image creation");
        throw new DatabaseError("No data returned from image creation");
      }

      console.log("✅ Successfully created image record:", data.id);
      return data as Image;
    } catch (error) {
      console.error(
        "❌ Unexpected error in createImage:",
        error instanceof Error ? error.message : "Unknown error"
      );
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Unexpected error while creating image record",
        error instanceof Error ? error : undefined
      );
    }
  },
};
