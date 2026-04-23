import { useState } from "react";
import { updateReminder } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/reminders.css";

interface Props {
  reminders: any[];
}

export default function RemindersPanel({ reminders: initialReminders }: Props) {
  const { leads } = useStore();
  const [reminders, setReminders] = useState(initialReminders);

  const handleComplete = async (id: string) => {
    await updateReminder(id, {
      completed: true,
      completed_at: new Date().toISOString(),
    });

    setReminders(reminders.filter((r) => r.id !== id));
  };

  const getReminderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = date.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "اليوم";
    if (days === 1) return "غداً";
    if (days < 0) return "متأخر";
    return `بعد ${days} أيام`;
  };

  return (
    <div className="reminders-container">
      <h2>التذكيرات النشطة</h2>

      {reminders.length === 0 ? (
        <div className="empty-state">
          <p>لا توجد تذكيرات</p>
        </div>
      ) : (
        <div className="reminders-list">
          {reminders.map((reminder) => {
            const lead = leads.find((l) => l.id === reminder.lead_id);
            return (
              <div key={reminder.id} className="reminder-item">
                <div className="reminder-content">
                  <div>
                    <h4>{lead?.name}</h4>
                    <p className="action">{reminder.reminder_type}</p>
                  </div>
                  <div className="reminder-date">
                    <span className="date-label">{getReminderDate(reminder.reminder_date)}</span>
                    <span className="date-value">{new Date(reminder.reminder_date).toLocaleDateString("ar-EG")}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleComplete(reminder.id)}
                  className="btn btn-success btn-small"
                >
                  ✓ اكتمل
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
