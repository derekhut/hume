"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { MotionDiv, MotionMain } from "../components/motion";

const schools = [{ code: "0001", name: "上海宋庆龄学校" }];

const zodiacSigns = [
  { sign: "", name: "", dates: "3.21-4.19" },
  { sign: "", name: "", dates: "4.20-5.20" },
  { sign: "", name: "", dates: "5.21-6.21" },
  { sign: "", name: "", dates: "6.22-7.22" },
  { sign: "", name: "", dates: "7.23-8.22" },
  { sign: "", name: "", dates: "8.23-9.22" },
  { sign: "", name: "", dates: "9.23-10.23" },
  { sign: "", name: "", dates: "10.24-11.22" },
  { sign: "", name: "", dates: "11.23-12.21" },
  { sign: "", name: "", dates: "12.22-1.19" },
  { sign: "", name: "", dates: "1.20-2.18" },
  { sign: "", name: "", dates: "2.19-3.20" },
];

export default function Welcome() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [showMainContent, setShowMainContent] = useState(false);
  const [formData, setFormData] = useState({
    school_code: "",
    gender: -1,
    birthday: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial animation
    const timer = setTimeout(() => {
      setShowMainContent(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show welcome text
    if (page === 0) {
      // Move to school input page after 5 seconds
      const timer = setTimeout(() => {
        setPage(1);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [page]);

  const handleSubmit = async () => {
    console.log("handleSubmit started");
    if (!formData.school_code) {
      setError("请选择学校");
      return;
    }
    if (formData.gender === -1) {
      setError("请选择性别");
      return;
    }
    if (!formData.birthday) {
      setError("请选择生日");
      return;
    }

    setError("");
    console.log("Setting isLoading to true");
    setIsLoading(true);

    try {
      // Get invitation code from sessionStorage
      const invitationCode = sessionStorage.getItem("invitationCode");
      if (!invitationCode) {
        throw new Error("邀请码无效");
      }

      console.log("Sending API request");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: formData.nickname,
          school_code: formData.school_code,
          gender: formData.gender,
          birthday: formData.birthday,
          invitation_code: invitationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store username in localStorage
      localStorage.setItem("username", data.username);
      localStorage.setItem("user", data.username);
      // Redirect to message page (root path)
      router.push("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (page === 0 && !formData.school_code) {
      setError("请选择学校");
      return;
    }
    setError("");
    setPage(page + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden fixed inset-0">
      <div className="w-[600px] relative z-10">
        <AnimatePresence mode="wait">
          {page === 0 ? (
            <MotionMain
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center h-[400px] flex flex-col items-center justify-center relative">
              {showMainContent && (
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="text-center relative z-10 whitespace-nowrap">
                  <h1 className="text-4xl text-white font-bold tracking-wider">
                    Welcome to Woody Camp
                  </h1>
                </MotionDiv>
              )}
            </MotionMain>
          ) : page === 1 ? (
            <MotionDiv
              key="school"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center">
              <h2 className="text-4xl text-white font-bold tracking-wider mb-12">
                你所在的学校是？
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
                  {error}
                </div>
              )}

              <div className="w-full max-w-md mx-auto">
                <button
                  onClick={() => {
                    setFormData({ ...formData, school_code: schools[0].code });
                    setError("");
                    setPage(2);
                  }}
                  className={`w-full p-8 rounded-xl border transition-colors duration-300 text-2xl font-medium
                    ${
                      formData.school_code === schools[0].code
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }
                  `}>
                  {schools[0].name}
                </button>
              </div>

              <div className="w-full max-w-md mx-auto flex justify-end">
                <button
                  onClick={() => {
                    if (!formData.school_code) {
                      setError("请选择学校");
                      return;
                    }
                    setError("");
                    setPage(2);
                  }}
                  className="mt-8 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-base w-12 h-12 flex items-center justify-center hover:scale-110 transform duration-200">
                  →
                </button>
              </div>
            </MotionDiv>
          ) : page === 2 ? (
            <MotionDiv
              key="gender"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center">
              <h2 className="text-4xl text-white font-bold tracking-wider mb-12">
                你的性别是什么？
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setFormData({ ...formData, gender: 1 });
                    setError("");
                    setPage(3);
                  }}
                  className={`p-4 rounded-lg border ${
                    formData.gender === 1
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-700 bg-gray-800"
                  } text-white hover:bg-gray-700 transition-colors`}>
                  男生
                </button>
                <button
                  onClick={() => {
                    setFormData({ ...formData, gender: 0 });
                    setError("");
                    setPage(3);
                  }}
                  className={`p-4 rounded-lg border ${
                    formData.gender === 0
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-700 bg-gray-800"
                  } text-white hover:bg-gray-700 transition-colors`}>
                  女生
                </button>
              </div>

              <div className="w-full max-w-md mx-auto flex justify-between">
                <button
                  onClick={() => setPage(1)}
                  className="mt-8 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-base w-12 h-12 flex items-center justify-center hover:scale-110 transform duration-200">
                  ←
                </button>
                <button
                  onClick={() => {
                    if (formData.gender === -1) {
                      setError("请选择性别");
                      return;
                    }
                    setError("");
                    setPage(3);
                  }}
                  className="mt-8 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-base w-12 h-12 flex items-center justify-center hover:scale-110 transform duration-200">
                  →
                </button>
              </div>
            </MotionDiv>
          ) : page === 3 ? (
            <MotionDiv
              key="birthday"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center">
              <h2 className="text-4xl text-white font-bold tracking-wider mb-12">
                你的生日是？
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
                  {error}
                </div>
              )}

              <div className="w-full max-w-md mx-auto">
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => {
                    setFormData({ ...formData, birthday: e.target.value });
                    setError("");
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-center text-2xl"
                />
              </div>

              <div className="w-full max-w-md mx-auto flex justify-between">
                <button
                  onClick={() => setPage(2)}
                  className="mt-8 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-base w-12 h-12 flex items-center justify-center hover:scale-110 transform duration-200">
                  ←
                </button>
                <button
                  onClick={() => {
                    if (!formData.birthday) {
                      setError("请选择生日");
                      return;
                    }
                    setError("");
                    setPage(4);
                  }}
                  className="mt-8 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-base w-12 h-12 flex items-center justify-center hover:scale-110 transform duration-200">
                  →
                </button>
              </div>
            </MotionDiv>
          ) : page === 4 ? (
            <MotionDiv
              key="nickname"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center">
              <h2 className="text-4xl text-white font-bold tracking-wider mb-12">
                你希望大家怎么称呼你？
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
                  {error}
                </div>
              )}

              <div className="w-full max-w-md mx-auto">
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => {
                    setFormData({ ...formData, nickname: e.target.value });
                    setError("");
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-center text-2xl"
                  placeholder="输入你的昵称"
                />
              </div>

              <div className="w-full max-w-md mx-auto flex justify-between">
                <button
                  onClick={() => setPage(3)}
                  className="mt-8 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-base w-12 h-12 flex items-center justify-center hover:scale-110 transform duration-200">
                  ←
                </button>
                <button
                  onClick={() => {
                    if (!formData.nickname) {
                      setError("请输入昵称");
                      return;
                    }
                    handleSubmit();
                  }}
                  disabled={isLoading}
                  className="mt-8 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-base w-12 h-12 flex items-center justify-center hover:scale-110 transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "→"
                  )}
                </button>
              </div>
            </MotionDiv>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
