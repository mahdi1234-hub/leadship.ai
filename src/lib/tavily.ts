const TAVILY_API_KEY = process.env.TAVILY_API_KEY || ""

interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
}

interface TavilyResponse {
  results: TavilySearchResult[]
}

export async function searchLeads(query: string): Promise<TavilySearchResult[]> {
  if (!TAVILY_API_KEY) return []

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: `${query} professional contact email LinkedIn`,
      search_depth: "advanced",
      max_results: 10,
      include_answer: false,
    }),
  })

  if (!response.ok) return []

  const data: TavilyResponse = await response.json()
  return data.results || []
}

function extractNameFromTitle(title: string): string {
  const cleaned = title.replace(/\s*[-|].*$/, "").replace(/\s*\(.*\)/, "").trim()
  const parts = cleaned.split(/\s+/).filter(p => p.length > 1 && /^[A-Z]/.test(p))
  return parts.slice(0, 3).join(" ") || cleaned.split(/\s+/).slice(0, 2).join(" ")
}

function extractCompany(content: string, url: string): string {
  const companies = ["Google", "Meta", "Apple", "Microsoft", "Amazon", "Stripe", "OpenAI", "Linear", "Anthropic", "Vercel", "Notion", "Figma", "Slack", "Shopify", "Datadog"]
  for (const c of companies) {
    if (content.includes(c) || url.includes(c.toLowerCase())) return c
  }
  const match = content.match(/(?:at|@|works? (?:at|for))\s+([A-Z][A-Za-z0-9]+(?:\s[A-Z][A-Za-z0-9]+)?)/i)
  if (match) return match[1]
  try {
    const hostname = new URL(url).hostname.replace("www.", "").split(".")[0]
    return hostname.charAt(0).toUpperCase() + hostname.slice(1)
  } catch { return "Unknown" }
}

function extractTitle(content: string): string {
  const titles = [
    "CEO", "CTO", "CFO", "CMO", "COO", "VP", "Director", "Head of", "Manager",
    "Chief", "Founder", "Co-founder", "Engineer", "Developer", "Designer",
    "Product Manager", "Growth Lead", "Marketing Lead", "Sales Lead"
  ]
  for (const t of titles) {
    const idx = content.indexOf(t)
    if (idx !== -1) {
      const end = content.indexOf(",", idx)
      const end2 = content.indexOf(".", idx)
      const endIdx = Math.min(end > -1 ? end : 200, end2 > -1 ? end2 : 200)
      return content.slice(idx, Math.min(idx + 40, endIdx)).trim()
    }
  }
  return "Professional"
}

export function parseLeadsFromResults(results: TavilySearchResult[]): Array<{
  name: string; title: string; company: string; intentScore: number; intentLevel: string; source: string
}> {
  return results.map((r, i) => {
    const name = extractNameFromTitle(r.title)
    const company = extractCompany(r.content, r.url)
    const title = extractTitle(r.content)
    const intentScore = Math.max(20, Math.min(99, Math.round(r.score * 100)))
    const intentLevel = intentScore >= 80 ? "Surging" : intentScore >= 60 ? "Active" : intentScore >= 40 ? "Warm" : "Cold"
    return { name: name || `Lead ${i + 1}`, title, company, intentScore, intentLevel, source: r.url }
  }).filter(l => l.name.length > 2)
}
