export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface CsvData {
  [key: string]: string | number;
}

export interface LessonResponse {
  title: string;
  csv_data: CsvData;
  // The backend may return null when a PDF wasn't generated.
  pdf_path: string | null;
}

export async function generateLesson(
  formData: FormData
): Promise<LessonResponse> {
  const response = await fetch(`${API_URL}/generate`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Unknown error during generation");
  }

  return (await response.json()) as LessonResponse;
}

export async function downloadPDF(filename: string): Promise<void> {
  const response = await fetch(`${API_URL}/download_pdf/${filename}`);
  if (!response.ok) throw new Error("PDF not found");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
