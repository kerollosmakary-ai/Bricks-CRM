import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCall, createAnalysis, createReminder } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/call-review.css";

interface Props {
  transcript: string;
}

export default function CallReview({ transcript }: Props) {
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

      if (!call) throw new Error("Failed to create call");

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

      if (!analysis) throw new Error("Failed to create analysis");

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors: Record<string, string> = {
    Hot: "#ef4444",
    Warm: "#f59e0b",
    Cold: "#6b7280",
  };

  return (
    <div className="review-container">
      <header className="review-header">
        <h1>مراجعة المكالمة</h1>
        <p>{currentLead?.name}</p>
      </header>

      <main className="review-main">
        <div className="review-card">
          <section>
            <h3>النص</h3>
            <div className="transcript-display">{transcript}</div>
          </section>

          <section>
            <label>المشاعر</label>
            <div className="sentiment-btns">
              {["Hot", "Warm", "Cold"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSentiment(s)}
                  style={
                    sentiment === s
                      ? { backgroundColor: colors[s], color: "white" }
                      : {}
                  }
                  className={`btn ${sentiment === s ? "selected" : ""}`}
                >
                  {s === "Hot" && "🔥 ساخن"}
                  {s === "Warm" && "🌤️ دافئ"}
                  {s === "Cold" && "❄️ بارد"}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label>الملخص</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="ملخص..."
            />
          </section>

          <section>
            <label>الملخص العربي</label>
            <input
              type="text"
              value={summaryAr}
              onChange={(e) => setSummaryAr(e.target.value)}
              placeholder="الملخص بالعربية..."
            />
          </section>

          <section>
            <label>الإجراء التالي</label>
            <select value={nextAction} onChange={(e) => setNextAction(e.target.value)}>
              <option value="Send pricing">إرسال السعر</option>
              <option value="Send details">إرسال التفاصيل</option>
              <option value="Call again">اتصال آخر</option>
              <option value="Follow up later">متابعة لاحقاً</option>
            </select>
          </section>

          <section>
            <label>تذكير بعد (أيام)</label>
            <input
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(parseInt(e.target.value) || 1)}
              min="1"
              max="365"
            />
          </section>

          {currentAnalysis?.keywords_matched && (
            <section>
              <label>الكلمات</label>
              <div className="keywords">
                {currentAnalysis.keywords_matched.map((k, i) => (
                  <span key={i} className="tag">{k}</span>
                ))}
              </div>
            </section>
          )}

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="btn btn-primary btn-large"
            >
              {isSubmitting ? "جاري..." : "✓ تأكيد"}
            </button>
            <button onClick={() => navigate("/dashboard")} className="btn btn-secondary">
              إلغاء
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
