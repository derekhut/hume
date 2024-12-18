"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface ChatLog {
  id: number;
  userId: number;
  userEmail: string;
  messages: string;
  createdAt: string;
}

export default function ChatLogs() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/admin/chats");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.chats);
      } else {
        setError("Failed to fetch chat logs");
      }
    } catch (error) {
      console.error("Failed to fetch chat logs:", error);
      setError("An error occurred while fetching chat logs");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by user email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{log.userEmail}</span>
              <span>{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            <div className="whitespace-pre-wrap">
              {JSON.parse(log.messages).map((msg: any, i: number) => (
                <div key={i} className="py-1">
                  <span className="font-medium">{msg.role}: </span>
                  {msg.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
