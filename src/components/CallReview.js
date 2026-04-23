import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCall, createAnalysis, createReminder } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/call-review.css";
export default function CallReview({ transcript }) {
    const navigate = useNavigate();
    const { user, currentLead, currentAnalysis } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [sentiment, setSentiment] = useState(currentAnalysis?.suggested_sentiment || "Warm");
    const [summary, setSummary] = useState(currentAnalysis?.suggested_summary || "");
    const [summaryAr, setSummaryAr] = useState(currentAnalysis?.suggested_summary_ar || "");
    const [nextAction, setNextAction] = useState(currentAnalysis?.suggested_next_action || "");
    const [reminderDays, setReminderDays] = useState(currentAnalysis?.suggested_reminder_days || 7);
    const handleSave = async () => {
        if (!user || !currentLead) {
            setError("بيانات ناقصة");
            return;
        }
        setIsSubmitting(true);
        try {
            const { data: call } = await createCall({
                lead_id: currentLead.id,
                agent_id: user.id,
                transcript,
                duration_seconds: 0,
                call_date: new Date().toISOString(),
            });
            if (!call)
                throw new Error("Failed to create call");
            const { data: analysis } = await createAnalysis({
                call_id: call.id,
                agent_id: user.id,
                suggested_sentiment: currentAnalysis?.suggested_sentiment,
                suggested_summary: currentAnalysis?.suggested_summary,
                suggested_summary_ar: currentAnalysis?.suggested_summary_ar,
                suggested_next_action: currentAnalysis?.suggested_next_action,
                suggested_reminder_days: currentAnalysis?.suggested_reminder_days,
                keywords_matched: currentAnalysis?.keywords_matched || [],
                confirmed_sentiment: sentiment,
                confirmed_summary: summary,
                confirmed_summary_ar: summaryAr,
                confirmed_next_action: nextAction,
                confirmed_reminder_days: reminderDays,
                confirmed_at: new Date().toISOString(),
            });
            if (!analysis)
                throw new Error("Failed to create analysis");
            const reminderDate = new Date();
            reminderDate.setDate(reminderDate.getDate() + reminderDays);
            await createReminder({
                call_analysis_id: analysis.id,
                agent_id: user.id,
                lead_id: currentLead.id,
                reminder_date: reminderDate.toISOString().split("T")[0],
                reminder_type: nextAction,
            });
            navigate("/dashboard");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "خطأ");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const colors = {
        Hot: "#ef4444",
        Warm: "#f59e0b",
        Cold: "#6b7280",
    };
    return (_jsxs("div", { className: "review-container", children: [_jsxs("header", { className: "review-header", children: [_jsx("h1", { children: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629" }), _jsx("p", { children: currentLead?.name })] }), _jsx("main", { className: "review-main", children: _jsxs("div", { className: "review-card", children: [_jsxs("section", { children: [_jsx("h3", { children: "\u0627\u0644\u0646\u0635" }), _jsx("div", { className: "transcript-display", children: transcript })] }), _jsxs("section", { children: [_jsx("label", { children: "\u0627\u0644\u0645\u0634\u0627\u0639\u0631" }), _jsx("div", { className: "sentiment-btns", children: ["Hot", "Warm", "Cold"].map((s) => (_jsxs("button", { onClick: () => setSentiment(s), style: sentiment === s
                                            ? { backgroundColor: colors[s], color: "white" }
                                            : {}, className: `btn ${sentiment === s ? "selected" : ""}`, children: [s === "Hot" && "🔥 ساخن", s === "Warm" && "🌤️ دافئ", s === "Cold" && "❄️ بارد"] }, s))) })] }), _jsxs("section", { children: [_jsx("label", { children: "\u0627\u0644\u0645\u0644\u062E\u0635" }), _jsx("input", { type: "text", value: summary, onChange: (e) => setSummary(e.target.value), placeholder: "\u0645\u0644\u062E\u0635..." })] }), _jsxs("section", { children: [_jsx("label", { children: "\u0627\u0644\u0645\u0644\u062E\u0635 \u0627\u0644\u0639\u0631\u0628\u064A" }), _jsx("input", { type: "text", value: summaryAr, onChange: (e) => setSummaryAr(e.target.value), placeholder: "\u0627\u0644\u0645\u0644\u062E\u0635 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629..." })] }), _jsxs("section", { children: [_jsx("label", { children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0627\u0644\u064A" }), _jsxs("select", { value: nextAction, onChange: (e) => setNextAction(e.target.value), children: [_jsx("option", { value: "Send pricing", children: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0633\u0639\u0631" }), _jsx("option", { value: "Send details", children: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644" }), _jsx("option", { value: "Call again", children: "\u0627\u062A\u0635\u0627\u0644 \u0622\u062E\u0631" }), _jsx("option", { value: "Follow up later", children: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0644\u0627\u062D\u0642\u0627\u064B" })] })] }), _jsxs("section", { children: [_jsx("label", { children: "\u062A\u0630\u0643\u064A\u0631 \u0628\u0639\u062F (\u0623\u064A\u0627\u0645)" }), _jsx("input", { type: "number", value: reminderDays, onChange: (e) => setReminderDays(parseInt(e.target.value) || 1), min: "1", max: "365" })] }), currentAnalysis?.keywords_matched && (_jsxs("section", { children: [_jsx("label", { children: "\u0627\u0644\u0643\u0644\u0645\u0627\u062A" }), _jsx("div", { className: "keywords", children: currentAnalysis.keywords_matched.map((k, i) => (_jsx("span", { className: "tag", children: k }, i))) })] })), error && _jsx("div", { className: "error", children: error }), _jsxs("div", { className: "actions", children: [_jsx("button", { onClick: handleSave, disabled: isSubmitting, className: "btn btn-primary btn-large", children: isSubmitting ? "جاري..." : "✓ تأكيد" }), _jsx("button", { onClick: () => navigate("/dashboard"), className: "btn btn-secondary", children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) })] }));
}
