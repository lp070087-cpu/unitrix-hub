/** Resumo legível de User-Agent ("Chrome 120 · Windows"). Heurística simples, sem dependências. */
export function summarizeUserAgent(ua: string | null | undefined) {
  if (!ua) return "desconhecido";
  const browser =
    match(ua, /Edg(?:e|A|iOS)?\/(\d+)/, "Edge") ||
    match(ua, /OPR\/(\d+)/, "Opera") ||
    match(ua, /SamsungBrowser\/(\d+)/, "Samsung Internet") ||
    match(ua, /Firefox\/(\d+)/, "Firefox") ||
    match(ua, /FxiOS\/(\d+)/, "Firefox") ||
    match(ua, /CriOS\/(\d+)/, "Chrome") ||
    match(ua, /Chrome\/(\d+)/, "Chrome") ||
    (/Safari\//.test(ua) ? match(ua, /Version\/(\d+)/, "Safari") || "Safari" : null) ||
    "Navegador";
  const os = /Windows/.test(ua) ? "Windows" : /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X|Macintosh/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "SO desconhecido";
  return `${browser} · ${os}`.slice(0, 120);
}

function match(ua: string, re: RegExp, name: string) {
  const m = ua.match(re);
  return m ? `${name} ${m[1]}` : null;
}
