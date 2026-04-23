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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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

  const handleRecord = (lead: typeof leads[0]) => {
    setCurrentLead(lead);
    navigate("/record-call");
  };

  return (
    <div className="leads-container">
      <div className="leads-header">
        <h2>العملاء</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? "إغلاق" : "+ إضافة"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="lead-form">
          <input
            type="text"
            placeholder="الاسم"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="الهاتف"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="البريد"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="الموقع"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
            <option value="شقة">شقة</option>
            <option value="فيلا">فيلا</option>
            <option value="أرض">أرض</option>
          </select>
          <input
            type="text"
            placeholder="الميزانية"
            value={form.budget_range}
            onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
          />
          <button type="submit" className="btn btn-success">
            حفظ
          </button>
        </form>
      )}

      <div className="leads-grid">
        {leads.length === 0 ? (
          <p className="empty">لا توجد عملاء</p>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="lead-card">
              <div className="card-header">
                <h3>{lead.name}</h3>
                <span className="badge">{lead.status}</span>
              </div>
              <p>☎️ {lead.phone}</p>
              {lead.email && <p>✉️ {lead.email}</p>}
              {lead.location && <p>📍 {lead.location}</p>}
              {lead.property_type && <p>🏠 {lead.property_type}</p>}
              {lead.budget_range && <p>💰 {lead.budget_range}</p>}
              <button
                onClick={() => handleRecord(lead)}
                className="btn btn-primary btn-small"
              >
                🎤 تسجيل
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
