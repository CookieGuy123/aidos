import React, { useState, useEffect } from "react";
import { Shield, RefreshCw, UserCog, Search, AlertTriangle, CheckCircle } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in: string | null;
}

interface AdminPanelProps {
  userId?: string;
}

export default function AdminPanel({ userId }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [promoting, setPromoting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const res = await fetch(`/api/admin/users${params}`);
      const data = await res.json();
      if (data.error) { setError(data.error); setUsers([]); }
      else setUsers(data.users || []);
    } catch { setError("Failed to load users"); setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId: string, newRole: string) => {
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccessMsg(`User role updated to ${newRole}`);
    } catch { setError("Failed to update role"); }
  };

  const promoteByEmail = async () => {
    if (!searchEmail.trim()) return;
    setPromoting(true); setError(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/promote-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: searchEmail.trim() })
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setUsers(prev => prev.map(u => u.id === data.user.id ? { ...u, role: "admin" } : u));
      setSuccessMsg(`User ${searchEmail} promoted to admin`);
      setSearchEmail("");
    } catch { setError("Failed to promote user"); }
    finally { setPromoting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="border border-holo-gray-border bg-holo-gray-dark">
        <div className="p-4 border-b border-holo-gray-border">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-holo-blue-light" />
            <h2 className="text-sm font-bold text-white uppercase">Admin Panel</h2>
          </div>
          <p className="text-xs text-gray-400 font-mono">Manage registered users and their roles.</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && promoteByEmail()}
                className="w-full bg-black text-gray-200 border border-holo-gray-border pl-9 pr-3 py-1.5 text-xs font-mono focus:border-holo-blue-light outline-none placeholder:text-gray-600"
                placeholder="Promote user by email..." />
            </div>
            <button onClick={promoteByEmail} disabled={promoting || !searchEmail.trim()}
              className="bg-holo-blue-dark text-black border border-holo-blue-light text-xs font-mono uppercase px-3 py-1.5 cursor-pointer disabled:opacity-40 hover:brightness-110 transition-all active:scale-95">
              {promoting ? <><RefreshCw className="w-3 h-3 animate-spin inline mr-1" /> Promoting</> : "Promote"}
            </button>
            <button onClick={fetchUsers}
              className="bg-black text-gray-400 border border-holo-gray-border text-xs font-mono uppercase px-3 py-1.5 cursor-pointer hover:text-holo-blue-light transition-all active:scale-95"
              title="Refresh users">
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-700/60 text-xs text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2 p-3 bg-teal-950/40 border border-teal-700/60 text-xs text-teal-400">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 text-holo-blue-light animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-8 text-center font-mono">No users found or service key not configured.</p>
          ) : (
            <div className="overflow-x-auto border border-holo-gray-border">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-black border-b border-holo-gray-border">
                    <th className="text-left px-3 py-2 text-holo-blue-light uppercase font-bold tracking-wider">Email</th>
                    <th className="text-left px-3 py-2 text-holo-blue-light uppercase font-bold tracking-wider">Role</th>
                    <th className="text-left px-3 py-2 text-holo-blue-light uppercase font-bold tracking-wider">Joined</th>
                    <th className="text-right px-3 py-2 text-holo-blue-light uppercase font-bold tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-holo-gray-border hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2.5 text-gray-300">{u.email}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin" ? "bg-holo-blue-dark/30 text-holo-blue-light border border-holo-blue-light/40" : "bg-black/60 text-gray-400 border border-holo-gray-border"
                        }`}>
                          {u.role === "admin" ? <Shield className="w-3 h-3 mr-1" /> : <UserCog className="w-3 h-3 mr-1" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {u.role === "admin" ? (
                          <button onClick={() => changeRole(u.id, "user")}
                            className="text-gray-500 hover:text-red-400 text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-colors">
                            Demote
                          </button>
                        ) : (
                          <button onClick={() => changeRole(u.id, "admin")}
                            className="text-holo-blue-light hover:brightness-125 text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all">
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
