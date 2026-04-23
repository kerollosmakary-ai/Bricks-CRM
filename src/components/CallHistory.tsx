import { useEffect, useState } from "react";
import { getCalls, getAnalysisByCall } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/calls.css";

export default function CallHistory() {
  const { user, leads } = useStore();
  const [calls, setCalls] = useState<any[]>([]);

  useEffect(() => {
    const loadCalls = async () => {
      if (!user) return;
      const { data } = await getCalls(user.id);
      if (data) setCalls(data);
    };
    loadCalls();
  }, [user]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Hot": return "#ef4444";
      case "Warm": return "#f59e0b";
      case "Cold": return "#6b7280";
      default: return "#9ca3af";
    }
  };

  return (
    <div className="calls-container">
      <h2>سجل المكالمات</h2>
      <div className="calls-list">
        {calls.length === 0 ? (
          <p className="empty">لا توجد مكالمات</p>
        ) : (
          calls.map((call) => {
            const lead = leads.find((l) => l.id === call.lead_id);
            return (
              <div key={call.id} className="call-item">
                <div className="call-header">
                  <div>
                    <h4>{lead?.name}</h4>
                    <p className="time">{new Date(call.call_date).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>
                <p className="transcript">{call.transcript?.slice(0, 200)}...</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
