import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";


import Dashboard from "./pages/Dashboard";
import { decodeToken } from "./utils/decodeToken";

function App() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.sub) {
        setUserEmail(decoded.sub);
      } else {
        localStorage.removeItem("access_token");
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    setUserEmail(null);
    window.location.href = "/login"; // fixed: redirect to proper login route
  };

  return (
    <Router>
      <Routes>
        {/* Added /login route explicitly */}
        <Route
          path="/login"
          element={
            userEmail ? <Navigate to="/dashboard" /> : <LoginPage setUserEmail={setUserEmail} />
          }
        />
        
        <Route
          path="/dashboard"
          element={
            userEmail ? (
              <Dashboard userEmail={userEmail} logout={logout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Redirect default "/" to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;