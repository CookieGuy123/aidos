import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Loader2, Sparkles, X, AlertTriangle, CheckCircle } from "lucide-react";

interface ResumeScannerModalProps {
  onClose: () => void;
  onData: (data: any) => void;
  data: any;
}

export default function ResumeScannerModal({ onClose, onData, data }: ResumeScannerModalProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const extractText = async (file: File): Promise<string> => {
    if (file.type === "text/plain") return await file.text();
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return text;
    }
    throw new Error("Unsupported file type. Please upload a .txt or .pdf file.");
  };

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    setUploading(true);
    try {
      const text = await extractText(file);
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text })
      });
      const result = await res.json();
      if (result.success) {
        onData(result);
      } else {
        setError(result.error || "Analysis failed.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to process resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseRef.current(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}
      style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>
      <div className="bg-holo-gray-dark border border-holo-gray-border w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-holo-gray-border shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-holo-blue-light" />
            <h2 className="text-sm font-bold text-white uppercase">Resume Match Scanner</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {!data ? (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-holo-gray-border hover:border-holo-blue-light/60 bg-black/40 p-10 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-xs text-holo-blue-light">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing resume...
                </div>
              ) : fileName ? (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
                  <FileText className="w-5 h-5 text-holo-blue-light" />
                  {fileName}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs text-gray-400">
                  <Upload className="w-8 h-8 text-holo-blue-light" />
                  <span className="text-sm">Drop your resume here or click to browse</span>
                  <span className="text-xs text-gray-500">Supports .txt and .pdf</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {data.profile && (
                <div className="p-3 bg-black/40 border border-holo-blue-dark/30 text-xs text-gray-300">
                  <strong className="text-holo-blue-light">Extracted Profile:</strong> {data.profile.summary}
                  <div className="flex gap-4 mt-1 text-gray-400">
                    {data.profile.gpa && <span>GPA: <strong className="text-white">{data.profile.gpa}</strong></span>}
                    {data.profile.gradeLevel && <span>Level: <strong className="text-white">{data.profile.gradeLevel}</strong></span>}
                    {data.profile.majors?.length > 0 && <span>Major: <strong className="text-white">{data.profile.majors.join(", ")}</strong></span>}
                  </div>
                </div>
              )}

              {data.scholarships?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-holo-blue-light uppercase mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Matched Scholarships ({data.scholarships.length})
                  </h4>
                  <div className="space-y-2">
                    {data.scholarships.map((s: any) => (
                      <div key={s.id} className="bg-black border border-holo-gray-border p-3 flex justify-between items-center text-xs">
                        <div className="max-w-[70%]">
                          <span className="text-gray-200 font-bold block">{s.name}</span>
                          <span className="text-gray-500">{s.organization}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-holo-blue-light block">{s.matchScore}/7 match</span>
                          <span className="text-emerald-400 font-bold">{s.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.internships?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-holo-blue-light uppercase mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Matched Internships ({data.internships.length})
                  </h4>
                  <div className="space-y-2">
                    {data.internships.map((i: any) => (
                      <div key={i.id} className="bg-black border border-holo-gray-border p-3 flex justify-between items-center text-xs">
                        <div className="max-w-[70%]">
                          <span className="text-gray-200 font-bold block">{i.title}</span>
                          <span className="text-gray-500">{i.company}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-holo-blue-light block">{i.matchScore}/7 match</span>
                          <span className="text-emerald-400 font-bold">{i.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!data.scholarships?.length && !data.internships?.length) && (
                <div className="p-4 bg-yellow-950/20 border border-yellow-700/30 text-xs text-yellow-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  No matching opportunities found for this profile.
                </div>
              )}

              <button
                onClick={() => { onData(null); setFileName(null); setError(null); }}
                className="w-full bg-holo-gray-light border border-holo-gray-border text-gray-300 hover:text-holo-blue-light py-2 text-xs font-mono uppercase cursor-pointer"
              >
                Scan Another Resume
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-950/40 border border-red-700/60 text-xs text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}