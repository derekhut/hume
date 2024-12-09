"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [username, setUsername] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isNewUser
            ? { invitationCode: invitationCode.trim().toUpperCase() }
            : { username: username.trim() }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (isNewUser) {
        // Store invitation code for welcome page
        sessionStorage.setItem("invitationCode", invitationCode.trim().toUpperCase());
        router.replace("/welcome");
      } else {
        // Store username and redirect to home
        localStorage.setItem("user", username);
        router.replace("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl text-white font-bold mb-6">Welcome to Woody</h1>
        
        {/* Login Mode Tabs */}
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              !isNewUser
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setIsNewUser(false)}
          >
            登录
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              isNewUser
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setIsNewUser(true)}
          >
            新用户
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isNewUser ? (
            <div className="mb-6">
              <label
                htmlFor="invitationCode"
                className="block text-gray-300 mb-2"
              >
                邀请码
              </label>
              <input
                type="text"
                id="invitationCode"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="请输入邀请码"
                required
              />
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="username" className="block text-gray-300 mb-2">
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="输入用户名"
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading 
              ? "请稍等..." 
              : isNewUser 
                ? "开始注册" 
                : "登录"
            }
          </button>
        </form>
      </div>
    </div>
  );
}
