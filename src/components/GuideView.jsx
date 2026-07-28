import { PHASE0_WEEKS, NUTRITION, WARNING_SIGNS, PROGRESSION_NOTES, WARMUP } from "../data/routine";

function Section({ title, children }) {
  return (
    <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
      <h2 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function GuideView() {
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Guía</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Referencia de la rutina</h1>
      </header>

      <Section title={`Fase 0 — cimentación (semanas 1-${PHASE0_WEEKS})`}>
        <p className="text-sm text-muted">
          Antes de cargar patrones de bisagra de cadera pesados, construyes control de tronco.
          Todos los ejercicios de pierna/bisagra usan máquina o rango controlado, no barra libre
          desde el suelo. No te la saltes.
        </p>
        <div className="mt-3">
          <div className="font-mono text-[11px] text-blueprint uppercase tracking-wide mb-1">
            Calentamiento fijo (5-7 min, cada sesión)
          </div>
          <ul className="text-sm text-muted space-y-0.5">
            {WARMUP.map((w) => (
              <li key={w.name}>· {w.name} <span className="text-faint">{w.reps}</span></li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Progresión">
        <div className="space-y-3">
          {PROGRESSION_NOTES.map((n) => (
            <div key={n.title}>
              <div className="text-sm text-ink font-medium">{n.title}</div>
              <div className="text-sm text-muted">{n.text}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Nutrición orientativa">
        <ul className="text-sm text-muted space-y-1.5">
          <li>
            <span className="text-ink">Calorías:</span> mantenimiento a ligero superávit — TDEE
            estimado {NUTRITION.tdeeRange[0]}-{NUTRITION.tdeeRange[1]} kcal, +{NUTRITION.surplus[0]}
            -{NUTRITION.surplus[1]} kcal de superávit.
          </li>
          <li>
            <span className="text-ink">Proteína:</span> {NUTRITION.proteinPerKg[0]}-{NUTRITION.proteinPerKg[1]} g/kg
          </li>
          <li>
            <span className="text-ink">Carbohidratos:</span> {NUTRITION.carbsPerKg[0]}-{NUTRITION.carbsPerKg[1]} g/kg — tu principal fuente de energía
          </li>
          <li>
            <span className="text-ink">Grasas:</span> {NUTRITION.fatPerKg[0]}-{NUTRITION.fatPerKg[1]} g/kg
          </li>
          <li>
            <span className="text-ink">Suplementos con evidencia:</span> creatina monohidratada
            (3-5 g/día todos los días) y proteína en polvo si te cuesta llegar a la cifra diaria.
          </li>
        </ul>
        <p className="mt-3 text-xs text-faint">
          La recomposición no es rápida: espera cambios visibles claros en 8-12 semanas, no en 2.
        </p>
      </Section>

      <Section title="Señales de alarma lumbar">
        <ul className="text-sm text-muted space-y-1">
          {WARNING_SIGNS.map((s) => (
            <li key={s} className="text-warn">· {s}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-faint">
          La molestia muscular leve y pasajera por activación es normal al empezar; el dolor agudo
          o irradiado no lo es. Ante cualquiera de estas señales, para y consulta a un profesional.
        </p>
      </Section>
    </div>
  );
}
