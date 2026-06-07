import React, { useState } from "react";
import { Internship } from "../../../types";
import { Search, Loader2, Sparkles, Filter, ShieldAlert, CheckCircle, Bookmark, BookmarkCheck, Calendar, Briefcase, DollarSign, RefreshCw, AlertTriangle, ExternalLink, Globe, Code, Heart, BarChart3, Building2, ArrowUpDown, Plus, Upload } from "lucide-react";

interface InternshipsPanelProps {
  internships: Internship[];
  bookmarks: string[];
  isLoading: boolean;
  onToggleBookmark: (id: string, type: "scholarship" | "internship") => void;
  onTriggerAIUpdate: (searchQuery: string) => Promise<void>;
  onAddManualInternship: (newInt: Internship) => void;
  onDismissNewItem: (id: string, type: "scholarship" | "internship") => void;
  onOpenResumeScanner: () => void;
}

export default function InternshipsPanel({
  internships,
  bookmarks,
  isLoading,
  onToggleBookmark,
  onTriggerAIUpdate,
  onAddManualInternship,
  onDismissNewItem,
  onOpenResumeScanner
}: InternshipsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter states
  const [levelFilter, setLevelFilter] = useState<"all" | "high_school" | "undergrad" | "grad">("all");
  const [fieldFilter, setFieldFilter] = useState<"all" | "Engineering" | "Health" | "Business">("all");
  const [sortBy, setSortBy] = useState<"soonest" | "title" | "company">("soonest");

  // Form state for custom manual additions
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [manualType, setManualType] = useState<"Paid" | "Unpaid">("Paid");
  const [manualDeadline, setManualDeadline] = useState("");
  const [manualLevel, setManualLevel] = useState<"high_school" | "undergrad" | "grad" | "all">("all");
  const [manualDescription, setManualDescription] = useState("");
  const [manualReqs, setManualReqs] = useState("");
  const [manualSource, setManualSource] = useState("");
  const [manualField, setManualField] = useState("Engineering");

  const handleAIQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingAI(true);
    setAiError(null);
    setSuccessMsg(null);
    try {
      await onTriggerAIUpdate(searchQuery);
      setSuccessMsg("AI scan complete! Retained live listings and flagged fraudulent applications.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setAiError(err?.message || "AI search lookup experienced a connection timeout.");
    } finally {
      setIsUpdatingAI(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualCompany) return;

    const newInt: Internship = {
      id: `int-manual-${Date.now()}`,
      title: manualTitle,
      company: manualCompany,
      location: manualLocation || "Remote",
      type: manualType,
      deadline: manualDeadline || "2026-12-31",
      studentLevel: manualLevel,
      description: manualDescription || "Hand-tracked student opportunity",
      requirements: manualReqs ? manualReqs.split(",").map(r => r.trim()) : ["Enrolled student Status"],
      isVerified: true,
      scamFlag: false,
      scamReason: "",
      sourceUrl: manualSource || "https://www.google.com",
      fieldOfStudy: manualField
    };

    onAddManualInternship(newInt);
    setShowManualForm(false);
    // Reset Form
    setManualTitle("");
    setManualCompany("");
    setManualLocation("");
    setManualDeadline("");
    setManualDescription("");
    setManualReqs("");
    setManualSource("");
  };

  // Filter & Sort
  const filteredInternships = internships
    .filter(item => {
      // Level check
      if (levelFilter !== "all") {
        if (item.studentLevel !== "all" && item.studentLevel !== levelFilter) return false;
      }
      // Field filter
      if (fieldFilter !== "all" && item.fieldOfStudy !== fieldFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "soonest") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return a.company.localeCompare(b.company);
    });

  return (
    <div className="space-y-6">
      {/* Clean Header Divider */}
      <div className="border-b border-holo-gray-border pb-2 flex justify-between items-end">
        <h2 className="text-xl font-light tracking-tight text-white">
          Internships
        </h2>
        <button
          onClick={onOpenResumeScanner}
          className="bg-holo-gray-light border border-holo-blue-dark text-holo-blue-light uppercase px-3 py-1 text-xs font-mono font-bold hover:bg-holo-blue-dim flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          SCAN RESUME
        </button>
      </div>

      {/* AI Grounding Section */}
      <div className="bg-holo-gray-dark border border-holo-gray-border p-4 relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-holo-blue-dark" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-holo-blue-light" />
              Internship Search
            </h3>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">
              Enter any query to search the live web. Powered by <strong>Gemini and Google Search</strong>, our guard automatically scans for fraudulent work-from-home checks, high-risk wire processing scams, and agencies requesting downpayments.
            </p>
          </div>
          <form onSubmit={handleAIQuery} className="flex-1 max-w-md flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. software engineer interns summer 2026"
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

      {/* Filters and Controls */}
      <div className="bg-holo-gray-dark border border-holo-gray-border p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Student level filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-holo-blue-light block uppercase">Target Level</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setLevelFilter("all")}
              className={`text-xs font-mono uppercase px-3 py-1.5 border transition-all duration-150 text-center cursor-pointer active:scale-95 ${levelFilter === "all" ? "bg-holo-blue-dark text-black border-holo-blue-light" : "bg-black text-gray-400 border-holo-gray-border hover:brightness-110"}`}
            >
              All Levels
            </button>
            <button
              onClick={() => setLevelFilter("high_school")}
              className={`text-xs font-mono uppercase px-3 py-1.5 border transition-all duration-150 text-center cursor-pointer active:scale-95 ${levelFilter === "high_school" ? "bg-holo-blue-dark text-black border-holo-blue-light" : "bg-black text-gray-400 border-holo-gray-border hover:brightness-110"}`}
            >
              High School
            </button>
            <button
              onClick={() => setLevelFilter("undergrad")}
              className={`text-xs font-mono uppercase px-3 py-1.5 border transition-all duration-150 text-center cursor-pointer active:scale-95 ${levelFilter === "undergrad" ? "bg-holo-blue-dark text-black border-holo-blue-light" : "bg-black text-gray-400 border-holo-gray-border hover:brightness-110"}`}
            >
              Undergrad
            </button>
            <button
              onClick={() => setLevelFilter("grad")}
              className={`text-xs font-mono uppercase px-3 py-1.5 border transition-all duration-150 text-center cursor-pointer active:scale-95 ${levelFilter === "grad" ? "bg-holo-blue-dark text-black border-holo-blue-light" : "bg-black text-gray-400 border-holo-gray-border hover:brightness-110"}`}
            >
              Grad Student
            </button>
          </div>
        </div>

        {/* Field of study filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-holo-blue-light block uppercase flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Field of Study
          </label>
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value as any)}
            className="w-full bg-black text-gray-200 border border-holo-gray-border px-3 py-1.5 text-xs font-mono focus:border-holo-blue-light outline-none"
          >
            <option value="all">Any Field of Study</option>
            <option value="Engineering">Engineering / STEM</option>
            <option value="Health">Health & Medicine</option>
            <option value="Business">Business & Consulting</option>
          </select>
        </div>

        {/* Sort selection */}
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
            <option value="soonest">Deadline Soonest</option>
            <option value="title">Job Title (A-Z)</option>
            <option value="company">Company (A-Z)</option>
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
            <Briefcase className="w-3.5 h-3.5" />
            {showManualForm ? "CLOSE FORM" : "ADD TRACKED INTERN"}
          </button>
        </div>
      </div>

      {/* Manual Insert Form */}
      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-holo-gray-dark border border-holo-blue-dark p-4 space-y-4">
          <h3 className="text-xs font-mono text-holo-blue-light uppercase border-b border-holo-gray-border pb-1.5 font-bold">
            Track Custom Internship Opening
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. QA Automation Assistant"
                value={manualTitle}
                onChange={e => setManualTitle(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Company / Agency *</label>
              <input
                type="text"
                required
                placeholder="e.g. Intel Corp"
                value={manualCompany}
                onChange={e => setManualCompany(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Location</label>
              <input
                type="text"
                placeholder="e.g. Remote / Hybrid NY"
                value={manualLocation}
                onChange={e => setManualLocation(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Salary Type</label>
              <select
                value={manualType}
                onChange={e => setManualType(e.target.value as any)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              >
                <option value="Paid">Paid Internship</option>
                <option value="Unpaid">Unpaid Opportunity</option>
              </select>
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Student Level</label>
              <select
                value={manualLevel}
                onChange={e => setManualLevel(e.target.value as any)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              >
                <option value="all">All student levels</option>
                <option value="high_school">High School Seniors</option>
                <option value="undergrad">Undergraduates</option>
                <option value="grad">Grad/PhD Students</option>
              </select>
            </div>
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
              <label className="text-3xs font-mono text-gray-400 uppercase block">Specialization Field</label>
              <select
                value={manualField}
                onChange={e => setManualField(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none"
              >
                <option value="Engineering">Engineering / STEM</option>
                <option value="Health">Health / BioMed</option>
                <option value="Business">Business / Finance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-3xs font-mono text-gray-400 uppercase block">Brief Job Description</label>
            <textarea
              placeholder="Provide key takeaways, department focus, goals..."
              value={manualDescription}
              onChange={e => setManualDescription(e.target.value)}
              rows={2}
              className="w-full bg-black text-gray-200 border border-holo-gray-border px-2 py-1 text-xs font-mono focus:border-holo-blue-light outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Core Requirements (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Python, Git, 3.0 GPA minimum"
                value={manualReqs}
                onChange={e => setManualReqs(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase block">Official Application URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={manualSource}
                onChange={e => setManualSource(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-holo-blue-dark text-black uppercase font-mono font-bold text-xs py-1.5 px-4 rounded-none hover:bg-holo-blue-light transition-all cursor-pointer"
          >
            CONFIRM INTERNSHIP TRACKING
          </button>
        </form>
      )}

      {/* Main List Container */}
      {filteredInternships.length === 0 ? (
        <div className="border border-holo-gray-border p-8 text-center bg-holo-gray-dark font-sans text-xs text-gray-400">
          No internships found matching those search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInternships.map((item) => {
            const isBookmarked = bookmarks.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={item.isNew ? () => onDismissNewItem(item.id, "internship") : undefined}
                className={`bg-holo-gray-dark border p-4 flex flex-col md:flex-row gap-4 items-start md:items-stretch transition-all duration-200 hover:scale-[1.01] ${
                    item.isNew
                    ? "border-holo-blue-light/70 bg-gradient-to-r from-holo-blue-dim/20 to-transparent cursor-pointer hover:border-holo-blue-light"
                    : "border-holo-gray-border hover:border-holo-blue-dark/50"
                }`}
              >
                {/* Left side: Basic details and type badge */}
                <div className="flex-grow space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {/* Company Name */}
                      <span className="text-xs font-sans text-holo-blue-light uppercase tracking-wider block">
                        {item.company} • {item.location}
                        {item.isNew && (
                          <span className="ml-2 inline-block bg-holo-blue-light text-black text-xs font-bold px-1.5 py-0.5 uppercase tracking-wider animate-pulse">
                            NEW
                          </span>
                        )}
                      </span>
                      {/* Name */}
                      <h4 className="text-base font-bold font-sans text-gray-100 flex items-center gap-1.5 mt-0.5">
                        {item.title}
                      </h4>
                    </div>

                    {/* Salary Type Badge */}
                    <div className="border border-holo-blue-dark px-2.5 py-1 text-center bg-black/60 shrink-0">
                      <span className="text-xs font-sans text-holo-blue-light uppercase tracking-wider block leading-none mb-0.5">COMPENSATION</span>
                      <span className="text-xs font-sans text-white tracking-tight leading-none font-bold block">{item.type}</span>
                    </div>
                  </div>

                  {/* Summary & description text */}
                  <p className="text-xs text-gray-300 leading-relaxed max-w-4xl py-1 font-sans">
                    {item.description}
                  </p>

                  {/* Criteria & Stats */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-sans text-gray-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Deadline: <span className="text-white font-medium">{item.deadline}</span>
                    </span>
                    <span className="border-l border-holo-gray-border pl-3">
                      Level: <span className="text-white font-medium uppercase">{item.studentLevel}</span>
                    </span>
                    <span className="border-l border-holo-gray-border pl-3">
                      Field: <span className="text-white font-medium uppercase">{item.fieldOfStudy}</span>
                    </span>
                  </div>

                  {/* Requirements bubble */}
                  <div className="pt-2 text-xs font-sans">
                    <span className="text-gray-400 block mb-1">Requirements & Qualifications:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.requirements.map((req, index) => (
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
                    onClick={() => onToggleBookmark(item.id, "internship")}
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

                  {/* External Visit Portal link */}
                  <a
                    href={item.sourceUrl}
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
