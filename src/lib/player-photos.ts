// A equipe busca fotos livres pela API PageImages da Wikipedia e evita imagens pequenas.
// O navegador mantém o resultado em cache para não repetir as requisições.

const CACHE_KEY = "expocorra.playerPhotos.v2";
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
    // A aplicação continua normalmente caso o navegador não permita atualizar o cache.
  }
}

const inflight = new Map<string, Promise<string | null>>();

export async function getPlayerPhoto(wikiTitle: string): Promise<string | null> {
  const cache = readCache();
  if (wikiTitle in cache) return cache[wikiTitle];
  if (inflight.has(wikiTitle)) return inflight.get(wikiTitle)!;

  const p = (async () => {
    try {
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        formatversion: "2",
        origin: "*",
        redirects: "1",
        prop: "pageimages",
        piprop: "thumbnail|original",
        pithumbsize: "900",
        pilicense: "free",
        titles: wikiTitle,
      });
      const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      const page = j?.query?.pages?.[0];
      const src: string | null = page?.thumbnail?.source || page?.original?.source || null;
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
