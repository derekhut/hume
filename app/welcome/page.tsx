"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Welcome() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    gender: "",
    birthday: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have an invitation code
    const invitationCode = sessionStorage.getItem("invitationCode");
    if (!invitationCode) {
      router.replace("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const invitationCode = sessionStorage.getItem("invitationCode");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          invitationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Clear invitation code from session
      sessionStorage.removeItem("invitationCode");
      // Store user info
      localStorage.setItem("user", formData.username);
      // Redirect to home
      router.replace("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.username) {
      setError("Please enter a username");
      return;
    }
    if (step === 2 && !formData.gender) {
      setError("Please select your gender");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl text-white font-bold mb-6">欢迎加入 Woody</h1>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-700 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>用户名</span>
            <span>性别</span>
            <span>生日</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="mb-6">
              <label htmlFor="username" className="block text-gray-300 mb-2">
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="请输入用户名"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">性别</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "male" })}
                  className={`p-3 rounded-lg border ${
                    formData.gender === "male"
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-700 bg-gray-800"
                  } text-white hover:bg-gray-700 transition-colors`}
                >
                  男生
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "female" })}
                  className={`p-3 rounded-lg border ${
                    formData.gender === "female"
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-700 bg-gray-800"
                  } text-white hover:bg-gray-700 transition-colors`}
                >
                  女生
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mb-6">
              <label htmlFor="birthday" className="block text-gray-300 mb-2">
                生日
              </label>
              <input
                type="date"
                id="birthday"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              >
                上一步
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                下一步
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "请稍等..." : "完成注册"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
