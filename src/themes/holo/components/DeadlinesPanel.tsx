import React, { useState, useEffect, useRef } from "react";
import { College } from "../../../types";
import { collegesData } from "../../../data/colleges";
import { supabase } from "../../../supabaseClient";
import { Clock, DollarSign, Pin, Landmark, Code, GraduationCap, Palette, Stethoscope, Sparkles, Loader2 } from "lucide-react";

interface DeadlinesPanelProps {
  onSelectCollegeForCalculator: (college: College) => void;
}

export default function DeadlinesPanel({ onSelectCollegeForCalculator }: DeadlinesPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<"all" | "Ivy League" | "Top Engineering" | "Top Public" | "Top Liberal Arts" | "Specialized Health">("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<"all" | "Engineering" | "Health" | "Business" | "Arts" | "Humanities" | "General">("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState<"all" | "high" | "low">("all");

  const [colleges, setColleges] = useState<College[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("holo_custom_colleges") || "[]");
      return saved.length ? saved : collegesData;
    } catch { return collegesData; }
  });

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [suggestedColleges, setSuggestedColleges] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("holo_suggested_colleges") || "[]"); } catch { return []; }
  });

  // Load colleges from Supabase on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetch(`/api/user/load-data?userId=${session.user.id}`).then(r => r.json()).then(d => {
          if (d.success) {
            if (d.customColleges?.length) setColleges(d.customColleges);
            if (d.suggestedColleges?.length) setSuggestedColleges(d.suggestedColleges);
          }
        }).catch(() => {});
      }
    });
  }, []);

  // Debounced persist to localStorage and Supabase on change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("holo_custom_colleges", JSON.stringify(colleges));
      localStorage.setItem("holo_suggested_colleges", JSON.stringify(suggestedColleges));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetch("/api/user/save-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user.id, customColleges: colleges, suggestedColleges })
          }).catch(() => {});
        }
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [colleges, suggestedColleges]);

  const handleAiRecommend = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/colleges/recommend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: aiQuery })
      });
      const data = await res.json();
      setRecommendedIds(data.matches || []);
      if (data.suggestions?.length) setSuggestedColleges(data.suggestions);
    } catch { setRecommendedIds([]); }
    finally { setAiLoading(false); }
  };

  const dismissRecommendation = (id: string) => {
    setRecommendedIds(prev => prev.filter(i => i !== id));
    setSuggestedColleges(prev => prev.map(c => c.id === id ? { ...c, dismissed: true } : c));
  };

  // Custom addition of university deadlines in app
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTier, setNewTier] = useState<"Ivy League" | "Top Engineering" | "Top Public" | "Top Liberal Arts" | "Specialized Health">("Top Public");
  const [newSpecialization, setNewSpecialization] = useState<"Engineering" | "Health" | "Business" | "Arts" | "Humanities" | "General">("General");
  const [newTuition, setNewTuition] = useState<number>(45000);
  const [newAid, setNewAid] = useState<number>(20000);
  const [newDeadlineED, setNewDeadlineED] = useState("");
  const [newDeadlineRD, setNewDeadlineRD] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newAcceptance, setNewAcceptance] = useState<number>(10);

  const handleAddCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const item: College = {
      id: `col-custom-${Date.now()}`,
      name: newName,
      tier: newTier,
      specialization: newSpecialization,
      tuitionSticker: Number(newTuition) || 40000,
      avgAidPackage: Number(newAid) || 15000,
      deadlineED: newDeadlineED || "Nov 01",
      deadlineRD: newDeadlineRD || "Jan 01",
      location: newLocation || "USA",
      acceptanceRate: Number(newAcceptance) || 15
    };
    setColleges([item, ...colleges]);
    setShowAddForm(false);
    // clear fields
    setNewName("");
    setNewDeadlineED("");
    setNewDeadlineRD("");
    setNewLocation("");
  };

  const allDisplayColleges = [...colleges, ...suggestedColleges];
  const filteredColleges = allDisplayColleges.filter(college => {
    // Search match
    if (searchTerm && !college.name.toLowerCase().includes(searchTerm.toLowerCase()) && !college.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Tier match
    if (selectedTier !== "all" && college.tier !== selectedTier) {
      return false;
    }
    // Specialty match
    if (selectedSpecialty !== "all" && college.specialization !== selectedSpecialty) {
      return false;
    }
    // Price match
    if (selectedPriceTier === "high" && college.tuitionSticker <= 60000) return false;
    if (selectedPriceTier === "low" && college.tuitionSticker > 60000) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Clean Header Divider */}
      <div className="border-b border-holo-gray-border pb-2 flex justify-between items-end">
        <h2 className="text-xl font-light tracking-tight text-white">
          College Admissions & Timelines
        </h2>
      </div>

      <div className="bg-holo-gray-dark border border-holo-gray-border p-4 text-xs leading-normal font-sans text-gray-300 flex items-start gap-2">
        <Pin className="w-4 h-4 shrink-0 mt-0.5 text-holo-blue-light" />
        <span><strong>College Admissions Quick Info:</strong> Early Decision (ED) programs are binding agreements. Regular Decision (RD) applications commonly close in early January. You can track tuition costs here and load them instantly into the <strong>Financial Aid Calculator</strong> to project your out-of-pocket costs.</span>
      </div>

      {/* Control Widgets */}
      <div className="bg-holo-gray-dark border border-holo-gray-border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Quick Search */}
          <div className="space-y-1">
            <label className="text-2xs font-mono text-holo-blue-light uppercase">Search Institution</label>
            <input
              type="text"
              placeholder="e.g. Stanford or California"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black text-gray-200 border-b border-holo-gray-border py-1 px-2 text-xs font-mono focus:border-holo-blue-light outline-none"
            />
          </div>

          {/* Category Tier Filter */}
          <div className="space-y-1">
            <label className="text-2xs font-mono text-holo-blue-light uppercase">Academic Tier</label>
            <select
              value={selectedTier}
              onChange={e => setSelectedTier(e.target.value as any)}
              className="w-full bg-black text-gray-200 border border-holo-gray-border p-1 text-xs font-mono focus:border-holo-blue-light outline-none text-white font-sans"
            >
              <option value="all"> All Academic Categories</option>
              <option value="Ivy League">Ivy League Elite</option>
              <option value="Top Engineering">Elite Engineering & STEM</option>
              <option value="Top Public">Elite Public State Universities</option>
              <option value="Top Liberal Arts">Premier Liberal Arts Colleges</option>
              <option value="Specialized Health">Specialized Clinical Centers</option>
            </select>
          </div>

          {/* Specialization Domain focus */}
          <div className="space-y-1">
            <label className="text-2xs font-mono text-holo-blue-light uppercase">Power Fields</label>
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value as any)}
              className="w-full bg-black text-gray-200 border border-holo-gray-border p-1 text-xs font-mono focus:border-holo-blue-light outline-none text-white font-sans"
            >
              <option value="all"> All Specialties</option>
              <option value="Engineering">Engineering / Technology</option>
              <option value="Health">Biomedical / Pre-Medicine</option>
              <option value="Business">Finance / Business / Commerce</option>
              <option value="Arts font-sans">Fine Arts / Design</option>
              <option value="Humanities">Humanities / Classical Studies</option>
              <option value="General font-sans">General Education focus</option>
            </select>
          </div>

          {/* Budget tier */}
          <div className="space-y-1">
            <label className="text-2xs font-mono text-holo-blue-light uppercase">Sticker Tuition Volume</label>
            <select
              value={selectedPriceTier}
              onChange={e => setSelectedPriceTier(e.target.value as any)}
              className="w-full bg-black text-gray-200 border border-holo-gray-border p-1 text-xs font-mono focus:border-holo-blue-light outline-none text-white font-custom"
            >
              <option value="all"> All Tuition Fees</option>
              <option value="high">Above $60,000 /yr (Standard Private)</option>
              <option value="low">Below $60,000 /yr (Subsidized/Public)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-holo-gray-border">
          <span className="text-xs text-gray-400 font-sans">Found {filteredColleges.length} colleges match</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-sans bg-black hover:bg-holo-blue-dim border border-holo-blue-dark text-holo-blue-light px-3 py-1.5 cursor-pointer transition-all"
          >
            {showAddForm ? "Close Form" : "Add Custom College"}
          </button>
        </div>
      </div>

      {/* AI College Recommender */}
      <div className="bg-holo-gray-dark border border-holo-gray-border p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-holo-blue-light" />
          <h3 className="text-xs font-mono text-holo-blue-light uppercase font-bold">College Recommender</h3>
        </div>
        <p className="text-xs text-gray-400 mb-2">Describe your interests and we'll highlight matching colleges below.</p>
        <div className="flex items-center gap-2">
          <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAiRecommend()}
            className="flex-1 bg-black text-gray-200 border border-holo-gray-border px-3 py-1.5 text-xs font-mono focus:border-holo-blue-light outline-none placeholder:text-gray-600"
            placeholder="e.g. I want to study engineering in California..." />
          <button onClick={handleAiRecommend} disabled={aiLoading || !aiQuery.trim()}
            className="bg-holo-blue-dark text-black border border-holo-blue-light text-xs font-mono uppercase px-3 py-1.5 cursor-pointer disabled:opacity-40 hover:brightness-110 transition-all active:scale-95">
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Find"}
          </button>
        </div>
        {(recommendedIds.length > 0 || suggestedColleges.length > 0) && (
          <p className="text-xs text-emerald-400 mt-2">{recommendedIds.length + suggestedColleges.length} college{(recommendedIds.length + suggestedColleges.length) > 1 ? "s" : ""} matched. Click a highlighted card to dismiss.</p>
        )}
      </div>

      {/* Add Custom college timelines */}
      {showAddForm && (
        <form onSubmit={handleAddCollege} className="bg-holo-gray-dark border border-holo-blue-dark p-4 space-y-4">
          <h3 className="text-xs font-mono text-holo-blue-light uppercase border-b border-holo-gray-border pb-1 font-bold">
            Define Custom College Deadline & Aid Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Institution Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Duke University"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Academic Tier</label>
              <select
                value={newTier}
                onChange={e => setNewTier(e.target.value as any)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              >
                <option value="Ivy League">Ivy League</option>
                <option value="Top Engineering">Top Engineering</option>
                <option value="Top Public">Top Public</option>
                <option value="Top Liberal Arts">Top Liberal Arts</option>
                <option value="Specialized Health">Specialized Health</option>
              </select>
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Location</label>
              <input
                type="text"
                placeholder="e.g. Durham, NC"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Sticker Tuition Price ($/year) *</label>
              <input
                type="number"
                required
                value={newTuition}
                onChange={e => setNewTuition(Number(e.target.value))}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Average Need/Merit Financial Aid ($)</label>
              <input
                type="number"
                value={newAid}
                onChange={e => setNewAid(Number(e.target.value))}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Early Decision Deadline</label>
              <input
                type="text"
                placeholder="e.g. Nov 01"
                value={newDeadlineED}
                onChange={e => setNewDeadlineED(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Regular Decision Deadline</label>
              <input
                type="text"
                placeholder="e.g. Jan 01"
                value={newDeadlineRD}
                onChange={e => setNewDeadlineRD(e.target.value)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Primary Specialization Focus</label>
              <select
                value={newSpecialization}
                onChange={e => setNewSpecialization(e.target.value as any)}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              >
                <option value="Engineering">Engineering / Computations</option>
                <option value="Health">Clinical Health / Pre-Med</option>
                <option value="Business">Finance & Economics</option>
                <option value="Arts">Graphic & Fine Arts</option>
                <option value="Humanities">Classical Humanities</option>
                <option value="General">General / All major fields</option>
              </select>
            </div>
            <div>
              <label className="text-3xs font-mono text-gray-400 block">Acceptance Rate %</label>
              <input
                type="number"
                value={newAcceptance}
                onChange={e => setNewAcceptance(Number(e.target.value))}
                className="w-full bg-black text-gray-200 border-b border-holo-gray-border px-2 py-0.5 text-xs font-mono focus:border-holo-blue-light outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-holo-blue-dark text-black uppercase font-mono font-bold text-xs py-1.5 px-4 rounded-none hover:bg-holo-blue-light transition-all cursor-pointer"
          >
            INCORPORATE TIMELINE RECORD
          </button>
        </form>
      )}

      {/* Colleges list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredColleges.map(coll => {
          const suggestion = suggestedColleges.find(s => s.id === coll.id);
          const isRec = recommendedIds.includes(coll.id) || (suggestion && !suggestion.dismissed);
          return (
            <div
              key={coll.id}
              onClick={isRec ? () => dismissRecommendation(coll.id) : undefined}
              className={`bg-holo-gray-dark border p-4 space-y-3 flex flex-col justify-between font-sans transition-all duration-200 ${
                isRec
                  ? "border-holo-blue-light/70 bg-gradient-to-r from-holo-blue-dim/20 to-transparent ring-1 ring-holo-blue-light/50 cursor-pointer"
                  : "border-holo-gray-border hover:border-holo-blue-dark/50"
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <span className="text-xs text-holo-blue-light uppercase tracking-wider block font-bold">
                      {coll.tier} &bull; {coll.specialization} FOCUS
                    </span>
                    <h4 className="text-base font-bold text-gray-100 mt-1">{coll.name}
                      {suggestion && !suggestion.dismissed && <span className="ml-2 inline-block bg-holo-blue-light text-black text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider">AI SUGGESTED</span>}
                    </h4>
                    <span className="text-xs text-gray-400 block mt-0.5">{coll.location}</span>
                    {suggestion?.reason && !suggestion.dismissed && <p className="text-xs text-holo-blue-light mt-1 italic">"{suggestion.reason}"</p>}
                  </div>

                  <span className="text-xs text-gray-400 border border-holo-gray-border px-2 py-0.5 bg-black rounded-sm">
                    Acceptance: {coll.acceptanceRate}%
                  </span>
                </div>

                {/* Deadlines Section */}
                <div className="grid grid-cols-2 gap-2 mt-3 bg-black/60 p-2.5 border border-holo-gray-border">
                  <div>
                    <span className="text-xs text-gray-500 uppercase block tracking-wider leading-none">Early Decision (ED)</span>
                    <span className="text-xs text-white flex items-center gap-1 mt-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-holo-blue-light mr-1" />
                      {coll.deadlineED}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase block tracking-wider leading-none">Regular Decision (RD)</span>
                    <span className="text-xs text-white flex items-center gap-1 mt-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-holo-blue-light mr-1" />
                      {coll.deadlineRD}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-gray-300">
                  <span>Sticker Tuition: <strong className="text-white font-semibold">${coll.tuitionSticker.toLocaleString()}/yr</strong></span>
                  <span>Average Financial Aid: <strong className="text-emerald-400 font-semibold">${coll.avgAidPackage.toLocaleString()}/yr</strong></span>
                </div>
              </div>

              {/* Loader into calculations */}
              <button
                onClick={() => onSelectCollegeForCalculator(coll)}
                className="w-full mt-2 bg-holo-gray-light border border-holo-gray-border text-holo-blue-light text-xs py-2 font-sans font-medium hover:bg-holo-blue-dim transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <DollarSign className="w-4 h-4 text-holo-blue-light" />
                Load Tuition into Calculator
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
