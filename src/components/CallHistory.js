import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getCalls } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/calls.css";
export default function CallHistory() {
    const { user, leads } = useStore();
    const [calls, setCalls] = useState([]);
    useEffect(() => {
        const loadCalls = async () => {
            if (!user)
                return;
            const { data } = await getCalls(user.id);
            if (data)
                setCalls(data);
        };
        loadCalls();
    }, [user]);
    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case "Hot": return "#ef4444";
            case "Warm": return "#f59e0b";
            case "Cold": return "#6b7280";
            default: return "#9ca3af";
        }
    };
    return (_jsxs("div", { className: "calls-container", children: [_jsx("h2", { children: "\u0633\u062C\u0644 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A" }), _jsx("div", { className: "calls-list", children: calls.length === 0 ? (_jsx("p", { className: "empty", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0643\u0627\u0644\u0645\u0627\u062A" })) : (calls.map((call) => {
                    const lead = leads.find((l) => l.id === call.lead_id);
                    return (_jsxs("div", { className: "call-item", children: [_jsx("div", { className: "call-header", children: _jsxs("div", { children: [_jsx("h4", { children: lead?.name }), _jsx("p", { className: "time", children: new Date(call.call_date).toLocaleDateString("ar-EG") })] }) }), _jsxs("p", { className: "transcript", children: [call.transcript?.slice(0, 200), "..."] })] }, call.id));
                })) })] }));
}
