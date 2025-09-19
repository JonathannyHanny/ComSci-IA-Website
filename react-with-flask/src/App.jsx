import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LogInPage } from "./Pages/LogIn";
import { SignUpPage } from "./Pages/SignUp"; 
import { DashboardPage } from "./Pages/Dashboard"; 
import { AdminPage } from "./Pages/Admin"; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInPage />} />

        <Route path="/login" element={<LogInPage />} />

        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/admin" element={<AdminPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
