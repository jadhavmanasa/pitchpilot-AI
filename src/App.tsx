import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import GenerateDeck from "./pages/GenerateDeck";
import DeckViewer from "./pages/DeckViewer";
import MyDecks from "./pages/MyDecks";
import Analytics from "./pages/Analytics";
import Exports from "./pages/Exports";
import Settings from "./pages/Settings";
import MainLayout from "./layouts/MainLayout";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/generate" element={<GenerateDeck />} />
              <Route path="/viewer/:id" element={<DeckViewer />} />
              <Route path="/my-decks" element={<MyDecks />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/exports" element={<Exports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
