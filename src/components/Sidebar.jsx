const TABS = [
  { id: "dashboard", label: "Dashboard", num: "01" },
  { id: "session", label: "Sesión", num: "02" },
  { id: "progress", label: "Progreso", num: "03" },
  { id: "guide", label: "Guía", num: "04" },
  { id: "settings", label: "Ajustes", num: "05" },
];

export default function Sidebar({ active, onChange }) {
  return (
    <>
      {/* Sidebar escritorio */}
      <aside className="hidden md:flex md:w-56 shrink-0 flex-col border-r border-line/60 bg-panel px-4 py-6">
        <div className="mb-10 px-2">
          <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            AugustoCS — Training
          </div>
          <div className="font-mono text-lg text-ink mt-1">100×100</div>
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`group flex items-center gap-3 rounded px-2 py-2.5 text-left transition-colors ${
                active === tab.id
                  ? "bg-panel-2 text-ink"
                  : "text-muted hover:text-ink hover:bg-panel-2/60"
              }`}
            >
              <span
                className={`font-mono text-[11px] ${
                  active === tab.id ? "text-progress" : "text-faint"
                }`}
              >
                {tab.num}
              </span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto px-2 pt-6 font-mono text-[10px] leading-relaxed text-faint">
          Datos guardados solo en este dispositivo (localStorage). Exporta backup en Ajustes.
        </div>
      </aside>

      {/* Barra inferior móvil */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden border-t border-line/60 bg-panel">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 text-center font-mono text-[10px] uppercase tracking-wide ${
              active === tab.id ? "text-progress" : "text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}
