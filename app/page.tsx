'use client';

import { useState, useEffect, useCallback } from 'react';
import CreatePost from './components/CreatePost';
import PostComponent from './components/Post';
import TopBanner from './components/TopBanner';

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
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (content: string, image?: File) => {
    try {
      let image_url = null;
      
      if (image) {
        try {
          // Create FormData and append the file
          const formData = new FormData();
          formData.append('file', image);

          // Upload to server
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();
          image_url = data.url;
        } catch (uploadError) {
          console.error('Upload failed:', uploadError instanceof Error ? uploadError.message : 'Unknown error');
          // Create a temporary URL for the image
          image_url = URL.createObjectURL(image);
        }
      }

      // Create post
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          image_url,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create post');
      }

      // Add the new post to the state
      setPosts(prevPosts => [data.post, ...prevPosts]);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create comment');
      }

      // Add comment to local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, data.comment]
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('❌ Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to like post');
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <TopBanner onRefresh={fetchPosts} />
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <CreatePost onSubmit={handleCreatePost} />
          
          {error && (
            <div className="p-4 text-red-500 bg-red-100 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <PostComponent 
                key={post.id} 
                post={post}
                onLike={() => handleLike(post.id)}
                onAddComment={(content) => handleAddComment(post.id, content)}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
