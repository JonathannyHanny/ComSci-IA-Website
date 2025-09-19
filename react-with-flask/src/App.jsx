import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LogInPage } from "./Pages/LogIn";
import { SignUpPage } from "./Pages/SignUp"; // Add this if you haven't already

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInPage />} />

        <Route path="/login" element={<LogInPage />} />

        <Route path="/signup" element={<SignUpPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
