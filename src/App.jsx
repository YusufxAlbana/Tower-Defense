import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import GamePage from './pages/Game';
import Store from './pages/Store';
import Deck from './pages/Deck';
import Info from './pages/Info';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import { isLoggedIn, loadPlayerData, savePlayerData, getCurrentUser } from './firebase';
import { usePlayerStore } from './store/gameStore';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Auth Route (redirect if logged in)
const AuthRoute = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Auto-save hook
const useAutoSave = () => {
  const { getPlayerData } = usePlayerStore();
  
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (isLoggedIn()) {
        const data = getPlayerData();
        savePlayerData(data);
      }
    }, 30000); // Save every 30 seconds

    // Save on page unload
    const handleUnload = () => {
      if (isLoggedIn()) {
        const data = getPlayerData();
        savePlayerData(data);
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [getPlayerData]);
};

// Main App with Auth
const AppContent = () => {
  const { setPlayerData } = usePlayerStore();
  const [loading, setLoading] = useState(true);
  
  useAutoSave();

  useEffect(() => {
    const loadData = async () => {
      if (isLoggedIn()) {
        const result = await loadPlayerData();
        if (result.success) {
          setPlayerData(result.data);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [setPlayerData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/game" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
          <Route path="/deck" element={<ProtectedRoute><Deck /></ProtectedRoute>} />
          <Route path="/info" element={<ProtectedRoute><Info /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        </Routes>
      </main>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppContent />
    </BrowserRouter>
  );
}
