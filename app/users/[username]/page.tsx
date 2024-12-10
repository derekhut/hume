"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBanner from "@/app/components/TopBanner";
import Post from "@/app/components/Post";

interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  zodiac: string | null;
  mbti: string | null;
  followers_count: number;
  following_count: number;
  school_code: string;
  school_name: string | null;
  interests: string | null;
  is_following?: boolean;
}

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login");
    } else {
      setCurrentUser(user);
    }
  }, [router]);

  // Fetch user profile and posts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const profileRes = await fetch(`/api/users/${username}`);
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.profile);
        } else {
          setError(profileData.error);
        }

        // Fetch user posts
        const postsRes = await fetch(`/api/posts?username=${username}`);
        const postsData = await postsRes.json();
        if (postsData.success) {
          setPosts(postsData.posts);
        }
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      // Only fetch data if user is authenticated
      fetchUserData();
    }
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!profile || followLoading) return;

    const currentUser = localStorage.getItem("user");
    if (!currentUser) {
      setError("请先登录");
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
        method: profile.is_following ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": encodeURIComponent(currentUser),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to follow/unfollow user");
      }

      // Update profile state with new follow status and count
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          is_following: !prev.is_following,
          followers_count: prev.followers_count + (prev.is_following ? -1 : 1),
        };
      });
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        // Refresh posts after liking
        const postsRes = await fetch(`/api/posts?username=${username}`);
        const postsData = await postsRes.json();
        if (postsData.success) {
          setPosts(postsData.posts);
        }
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh posts after commenting
        const postsRes = await fetch(`/api/posts?username=${username}`);
        const postsData = await postsRes.json();
        if (postsData.success) {
          setPosts(postsData.posts);
        }
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">Loading...</div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        Error: {error || "User not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <TopBanner onRefresh={() => {}} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt={profile.username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold">
                  {profile.nickname || profile.username}
                </h1>
                <p className="text-gray-400">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-2 text-gray-300">{profile.bio}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-4 py-2 rounded-full transition-all ${
                followLoading ? "opacity-50 cursor-not-allowed" : ""
              } ${
                profile.is_following
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}>
              {followLoading ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </span>
              ) : profile.is_following ? (
                "取消关注"
              ) : (
                "关注"
              )}
            </button>
          </div>

          <div className="mt-4 flex space-x-4">
            <span>关注 {profile.following_count}</span>
            <span>被关注 {profile.followers_count}</span>
          </div>

          {profile.zodiac && (
            <div className="mt-2">
              <span className="px-2 py-1 bg-gray-700 rounded-full text-sm">
                {profile.zodiac}
              </span>
            </div>
          )}
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onComment={(content) => handleComment(post.id, content)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
