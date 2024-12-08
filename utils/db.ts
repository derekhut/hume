import { Pool } from "pg";

export type Post = {
  id: string;
  content: string;
  user_id: string;
  image_url?: string | null;
  likes_count: number;
  created_at: string;
};

export type Comment = {
  id: string;
  postId: string;
  content: string;
  username: string;
  avatarUrl: string;
  created_at: string;
};

export type Image = {
  id: string;
  imageUrl: string;
  llmName: string;
  created_at: string;
};

let globalPool: Pool | null;

export function getDb(): Pool {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_URL environment variable is not set");
    }
    console.log("Initializing database connection...");

    globalPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : undefined
    });

    globalPool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      globalPool = null;
    });

    globalPool.on('connect', (client) => {
      client.on('error', (err) => {
        console.error('Database client error:', err);
      });
    });

    // Test the connection synchronously
    try {
      const client = globalPool.connect();
      client.then(c => c.release());
    } catch (err) {
      console.error('Error testing database connection:', err);
      globalPool = null;
    }
  }
  
  if (!globalPool) {
    throw new Error("Failed to initialize database connection");
  }
  
  return globalPool;
}

export async function closeDb() {
  if (globalPool) {
    await globalPool.end();
    globalPool = null;
  }
}

export async function insertPost(post: {
  content: string;
  user_id: string;
  image_url?: string | null;
}) {
  const db = getDb();
  if (!db) {
    throw new Error("Database connection is undefined");
  }
  const result = await db.query(
    `
    INSERT INTO posts
    (content, user_id, image_url, likes_count)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [post.content, post.user_id, post.image_url || null, 0]
  );
  return result.rows[0] as Post;
}

export async function insertComment(comment: {
  postId: string;
  content: string;
  username: string;
  avatarUrl: string;
}) {
  const db = getDb();
  if (!db) {
    throw new Error("Database connection is undefined");
  }
  const result = await db.query(
    `
    INSERT INTO comments
    ("postId", content, username, "avatarUrl")
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [comment.postId, comment.content, comment.username, comment.avatarUrl]
  );
  return result.rows[0] as Comment;
}

export async function insertImage(image: {
  imageUrl: string;
  llmName?: string;
}) {
  const db = getDb();
  if (!db) {
    throw new Error("Database connection is undefined");
  }
  const result = await db.query(
    `
    INSERT INTO images
    ("imageUrl", "llmName")
    VALUES ($1, $2)
    RETURNING *
    `,
    [image.imageUrl, image.llmName || ""]
  );
  return result.rows[0] as Image;
}

export async function getPostWithComments(postId: string) {
  const db = getDb();
  if (!db) {
    throw new Error("Database connection is undefined");
  }

  // Get post
  const postResult = await db.query(
    `SELECT * FROM posts WHERE id = $1`,
    [postId]
  );
  const post = postResult.rows[0] as Post;

  if (!post) {
    return null;
  }

  // Get comments for the post
  const commentsResult = await db.query(
    `SELECT * FROM comments 
     WHERE "postId" = $1 
     ORDER BY created_at ASC`,
    [postId]
  );

  return {
    ...post,
    comments: commentsResult.rows as Comment[]
  };
}

export async function getAllPosts() {
  const db = getDb();
  if (!db) {
    throw new Error("Database connection is undefined");
  }

  // Get all posts
  const postsResult = await db.query(
    `SELECT * FROM posts ORDER BY created_at DESC`
  );

  const posts = postsResult.rows;

  // If we have posts, get their comments
  if (posts.length > 0) {
    const postIds = posts.map(post => post.id);

    const commentsResult = await db.query(
      `SELECT * FROM comments 
       WHERE post_id = ANY($1::uuid[])
       ORDER BY created_at ASC`,
      [postIds]
    );

    const comments = commentsResult.rows;

    // Group comments by post
    const commentsByPost = comments.reduce((acc, comment) => {
      if (!acc[comment.post_id]) {
        acc[comment.post_id] = [];
      }
      acc[comment.post_id].push(comment);
      return acc;
    }, {} as Record<string, any[]>);

    // Add comments to each post
    return posts.map(post => ({
      ...post,
      username: `User ${post.id.slice(0, 8)}`,  // Generate a simple username
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.id}`,  // Generate an avatar
      comments: commentsByPost[post.id] || []
    }));
  }

  // If no posts, return empty array with generated usernames and avatars
  return posts.map(post => ({
    ...post,
    username: `User ${post.id.slice(0, 8)}`,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.id}`,
    comments: []
  }));
}
