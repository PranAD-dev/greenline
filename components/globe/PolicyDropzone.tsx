"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload, FileText, Loader2, Zap, Globe } from "lucide-react";
import { SAMPLE_POLICY_TEXT } from "@/lib/agents/globe";

interface PolicyDropzoneProps {
  onAnalyze: (text: string) => void;
  loading: boolean;
}

export default function PolicyDropzone({ onAnalyze, loading }: PolicyDropzoneProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.name.match(/\.(txt|md)$/i)) {
      alert("Please upload a .txt or .md file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function loadSample() {
    setText(SAMPLE_POLICY_TEXT.trim());
    setFileName("riverside-climate-plan.txt");
  }

  const canAnalyze = text.trim().length > 50 && !loading;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Globe size={16} className="text-emerald-400" />
          Policy Globe
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Drop a policy document (.txt or .md) to see its global geographic impact on a 3D globe.
        </p>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${dragging
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800"
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {fileName ? (
          <div className="flex flex-col items-center gap-1.5">
            <FileText size={20} className="text-emerald-400" />
            <span className="text-sm text-white font-medium">{fileName}</span>
            <span className="text-xs text-slate-500">{text.length.toLocaleString()} characters</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-500">
            <Upload size={20} />
            <span className="text-sm">Drop .txt or .md file here</span>
            <span className="text-xs">or click to browse</span>
          </div>
        )}
      </div>

      {/* OR divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="text-xs text-slate-600">or paste text</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setFileName(null); }}
        placeholder="Paste policy document text here..."
        className="flex-1 min-h-[160px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none font-mono text-xs leading-relaxed"
      />

      {/* Char count */}
      {text && (
        <div className="text-xs text-slate-600 -mt-2">
          {text.length.toLocaleString()} chars · {text.trim().split(/\s+/).length.toLocaleString()} words
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={() => canAnalyze && onAnalyze(text)}
        disabled={!canAnalyze}
        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Analyzing with Claude...
          </>
        ) : (
          <>
            <Zap size={14} />
            Analyze Policy
          </>
        )}
      </button>

      {/* Sample policy shortcut */}
      <button
        onClick={loadSample}
        disabled={loading}
        className="text-xs text-slate-500 hover:text-emerald-400 transition-colors py-1 border border-slate-700/50 rounded-lg hover:border-emerald-500/30"
      >
        Use sample: Riverside Climate Action Plan
      </button>

      {/* Hint */}
      {!text && (
        <p className="text-xs text-slate-600 text-center">
          Claude will identify cities and regions affected by the policy and explain the impact for each.
        </p>
      )}
    </div>
  );
}
