import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { analyzeTranscript } from "../lib/api";
import { useStore } from "../lib/store";
import CallReview from "../components/CallReview";
import "../styles/record-call.css";

export default function RecordCall() {
  const navigate = useNavigate();
  const { user, setUser, currentLead, setCurrentAnalysis } = useStore();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"recording" | "review">("recording");

  useEffect(() => {
    const init = async () => {
      const { data } = await getCurrentUser();
      if (data?.user) setUser({ id: data.user.id, email: data.user.email || "" });
    };
    init();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTime(0);
      setTranscript("جاري التسجيل...");

      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } catch (err) {
      setError("فشل في الوصول للميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await processAudio(audioBlob);
      };
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      const mockTranscript = `العميل: السلام عليكم
الموظف: وعليكم السلام ورحمة الله
العميل: أنا مهتم بالشقة في النيل جرين، كم السعر؟
الموظف: السعر 2.5 مليون جنيه
العميل: تمام، أنا مهتم جدا وأريد أن أراها الأسبوع القادم
الموظف: ممتاز، سأرسل لك التفاصيل`;

      setTranscript(mockTranscript);

      const analysis = await analyzeTranscript(mockTranscript, "ar");

      setCurrentAnalysis({
        id: "",
        call_id: "",
        suggested_sentiment: analysis.sentiment,
        suggested_summary: analysis.summary,
        suggested_summary_ar:
          analysis.sentiment === "Hot"
            ? "عميل مهتم جداً ويريد معاينة الآن"
            : "عميل مهتم",
        suggested_next_action: analysis.next_action,
        suggested_reminder_days: analysis.reminder_days,
        keywords_matched: analysis.keywords || [],
      });

      setPhase("review");
    } catch (err) {
      setError("خطأ في التحليل");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (phase === "review") return <CallReview transcript={transcript} />;

  return (
    <div className="record-container">
      <header className="header">
        <button onClick={() => navigate("/dashboard")} className="back">
          ← العودة
        </button>
        <div>
          <h1>تسجيل مكالمة</h1>
          <p>{currentLead?.name}</p>
        </div>
      </header>

      <main className="record-main">
        <div className="record-box">
          <div className={`indicator ${isRecording ? "active" : ""}`}>
            {isRecording && <span className="pulse"></span>}
            <span>{isRecording ? "قيد التسجيل" : "جاهز"}</span>
          </div>

          <div className="timer">
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
          </div>

          <div className="transcript-box">
            <p>{transcript}</p>
          </div>

          <div className="controls">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="btn btn-primary btn-large"
                disabled={isAnalyzing}
              >
                🎤 بدء
              </button>
            ) : (
              <button onClick={stopRecording} className="btn btn-danger btn-large">
                ⏹ إيقاف
              </button>
            )}
          </div>

          {isAnalyzing && (
            <div className="analyzing">
              <span className="spinner"></span> جاري التحليل...
            </div>
          )}

          {error && <div className="error">{error}</div>}
        </div>
      </main>
    </div>
  );
}
