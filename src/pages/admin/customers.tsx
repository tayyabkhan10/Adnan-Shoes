import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface ClerkUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: number;
  lastActiveAt: number | null;
}

export default function AdminCustomers() {
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const basePath = "";

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${basePath}/api/admin/users`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError("Could not load customer data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isRecentlyActive = (ts: number | null) => {
    if (!ts) return false;
    return Date.now() - ts < 24 * 60 * 60 * 1000;
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 mt-1">All registered users and their activity status.</p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                All Customers
                {!isLoading && <span className="ml-1 text-gray-400 font-normal text-sm">({users.length})</span>}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-gray-50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center text-gray-400">{error}</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No customers registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Email</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Joined</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Last Active</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => {
                      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
                      const initials = (u.firstName?.[0] ?? u.email[0] ?? "?").toUpperCase();
                      const active = isRecentlyActive(u.lastActiveAt);
                      return (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {initials}
                              </div>
                              <span className="font-medium text-gray-900">{name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{u.email}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {u.lastActiveAt ? format(new Date(u.lastActiveAt), "MMM d, yyyy") : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={`text-xs ${
                              active
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}>
                              {active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
