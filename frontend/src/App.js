import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";

// Pages
import SplashScreen from "@/pages/SplashScreen";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import ARView from "@/pages/ARView";
import MapView from "@/pages/MapView";
import SavedView from "@/pages/SavedView";
import SettingsView from "@/pages/SettingsView";
import CompassDemo from "@/pages/CompassDemo";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";

// Router wrapper to detect session_id in URL
const AppRouter = () => {
  const location = useLocation();

  // Check URL fragment (not query params) for session_id synchronously
  // This prevents race conditions by processing new session_id FIRST
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="/compass-demo" element={<CompassDemo />} />
      <Route path="/dashboard/*" element={<Dashboard />}>
        <Route index element={<ARView />} />
        <Route path="ar" element={<ARView />} />
        <Route path="map" element={<MapView />} />
        <Route path="saved" element={<SavedView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <AppRouter />
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
