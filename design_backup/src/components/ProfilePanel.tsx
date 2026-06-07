import React, { useState } from "react";
import { Scholarship, Internship } from "../types";
import { User, Settings, Trophy, Bookmark, RefreshCw, Trash2, Edit3, Check, Sun, Moon } from "lucide-react";

interface ProfilePanelProps {
  userName: string;
  userLevel: string;
  onChangeUserName: (name: string) => void;
  onChangeUserLevel: (level: string) => void;
  theme: "dark" | "light";
  onChangeTheme: (theme: "dark" | "light") => void;
  bookmarks: string[];
  scholarships: Scholarship[];
  internships: Internship[];
  onToggleBookmark: (id: string, type: "scholarship" | "internship") => void;
  wonScholarships: { [id: string]: number };
  onToggleWonStatus: (id: string, amount: number) => void;
  onResetDatabase: () => void;
}

export default function ProfilePanel({
  userName,
  userLevel,
  onChangeUserName,
  onChangeUserLevel,
  theme,
  onChangeTheme,
  bookmarks,
  scholarships,
  internships,
  onToggleBookmark,
  wonScholarships,
  onToggleWonStatus,
  onResetDatabase
}: ProfilePanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [editingWonId, setEditingWonId] = useState<string | null>(null);
  const [tempWonAmount, setTempWonAmount] = useState<number>(0);

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onChangeUserName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const startEditWon = (id: string, currentAmount: number) => {
    setEditingWonId(id);
    setTempWonAmount(currentAmount);
  };

  const saveEditWon = (id: string) => {
    onToggleWonStatus(id, tempWonAmount);
    setEditingWonId(null);
  };

  // Find bookmarked items
  const savedScholarships = scholarships.filter(s => bookmarks.includes(s.id));
  const savedInternships = internships.filter(i => bookmarks.includes(i.id));

  // Find won items
  const wonList = scholarships.filter(s => wonScholarships[s.id] !== undefined);
  const totalGrants = Object.values(wonScholarships).reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="border-b border-holo-gray-border pb-2 flex justify-between items-end">
        <h2 className="text-xl font-light tracking-tight text-white flex items-center gap-2">
          <User className="w-5 h-5 text-holo-blue-light" />
          My Profile & Preferences
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal info & Preferences */}
        <div className="space-y-6 lg:col-span-1">
          {/* User Card */}
          <div className="bg-holo-gray-dark border border-holo-gray-border p-4 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-holo-blue-dark" />
            <h3 className="text-xs font-mono text-holo-blue-light uppercase tracking-wider mb-4 font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Student Credentials
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-3xs font-mono text-gray-400 block uppercase mb-1">Student Name</label>
                {isEditingName ? (
                  <form onSubmit={handleNameSave} className="flex gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      className="bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-sans focus:border-holo-blue-light outline-none flex-grow"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-holo-blue-dark text-black px-2.5 py-1 text-xs cursor-pointer hover:bg-holo-blue-light transition-all flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="flex justify-between items-center bg-black/40 p-2 border border-holo-gray-border/40">
                    <span className="text-sm font-sans font-bold text-gray-200">{userName}</span>
                    <button
                      onClick={() => {
                        setTempName(userName);
                        setIsEditingName(true);
                      }}
                      className="text-holo-blue-light hover:text-white transition-all text-xs font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      EDIT
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-3xs font-mono text-gray-400 block uppercase mb-1">Academic Student Level</label>
                <select
                  value={userLevel}
                  onChange={e => onChangeUserLevel(e.target.value)}
                  className="w-full bg-black text-gray-200 border border-holo-gray-border px-3 py-1.5 text-xs font-mono focus:border-holo-blue-light outline-none"
                >
                  <option value="high_school">High School Student</option>
                  <option value="undergrad">Undergraduate Student</option>
                  <option value="grad">Graduate / PhD Student</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-holo-gray-dark border border-holo-gray-border p-4 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-holo-blue-dark" />
            <h3 className="text-xs font-mono text-holo-blue-light uppercase tracking-wider mb-4 font-bold flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Console Preferences
            </h3>

            <div className="space-y-4">
              {/* Theme Selector */}
              <div>
                <label className="text-3xs font-mono text-gray-400 block uppercase mb-1.5">App Color Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeTheme("dark")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 border font-mono text-2xs uppercase transition-all cursor-pointer ${theme === "dark" ? "bg-holo-blue-dim text-holo-blue-light border-holo-blue-light font-bold" : "bg-black text-gray-400 border-holo-gray-border"}`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Dark Mode
                  </button>
                  <button
                    onClick={() => onChangeTheme("light")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 border font-mono text-2xs uppercase transition-all cursor-pointer ${theme === "light" ? "bg-holo-blue-dim text-holo-blue-light border-holo-blue-light font-bold" : "bg-black text-gray-400 border-holo-gray-border"}`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Light Mode
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-holo-gray-border/40">
                <button
                  onClick={onResetDatabase}
                  className="w-full bg-holo-gray-light border border-holo-gray-border text-gray-300 hover:text-holo-blue-light hover:border-holo-blue-light/50 transition-all py-1.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Sample Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: User Progress Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Scholarships Won List */}
          <div className="bg-holo-gray-dark border border-holo-gray-border p-4 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
            <div className="flex justify-between items-center border-b border-holo-gray-border pb-2 mb-4">
              <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Financial Awards Secured ({wonList.length})
              </h3>
              <span className="text-xs text-emerald-400 font-bold font-sans">
                Total: ${totalGrants.toLocaleString()}
              </span>
            </div>

            {wonList.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500 font-sans">
                No financial awards added to your won portfolio yet. Toggle the "Mark as Won" button on scholarship listings to begin tracking your earnings.
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {wonList.map(s => {
                  const currentAmount = wonScholarships[s.id] || 0;
                  const isEditing = editingWonId === s.id;

                  return (
                    <div key={s.id} className="flex justify-between items-center p-3 bg-black border border-emerald-900/40 font-sans text-xs">
                      <div className="max-w-[65%]">
                        <p className="font-bold text-gray-300 truncate">{s.name}</p>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{s.organization}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-mono font-bold">$</span>
                            <input
                              type="number"
                              value={tempWonAmount}
                              onChange={e => setTempWonAmount(parseFloat(e.target.value) || 0)}
                              className="bg-black text-emerald-400 border-b border-emerald-500 outline-none w-20 text-right font-mono font-bold px-1"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEditWon(s.id)}
                              className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer"
                              title="Save amount"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">${currentAmount.toLocaleString()}</span>
                            <button
                              onClick={() => startEditWon(s.id, currentAmount)}
                              className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                              title="Edit amount"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => onToggleWonStatus(s.id, 0)}
                          className="text-red-500 hover:text-red-400 p-0.5 border-l border-holo-gray-border/60 pl-2 cursor-pointer"
                          title="Remove award"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bookmarked / Monitored Opportunities */}
          <div className="bg-holo-gray-dark border border-holo-gray-border p-4 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-holo-blue-dark" />
            <h3 className="text-xs font-mono text-holo-blue-light uppercase tracking-wider border-b border-holo-gray-border pb-2 mb-4 font-bold flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              Monitored Watchlist ({bookmarks.length})
            </h3>

            {bookmarks.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-500 font-sans">
                Your monitored watchlist is empty. Bookmark scholarships and internships to keep track of deadlines here.
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {/* Bookmarked Scholarships */}
                {savedScholarships.map(s => (
                  <div key={s.id} className="p-3 bg-black border-l-2 border-holo-blue-light border border-holo-gray-border/40 flex justify-between items-start font-sans text-xs">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="bg-holo-blue-dim/40 text-holo-blue-light text-xs font-mono px-1 rounded-sm uppercase font-semibold">Scholarship</span>
                        <span className="text-xs text-red-400">Ends {s.deadline}</span>
                      </div>
                      <p className="font-bold text-gray-200 truncate">{s.name}</p>
                      <span className="text-xs text-gray-500 block truncate">{s.organization}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold font-mono">{s.amount}</span>
                      <button
                        onClick={() => onToggleBookmark(s.id, "scholarship")}
                        className="text-red-500 hover:text-red-400 cursor-pointer"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Bookmarked Internships */}
                {savedInternships.map(i => (
                  <div key={i.id} className="p-3 bg-black border-l-2 border-holo-gray-border border border-holo-gray-border/40 flex justify-between items-start font-sans text-xs">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="bg-holo-gray-light text-gray-300 text-xs font-mono px-1 rounded-sm uppercase font-semibold">Internship</span>
                        <span className="text-xs text-red-400">Deadline {i.deadline}</span>
                      </div>
                      <p className="font-bold text-gray-200 truncate">{i.title}</p>
                      <span className="text-xs text-gray-500 block truncate">{i.company} &bull; {i.location}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold font-mono">{i.type}</span>
                      <button
                        onClick={() => onToggleBookmark(i.id, "internship")}
                        className="text-red-500 hover:text-red-400 cursor-pointer"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
