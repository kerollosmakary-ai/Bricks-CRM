import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, signIn } from "../lib/auth";
import "../styles/auth.css";

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password);
        if (err) throw err;
        setError("تم التسجيل! يرجى تسجيل الدخول");
        setIsSignUp(false);
      } else {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>نظام إدارة العقارات</h1>
        <p>نظام تحليل المكالمات الذكي</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className={`msg ${isSignUp ? "success" : "error"}`}>{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "جاري..." : isSignUp ? "إنشاء حساب" : "تسجيل الدخول"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          className="toggle"
        >
          {isSignUp ? "تسجيل الدخول" : "إنشاء حساب"}
        </button>
      </div>
    </div>
  );
}
