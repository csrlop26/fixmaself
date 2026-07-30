import { describe, it, expect } from "vitest";
import { suggestProgression } from "./progression";

const RANGE = { repsLow: 8, repsHigh: 10 };

describe("suggestProgression", () => {
  it("suggests starting weight when there is no history", () => {
    const result = suggestProgression([], RANGE);
    expect(result.action).toBe("start");
  });

  it("suggests increasing weight when the top set hit repsHigh at low RIR", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 10, rir: 1 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("increase");
    expect(result.weightDeltaPct).toBeGreaterThanOrEqual(0.025);
    expect(result.weightDeltaPct).toBeLessThanOrEqual(0.05);
  });

  it("holds weight when the top set is within range but RIR is still high", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 10, rir: 3 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("hold");
  });

  it("holds weight after a single session below repsLow", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 6, rir: 0 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("hold");
  });

  it("suggests decreasing weight after two sessions in a row below repsLow", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 6, rir: 0 }] },
      { date: "2026-07-21", sets: [{ weight: 40, reps: 7, rir: 0 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("decrease");
  });

  it("holds weight exactly at repsLow (not below range)", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 8, rir: 2 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("hold");
  });

  it("increases weight exactly at repsHigh with RIR exactly at the threshold", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 10, rir: 2 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("increase");
  });

  it("holds weight above repsHigh when RIR is above the low-RIR threshold", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 11, rir: 3 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("hold");
  });
});
