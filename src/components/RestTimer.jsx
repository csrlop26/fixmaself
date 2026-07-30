import { useEffect, useState } from "react";

export default function RestTimer({ seconds }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  if (remaining === null) {
    return (
      <button
        onClick={() => setRemaining(seconds)}
        className="font-mono text-[11px] text-blueprint hover:brightness-125"
      >
        ⏱ iniciar descanso ({seconds}s)
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono text-[11px]">
      <span className={remaining === 0 ? "text-progress" : "text-blueprint"}>
        {remaining === 0 ? "¡Listo!" : `${remaining}s restantes`}
      </span>
      <button onClick={() => setRemaining(null)} className="text-faint hover:text-ink">
        reiniciar
      </button>
    </div>
  );
}
