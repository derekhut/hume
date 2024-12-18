"use client";

import * as React from "react";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/admin/user-management";
import ChatLogs from "@/components/admin/chat-logs";
import AdminSettings from "@/components/admin/settings";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/check", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          router.push("/login");
        }
        setLoading(false);
      } catch (error) {
        console.error("Admin check failed:", error);
        setError("Failed to verify admin access");
        router.push("/login");
      }
    };
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="chats">Chat Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><UserManagement /></TabsContent>
        <TabsContent value="chats"><ChatLogs /></TabsContent>
        <TabsContent value="settings"><AdminSettings /></TabsContent>
      </Tabs>
    </div>
  );
}
