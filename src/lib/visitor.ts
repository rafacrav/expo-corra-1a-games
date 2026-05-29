/** Anonymous visitor session — UUID v4 stored in localStorage. */
const KEY = "expocorra.visitor.v1";

function uuidv4(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr-placeholder";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = uuidv4();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
