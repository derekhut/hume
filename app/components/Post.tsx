import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  comments: Comment[];
}

interface PostProps {
  post: Post;
  onLike: () => void;
  onComment: (comment: string) => void;
}

const Post: FC<PostProps> = ({ post, onLike, onComment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    if (!isLiked) {
      onLike();
      setIsLiked(true);
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText("");
    }
  };

  // Format the date to a readable string
  const formattedDate = new Date(post.created_at).toLocaleString();

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <Link href={`/users/${encodeURIComponent(post.username)}`}>
          <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden relative cursor-pointer">
            {post.avatar_url ? (
              <Image
                src={post.avatar_url}
                alt={post.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-500" />
            )}
          </div>
        </Link>
        <div>
          <Link href={`/users/${encodeURIComponent(post.username)}`}>
            <h3 className="text-white font-medium hover:underline">
              {post.nickname || post.username}
            </h3>
          </Link>
          <p className="text-gray-400 text-sm">{formattedDate}</p>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-white">{post.content}</p>
      </div>
      {post.image_url && (
        <div className="mt-4">
          <Image
            src={post.image_url}
            alt="Post image"
            width={500}
            height={300}
            className="rounded-lg object-cover"
          />
        </div>
      )}
      <div className="mt-4 flex space-x-4 items-center">
        <button
          className={`flex items-center space-x-1 ${
            isLiked ? "text-red-500" : "text-gray-400"
          } hover:text-red-500`}
          onClick={handleLike}>
          <svg
            className="w-5 h-5"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>{post.likes_count}</span>
        </button>
        <button
          className="text-gray-400 hover:text-gray-300 flex items-center space-x-1"
          onClick={() => setShowComments(!showComments)}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          {/* Comment Input */}
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-gray-700 text-white rounded-lg p-2"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              className="bg-yellow-500 text-black px-3 py-2 rounded-lg"
              onClick={handleAddComment}>
              Send
            </button>
          </div>

          {/* Comments List */}
          {post.comments?.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden relative">
                {comment.avatar_url ? (
                  <Image
                    src={comment.avatar_url}
                    alt={comment.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-500" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-medium text-sm">
                    {comment.username || "Anonymous"}
                  </h4>
                  <span className="text-gray-400 text-xs">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
