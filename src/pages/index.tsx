"use client";

import { useState, FormEvent } from "react";
import { generateLesson, downloadPDF, LessonResponse } from "@/lib/api";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a PPTX file.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const data = await generateLesson(formData);
      setResult(data);
    } catch (err: unknown) {
      // Safely extract an error message without using `any`
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message ?? String(err)
          : String(err);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
      <h1 className="text-3xl font-bold">Lesson Generator</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3"
      >
        <input
          type="file"
          accept=".pptx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Processing..." : "Upload & Generate"}
        </button>
      </form>

      {result && (
        <div className="mt-6 border rounded-lg p-4 w-full max-w-md bg-gray-50">
          <h2 className="font-semibold text-lg">{result.title}</h2>
          <pre className="text-xs mt-3 bg-gray-100 p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(result.csv_data, null, 2)}
          </pre>
          {result.pdf_path ? (
            (() => {
              const filename = result.pdf_path
                ? result.pdf_path.split("/").pop()
                : null;
              return (
                <button
                  onClick={() => filename && downloadPDF(filename)}
                  className="mt-3 bg-green-600 text-white px-3 py-2 rounded"
                  disabled={!filename}
                >
                  Download PDF
                </button>
              );
            })()
          ) : (
            <p className="text-red-500 mt-3">⚠️ PDF not generated.</p>
          )}
        </div>
      )}
    </main>
  );
}
