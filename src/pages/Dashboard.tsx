import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from "../lib/auth";
import { getLeads, getCalls, getReminders } from "../lib/api";
import { useStore } from "../lib/store";
import LeadList from "../components/LeadList";
import CallHistory from "../components/CallHistory";
import RemindersPanel from "../components/RemindersPanel";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser, setLeads, leads } = useStore();
  const [activeTab, setActiveTab] = useState<"leads" | "calls" | "reminders">("leads");
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getCurrentUser();
        if (!data?.user) {
          navigate("/auth");
          return;
        }

        setUser({ id: data.user.id, email: data.user.email || "" });

        const { data: leadsData } = await getLeads(data.user.id);
        if (leadsData) setLeads(leadsData);

        const { data: remindersData } = await getReminders(data.user.id);
        if (remindersData) setReminders(remindersData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    navigate("/auth");
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>لوحة التحكم</h1>
          <p className="subtitle">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          تسجيل الخروج
        </button>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === "leads" ? "active" : ""}`}
          onClick={() => setActiveTab("leads")}
        >
          العملاء ({leads.length})
        </button>
        <button
          className={`tab ${activeTab === "calls" ? "active" : ""}`}
          onClick={() => setActiveTab("calls")}
        >
          المكالمات
        </button>
        <button
          className={`tab ${activeTab === "reminders" ? "active" : ""}`}
          onClick={() => setActiveTab("reminders")}
        >
          التذكيرات ({reminders.length})
        </button>
      </nav>

      <main className="content">
        {activeTab === "leads" && <LeadList />}
        {activeTab === "calls" && <CallHistory />}
        {activeTab === "reminders" && <RemindersPanel reminders={reminders} />}
      </main>
    </div>
  );
}
