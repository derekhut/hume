'use client';

import { useState } from 'react';
import EditProfile from './EditProfile';

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
}

export default function UserProfile({ profile }: { profile: UserProfile }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="bg-[#1a1a1a] rounded-lg p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={profile.avatar_url || '/default-avatar.png'}
                alt={profile.username}
                className="w-16 h-16 rounded-full"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">
                {profile.nickname || profile.username}
              </h2>
              <p className="text-gray-400 mt-1">@{profile.school_name || '未设置学校'}</p>
              <div className="flex space-x-3 mt-1 text-sm">
                {profile.zodiac && (
                  <span className="text-gray-300">{profile.zodiac}</span>
                )}
                {profile.mbti && (
                  <span className="text-gray-300">{profile.mbti}</span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm rounded-md bg-gray-700 text-white hover:bg-gray-600"
          >
            编辑
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-start space-x-6 mt-4 text-sm">
          <div>
            <span className="font-semibold text-white">{profile.following_count}</span>
            <span className="text-gray-400 ml-1">关注</span>
          </div>
          <div>
            <span className="font-semibold text-white">{profile.followers_count}</span>
            <span className="text-gray-400 ml-1">被关注</span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4 text-sm text-gray-300">
            {profile.bio}
          </div>
        )}

        {/* Interests */}
        {profile.interests && (
          <div className="mt-4">
            <p className="text-sm text-gray-400">兴趣爱好:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.interests.split(',').map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300"
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfile
          currentProfile={profile}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
