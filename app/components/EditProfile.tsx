'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface School {
  id: string;
  name: string;
}

interface EditProfileProps {
  onClose: () => void;
  currentProfile: any;
}

const ZODIAC_SIGNS = [
  '白羊座', '金牛座', '双子座', '巨蟹座', 
  '狮子座', '处女座', '天秤座', '天蝎座',
  '射手座', '摩羯座', '水瓶座', '双鱼座'
];

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

export default function EditProfile({ onClose, currentProfile }: EditProfileProps) {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState({
    username: currentProfile?.username || '',
    nickname: currentProfile?.nickname || '',
    school_id: currentProfile?.school_id || '',
    zodiac: currentProfile?.zodiac || '',
    mbti: currentProfile?.mbti || '',
    bio: currentProfile?.bio || '',
    interests: currentProfile?.interests || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentProfile?.avatar_url || null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch schools list
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/schools');
        const data = await response.json();
        if (data.success) {
          setSchools(data.schools);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };
    fetchSchools();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First upload avatar if selected
      let avatarUrl = currentProfile?.avatar_url;
      if (selectedAvatar) {
        const formData = new FormData();
        formData.append('file', selectedAvatar);
        formData.append('username', currentProfile.username);

        const avatarResponse = await fetch('/api/users/avatar', {
          method: 'POST',
          body: formData,
        });

        const avatarData = await avatarResponse.json();
        if (!avatarData.success) {
          throw new Error(avatarData.error || '头像上传失败');
        }
        avatarUrl = avatarData.user.avatar_url;
      }

      // Then update profile
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          avatar_url: avatarUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.refresh(); // Refresh the page to show updated data
        onClose();
      } else {
        setError(data.error || '更新失败');
      }
    } catch (error) {
      setError('更新时出错');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">编辑个人资料</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-24 h-24">
              <Image
                src={avatarPreview || '/default-avatar.png'}
                alt="Profile Avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                更换头像
              </button>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">昵称</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-[#2a2a2a] border-gray-600 text-white"
                placeholder="输入你的昵称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">学校</label>
              <select
                name="school_id"
                value={formData.school_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-[#2a2a2a] border-gray-600 text-white"
              >
                <option value="">选择学校</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">星座</label>
              <select
                name="zodiac"
                value={formData.zodiac}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-[#2a2a2a] border-gray-600 text-white"
              >
                <option value="">选择星座</option>
                {ZODIAC_SIGNS.map((sign) => (
                  <option key={sign} value={sign}>
                    {sign}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">MBTI</label>
              <select
                name="mbti"
                value={formData.mbti}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-[#2a2a2a] border-gray-600 text-white"
              >
                <option value="">选择MBTI类型</option>
                {MBTI_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio & Interests Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">个人简介</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md bg-[#2a2a2a] border-gray-600 text-white"
                placeholder="介绍一下你自己..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">兴趣爱好</label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-[#2a2a2a] border-gray-600 text-white"
                placeholder="编程, 读书, 运动..."
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
