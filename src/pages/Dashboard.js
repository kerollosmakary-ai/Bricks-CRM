import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from "../lib/auth";
import { getLeads, getReminders } from "../lib/api";
import { useStore } from "../lib/store";
import LeadList from "../components/LeadList";
import CallHistory from "../components/CallHistory";
import RemindersPanel from "../components/RemindersPanel";
import "../styles/dashboard.css";
export default function Dashboard() {
    const navigate = useNavigate();
    const { user, setUser, setLeads, leads } = useStore();
    const [activeTab, setActiveTab] = useState("leads");
    const [reminders, setReminders] = useState([]);
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
                if (leadsData)
                    setLeads(leadsData);
                const { data: remindersData } = await getReminders(data.user.id);
                if (remindersData)
                    setReminders(remindersData);
            }
            catch (err) {
                console.error(err);
            }
            finally {
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
    if (loading)
        return _jsx("div", { className: "loading", children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." });
    return (_jsxs("div", { className: "dashboard", children: [_jsxs("header", { className: "dashboard-header", children: [_jsxs("div", { children: [_jsx("h1", { children: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" }), _jsx("p", { className: "subtitle", children: user?.email })] }), _jsx("button", { onClick: handleLogout, className: "btn btn-secondary", children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C" })] }), _jsxs("nav", { className: "tabs", children: [_jsxs("button", { className: `tab ${activeTab === "leads" ? "active" : ""}`, onClick: () => setActiveTab("leads"), children: ["\u0627\u0644\u0639\u0645\u0644\u0627\u0621 (", leads.length, ")"] }), _jsx("button", { className: `tab ${activeTab === "calls" ? "active" : ""}`, onClick: () => setActiveTab("calls"), children: "\u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A" }), _jsxs("button", { className: `tab ${activeTab === "reminders" ? "active" : ""}`, onClick: () => setActiveTab("reminders"), children: ["\u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A (", reminders.length, ")"] })] }), _jsxs("main", { className: "content", children: [activeTab === "leads" && _jsx(LeadList, {}), activeTab === "calls" && _jsx(CallHistory, {}), activeTab === "reminders" && _jsx(RemindersPanel, { reminders: reminders })] })] }));
}
