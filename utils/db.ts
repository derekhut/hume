/**
 * db.ts
 * 数据库操作工具函数模块
 * 提供数据库连接管理和各种数据操作的功能
 */

import { Pool } from "pg";
import { generateAvatarUrl } from "./random";

/**
 * 帖子数据类型定义
 * @description 定义了帖子的基本数据结构
 */
export type Post = {
  id: string;           // 帖子唯一标识符
  content: string;      // 帖子内容
  user_id: string;      // 发帖用户ID
  image_url?: string | null;  // 帖子图片URL（可选）
  likes_count: number;  // 点赞数
  created_at: string;   // 创建时间
};

/**
 * 评论数据类型定义
 * @description 定义了评论的基本数据结构
 */
export type Comment = {
  id: string;          // 评论唯一标识符
  postId: string;      // 关联的帖子ID
  content: string;     // 评论内容
  username: string;    // 评论用户名
  avatarUrl: string;   // 评论用户头像
  created_at: string;  // 创建时间
};

/**
 * 图片数据类型定义
 * @description 定义了图片资源的基本数据结构
 */
export type Image = {
  id: string;          // 图片唯一标识符
  imageUrl: string;    // 图片URL
  llmName: string;     // AI模型名称
  created_at: string;  // 创建时间
};

// 全局数据库连接池实例
let globalPool: Pool | null;

/**
 * 获取数据库连接池实例
 * @returns 返回PostgreSQL数据库连接池实例
 * @throws 如果数据库连接URL未设置或连接失败则抛出错误
 * @description
 * - 使用单例模式管理数据库连接池
 * - 自动处理SSL连接（生产环境）
 * - 包含连接池配置：
 *   - 最大连接数：10
 *   - 空闲超时：30秒
 *   - 连接超时：10秒
 */
export function getDb(): Pool {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_URL环境变量未设置");
    }
    console.log("初始化数据库连接池...");

    globalPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
    });

    globalPool.on("error", (err) => {
      console.error("空闲客户端发生意外错误", err);
      globalPool = null;
    });

    globalPool.on("connect", (client) => {
      client.on("error", (err) => {
        console.error("数据库客户端错误:", err);
      });
    });

    // 测试数据库连接
    globalPool
      .connect()
      .then((client) => {
        console.log("成功连接到数据库");
        client.release();
      })
      .catch((err) => {
        console.error("测试数据库连接失败:", err);
        globalPool = null;
      });
  }

  if (!globalPool) {
    throw new Error("数据库连接池初始化失败");
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
    throw new Error("数据库连接未定义");
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
    throw new Error("数据库连接未定义");
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
    throw new Error("数据库连接未定义");
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
    throw new Error("数据库连接未定义");
  }

  // 获取帖子数据
  const postResult = await db.query(`SELECT * FROM posts WHERE id = $1`, [
    postId,
  ]);
  const post = postResult.rows[0] as Post;

  if (!post) {
    return null;
  }

  // 获取帖子的评论列表
  const commentsResult = await db.query(
    `SELECT * FROM comments
     WHERE "postId" = $1
     ORDER BY created_at ASC`,
    [postId]
  );

  return {
    ...post,
    comments: commentsResult.rows as Comment[],
  };
}

// 获取帖子的评论
async function getPostComments(postIds: string[]) {
  const db = getDb();
  if (!db) {
    throw new Error("数据库连接未定义");
  }

  const commentsResult = await db.query(
    `
    SELECT
      c.*,
      u.username,
      u.avatar_url,
      u.nickname
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ANY($1::uuid[])
    ORDER BY c.created_at ASC
    `,
    [postIds]
  );

  return commentsResult.rows;
}

// 处理帖子和评论数据
function processPostsWithComments(posts: any[], comments: any[]) {
  // 按帖子ID分组评论
  const commentsByPost = comments.reduce((acc, comment) => {
    if (!acc[comment.post_id]) {
      acc[comment.post_id] = [];
    }
    acc[comment.post_id].push({
      ...comment,
      username: comment.nickname || comment.username,
      avatar_url: comment.avatar_url,
    });
    return acc;
  }, {} as Record<string, any[]>);

  // 将评论添加到对应的帖子中
  return posts.map((post) => ({
    ...post,
    username: post.nickname || post.username,
    comments: commentsByPost[post.id] || [],
  }));
}

export async function getAllPosts() {
  const db = getDb();
  if (!db) {
    throw new Error("数据库连接未定义");
  }

  // 获取所有帖子及用户信息
  const postsResult = await db.query(
    `
    SELECT
      p.*,
      u.username,
      u.avatar_url,
      u.nickname
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    `
  );

  const posts = postsResult.rows;

  // 如果有帖子，获取其评论
  if (posts.length > 0) {
    const comments = await getPostComments(posts.map(post => post.id));
    return processPostsWithComments(posts, comments);
  }

  // 如果没有帖子，返回空数组
  return processPostsWithComments(posts, []);
}

export async function getUserPosts(username: string) {
  const db = getDb();
  if (!db) {
    throw new Error("数据库连接未定义");
  }

  // 获取用户的帖子及用户信息
  const postsResult = await db.query(
    `
    SELECT
      p.*,
      u.username,
      u.avatar_url,
      u.nickname
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE u.username = $1
    ORDER BY p.created_at DESC
    `,
    [username]
  );

  const posts = postsResult.rows;

  // 如果有帖子，获取其评论
  if (posts.length > 0) {
    const comments = await getPostComments(posts.map(post => post.id));
    return processPostsWithComments(posts, comments);
  }

  // 如果没有帖子，返回空数组
  return processPostsWithComments(posts, []);
}
