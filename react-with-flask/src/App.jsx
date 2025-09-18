import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LogInPage } from "./Pages/LogIn";
import { SignUpPage } from "./Pages/SignUp"; // Add this if you haven't already

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<LogInPage />} />

        {/* Sign-in route */}
        <Route path="/login" element={<LogInPage />} />

        {/* Sign-up route */}
        <Route path="/signup" element={<SignUpPage />} />

        {/* Catch-all redirect to sign-in */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
