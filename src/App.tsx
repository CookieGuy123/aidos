import React, { lazy, Suspense } from "react";

const M3App = lazy(() => import("./themes/m3/App"));

export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141218] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#90CAF9] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <M3App />
    </Suspense>
  );
}
