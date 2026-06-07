import React, { useState } from "react";
import { Scholarship } from "../../../types";
import { Search, Loader2, Sparkles, Filter, CheckCircle, Bookmark, BookmarkCheck, Calendar, Trophy, DollarSign, RefreshCw, AlertTriangle, ExternalLink, ArrowUpDown, Plus, Upload } from "lucide-react";

interface ScholarshipsPanelProps {
  scholarships: Scholarship[];
  bookmarks: string[];
  wonScholarships: { [id: string]: number };
  isLoading: boolean;
  onToggleBookmark: (id: string, type: "scholarship" | "internship") => void;
  onToggleWonStatus: (id: string, amount: number) => void;
  onTriggerAIUpdate: (searchQuery: string) => Promise<void>;
  setIsAddingManual: (show: boolean) => void;
  onAddManualScholarship: (newSch: Scholarship) => void;
  onDismissNewItem: (id: string, type: "scholarship" | "internship") => void;
  onOpenResumeScanner: () => void;
}

export default function ScholarshipsPanel({
  scholarships,
  bookmarks,
  wonScholarships,
  isLoading,
  onToggleBookmark,
  onToggleWonStatus,
  onTriggerAIUpdate,
  onAddManualScholarship,
  onDismissNewItem,
  onOpenResumeScanner
}: ScholarshipsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter states
  const [levelFilter, setLevelFilter] = useState<"all" | "high_school" | "college" | "both">("all");

  const [ageLimit, setAgeLimit] = useState<number>(30);
  const [sortBy, setSortBy] = useState<"soonest" | "reward" | "name">("soonest");

  // Form state for custom manual additions
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualOrg, setManualOrg] = useState("");
  const [manualReward, setManualReward] = useState("");
  const [manualDeadline, setManualDeadline] = useState("");
  const [manualLevel, setManualLevel] = useState<"high_school" | "college" | "both">("both");
  const [manualReqs, setManualReqs] = useState("");
  const [manualSource, setManualSource] = useState("");

  const handleAIQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingAI(true);
    setAiError(null);
    setSuccessMsg(null);
    try {
      await onTriggerAIUpdate(searchQuery);
      setSuccessMsg("AI update completed! Expired opportunities checked and suspicious records flagged.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setAiError(err?.message || "AI search lookup experienced a connection timeout.");
    } finally {
      setIsUpdatingAI(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualReward) return;

    const amountNum = parseFloat(manualReward.replace(/[^0-9.]/g, "")) || 0;
    const newSch: Scholarship = {
      id: `sch-manual-${Date.now()}`,
      name: manualName,
      organization: manualOrg || "Self-Declared Opportunity",
      amount: manualReward.startsWith("$") ? manualReward : `$${manualReward}`,
      amountNumeric: amountNum,
      deadline: manualDeadline || "2026-12-31",
      studentLevel: manualLevel,
      ageFilter: "All eligible",
      isFree: true,
      scamFlag: false,
      scamReason: "",
      requirements: manualReqs ? manualReqs.split(",").map(r => r.trim()) : ["Standard student admission"],
      isVerified: true,
      sourceUrl: manualSource || "https://www.google.com",
      fieldOfStudy: "Any"
    };

    onAddManualScholarship(newSch);
    setShowManualForm(false);
    // Reset form
    setManualName("");
    setManualOrg("");
    setManualReward("");
    setManualDeadline("");
    setManualReqs("");
    setManualSource("");
  };

  // Filter & Sort core logic
  const parseAwardValue = (amountStr: string): number => {
    const match = amountStr.match(/\$?([\d,]+)/);
    if (!match) return 0;
    return parseInt(match[1].replace(/,/g, ""), 10) || 0;
  };

  const filteredScholarships = scholarships
    .filter(s => {
      // Level check
      if (levelFilter !== "all") {
        if (s.studentLevel !== "both" && s.studentLevel !== levelFilter) return false;
      }
      // Simple age check helper (extracts approximate number from string like 'Under 19' or 'All')
      const ageMatch = s.ageFilter.match(/\d+/);
      const minAge = ageMatch ? parseInt(ageMatch[0]) : null;
      if (minAge && minAge > ageLimit) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "soonest") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "reward") {
        return parseAwardValue(b.amount) - parseAwardValue(a.amount);
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6">
      {/* Clean Header Divider */}
      <div className="border-b border-holo-gray-border pb-2 flex justify-between items-end">
        <h2 className="text-xl font-light tracking-tight text-white">
          Scholarships
        </h2>
        <button
          onClick={onOpenResumeScanner}
          className="bg-holo-gray-light border border-holo-blue-dark text-holo-blue-light uppercase px-3 py-1 text-xs font-mono font-bold hover:bg-holo-blue-dim flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          SCAN RESUME
        </button>
      </div>

      {/* AI Search Grounding & Update Bar */}
      <div className="bg-holo-gray-dark border border-holo-gray-border p-4 relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-holo-blue-dark" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-holo-blue-light" />
              Scholarship Search
            </h3>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">
              Enter any query to search the live web. Supported by <strong>Gemini and Google Search</strong>, our system screens and filters out suspected predatory application scams, verification fees, and phishing requests before listing.
            </p>
          </div>
          <form onSubmit={handleAIQuery} className="flex-1 max-w-md flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. computer science scholar for high schoolers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-black text-gray-200 border-b border-holo-gray-border px-3 py-1.5 text-xs font-sans focus:border-holo-blue-light transition-all outline-none"
            />
<button
            type="submit"
            disabled={isUpdatingAI}
            className="bg-holo-gray-light border border-holo-blue-dark text-holo-blue-light uppercase px-4 py-1.5 text-xs font-sans font-bold hover:bg-holo-blue-dim flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 transition-all duration-150"
          >
              {isUpdatingAI ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Search Web
                </>
              )}
            </button>
          </form>
        </div>

        {isUpdatingAI && (
          <div className="mt-3 p-2 border border-dashed border-holo-blue-light/50 bg-holo-blue-dim/10 text-center text-xs font-sans text-holo-blue-light animate-pulse">
            Searching public records and validating source channels for safe compliance...
          </div>
        )}

        {aiError && (
          <div className="mt-3 p-3 bg-red-950/40 border border-red-700/60 text-red-400 text-xs font-sans flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {aiError}
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 bg-teal-950/40 border border-teal-700/60 text-teal-400 text-xs font-sans flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {successMsg}
          </div>
        )}
      </div>

      {/* Control Panel / Filtering & Sorting */}
      <div className="bg-holo-gray-dark border border-holo-gray-border p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Level filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-holo-blue-light block uppercase">Target Level</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setLevelFilter("all")}
              className={`text-xs font-mono uppercase px-3 py-1.5 border transition-all duration-150 text-center cursor-pointer active:scale-95 ${levelFilter === "all" ? "bg-holo-blue-dark text-black border-holo-blue-light" : "bg-black text-gray-400 border-holo-gray-border hover:brightness-110"}`}
            >
              All Types
            </button>
            <button
              onClick={() => setLevelFilter("high_school")}
              className={`text-xs font-mono uppercase px-3 py-1.5 border transition-all duration-150 text-center cursor-pointer active:scale-95 ${levelFilter === "high_school" ? "bg-holo-blue-dark text-black border-holo-blue-light" : "bg-black text-gray-400 border-holo-gray-border hover:brightness-110"}`}
            >
              High School
            </button>
            <button
              onClick={() => setLevelFilter("college")}
              className={`text-xs font-mono uppercase px-3 py-1.5 border transition-all duration-150 text-center cursor-pointer active:scale-95 ${levelFilter === "college" ? "bg-holo-blue-dark text-black border-holo-blue-light" : "bg-black text-gray-400 border-holo-gray-border hover:brightness-110"}`}
            >
              Undergrad
            </button>
            <button
              onClick={() => setLevelFilter("both")}
              className={`text-xs font-mono uppercase px-3 py-1.5 border transition-all duration-150 text-center cursor-pointer active:scale-95 ${levelFilter === "both" ? "bg-holo-blue-dark text-black border-holo-blue-light" : "bg-black text-gray-400 border-holo-gray-border hover:brightness-110"}`}
            >
              Co-Eligible
            </button>
          </div>
        </div>

        {/* Sorting selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-holo-blue-light block uppercase flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sort Order
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-black text-gray-200 border border-holo-gray-border px-3 py-1.5 text-xs font-mono focus:border-holo-blue-light outline-none"
          >
            <option value="soonest">Ending Soonest</option>
            <option value="reward">Highest Award (Value)</option>
            <option value="name">Title (A to Z)</option>
          </select>
        </div>

        {/* Manual Entry */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-holo-blue-light block uppercase flex items-center gap-1">
            <Plus className="w-3 h-3" />
            Manual Entry
          </label>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="w-full bg-holo-gray-light border border-holo-gray-border text-gray-200 uppercase px-4 py-1.5 text-xs font-mono font-bold hover:bg-holo-blue-dim hover:text-holo-blue-light flex items-center justify-center gap-1.5 transition-all duration-150 text-center cursor-pointer active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5" />
            {showManualForm ? "CLOSE FORM" : "ADD WON / MY SCH"}
          </button>
        </div>
      </div>

      {/* Manual Insert Form */}
      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-holo-gray-dark border border-holo-blue-dark p-4 space-y-4">
          <h3 className="text-xs font-mono text-holo-blue-light uppercase border-b border-holo-gray-border pb-1.5 font-bold">
            Add Manually Tracked Scholarship / Won Award
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Scholarship Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Local Lions Club Scholarship"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Issuer Foundation</label>
              <input
                type="text"
                placeholder="e.g. Lions Club International"
                value={manualOrg}
                onChange={e => setManualOrg(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Award Amount ($) *</label>
              <input
                type="text"
                required
                placeholder="e.g. $2500"
                value={manualReward}
                onChange={e => setManualReward(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Deadline Date</label>
              <input
                type="date"
                value={manualDeadline}
                onChange={e => setManualDeadline(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Target Student Level</label>
              <select
                value={manualLevel}
                onChange={e => setManualLevel(e.target.value as any)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              >
                <option value="both">Both High School & College</option>
                <option value="high_school">High School Only</option>
                <option value="college">College Student Only</option>
              </select>
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Original URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={manualSource}
                onChange={e => setManualSource(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-3xs font-mono text-gray-400 uppercase block">Requirements (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g. Minimum GPA 3.0, Community service history, Short essay"
              value={manualReqs}
              onChange={e => setManualReqs(e.target.value)}
              className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-holo-blue-dark text-black uppercase font-mono font-bold text-xs py-1.5 px-4 rounded-none hover:bg-holo-blue-light transition-all cursor-pointer"
          >
            CONFIRM ENTRY
          </button>
        </form>
      )}

      {/* Main List Container */}
      {filteredScholarships.length === 0 ? (
        <div className="border border-holo-gray-border p-8 text-center bg-holo-gray-dark font-sans text-xs text-gray-400">
          No scholarships found matching those search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredScholarships.map((s) => {
            const isBookmarked = bookmarks.includes(s.id);
            const isWonValue = wonScholarships[s.id] !== undefined;

            return (
              <div
                key={s.id}
                onClick={s.isNew ? () => onDismissNewItem(s.id, "scholarship") : undefined}
                className={`bg-holo-gray-dark border p-4 flex flex-col md:flex-row gap-4 items-start md:items-stretch transition-all duration-200 hover:scale-[1.01] ${
                    isWonValue
                    ? "border-emerald-600/80 bg-gradient-to-r from-emerald-950/15 to-transparent"
                    : s.isNew
                    ? "border-holo-blue-light/70 bg-gradient-to-r from-holo-blue-dim/20 to-transparent cursor-pointer hover:border-holo-blue-light"
                    : "border-holo-gray-border hover:border-holo-blue-dark/50"
                }`}
              >
                {/* Left side: Basic details and award badge */}
                <div className="flex-grow space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {/* Organisation */}
                      <span className="text-xs font-sans text-holo-blue-light uppercase tracking-wider block">
                        {s.organization}
                        {s.isNew && (
                          <span className="ml-2 inline-block bg-holo-blue-light text-black text-xs font-bold px-1.5 py-0.5 uppercase tracking-wider animate-pulse">
                            NEW
                          </span>
                        )}
                      </span>
                      {/* Name */}
                      <h4 className="text-base font-bold font-sans text-gray-100 flex items-center gap-1.5 mt-0.5">
                        {s.name}
                      </h4>
                    </div>

                    {/* Reward Badge */}
                    <div className="border border-holo-blue-dark px-2.5 py-1 text-center bg-black/60 shrink-0">
                      <span className="text-xs font-sans text-holo-blue-light uppercase tracking-wider block leading-none mb-0.5">AWARD</span>
                      <span className="text-xs font-sans text-white tracking-tight leading-none font-bold block">{s.amount}</span>
                    </div>
                  </div>

                  {/* Criteria & Stats */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-sans text-gray-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Deadline: <span className="text-white font-medium">{s.deadline}</span>
                    </span>
                    <span className="border-l border-holo-gray-border pl-3">
                      Level: <span className="text-white font-medium">{s.studentLevel === "both" ? "HS & College" : s.studentLevel === "high_school" ? "High School" : "Undergrad"}</span>
                    </span>
                    <span className="border-l border-holo-gray-border pl-3">
                      Age limits: <span className="text-white font-medium">{s.ageFilter}</span>
                    </span>
                    <span className="border-l border-holo-gray-border pl-3">
                      Field: <span className="text-white font-medium">{s.fieldOfStudy}</span>
                    </span>
                    {s.originalQuery && (
                      <span className="border-l border-holo-gray-border pl-3 text-holo-blue-light font-medium">
                        Keyword: "{s.originalQuery}"
                      </span>
                    )}
                  </div>

                  {/* Requirements bubble */}
                  <div className="pt-2 text-xs font-sans">
                    <span className="text-gray-400 block mb-1">Eligibility Criteria:</span>
                    <div className="flex flex-wrap gap-1">
                      {s.requirements.map((req, index) => (
                        <span key={index} className="bg-holo-gray-light border border-holo-gray-border text-gray-300 px-2.5 py-0.5">
                          • {req}
                        </span>
                      ))}
                    </div>
</div>
                  </div>

                {/* Right side: Action triggers */}
                <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 w-full md:w-34 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-holo-gray-border md:pl-3">
                  {/* Bookmark Toggle */}
                  <button
                    onClick={() => onToggleBookmark(s.id, "scholarship")}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 border font-mono text-xs uppercase transition-all duration-150 cursor-pointer active:scale-95 ${
                      isBookmarked
                        ? "bg-holo-blue-dim text-holo-blue-light border-holo-blue-light"
                        : "bg-black text-gray-300 border-holo-gray-border hover:brightness-110"
                    }`}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="w-3 h-3 text-holo-blue-light" />
                        BOOKMARKED
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3 h-3 text-gray-400" />
                        BOOKMARK
                      </>
                    )}
                  </button>

                  {/* Mark as won */}
                    <div className="flex-1 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          const currentAmt = wonScholarships[s.id] || s.amountNumeric;
                          onToggleWonStatus(s.id, isWonValue ? 0 : currentAmt);
                        }}
                        className={`w-full flex items-center justify-center gap-1 px-2 py-1 border font-mono text-xs uppercase transition-all duration-150 cursor-pointer active:scale-95 ${
                          isWonValue
                            ? "bg-emerald-950 text-emerald-400 border-emerald-500"
                            : "bg-black text-gray-300 border-holo-gray-border hover:brightness-110"
                        }`}
                      >
                        <Trophy className="w-3 h-3" />
                        {isWonValue ? "WON (EDIT)" : "MARK WON"}
                      </button>

                      {isWonValue && (
                        <div className="flex items-center gap-1 bg-black border border-emerald-600/50 px-1 mt-0.5">
                          <span className="text-xs font-mono text-emerald-400">$</span>
                          <input
                            type="number"
                            value={wonScholarships[s.id]}
                            onChange={(e) => onToggleWonStatus(s.id, parseFloat(e.target.value) || 0)}
                            className="bg-transparent text-emerald-400 outline-none w-full text-xs font-mono border-none text-right py-0.5"
                          />
                        </div>
                      )}
                    </div>

                  {/* External Visit Portal link */}
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-holo-gray-light border border-holo-gray-border text-gray-300 font-mono text-xs uppercase transition-all duration-150 py-1 text-center hover:bg-holo-blue-dim hover:text-holo-blue-light hover:border-holo-blue-light active:scale-95"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    APPLY
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
