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
      <div className="m3-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-on-surface">Admin Panel</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">Manage registered users and their roles.</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && promoteByEmail()}
              className="m3-field w-full pl-9" placeholder="Promote user by email..." />
          </div>
          <button onClick={promoteByEmail} disabled={promoting || !searchEmail.trim()}
            className="m3-btn-filled text-sm px-4 py-2">
            {promoting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Promoting</> : "Promote"}
          </button>
          <button onClick={fetchUsers} className="m3-btn-outlined text-sm px-4 py-2" title="Refresh users">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-error-container rounded-xl text-sm text-on-error-container mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-start gap-2 p-3 bg-success-container rounded-xl text-sm text-success mb-3">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-on-surface-variant italic py-8 text-center">No users found or service key not configured.</p>
        ) : (
          <div className="m3-card overflow-x-auto">
            <table className="m3-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="text-sm text-on-surface-variant font-mono">{u.email}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === "admin" ? "bg-primary-container text-primary" : "bg-surface-dim text-on-surface-variant"
                      }`}>
                        {u.role === "admin" ? <Shield className="w-3 h-3 mr-1" /> : <UserCog className="w-3 h-3 mr-1" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="text-sm text-on-surface-variant">
                      {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                    </td>
                    <td className="text-right">
                      {u.role === "admin" ? (
                        <button onClick={() => changeRole(u.id, "user")} className="m3-btn-text text-sm px-3 py-1 text-on-surface-variant">
                          Demote
                        </button>
                      ) : (
                        <button onClick={() => changeRole(u.id, "admin")} className="m3-btn-text text-sm px-3 py-1 text-primary">
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
  );
}
