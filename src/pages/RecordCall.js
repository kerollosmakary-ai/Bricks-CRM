import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [phase, setPhase] = useState("recording");
    useEffect(() => {
        const init = async () => {
            const { data } = await getCurrentUser();
            if (data?.user)
                setUser({ id: data.user.id, email: data.user.email || "" });
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
        }
        catch (err) {
            setError("فشل في الوصول للميكروفون");
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            if (timerRef.current)
                clearInterval(timerRef.current);
            setIsRecording(false);
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                await processAudio(audioBlob);
            };
        }
    };
    const processAudio = async (audioBlob) => {
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
                suggested_summary_ar: analysis.sentiment === "Hot"
                    ? "عميل مهتم جداً ويريد معاينة الآن"
                    : "عميل مهتم",
                suggested_next_action: analysis.next_action,
                suggested_reminder_days: analysis.reminder_days,
                keywords_matched: analysis.keywords || [],
            });
            setPhase("review");
        }
        catch (err) {
            setError("خطأ في التحليل");
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    if (phase === "review")
        return _jsx(CallReview, { transcript: transcript });
    return (_jsxs("div", { className: "record-container", children: [_jsxs("header", { className: "header", children: [_jsx("button", { onClick: () => navigate("/dashboard"), className: "back", children: "\u2190 \u0627\u0644\u0639\u0648\u062F\u0629" }), _jsxs("div", { children: [_jsx("h1", { children: "\u062A\u0633\u062C\u064A\u0644 \u0645\u0643\u0627\u0644\u0645\u0629" }), _jsx("p", { children: currentLead?.name })] })] }), _jsx("main", { className: "record-main", children: _jsxs("div", { className: "record-box", children: [_jsxs("div", { className: `indicator ${isRecording ? "active" : ""}`, children: [isRecording && _jsx("span", { className: "pulse" }), _jsx("span", { children: isRecording ? "قيد التسجيل" : "جاهز" })] }), _jsxs("div", { className: "timer", children: [Math.floor(time / 60), ":", (time % 60).toString().padStart(2, "0")] }), _jsx("div", { className: "transcript-box", children: _jsx("p", { children: transcript }) }), _jsx("div", { className: "controls", children: !isRecording ? (_jsx("button", { onClick: startRecording, className: "btn btn-primary btn-large", disabled: isAnalyzing, children: "\uD83C\uDFA4 \u0628\u062F\u0621" })) : (_jsx("button", { onClick: stopRecording, className: "btn btn-danger btn-large", children: "\u23F9 \u0625\u064A\u0642\u0627\u0641" })) }), isAnalyzing && (_jsxs("div", { className: "analyzing", children: [_jsx("span", { className: "spinner" }), " \u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0644\u064A\u0644..."] })), error && _jsx("div", { className: "error", children: error })] }) })] }));
}
