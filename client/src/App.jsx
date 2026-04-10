// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import BookListings from './pages/BookListings';
import AddBookPage from './pages/AddBookPage';
import ProfilePage from './pages/ProfilePage';
import SwapRequestsPage from './pages/SwapRequestsPage';
import BookDetails from './pages/BookDetails';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/signup"  element={<SignupPage />} />
        <Route path="/books"   element={<BookListings />} />

        {/* Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      }/>
      <Route path="/add-book" element={
        <ProtectedRoute><AddBookPage /></ProtectedRoute>
      }/>
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      }/>
      <Route path="/profile/:id" element={<ProfilePage />} />
      <Route path="/swaps" element={
        <ProtectedRoute><SwapRequestsPage /></ProtectedRoute>
      }/>

      {/* NEW: Book Details */}
      <Route path="/book/:id" element={<BookDetails />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
