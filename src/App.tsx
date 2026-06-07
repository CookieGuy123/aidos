import React, { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "./supabaseClient";
import { Palette, Shield } from "lucide-react";

const M3App = lazy(() => import("./themes/m3/App"));
const HoloApp = lazy(() => import("./themes/holo/App"));

export default function App() {
  const [uiTheme, setUiTheme] = useState<"m3" | "holo">(() => {
    return (localStorage.getItem("aid_ui_theme") as "m3" | "holo") || "m3";
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    localStorage.setItem("aid_ui_theme", uiTheme);
  }, [uiTheme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.role === "admin") setIsAdmin(true);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#141218] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#90CAF9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Admin theme toggle bar */}
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-9 bg-[#1E1C22] border-b border-[#49454F] flex items-center justify-center gap-2 px-4">
          <Shield className="w-3.5 h-3.5 text-[#A8C7FA]" />
          <span className="text-xs font-medium text-[#CAC4D0]">Admin:</span>
          <button onClick={() => setUiTheme("m3")}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              uiTheme === "m3" ? "bg-[#A8C7FA] text-[#003258]" : "bg-[#2B2930] text-[#CAC4D0] hover:bg-[#353339]"
            }`}>
            Material
          </button>
          <button onClick={() => setUiTheme("holo")}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              uiTheme === "holo" ? "bg-[#33b5e5] text-black" : "bg-[#2B2930] text-[#CAC4D0] hover:bg-[#353339]"
            }`}>
            Holo
          </button>
        </div>
      )}

      {/* Selected theme */}
      <div className={isAdmin ? "pt-9" : ""}>
        <Suspense fallback={
          <div className="min-h-screen bg-[#141218] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#90CAF9] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {uiTheme === "m3" ? <M3App /> : <HoloApp />}
        </Suspense>
      </div>
    </>
  );
}