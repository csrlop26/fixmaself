import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import SessionView from "./components/SessionView";
import CalendarView from "./components/CalendarView";
import ProgressView from "./components/ProgressView";
import GuideView from "./components/GuideView";
import SettingsView from "./components/SettingsView";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { todayISO } from "./lib/dates";
import { normalizeLogs } from "./lib/logs";

const DEFAULT_SETTINGS = {
  weightKg: 75,
  heightCm: 181,
  age: 28,
  startDate: todayISO(),
};

const DEFAULT_LOGS = { sessions: {}, bodyweight: [] };

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [settings, setSettings] = useLocalStorage("gd-settings", DEFAULT_SETTINGS);
  const [rawLogs, setRawLogs] = useLocalStorage("gd-logs", DEFAULT_LOGS);
  const logs = normalizeLogs(rawLogs);
  const setLogs = (update) => {
    setRawLogs((prev) => {
      const safePrev = normalizeLogs(prev);
      const next = typeof update === "function" ? update(safePrev) : update;
      return normalizeLogs(next);
    });
  };

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
          {tab === "calendar" && <CalendarView logs={logs} setLogs={setLogs} />}
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
