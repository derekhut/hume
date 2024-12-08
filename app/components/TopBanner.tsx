import React from 'react';

interface TopBannerProps {
  onRefresh: () => void;
}

const TopBanner: React.FC<TopBannerProps> = ({ onRefresh }) => {
  return (
    <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex">
          <div className="w-1/3">
            <button 
              onClick={onRefresh}
              className="px-4 py-2 text-white font-medium border-b-2 border-blue-500 hover:text-blue-400 transition-colors"
            >
              动态
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
