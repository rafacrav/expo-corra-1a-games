// Fetches real player photos from Wikipedia's public REST API (CORS-enabled).
// Caches in localStorage to avoid refetching.

const CACHE_KEY = "expocorra.playerPhotos.v1";
type Cache = Record<string, string | null>;

function readCache(): Cache {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeCache(c: Cache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    // quota — ignore
  }
}

const inflight = new Map<string, Promise<string | null>>();

export async function getPlayerPhoto(wikiTitle: string): Promise<string | null> {
  const cache = readCache();
  if (wikiTitle in cache) return cache[wikiTitle];
  if (inflight.has(wikiTitle)) return inflight.get(wikiTitle)!;

  const p = (async () => {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        wikiTitle,
      )}?redirect=true`;
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      const src: string | null =
        j?.thumbnail?.source || j?.originalimage?.source || null;
      cache[wikiTitle] = src;
      writeCache(cache);
      return src;
    } catch {
      cache[wikiTitle] = null;
      writeCache(cache);
      return null;
    } finally {
      inflight.delete(wikiTitle);
    }
  })();

  inflight.set(wikiTitle, p);
  return p;
}
