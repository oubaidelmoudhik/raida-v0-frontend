import { useState, useEffect } from "react";
import Head from "next/head";
import { API_URL } from "../lib/api";
import { translations } from "../lib/translations";
import Header from "../components/Header";

type InfoFields = Record<string, string>;
type Language = "fr" | "ar";

interface TeacherInfo {
  fr: InfoFields;
  ar: InfoFields;
}

export default function Profile() {
  const [info, setInfo] = useState<TeacherInfo>({
    fr: {
      Nom: "",
      PPR: "",
      "Année Scolaire": "",
      "Établissement": "",
      "Niveau": "",
    },
    ar: {
      "الأستاذ": "",
      "رقم التأجير": "",
      "السنة الدراسية": "",
      "المؤسسة": "",
      "المستوى": "",
    },
  });
  const [language, setLanguage] = useState<Language>("fr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const t = (key: string) => translations[language][key] || key;

  // Sync language with local storage
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "fr" || savedLang === "ar")) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const frFields = ["Nom", "Établissement", "Niveau"];
  const arFields = ["الأستاذ", "المؤسسة", "المستوى"];

  const handleSharedChange = (fieldKey: "PPR" | "Year", value: string) => {
    setInfo((prev) => {
        const newInfo = { ...prev };
        if (fieldKey === "PPR") {
            newInfo.fr["PPR"] = value;
            newInfo.ar["رقم التأجير"] = value;
        } else if (fieldKey === "Year") {
            newInfo.fr["Année Scolaire"] = value;
            newInfo.ar["السنة الدراسية"] = value;
        }
        return newInfo;
    });
  };

  useEffect(() => {
    fetch(`${API_URL}/teacher-info`)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           // Should not happen if backend is correct, but handles the "unexpected token" error
           console.error("Received non-JSON response from /teacher-info");
           return []; 
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setInfo({
            fr: { ...info.fr, ...(data[0].fr || {}) },
            ar: { ...info.ar, ...(data[0].ar || {}) },
          });
        }
      })
      .catch((err) => console.error("Failed to load info", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (lang: "fr" | "ar", field: string, value: string) => {
    setInfo((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    
    if (!info.fr.Nom.trim() && !info.ar["الأستاذ"].trim()) {
        setMessage(t("fillNameError"));
        setSaving(false);
        return;
    }

    try {
      const payload = [info]; 
      const res = await fetch(`${API_URL}/teacher-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage(t("profileSaved"));
      } else {
        setMessage(t("failedSave"));
      }
    } catch (e) {
      setMessage(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">{t("loading")}</div>;

  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Head>
        <title>{t("profileTitle")}</title>
      </Head>

      <Header language={language} toggleLanguage={toggleLanguage} translations={translations} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{t("profileTitle")}</h2>
            <p className="mb-6 text-gray-600">
                {t("profileDescription")}
            </p>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.includes("success") || message === t("profileSaved") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message}
                </div>
            )}

            {/* Shared Info Section */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("ppr")}
                        </label>
                        <input
                            type="text"
                            value={info.fr["PPR"] || ""}
                            onChange={(e) => handleSharedChange("PPR", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="123456"
                            dir="ltr" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("schoolYear")}
                        </label>
                        <input
                            type="text"
                            value={info.fr["Année Scolaire"] || ""}
                            onChange={(e) => handleSharedChange("Year", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="202X/202X"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* French Section - Always LTR for input alignment? Or respect global RTL? Usually form inputs follow strict direction logic. 
                    User said "only change language not layout". 
                    If I put dir="rtl" on root, everything flips. 
                    French inputs in RTL mode might look weird if the labels flip side.
                    Let's enforce LTR for French section and RTL for Arabic section explicitly for cleanliness.
                */}
                <div dir="ltr">
                    <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>🇫🇷</span> {t("frenchSection")}
                    </h2>
                    <div className="space-y-4">
                        {frFields.map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field} {field === "Nom" && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="text"
                                    value={info.fr[field] || ""}
                                    onChange={(e) => handleChange("fr", field, e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder={field}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Arabic Section - Always RTL */}
                <div dir="rtl">
                    <h2 className="text-xl font-bold text-green-600 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>🇲🇦</span> {t("arabicSection")}
                    </h2>
                    <div className="space-y-4">
                        {arFields.map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field} {field === "الأستاذ" && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="text"
                                    value={info.ar[field] || ""}
                                    onChange={(e) => handleChange("ar", field, e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder={field}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? t("saving") : t("saveProfile")}
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}
