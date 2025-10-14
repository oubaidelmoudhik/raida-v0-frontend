"use client";
import { useEffect, useState } from "react";

interface Lesson {
  id: number;
  title: string;
}

interface LessonResponse {
  title: string;
  csv_data: Record<string, unknown>;
  pdf_path: string;
}

export default function HomePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [result, setResult] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch available lessons
  useEffect(() => {
    fetch("http://localhost:5000/lessons")
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((err) => console.error("Error fetching lessons:", err));
  }, []);

  const handleGenerate = async () => {
    if (!selectedId) return alert("Please select a lesson");

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/generate_from_id/${selectedId}`,
        { method: "POST" }
      );
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.pdf_path) return;
    const filename = result.pdf_path.split("/").pop();
    if (!filename) return;
    window.open(`http://localhost:5000/download_pdf/${filename}`, "_blank");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
      <h1 className="text-3xl font-bold">Lesson Generator (Beta)</h1>

      {/* Lesson Selector */}
      <div className="flex flex-col items-center gap-3">
        <select
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value="">Select a lesson</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedId}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </div>

      {/* Display Result */}
      {result && (
        <div className="mt-6 border rounded-lg p-4 w-full max-w-md bg-gray-50">
          <h2 className="font-semibold text-lg">{result.title}</h2>
          <pre className="text-xs mt-3 bg-gray-100 p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(result.csv_data, null, 2)}
          </pre>
          {result.pdf_path ? (
            <button
              onClick={handleDownload}
              className="mt-3 bg-green-600 text-white px-3 py-2 rounded"
            >
              Download PDF
            </button>
          ) : (
            <p className="text-red-500 mt-3">⚠️ PDF not generated.</p>
          )}
        </div>
      )}
    </main>
  );
}
