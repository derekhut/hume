"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  email: string;
  rateLimit: number;
  isAdmin: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const updateRateLimit = async (userId: number, rateLimit: number) => {
    try {
      const response = await fetch("/api/admin/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rateLimit }),
      });
      if (response.ok) {
        fetchUsers(); // Refresh user list
      }
    } catch (error) {
      console.error("Failed to update rate limit:", error);
    }
  };

  const resetPassword = async (userId: number) => {
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        alert("Password reset successful");
      } else {
        setError("Failed to reset password");
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      setError("An error occurred while resetting password");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 font-medium p-4 bg-muted rounded-lg">
        <div>Email</div>
        <div>Rate Limit</div>
        <div>Role</div>
        <div>Actions</div>
      </div>
      {users.map((user) => (
        <div key={user.id} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
          <div>{user.email}</div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={user.rateLimit}
              onChange={(e) => updateRateLimit(user.id, parseInt(e.target.value))}
              className="w-24"
              min="1"
            />
            <span className="text-sm text-muted-foreground">req/min</span>
          </div>
          <div>{user.isAdmin ? "Admin" : "User"}</div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetPassword(user.id)}
            >
              Reset Password
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
