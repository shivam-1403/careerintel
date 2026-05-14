import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from "./components/utils/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ui/Toast";

// Layouts
import MainLayout from './components/layout/MainLayout';
import BaseLayout from './components/layout/BaseLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import About from './pages/Info/About';
import Contact from './pages/Info/Contact';
import Pricing from './pages/Info/Pricing';
import Privacy from './pages/Info/Privacy';
import Terms from './pages/Info/Terms';
import Dashboard from './pages/Student/Dashboard';
import Profile from './pages/Student/Profile';
import ResumeAnalyzer from './pages/Student/ResumeAnalyzer';
import CareerRecommendations from './pages/Student/CareerRecommendations';
import SkillGapAnalyzer from './pages/Student/SkillGapAnalyzer';
import LearningPath from './pages/Student/LearningPath';
import ProgressTracker from './pages/Student/ProgressTracker';
import CareerDetails from './pages/Student/CareerDetails';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <ToastProvider>
        <ScrollToTop />
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BaseLayout><Landing /></BaseLayout>} />
        <Route path="/login" element={<BaseLayout><Login /></BaseLayout>} />
        <Route path="/signup" element={<BaseLayout><Signup /></BaseLayout>} />
        <Route path="/forgot-password" element={<BaseLayout><ForgotPassword /></BaseLayout>} />
        <Route path="/about" element={<BaseLayout><About /></BaseLayout>} />
        <Route path="/contact" element={<BaseLayout><Contact /></BaseLayout>} />
        <Route path="/pricing" element={<BaseLayout><Pricing /></BaseLayout>} />
        <Route path="/privacy" element={<BaseLayout><Privacy /></BaseLayout>} />
        <Route path="/terms" element={<BaseLayout><Terms /></BaseLayout>} />

        {/* Client Side Routes - Student */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout><Dashboard /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <MainLayout><Profile /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume-analyzer" 
          element={
            <ProtectedRoute>
              <MainLayout><ResumeAnalyzer /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/career-recommendations" 
          element={
            <ProtectedRoute>
              <MainLayout><CareerRecommendations /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/skill-gap" 
          element={
            <ProtectedRoute>
              <MainLayout><SkillGapAnalyzer /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/learning-path" 
          element={
            <ProtectedRoute>
              <MainLayout><LearningPath /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/progress" 
          element={
            <ProtectedRoute>
              <MainLayout><ProgressTracker /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/career/:id"
          element={
            <ProtectedRoute>
              <MainLayout><CareerDetails /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <MainLayout><AdminDashboard /></MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;
