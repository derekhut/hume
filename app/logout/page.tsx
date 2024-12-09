"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        // Call logout API
        await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Clear local storage
        localStorage.removeItem("user");
        
        // Redirect to login
        router.replace("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        // Still redirect to login even if API call fails
        router.replace("/login");
      }
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-white">正在退出...</div>
    </div>
  );
}
