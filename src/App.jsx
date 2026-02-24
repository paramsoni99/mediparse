import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import {
  Dna, Upload, FileText, Play, Loader2, ArrowDown,
  LayoutDashboard, ClipboardList, Sparkles, Building2,
  ChevronDown
} from "lucide-react";
import ResultViewer from "./components/ResultViewer";
import BatchQueue from "./components/BatchQueue";
import Dashboard from "./components/Dashboard";
import ExportPanel from "./components/ExportPanel";
import { extractMedicalData } from "./services/geminiService";
import "./index.css";

export default function App() {
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("results");
  const [singleText, setSingleText] = useState("");
  const processingRef = useRef(false);
  const workspaceRef = useRef(null);

  const handleFilesAdded = (files) => {
    const newItems = files.map((f) => ({ fileName: f.name, file: f, status: "pending", data: null }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleTextInput = (text, name) => {
    setSingleText(text);
  };

  const processQueue = async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);

    setQueue((prev) =>
      prev.map((item) => (item.status === "pending" ? { ...item, status: "pending" } : item))
    );

    const currentQueue = queue.filter((item) => item.status === "pending");

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      const globalIndex = queue.findIndex((q) => q.fileName === item.fileName && q.status === "pending");

      setQueue((prev) =>
        prev.map((q, idx) => (idx === globalIndex ? { ...q, status: "processing" } : q))
      );

      try {
        let text = "";
        if (item.file) {
          text = await item.file.text();
        }
        const data = await extractMedicalData(text);
        setQueue((prev) =>
          prev.map((q, idx) => (idx === globalIndex ? { ...q, status: "done", data } : q))
        );
        if (selectedIndex === null) setSelectedIndex(globalIndex);
      } catch (err) {
        setQueue((prev) =>
          prev.map((q, idx) => (idx === globalIndex ? { ...q, status: "error" } : q))
        );
      }
    }

    processingRef.current = false;
    setProcessing(false);
  };

  const handleSingleExtract = async () => {
    if (!singleText.trim()) return;
    const newItem = { fileName: "manual-input.txt", file: null, status: "processing", data: null };
    const newIndex = queue.length;
    setQueue((prev) => [...prev, newItem]);
    setProcessing(true);
    try {
      const data = await extractMedicalData(singleText);
      setQueue((prev) =>
        prev.map((q, i) => (i === newIndex ? { ...q, status: "done", data } : q))
      );
      setSelectedIndex(newIndex);
    } catch {
      setQueue((prev) =>
        prev.map((q, i) => (i === newIndex ? { ...q, status: "error" } : q))
      );
    }
    setProcessing(false);
  };

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const doneCount = queue.filter((q) => q.status === "done").length;
  const selectedResult = selectedIndex !== null ? queue[selectedIndex]?.data : null;

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)" }}>

      {/* ─── Glass Navbar ─── */}
      <nav className="glass-card" style={{
        position: "sticky", top: 0, zIndex: 50,
        borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none",
        padding: "0 40px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Dna size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>MediParse</h1>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.02em" }}>Medical Document Intelligence</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {doneCount > 0 && (
            <>
              <button
                className={`tab-pill ${activeTab === "results" ? "active" : ""}`}
                onClick={() => setActiveTab("results")}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <ClipboardList size={14} /> Results
                </span>
              </button>
              <button
                className={`tab-pill ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <LayoutDashboard size={14} /> Dashboard
                </span>
              </button>
            </>
          )}
          <span className="badge badge-green" style={{ marginLeft: "8px" }}>
            <Sparkles size={12} /> Gemini 2.5 Flash
          </span>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      {queue.length === 0 && (
        <section style={{
          position: "relative", overflow: "hidden",
          padding: "100px 24px 80px",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(var(--accent-primary-rgb), 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 50%, rgba(6,182,212,0.06) 0%, transparent 50%),
            var(--bg-deep)
          `,
        }}>
          {/* Floating accent orbs */}
          <div style={{
            position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)",
            width: "500px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(var(--accent-primary-rgb), 0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="badge badge-green" style={{ marginBottom: "20px" }}>
              <Sparkles size={12} /> AI-Powered Medical Data Extraction
            </span>

            <h2 className="hero-title" style={{
              fontSize: "44px", fontWeight: 800, lineHeight: 1.15,
              maxWidth: "680px", margin: "0 auto 16px",
              background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Transform Unstructured Medical Records into Actionable Data
            </h2>

            <p style={{
              color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.7,
              maxWidth: "520px", margin: "0 auto 36px",
            }}>
              Upload discharge summaries, lab reports, or doctor notes. Our AI extracts patient information, diagnoses, medications, and lab results into analysis-ready JSON.
            </p>

            <motion.button
              className="btn-primary"
              onClick={scrollToWorkspace}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: "auto", padding: "14px 32px", fontSize: "15px" }}
            >
              Get Started <ArrowDown size={16} />
            </motion.button>
          </motion.div>
        </section>
      )}

      {/* ─── Workspace ─── */}
      <div ref={workspaceRef} style={{ maxWidth: "1140px", margin: "0 auto", padding: "32px 24px 60px" }}>
        {activeTab === "results" ? (
          <div
            className="workspace-grid"
            style={{
              display: "grid",
              gridTemplateColumns: queue.length > 0 ? "320px 1fr" : "1fr",
              gap: "24px", alignItems: "start",
            }}
          >
            {/* ─── Left Sidebar ─── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Upload Card */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <div className="section-label">
                  <Upload size={13} /> Upload Files
                </div>
                <MultiFileUpload
                  onFilesAdded={handleFilesAdded}
                  onTextInput={handleTextInput}
                  isLoading={processing}
                />

                {singleText && queue.filter(q => q.fileName === "manual-input.txt" && q.status === "done").length === 0 && (
                  <button
                    className="btn-primary"
                    onClick={handleSingleExtract}
                    disabled={processing}
                    style={{ marginTop: "12px" }}
                  >
                    {processing ? (
                      <><Loader2 size={15} className="animate-spin" /> Extracting...</>
                    ) : (
                      <><Play size={15} /> Extract Text</>
                    )}
                  </button>
                )}

                {pendingCount > 0 && (
                  <button
                    className="btn-primary"
                    onClick={processQueue}
                    disabled={processing}
                    style={{ marginTop: "12px" }}
                  >
                    {processing ? (
                      <><Loader2 size={15} className="animate-spin" /> Processing...</>
                    ) : (
                      <><Play size={15} /> Process {pendingCount} File{pendingCount > 1 ? "s" : ""}</>
                    )}
                  </button>
                )}
              </div>

              {queue.length > 0 && (
                <BatchQueue queue={queue} onSelectResult={setSelectedIndex} selectedIndex={selectedIndex} />
              )}

              {doneCount > 0 && (
                <ExportPanel results={queue} selectedIndex={selectedIndex} />
              )}
            </div>

            {/* ─── Main Content ─── */}
            <div>
              {selectedResult ? (
                <ResultViewer data={selectedResult} />
              ) : (
                <div className="glass-card" style={{
                  padding: "72px 40px", textAlign: "center",
                }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div style={{
                      width: 64, height: 64, borderRadius: "var(--radius-lg)",
                      background: "rgba(var(--accent-primary-rgb), 0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 20px",
                    }}>
                      <Building2 size={28} color="var(--accent-primary)" strokeWidth={1.5} />
                    </div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>
                      Upload Medical Documents
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "320px", margin: "0 auto" }}>
                      Upload RTF/TXT files or paste text to extract structured JSON data
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Dashboard results={queue} />
        )}
      </div>
    </div>
  );
}

/* ─── Multi File Upload (inline component) ─── */
function MultiFileUpload({ onFilesAdded, onTextInput, isLoading }) {
  const onDrop = useCallback((acceptedFiles) => {
    onFilesAdded(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/rtf": [".rtf"], "text/plain": [".txt"] },
    multiple: true,
    disabled: isLoading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""} ${isLoading ? "disabled" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload
          size={24}
          color={isDragActive ? "var(--accent-primary)" : "var(--text-muted)"}
          style={{ marginBottom: "8px" }}
        />
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.5 }}>
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop RTF/TXT files"}
        </p>
        {!isDragActive && (
          <p style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "4px" }}>
            Multiple files supported
          </p>
        )}
      </div>
      <textarea
        className="text-input"
        disabled={isLoading}
        onChange={(e) => onTextInput(e.target.value, "manual-input.txt")}
        placeholder="Or paste medical text here..."
        style={{ marginTop: "12px" }}
      />
    </div>
  );
}