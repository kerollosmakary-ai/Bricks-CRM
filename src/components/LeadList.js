import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLead } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/leads.css";
export default function LeadList() {
    const navigate = useNavigate();
    const { user, leads, setLeads, setCurrentLead } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        location: "",
        property_type: "شقة",
        budget_range: "",
    });
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        const { data } = await createLead({
            agent_id: user.id,
            ...form,
            status: "New",
            language: "ar",
        });
        if (data) {
            setLeads([data, ...leads]);
            setForm({ name: "", phone: "", email: "", location: "", property_type: "شقة", budget_range: "" });
            setShowForm(false);
        }
    };
    const handleRecord = (lead) => {
        setCurrentLead(lead);
        navigate("/record-call");
    };
    return (_jsxs("div", { className: "leads-container", children: [_jsxs("div", { className: "leads-header", children: [_jsx("h2", { children: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621" }), _jsx("button", { onClick: () => setShowForm(!showForm), className: "btn btn-primary", children: showForm ? "إغلاق" : "+ إضافة" })] }), showForm && (_jsxs("form", { onSubmit: handleAdd, className: "lead-form", children: [_jsx("input", { type: "text", placeholder: "\u0627\u0644\u0627\u0633\u0645", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true }), _jsx("input", { type: "tel", placeholder: "\u0627\u0644\u0647\u0627\u062A\u0641", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }), required: true }), _jsx("input", { type: "email", placeholder: "\u0627\u0644\u0628\u0631\u064A\u062F", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) }), _jsx("input", { type: "text", placeholder: "\u0627\u0644\u0645\u0648\u0642\u0639", value: form.location, onChange: (e) => setForm({ ...form, location: e.target.value }) }), _jsxs("select", { value: form.property_type, onChange: (e) => setForm({ ...form, property_type: e.target.value }), children: [_jsx("option", { value: "\u0634\u0642\u0629", children: "\u0634\u0642\u0629" }), _jsx("option", { value: "\u0641\u064A\u0644\u0627", children: "\u0641\u064A\u0644\u0627" }), _jsx("option", { value: "\u0623\u0631\u0636", children: "\u0623\u0631\u0636" })] }), _jsx("input", { type: "text", placeholder: "\u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629", value: form.budget_range, onChange: (e) => setForm({ ...form, budget_range: e.target.value }) }), _jsx("button", { type: "submit", className: "btn btn-success", children: "\u062D\u0641\u0638" })] })), _jsx("div", { className: "leads-grid", children: leads.length === 0 ? (_jsx("p", { className: "empty", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0645\u0644\u0627\u0621" })) : (leads.map((lead) => (_jsxs("div", { className: "lead-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { children: lead.name }), _jsx("span", { className: "badge", children: lead.status })] }), _jsxs("p", { children: ["\u260E\uFE0F ", lead.phone] }), lead.email && _jsxs("p", { children: ["\u2709\uFE0F ", lead.email] }), lead.location && _jsxs("p", { children: ["\uD83D\uDCCD ", lead.location] }), lead.property_type && _jsxs("p", { children: ["\uD83C\uDFE0 ", lead.property_type] }), lead.budget_range && _jsxs("p", { children: ["\uD83D\uDCB0 ", lead.budget_range] }), _jsx("button", { onClick: () => handleRecord(lead), className: "btn btn-primary btn-small", children: "\uD83C\uDFA4 \u062A\u0633\u062C\u064A\u0644" })] }, lead.id)))) })] }));
}
