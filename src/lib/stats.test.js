import { describe, it, expect } from "vitest";
import {
  getWeeklyMuscleVolume,
  getAdherenceDates,
  getStreak,
  getExerciseHistory,
  getLoggedExerciseIds,
  getPRs,
  getEstimated1RMTrend,
  getTonnageSeries,
  getAvgRIRSeries,
} from "./stats";

function logsWith(sessions) {
  return { sessions, bodyweight: [] };
}

describe("getWeeklyMuscleVolume", () => {
  it("counts trained sets per muscle for the week of the reference date", () => {
    const logs = logsWith({
      "2026-07-27": {
        dayId: "torsoA",
        status: "trained",
        sets: [
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 2 },
          { exerciseId: "ta-2", weight: 20, reps: 9, rir: 2, setNumber: 1 },
        ],
      },
    });
    const volume = getWeeklyMuscleVolume(logs, new Date("2026-07-29"));
    expect(volume.pecho).toBe(2);
    expect(volume.hombro).toBe(1);
  });
});

describe("getAdherenceDates / getStreak", () => {
  it("only counts sessions with status trained", () => {
    const logs = logsWith({
      "2026-07-29": { dayId: "torsoA", status: "trained", sets: [] },
      "2026-07-28": { dayId: "piernaA", status: "missed", sets: [] },
    });
    expect(getAdherenceDates(logs)).toEqual(["2026-07-29"]);
  });
});

describe("getExerciseHistory", () => {
  it("computes max weight and total volume per date for one exercise", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          { exerciseId: "ta-1", weight: 42.5, reps: 8, rir: 1, setNumber: 2 },
        ],
      },
    });
    const history = getExerciseHistory(logs, "ta-1");
    expect(history).toEqual([
      { date: "2026-07-28", maxWeight: 42.5, totalVolume: 40 * 9 + 42.5 * 8, sets: 2 },
    ]);
  });
});

describe("getLoggedExerciseIds", () => {
  it("returns ids that have at least one set logged", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
      },
    });
    expect(getLoggedExerciseIds(logs)).toEqual(new Set(["ta-1"]));
  });
});

describe("getPRs", () => {
  it("tracks the best weight ever logged per exercise, with date", () => {
    const logs = logsWith({
      "2026-07-14": {
        dayId: "torsoA",
        status: "trained",
        sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
      },
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [{ exerciseId: "ta-1", weight: 42.5, reps: 8, rir: 1, setNumber: 1 }],
      },
    });
    const prs = getPRs(logs);
    expect(prs["ta-1"]).toEqual({ bestWeight: 42.5, bestWeightDate: "2026-07-28" });
  });
});

describe("getEstimated1RMTrend", () => {
  it("applies the Epley formula to the top set of each session", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
      },
    });
    const trend = getEstimated1RMTrend(logs, "ta-1");
    expect(trend).toEqual([{ date: "2026-07-28", oneRM: 40 * (1 + 9 / 30) }]);
  });
});

describe("getTonnageSeries", () => {
  it("sums weight times reps across all sets per date", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          { exerciseId: "ta-2", weight: 20, reps: 10, rir: 2, setNumber: 1 },
        ],
      },
    });
    expect(getTonnageSeries(logs)).toEqual([{ date: "2026-07-28", tonnage: 40 * 9 + 20 * 10 }]);
  });
});

describe("getAvgRIRSeries", () => {
  it("averages RIR across sets that have it, per date", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          { exerciseId: "ta-2", weight: 20, reps: 10, rir: 4, setNumber: 1 },
        ],
      },
    });
    expect(getAvgRIRSeries(logs)).toEqual([{ date: "2026-07-28", avgRIR: 3 }]);
  });
});
