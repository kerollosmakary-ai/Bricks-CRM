import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { updateReminder } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/reminders.css";
export default function RemindersPanel({ reminders: initialReminders }) {
    const { leads } = useStore();
    const [reminders, setReminders] = useState(initialReminders);
    const handleComplete = async (id) => {
        await updateReminder(id, {
            completed: true,
            completed_at: new Date().toISOString(),
        });
        setReminders(reminders.filter((r) => r.id !== id));
    };
    const getReminderDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diff = date.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days === 0)
            return "اليوم";
        if (days === 1)
            return "غداً";
        if (days < 0)
            return "متأخر";
        return `بعد ${days} أيام`;
    };
    return (_jsxs("div", { className: "reminders-container", children: [_jsx("h2", { children: "\u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629" }), reminders.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0630\u0643\u064A\u0631\u0627\u062A" }) })) : (_jsx("div", { className: "reminders-list", children: reminders.map((reminder) => {
                    const lead = leads.find((l) => l.id === reminder.lead_id);
                    return (_jsxs("div", { className: "reminder-item", children: [_jsxs("div", { className: "reminder-content", children: [_jsxs("div", { children: [_jsx("h4", { children: lead?.name }), _jsx("p", { className: "action", children: reminder.reminder_type })] }), _jsxs("div", { className: "reminder-date", children: [_jsx("span", { className: "date-label", children: getReminderDate(reminder.reminder_date) }), _jsx("span", { className: "date-value", children: new Date(reminder.reminder_date).toLocaleDateString("ar-EG") })] })] }), _jsx("button", { onClick: () => handleComplete(reminder.id), className: "btn btn-success btn-small", children: "\u2713 \u0627\u0643\u062A\u0645\u0644" })] }, reminder.id));
                }) }))] }));
}
