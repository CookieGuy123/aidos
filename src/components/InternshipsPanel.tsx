import React, { useState } from "react";
import { Search, Bookmark, Award, ExternalLink, Plus, Sparkles, Shield, X } from "lucide-react";
import type { Internship, Scholarship, UserProfile } from "../types";

interface Props {
  internships: Internship[];
  setInternships: React.Dispatch<React.SetStateAction<Internship[]>>;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string, type: "scholarship" | "internship") => void;
  isWon: (id: string) => boolean;
  toggleWon: (item: Scholarship | Internship, type: "scholarship" | "internship") => void;
  dismissNew: (id: string) => void;
  saveData: (overrides?: Record<string, any>) => void;
  profile: UserProfile | null;
  onOpenAiSearch: () => void;
}

export default function InternshipsPanel({ internships, setInternships, isBookmarked, toggleBookmark, isWon, toggleWon, dismissNew, saveData, profile, onOpenAiSearch }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"deadline" | "title">("deadline");
  const [typeFilter, setTypeFilter] = useState<"all" | "Paid" | "Unpaid">("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ title: "", company: "", location: "", type: "Paid" as "Paid" | "Unpaid", deadline: "" });

  const filtered = internships
    .filter(i => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (verifiedOnly && !i.isVerified) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return i.title.toLowerCase().includes(q) || i.company.toLowerCase().includes(q) || (i.fieldOfStudy || "").toLowerCase().includes(q) || (i.location || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return a.title.localeCompare(b.title);
    });

  const addManual = () => {
    if (!manual.title || !manual.company || !manual.deadline) return;
    const id = "manual-int-" + Date.now();
    const i: Internship = {
      id, title: manual.title, company: manual.company,
      location: manual.location, type: manual.type,
      deadline: manual.deadline, description: "",
      requirements: [], isVerified: false, scamFlag: false, scamReason: "",
      sourceUrl: "", fieldOfStudy: "", studentLevel: "undergrad",
      isNew: false,
    };
    setInternships(prev => [i, ...prev]);
    setManual({ title: "", company: "", location: "", type: "Paid", deadline: "" });
    setManualOpen(false);
    setTimeout(() => saveData(), 100);
  };

  return (
    <div>
      <div className="m3-card p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="m3-field w-full pl-9" placeholder="Filter internships by title, company, or field..." />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="m3-select">
            <option value="all">All types</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="m3-select">
            <option value="deadline">Deadline</option>
            <option value="title">Title</option>
          </select>
          <button onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`m3-chip ${verifiedOnly ? "active" : ""}`}>
            <Shield className="w-4 h-4" /> Verified
          </button>
          <button onClick={onOpenAiSearch} className="m3-btn-filled text-sm px-4 py-2">
            <Sparkles className="w-4 h-4" /> AI Search
          </button>
          <button onClick={() => setManualOpen(!manualOpen)} className="m3-btn-outlined text-sm px-4 py-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {manualOpen && (
        <div className="m3-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-on-surface">Add Internship</h3>
            <button onClick={() => setManualOpen(false)} className="m3-btn-text p-1"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input value={manual.title} onChange={e => setManual(m => ({ ...m, title: e.target.value }))} className="m3-field" placeholder="Title" />
            <input value={manual.company} onChange={e => setManual(m => ({ ...m, company: e.target.value }))} className="m3-field" placeholder="Company" />
            <input value={manual.location} onChange={e => setManual(m => ({ ...m, location: e.target.value }))} className="m3-field" placeholder="Location" />
            <div className="flex gap-2">
              <select value={manual.type} onChange={e => setManual(m => ({ ...m, type: e.target.value as any }))} className="m3-select flex-1">
                <option value="Paid">Paid</option><option value="Unpaid">Unpaid</option>
              </select>
              <button onClick={addManual} className="m3-btn-filled text-sm px-4">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="m3-card overflow-x-auto">
        <table className="m3-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Title</th>
              <th>Location</th>
              <th>Type</th>
              <th>Deadline</th>
              <th>Field</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td className="text-sm text-on-surface-variant">{i.company}</td>
                <td className="font-medium">
                  <div className="flex items-center gap-2">
                    {i.title}
                    {i.isNew && <span className="m3-badge m3-badge-new">NEW</span>}
                    {i.scamFlag && <span className="m3-badge m3-badge-alert">FLAG</span>}
                    {i.isVerified && !i.scamFlag && <span className="m3-badge m3-badge-verified">OK</span>}
                  </div>
                </td>
                <td className="text-sm text-on-surface-variant">{i.location || "—"}</td>
                <td>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    i.type === "Paid" ? "bg-success-container text-success" : "bg-surface-dim text-on-surface-variant"
                  }`}>{i.type}</span>
                </td>
                <td className="font-mono tabular-nums text-sm">
                  {new Date(i.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                </td>
                <td className="text-sm text-on-surface-variant">{i.fieldOfStudy || "—"}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => toggleBookmark(i.id, "internship")} title={isBookmarked(i.id) ? "Remove bookmark" : "Bookmark"}
                      className={`m3-btn-text p-1.5 ${isBookmarked(i.id) ? "text-primary" : "text-on-surface-variant"}`}>
                      <Bookmark className={`w-4 h-4 ${isBookmarked(i.id) ? "fill-primary" : ""}`} />
                    </button>
                    <button onClick={() => toggleWon(i, "internship")} title={isWon(i.id) ? "Remove award" : "Mark as won"}
                      className={`m3-btn-text p-1.5 ${isWon(i.id) ? "text-secondary" : "text-on-surface-variant"}`}>
                      <Award className={`w-4 h-4 ${isWon(i.id) ? "text-secondary" : ""}`} />
                    </button>
                    {i.sourceUrl && (
                      <a href={i.sourceUrl} target="_blank" rel="noreferrer" title="Open website"
                        className="m3-btn-text p-1.5 text-on-surface-variant">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-sm text-on-surface-variant py-8 italic">No internships found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex justify-between items-center px-1 py-2 text-sm text-on-surface-variant">
          <span>{filtered.length} internships</span>
          {verifiedOnly && <span className="m3-badge m3-badge-verified">Verified only</span>}
        </div>
      )}
    </div>
  );
}