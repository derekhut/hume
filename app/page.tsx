'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CreatePost from './components/CreatePost';
import PostComponent from './components/Post';
import TopBanner from './components/TopBanner';
import UserProfile from './components/UserProfile';

interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  comments: Comment[];
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  // Check authentication and fetch profile
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.replace('/login');
    } else {
      try {
        // Use the actual username from localStorage
        fetch(`/api/users/${user}`)
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              setProfile(data.profile);
            }
          })
          .catch(error => {
            console.error('Error fetching profile:', error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
      }
    }
  }, [router]);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (error) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!isLoading) {
      fetchPosts();
    }
  }, [fetchPosts, isLoading]);

  const handleCreatePost = async (content: string, image?: File) => {
    try {
      let image_url = null;
      
      // If there's an image, upload it first
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        if (uploadData.url) {
          image_url = uploadData.url;
        } else {
          console.error('Upload failed:', uploadData);
          throw new Error('Failed to upload image');
        }
      }

      // Create the post
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          image_url,
          user_id: profile.id // Use user ID instead of username
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchPosts(); // Refresh the posts after creating a new one
      } else {
        setError('Failed to create post');
      }
    } catch (error) {
      setError('Failed to create post');
      console.error('Error creating post:', error);
    }
  };

  const handleCreateComment = async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, userId: profile.id }),
      });

      const data = await response.json();

      if (data.success) {
        fetchPosts(); // Refresh the posts after creating a new comment
      } else {
        setError('Failed to create comment');
      }
    } catch (error) {
      setError('Failed to create comment');
      console.error('Error creating comment:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        fetchPosts(); // Refresh the posts after liking
      } else {
        setError('Failed to like post');
      }
    } catch (error) {
      setError('Failed to like post');
      console.error('Error liking post:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <TopBanner onRefresh={fetchPosts} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left sidebar with profile */}
          <div className="w-80 flex-shrink-0">
            {profile && <UserProfile profile={profile} />}
          </div>

          {/* Main content */}
          <div className="flex-1">
            <CreatePost onSubmit={handleCreatePost} />
            <div className="space-y-6 mt-6">
              {posts.map((post) => (
                <PostComponent
                  key={post.id}
                  post={post}
                  onComment={(content) => handleCreateComment(post.id, content)}
                  onLike={() => handleLike(post.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
