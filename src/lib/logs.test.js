import { describe, it, expect } from "vitest";
import { getSession, getExerciseSets, setExerciseSets, markAttendance, addBodyweightEntry, getBodyweightSeries, normalizeLogs } from "./logs";

const EMPTY_LOGS = { sessions: {}, bodyweight: [] };

describe("normalizeLogs", () => {
  it("passes through an already-valid new-shape object unchanged", () => {
    const logs = { sessions: { "2026-07-30": { dayId: "torsoA", status: "trained", sets: [], durationMin: null, note: "" } }, bodyweight: [] };
    expect(normalizeLogs(logs)).toBe(logs);
  });

  it("converts an empty object (e.g. from the old reset bug) to a safe empty shape", () => {
    expect(normalizeLogs({})).toEqual({ sessions: {}, bodyweight: [] });
  });

  it("converts null/undefined to a safe empty shape", () => {
    expect(normalizeLogs(null)).toEqual({ sessions: {}, bodyweight: [] });
    expect(normalizeLogs(undefined)).toEqual({ sessions: {}, bodyweight: [] });
  });

  it("migrates legacy { [date]: { dayId, entries } } logs into the new sets-array shape", () => {
    const legacy = {
      "2026-07-30": {
        dayId: "torsoA",
        entries: {
          "ta-1": [{ weight: "40", reps: "9" }, { weight: "40", reps: "8" }],
          "ta-2": [{ weight: "20", reps: "10" }],
        },
      },
    };
    const result = normalizeLogs(legacy);
    expect(result.bodyweight).toEqual([]);
    expect(result.sessions["2026-07-30"].dayId).toBe("torsoA");
    expect(result.sessions["2026-07-30"].status).toBe("trained");
    expect(result.sessions["2026-07-30"].sets).toEqual([
      { exerciseId: "ta-1", weight: "40", reps: "9", rir: "", setNumber: 1 },
      { exerciseId: "ta-1", weight: "40", reps: "8", rir: "", setNumber: 2 },
      { exerciseId: "ta-2", weight: "20", reps: "10", rir: "", setNumber: 1 },
    ]);
  });

  it("drops legacy days that logged no real sets", () => {
    const legacy = { "2026-07-29": { dayId: "piernaA", entries: {} } };
    expect(normalizeLogs(legacy)).toEqual({ sessions: {}, bodyweight: [] });
  });
});

describe("getSession", () => {
  it("returns null when the session does not exist", () => {
    expect(getSession(EMPTY_LOGS, "2026-07-30")).toBeNull();
  });

  it("returns the session when it exists", () => {
    const logs = {
      sessions: {
        "2026-07-30": { dayId: "torsoA", status: "trained", sets: [], durationMin: null, note: "" },
      },
      bodyweight: [],
    };
    expect(getSession(logs, "2026-07-30")).toEqual(logs.sessions["2026-07-30"]);
  });
});

describe("getExerciseSets", () => {
  it("returns empty array when the session does not exist", () => {
    expect(getExerciseSets(EMPTY_LOGS, "2026-07-30", "ta-1")).toEqual([]);
  });

  it("returns only the sets for the requested exercise, ordered by setNumber", () => {
    const logs = {
      sessions: {
        "2026-07-30": {
          dayId: "torsoA",
          status: "trained",
          sets: [
            { exerciseId: "ta-2", weight: 20, reps: 10, rir: 2, setNumber: 1 },
            { exerciseId: "ta-1", weight: 40, reps: 8, rir: 2, setNumber: 2 },
            { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          ],
        },
      },
      bodyweight: [],
    };
    expect(getExerciseSets(logs, "2026-07-30", "ta-1")).toEqual([
      { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
      { exerciseId: "ta-1", weight: 40, reps: 8, rir: 2, setNumber: 2 },
    ]);
  });
});

describe("setExerciseSets", () => {
  it("creates a new trained session with the given sets when none existed", () => {
    const result = setExerciseSets(EMPTY_LOGS, "2026-07-30", "torsoA", "ta-1", [
      { weight: 40, reps: 9, rir: 2 },
    ]);
    expect(result.sessions["2026-07-30"]).toEqual({
      dayId: "torsoA",
      status: "trained",
      sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
      durationMin: null,
      note: "",
    });
  });

  it("replaces only the target exercise's sets, keeping other exercises intact", () => {
    const logs = {
      sessions: {
        "2026-07-30": {
          dayId: "torsoA",
          status: "trained",
          sets: [{ exerciseId: "ta-2", weight: 20, reps: 10, rir: 2, setNumber: 1 }],
          durationMin: null,
          note: "",
        },
      },
      bodyweight: [],
    };
    const result = setExerciseSets(logs, "2026-07-30", "torsoA", "ta-1", [
      { weight: 40, reps: 9, rir: 2 },
    ]);
    expect(result.sessions["2026-07-30"].sets).toEqual([
      { exerciseId: "ta-2", weight: 20, reps: 10, rir: 2, setNumber: 1 },
      { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
    ]);
  });

  it("does not mutate the original logs object", () => {
    const result = setExerciseSets(EMPTY_LOGS, "2026-07-30", "torsoA", "ta-1", [
      { weight: 40, reps: 9, rir: 2 },
    ]);
    expect(EMPTY_LOGS.sessions).toEqual({});
    expect(result).not.toBe(EMPTY_LOGS);
  });

  it("clears sets when called with an empty array", () => {
    const logs = {
      sessions: {
        "2026-07-30": {
          dayId: "torsoA",
          status: "trained",
          sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
          durationMin: null,
          note: "",
        },
      },
      bodyweight: [],
    };
    const result = setExerciseSets(logs, "2026-07-30", "torsoA", "ta-1", []);
    expect(result.sessions["2026-07-30"].sets).toEqual([]);
  });
});

describe("markAttendance", () => {
  it("sets a manual status on a day with no prior session", () => {
    const result = markAttendance(EMPTY_LOGS, "2026-07-31", "piernaA", "missed", "dolor de espalda");
    expect(result.sessions["2026-07-31"]).toEqual({
      dayId: "piernaA",
      status: "missed",
      sets: [],
      durationMin: null,
      note: "dolor de espalda",
    });
  });

  it("overrides status on an existing session without dropping its sets", () => {
    const logs = {
      sessions: {
        "2026-07-30": {
          dayId: "torsoA",
          status: "trained",
          sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
          durationMin: null,
          note: "",
        },
      },
      bodyweight: [],
    };
    const result = markAttendance(logs, "2026-07-30", "torsoA", "rest", "");
    expect(result.sessions["2026-07-30"].status).toBe("rest");
    expect(result.sessions["2026-07-30"].sets).toEqual(logs.sessions["2026-07-30"].sets);
  });

  it("does not mutate the original logs object", () => {
    const result = markAttendance(EMPTY_LOGS, "2026-07-31", "piernaA", "missed", "");
    expect(EMPTY_LOGS.sessions).toEqual({});
    expect(result).not.toBe(EMPTY_LOGS);
  });
});

describe("bodyweight", () => {
  it("adds a new entry sorted by date", () => {
    let logs = addBodyweightEntry(EMPTY_LOGS, "2026-07-30", 75.2);
    logs = addBodyweightEntry(logs, "2026-07-15", 75.8);
    expect(getBodyweightSeries(logs)).toEqual([
      { date: "2026-07-15", kg: 75.8 },
      { date: "2026-07-30", kg: 75.2 },
    ]);
  });

  it("upserts an existing date instead of duplicating it", () => {
    let logs = addBodyweightEntry(EMPTY_LOGS, "2026-07-30", 75.2);
    logs = addBodyweightEntry(logs, "2026-07-30", 74.9);
    expect(getBodyweightSeries(logs)).toEqual([{ date: "2026-07-30", kg: 74.9 }]);
  });
});
