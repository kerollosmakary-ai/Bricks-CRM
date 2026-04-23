import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isSignUp) {
                const { error: err } = await signUp(email, password);
                if (err)
                    throw err;
                setError("تم التسجيل! يرجى تسجيل الدخول");
                setIsSignUp(false);
            }
            else {
                const { error: err } = await signIn(email, password);
                if (err)
                    throw err;
                navigate("/dashboard");
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "خطأ");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A" }), _jsx("p", { children: "\u0646\u0638\u0627\u0645 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A \u0627\u0644\u0630\u0643\u064A" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("input", { type: "email", placeholder: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx("input", { type: "password", placeholder: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", value: password, onChange: (e) => setPassword(e.target.value), required: true }), error && _jsx("div", { className: `msg ${isSignUp ? "success" : "error"}`, children: error }), _jsx("button", { type: "submit", disabled: loading, className: "btn btn-primary", children: loading ? "جاري..." : isSignUp ? "إنشاء حساب" : "تسجيل الدخول" })] }), _jsx("button", { onClick: () => {
                        setIsSignUp(!isSignUp);
                        setError("");
                    }, className: "toggle", children: isSignUp ? "تسجيل الدخول" : "إنشاء حساب" })] }) }));
}
