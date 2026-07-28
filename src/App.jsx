import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import SessionView from "./components/SessionView";
import ProgressView from "./components/ProgressView";
import GuideView from "./components/GuideView";
import SettingsView from "./components/SettingsView";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { todayISO } from "./lib/dates";

const DEFAULT_SETTINGS = {
  weightKg: 75,
  heightCm: 181,
  age: 28,
  startDate: todayISO(),
};

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [settings, setSettings] = useLocalStorage("gd-settings", DEFAULT_SETTINGS);
  const [logs, setLogs] = useLocalStorage("gd-logs", {});

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar active={tab} onChange={setTab} />
      <div className="relative flex-1 min-w-0">
        <div className="blueprint-grid pointer-events-none fixed inset-0 -z-10" />
        <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8 pb-24 md:pb-12">
          {tab === "dashboard" && (
            <Dashboard settings={settings} logs={logs} onNavigate={setTab} />
          )}
          {tab === "session" && <SessionView logs={logs} setLogs={setLogs} />}
          {tab === "progress" && <ProgressView logs={logs} />}
          {tab === "guide" && <GuideView />}
          {tab === "settings" && (
            <SettingsView settings={settings} setSettings={setSettings} logs={logs} setLogs={setLogs} />
          )}
        </main>
      </div>
    </div>
  );
}
