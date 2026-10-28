import { promises as fs } from "node:fs";
import path from "node:path";
import { atomic } from "./engine.mjs";
export const defaults = { version: 1, taskTimeoutMinutes: 20, repairLimit: 1, defaultSimulator: "", captureLimit: 200 };
export async function loadSettings(root) {
  try {
    const value = JSON.parse(
      await fs.readFile(path.join(root, "settings-v1.json"), "utf8"),
    );
    return validateSettings(value);
  } catch (e) {
    if (e.code === "ENOENT") return { ...defaults };
    throw e;
  }
}
export function validateSettings(value) {
  if (
    !value ||
    !Number.isInteger(value.taskTimeoutMinutes) ||
    value.taskTimeoutMinutes < 1 ||
    value.taskTimeoutMinutes > 60 ||
    !Number.isInteger(value.repairLimit) ||
    value.repairLimit < 0 ||
    value.repairLimit > 3
  )
    throw Error("Timeout must be 1–60 minutes; repairs 0–3");
  if (value.defaultSimulator !== undefined && (typeof value.defaultSimulator !== "string" || (value.defaultSimulator !== "" && !/^[A-Fa-f0-9-]{36}$/.test(value.defaultSimulator)))) throw Error("Select a valid simulator UUID");
  if (value.captureLimit !== undefined && (!Number.isInteger(value.captureLimit) || value.captureLimit < 1 || value.captureLimit > 500)) throw Error("Capture retention must be 1–500 records");
  return {
    version: 1,
    defaultSimulator: value.defaultSimulator ?? "",
    captureLimit: value.captureLimit ?? 200,
    taskTimeoutMinutes: value.taskTimeoutMinutes,
    repairLimit: value.repairLimit,
  };
}
export async function saveSettings(root, value) {
  const settings = validateSettings(value);
  await atomic(path.join(root, "settings-v1.json"), settings);
  return settings;
}
