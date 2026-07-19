import { useState } from "react";
import { useAuth } from "./state/AuthContext.jsx";
import { BoardProvider } from "./state/BoardContext.jsx";
import { UsersProvider } from "./state/UsersContext.jsx";
import { MinutesProvider } from "./state/MinutesContext.jsx";
import SetupScreen from "./screens/SetupScreen.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";
import LandingScreen from "./screens/LandingScreen.jsx";
import AuthenticatedApp from "./AuthenticatedApp.jsx";

export default function App() {
  const { loading, needsSetup, user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return <div className="app-loading">Carregando...</div>;
  }
  if (needsSetup) return <SetupScreen />;
  if (!user) {
    if (!showAuth) return <LandingScreen onEnter={() => setShowAuth(true)} />;
    return <AuthScreen onBack={() => setShowAuth(false)} />;
  }

  return (
    <BoardProvider>
      <UsersProvider>
        <MinutesProvider>
          <AuthenticatedApp />
        </MinutesProvider>
      </UsersProvider>
    </BoardProvider>
  );
}
