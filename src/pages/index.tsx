"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/api";

interface Lesson {
  id: number;
  title: string;
  subject: string;
  level: string;
  period: string;
  week: string;
  session: string;
}

interface LessonResponse {
  title: string;
  lesson_data: Record<string, unknown>;
  pdf_path: string;
}

type Language = "fr" | "ar";

interface Translations {
  fr: {
    [key: string]: string;
  };
  ar: {
    [key: string]: string;
  };
}

const translations: Translations = {
  fr: {
    appTitle: "Générateur de Leçons",
    appSubtitle: "Générez de beaux PDFs de leçons",
    selectLesson: "Sélectionner une Leçon",
    subject: "Matière",
    selectSubject: "Sélectionner une matière",
    period: "Period",
    selectPeriod: "Sélectionner une period",
    week: "Semaine",
    selectWeek: "Sélectionner une semaine",
    session: "Séance",
    selectSession: "Sélectionner une séance",
    generatePDF: "Générer le PDF",
    generating: "Génération en cours...",
    previewPDF: "Prévisualiser",
    analyzing: "Analyse du contenu...",
    generatingPDF: "Génération du PDF...",
    result: "Résultat",
    pdfGeneratedSuccess: "PDF généré avec succès !",
    downloadPDF: "Télécharger le PDF",
    noPDFYet: "Aucun PDF généré",
    noPDFDescription: "Sélectionnez une leçon et cliquez sur \"Générer le PDF\"",
    selectedLessonDetails: "Détails de la leçon sélectionnée",
    level: "Niveau",
    selectLevel: "Sélectionner un niveau",
    connectionError: "Erreur de connexion",
    backendNotRunning: "Assurez-vous que le backend Flask fonctionne sur le port 5000",
    lessonsLoaded: "leçons chargées avec succès.",
    français: "Français",
    "langue arabe": "Langue arabe",
    mathématiques: "Mathématiques",
    generationError: "Erreur lors de la génération",
    tryAgain: "Réessayer",
  },
  ar: {
    appTitle: "مولد الدروس",
    appSubtitle: "إنشاء ملفات PDF جميلة للدروس",
    selectLesson: "اختر درسًا",
    subject: "المادة",
    selectSubject: "اختر مادة",
    period: "الفترة",
    selectPeriod: "اختر الفترة",
    week: "الأسبوع",
    selectWeek: "اختر أسبوعًا",
    session: "الحصة",
    selectSession: "اختر حصة",
    generatePDF: "إنشاء PDF",
    generating: "جاري الإنشاء...",
    result: "النتيجة",
    pdfGeneratedSuccess: "تم إنشاء PDF بنجاح!",
    downloadPDF: "تحميل PDF",
    noPDFYet: "لم يتم إنشاء PDF بعد",
    noPDFDescription: "اختر درسًا وانقر على \"إنشاء PDF\"",
    selectedLessonDetails: "تفاصيل الدرس المحدد",
    level: "المستوى",
    selectLevel: "اختر المستوى",
    connectionError: "خطأ في الاتصال",
    backendNotRunning: "تأكد من تشغيل الخادم على المنفذ 5000",
    lessonsLoaded: "تم تحميل الدروس بنجاح.",
    français: "الفرنسية",
    "langue arabe": "اللغة العربية",
    mathématiques: "الرياضيات",
  },
};

export default function HomePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedSemaine, setSelectedSemaine] = useState<string>("");
  const [selectedSeance, setSelectedSeance] = useState<string>("");
  const [selectedNiveau, setSelectedNiveau] = useState<string>("");
  const [result, setResult] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [language, setLanguage] = useState<Language>("fr");

  // Load language preference from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "fr" || savedLang === "ar")) {
      setLanguage(savedLang);
    }
  }, []);

  // Save language preference to localStorage
  const toggleLanguage = () => {
    const newLang: Language = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Fetch available lessons
  useEffect(() => {
    console.log("🔄 Fetching lessons from backend...");
    fetch(`${API_URL}/lessons`)
      .then((res) => {
        console.log("📡 Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Lessons received:", data);
        console.log("📊 Number of lessons:", data.length);
        setLessons(data);
        setError("");
      })
      .catch((err) => {
        console.error("❌ Error fetching lessons:", err);
        setError(`Failed to load lessons: ${err.message}`);
      });
  }, []);

  // Get unique values for dropdowns
  const matieres = Array.from(new Set(lessons.map((l) => l.subject))).sort();
  console.log("📚 Available subjects:", matieres);
  
  // Get unique levels for selected subject
  const niveaux = selectedMatiere
    ? Array.from(
        new Set(
          lessons
            .filter((l) => l.subject === selectedMatiere)
            .map((l) => l.level)
        )
      ).sort()
    : [];
  
  // Filter by selected matiere and niveau to get periods
  const periods = selectedMatiere && selectedNiveau
    ? Array.from(
        new Set(
          lessons
            .filter((l) => l.subject === selectedMatiere && l.level === selectedNiveau)
            .map((l) => l.period)
        )
      ).sort()
    : [];
  
  // Filter by selected period to get weeks
  const weeks = selectedPeriod
    ? Array.from(
        new Set(
          lessons
            .filter((l) => l.period === selectedPeriod && l.level === selectedNiveau && l.subject === selectedMatiere)
            .map((l) => l.week)
        )
      ).sort()
    : [];

  // Filter by selected period and week to get sessions
  const sessions =
    selectedPeriod && selectedSemaine
      ? Array.from(
          new Set(
            lessons
              .filter(
                (l) => l.period === selectedPeriod && l.week === selectedSemaine && l.level === selectedNiveau && l.subject === selectedMatiere
              )
              .map((l) => l.session)
          )
        ).sort((a, b) => parseInt(a) - parseInt(b))
      : [];

  // Get the selected lesson ID
  const selectedLesson = lessons.find(
    (l) =>
      l.subject === selectedMatiere &&
      l.level === selectedNiveau &&
      l.period === selectedPeriod &&
      l.week === selectedSemaine &&
      l.session === selectedSeance
  );

  const handleGenerate = async () => {
    if (!selectedLesson) {
      alert("Please complete all selections");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setLoadingStep(t("analyzing"));
      console.log("🚀 Generating PDF for lesson:", selectedLesson);
      
      const res = await fetch(
        `${API_URL}/generate_from_id/${selectedLesson.id}`,
        { method: "POST" }
      );
      
      setLoadingStep(t("generatingPDF"));
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("✅ PDF generated:", data);
      setResult(data);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

interface LessonResponse {
  title: string;
  lesson_data: Record<string, unknown>;
  pdf_path: string;
  mindmap_pdf_path?: string;
}

type Language = "fr" | "ar";

  const handleDownload = () => {
    if (!result?.pdf_path) return;
    const filename = result.pdf_path.split("/").pop();
    if (!filename) return;
    window.open(`${API_URL}/download_pdf/${filename}`, "_blank");
  };

  const handleDownloadMindMap = () => {
    if (!result?.mindmap_pdf_path) return;
    const filename = result.mindmap_pdf_path.split("/").pop();
    if (!filename) return;
    window.open(`${API_URL}/download_pdf/${filename}`, "_blank");
  };

  // Reset downstream selections when parent changes
  const handleMatiereChange = (value: string) => {
    console.log("📝 Subject changed to:", value);
    setSelectedMatiere(value);
    setSelectedNiveau("");
    setSelectedPeriod("");
    setSelectedSemaine("");
    setSelectedSeance("");
  };

  const handleNiveauChange = (value: string) => {
    console.log("📝 Level changed to:", value);
    setSelectedNiveau(value);
    setSelectedPeriod("");
    setSelectedSemaine("");
    setSelectedSeance("");
  };

  const handlePeriodChange = (value: string) => {
    console.log("📝 Period changed to:", value);
    setSelectedPeriod(value);
    setSelectedSemaine("");
    setSelectedSeance("");
  };

  const handleSemaineChange = (value: string) => {
    console.log("📝 Week changed to:", value);
    setSelectedSemaine(value);
    setSelectedSeance("");
  };

  const isRTL = language === "ar";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t("appTitle")}
                </h1>
                
              </div>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-semibold">{language === "fr" ? "العربية" : "Français"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800">{t("connectionError")}</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">{t("backendNotRunning")}</p>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {lessons.length > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-800">
              {lessons.length} {t("lessonsLoaded")}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Selection Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t("selectLesson")}
              </h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("subject")}
                </label>
                <select
                  value={selectedMatiere}
                  onChange={(e) => handleMatiereChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300 cursor-pointer"
                >
                  <option value="">{t("selectSubject")}</option>
                  {matieres.map((m) => (
                    <option key={m} value={m}>
                      {t(m) || m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Niveau (Level) Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("level")}
                </label>
                <select
                  value={selectedNiveau}
                  onChange={(e) => handleNiveauChange(e.target.value)}
                  disabled={!selectedMatiere}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{t("selectLevel")}</option>
                  {niveaux.map((n) => (
                    <option key={n} value={n}>
                      {t("level")} {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("period")}
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  disabled={!selectedNiveau}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{t("selectPeriod")}</option>
                  {periods.map((p) => (
                    <option key={p} value={p}>
                      {t("period")} {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Week Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("week")}
                </label>
                <select
                  value={selectedSemaine}
                  onChange={(e) => handleSemaineChange(e.target.value)}
                  disabled={!selectedPeriod}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{t("selectWeek")}</option>
                  {weeks.map((s) => (
                    <option key={s} value={s}>
                      {t("week")} {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t("session")}
                </label>
                <select
                  value={selectedSeance}
                  onChange={(e) => setSelectedSeance(e.target.value)}
                  disabled={!selectedSemaine}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{t("selectSession")}</option>
                  {sessions.map((s) => (
                    <option key={s} value={s}>
                      {t("session")} {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!selectedLesson || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{loadingStep || t("generating")}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{t("generatePDF")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("result")}
              </h2>
            </div>

            <div className="p-6">
              {error ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-red-900">{t("generationError")}</h3>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {t("tryAgain")}
                  </button>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Success Message */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900">{t("pdfGeneratedSuccess")}</h3>
                        <p className="text-sm text-green-700">{result.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>{t("downloadPDF")}</span>
                    </button>

                    {result.mindmap_pdf_path && (
                      <button
                        onClick={handleDownloadMindMap}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{language === "fr" ? "Télécharger la Carte Mentale" : "تحميل الخريطة الذهنية"}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("noPDFYet")}</h3>
                  <p className="text-sm text-gray-500">{t("noPDFDescription")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Lesson Info */}
        {selectedLesson && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("selectedLessonDetails")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">{t("subject")}</p>
                <p className="text-sm font-bold text-indigo-900">{t(selectedLesson.subject) || selectedLesson.subject}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">{t("level")}</p>
                <p className="text-sm font-bold text-purple-900">{selectedLesson.level}</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">{t("week")}</p>
                <p className="text-sm font-bold text-pink-900">{selectedLesson.week}</p>
              </div>
              <div className="bg-teal-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">{t("session")}</p>
                <p className="text-sm font-bold text-teal-900">{selectedLesson.session}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
