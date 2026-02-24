import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

export default function FileUpload({ onTextExtracted, isLoading }) {
    const [fileName, setFileName] = useState(null);

    const readFile = (file) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            onTextExtracted(e.target.result, file.name);
        };
        reader.readAsText(file);
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) readFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/rtf": [".rtf"], "text/plain": [".txt"] },
        multiple: false,
        disabled: isLoading,
    });

    return (
        <div style={{ width: "100%" }}>
            <motion.div
                {...getRootProps()}
                whileHover={{ scale: 1.01 }}
                style={{
                    border: `2px dashed ${isDragActive ? "#3b82f6" : "#1e293b"}`,
                    borderRadius: "16px",
                    padding: "48px 32px",
                    textAlign: "center",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    background: isDragActive ? "rgba(59,130,246,0.05)" : "#111827",
                    transition: "all 0.2s ease",
                }}
            >
                <input {...getInputProps()} />
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
                {fileName ? (
                    <p style={{ color: "#10b981", fontWeight: 600 }}>📄 {fileName}</p>
                ) : isDragActive ? (
                    <p style={{ color: "#3b82f6" }}>Drop your medical file here...</p>
                ) : (
                    <>
                        <p style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: "8px" }}>
                            Drag & drop your RTF or TXT medical file
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                            Supports .rtf and .txt — discharge summaries, lab reports, doctor notes
                        </p>
                    </>
                )}
            </motion.div>

            {/* Manual text input */}
            <div style={{ marginTop: "24px" }}>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
                    Or paste raw medical text directly:
                </p>
                <textarea
                    disabled={isLoading}
                    onChange={(e) => onTextExtracted(e.target.value, "manual-input.txt")}
                    placeholder="Paste discharge summary, lab report, or any medical document text here..."
                    style={{
                        width: "100%",
                        minHeight: "140px",
                        background: "#1a2235",
                        border: "1px solid #1e293b",
                        borderRadius: "12px",
                        padding: "16px",
                        color: "#f1f5f9",
                        fontSize: "14px",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                    }}
                />
            </div>
        </div>
    );
}