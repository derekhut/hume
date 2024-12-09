import { FC, useState, useRef } from "react";
import Image from "next/image";

interface CreatePostProps {
  onSubmit: (content: string, image?: File) => void;
}

const CreatePost: FC<CreatePostProps> = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    try {
      if (content.trim() || selectedFile) {
        onSubmit(content, selectedFile || undefined);
        setContent("");
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-4">
      <textarea
        className="w-full bg-gray-700 text-white rounded-lg p-3 min-h-[100px] resize-none"
        placeholder="分享你的想法..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {imagePreview && (
        <div className="relative mt-4">
          <Image
            src={imagePreview}
            alt="Preview"
            width={300}
            height={200}
            className="rounded-lg object-cover"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="imageUpload"
          />
          <label
            htmlFor="imageUpload"
            className="text-gray-400 hover:text-gray-300 flex items-center cursor-pointer">
            <span className="flex items-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              图片
            </span>
          </label>
          <button className="text-gray-400 hover:text-gray-300">
            <span className="flex items-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              链接
            </span>
          </button>
          <button className="text-gray-400 hover:text-gray-300">
            <span className="flex items-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              视频
            </span>
          </button>
        </div>
        <button
          className="bg-yellow-500 text-black px-4 py-2 rounded-full font-medium hover:bg-yellow-400"
          onClick={handleSubmit}>
          发布
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
