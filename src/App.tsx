import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./lib/store";
import { getCurrentUser } from "./lib/auth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RecordCall from "./pages/RecordCall";
import "./styles/global.css";

function App() {
  const { user, setUser } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await getCurrentUser();
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email || "" });
      }
    };
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="/record-call" element={user ? <RecordCall /> : <Navigate to="/auth" />} />
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
