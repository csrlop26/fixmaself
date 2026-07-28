import { useRef } from "react";

export default function SettingsView({ settings, setSettings, logs, setLogs }) {
  const fileInput = useRef(null);

  function update(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  function handleExport() {
    const payload = { settings, logs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-100x100-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.settings) setSettings(data.settings);
        if (data.logs) setLogs(data.logs);
      } catch {
        alert("El archivo no es un backup válido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleReset() {
    if (window.confirm("Esto borrará todo tu historial de series registradas. ¿Seguro?")) {
      setLogs({});
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Ajustes</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Datos y backup</h1>
      </header>

      <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted mb-4">Perfil</h2>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <label className="text-sm text-muted">
            Peso (kg)
            <input
              type="number"
              value={settings.weightKg}
              onChange={(e) => update("weightKg", e.target.value)}
              className="mt-1 w-full rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-ink"
            />
          </label>
          <label className="text-sm text-muted">
            Altura (cm)
            <input
              type="number"
              value={settings.heightCm}
              onChange={(e) => update("heightCm", e.target.value)}
              className="mt-1 w-full rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-ink"
            />
          </label>
          <label className="text-sm text-muted">
            Edad
            <input
              type="number"
              value={settings.age}
              onChange={(e) => update("age", e.target.value)}
              className="mt-1 w-full rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-ink"
            />
          </label>
          <label className="text-sm text-muted">
            Inicio del programa
            <input
              type="date"
              value={settings.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="mt-1 w-full rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-ink"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-faint">
          La fecha de inicio determina en qué semana/fase estás en el Dashboard.
        </p>
      </section>

      <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">Backup de datos</h2>
        <p className="text-sm text-muted mb-4">
          Todo se guarda solo en este navegador. Exporta un backup si vas a cambiar de dispositivo
          o quieres tener una copia de seguridad.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="rounded bg-progress-dim text-progress font-mono text-xs uppercase tracking-wide px-4 py-2 hover:brightness-125"
          >
            Exportar backup (.json)
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className="rounded border border-line/60 text-ink font-mono text-xs uppercase tracking-wide px-4 py-2 hover:bg-panel-2"
          >
            Importar backup
          </button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={handleImport} />
        </div>
      </section>

      <section className="rounded border border-warn-dim/60 bg-panel p-4 sm:p-5">
        <h2 className="font-mono text-xs uppercase tracking-wide text-warn mb-3">Zona de riesgo</h2>
        <button
          onClick={handleReset}
          className="rounded border border-warn-dim text-warn font-mono text-xs uppercase tracking-wide px-4 py-2 hover:bg-warn-dim/20"
        >
          Borrar todo el historial de series
        </button>
      </section>
    </div>
  );
}
