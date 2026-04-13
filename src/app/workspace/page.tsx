"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import {
  Search, Filter, Download, FolderPlus, Bell, Home, ChevronLeft, ChevronRight,
  Users, Building2, Radar, FolderOpen, Wand2, Plug, Settings, Mail, Phone,
  MoreHorizontal, ChevronDown, Check
} from "lucide-react"

type Lead = {
  id: string; name: string; title: string | null; company: string | null;
  email: string | null; phone: string | null; emailStatus: string;
  phoneStatus: string; intentScore: number; intentLevel: string; source: string | null
}

const NAV_ITEMS = [
  { section: "Discovery", items: [
    { icon: Users, label: "Lead Search", active: true },
    { icon: Building2, label: "Companies" },
    { icon: Radar, label: "Buying Intent", badge: "New" },
  ]},
  { section: "Workspace", items: [
    { icon: FolderOpen, label: "Saved Lists" },
    { icon: Wand2, label: "Enrichment Jobs" },
    { icon: Plug, label: "Integrations" },
  ]},
]

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

function IntentDot({ level }: { level: string }) {
  const color = level === "Surging" ? "bg-green-500" : level === "Active" ? "bg-yellow-500" : level === "High" ? "bg-green-500" : level === "Warm" ? "bg-orange-400" : "bg-stone-400"
  return <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
}

export default function WorkspacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [autoEnrich, setAutoEnrich] = useState(true)
  const [activeNav, setActiveNav] = useState("Lead Search")
  const [savingList, setSavingList] = useState(false)
  const pageSize = 20

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) params.set("search", search)
      const res = await fetch(`/api/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads)
        setTotal(data.total)
      }
    } catch {} finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { if (status === "authenticated") fetchLeads() }, [status, fetchLeads])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) { fetchLeads(); return }
    setSearching(true)
    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search }),
      })
      if (res.ok) { setPage(1); await fetchLeads() }
    } catch {} finally { setSearching(false) }
  }

  async function handleReveal(leadId: string) {
    const res = await fetch("/api/leads/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    })
    if (res.ok) {
      const { lead } = await res.json()
      setLeads(prev => prev.map(l => l.id === lead.id ? lead : l))
    }
  }

  async function handleExport() {
    window.open("/api/leads/export", "_blank")
  }

  async function handleSaveToList() {
    if (selected.size === 0) return
    setSavingList(true)
    try {
      await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `List ${new Date().toLocaleDateString()}`, leadIds: Array.from(selected) }),
      })
      setSelected(new Set())
    } catch {} finally { setSavingList(false) }
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleSelectAll() {
    if (selected.size === leads.length) setSelected(new Set())
    else setSelected(new Set(leads.map(l => l.id)))
  }

  const totalPages = Math.ceil(total / pageSize)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#EAE8E2] flex items-center justify-center">
        <div className="text-stone-400 text-sm tracking-widest uppercase">Loading...</div>
      </div>
    )
  }

  return (
    <main className="max-w-[1600px] mx-auto py-8 md:py-16 px-4 md:px-12">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-3xl font-light text-stone-900 font-display" style={{ letterSpacing: "-0.05em" }}>Workspace Overview</h2>
        <span className="text-xs font-medium uppercase tracking-widest text-stone-500 hidden md:block" style={{ letterSpacing: "-0.025em" }}>Lead Generation Platform</span>
      </div>

      {/* App Container */}
      <div className="border border-stone-300/60 rounded-md bg-[#EAE8E2] shadow-2xl shadow-stone-800/10 flex flex-col md:flex-row overflow-hidden relative" style={{ height: "80vh", minHeight: "700px" }}>
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-300/60 bg-[#EAE8E2] flex flex-col shrink-0">
          {/* Workspace Selector */}
          <div className="p-5 border-b border-stone-300/60 flex items-center justify-between cursor-pointer hover:bg-stone-300/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-stone-900 text-[#EAE8E2] flex items-center justify-center font-medium text-sm">
                {session?.user?.name?.[0]?.toUpperCase() || "L"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-stone-800 tracking-tight">{session?.user?.name || "Workspace"}</span>
                <span className="text-xs text-stone-500">Pro Plan</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </div>

          {/* Nav */}
          <div className="p-4 flex-1 overflow-y-auto space-y-1">
            {NAV_ITEMS.map(section => (
              <div key={section.section}>
                <p className="px-3 text-xs uppercase tracking-widest text-stone-400 font-medium mb-3 mt-4" style={{ letterSpacing: "-0.025em" }}>{section.section}</p>
                {section.items.map(item => (
                  <button key={item.label} onClick={() => setActiveNav(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-sm transition-colors ${activeNav === item.label ? "text-stone-900 bg-stone-300/40" : "text-stone-600 hover:text-stone-900 hover:bg-stone-300/20"}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-[18px] h-[18px]" />
                      {item.label}
                    </div>
                    {item.badge && <span className="text-xs bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded border border-stone-300/50">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-stone-300/60 space-y-2">
            {session?.user && (
              <div className="flex items-center gap-3 px-2 py-2">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || ""} className="w-8 h-8 rounded-full grayscale object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center text-stone-600 font-medium text-xs">
                    {getInitials(session.user.name || "U")}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-stone-800 truncate">{session.user.name}</p>
                  <p className="text-[10px] text-stone-500 truncate">{session.user.email}</p>
                </div>
              </div>
            )}
            <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-300/20 rounded-sm transition-colors">
              <Settings className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#EAE8E2] overflow-hidden">
          
          {/* Topbar */}
          <header className="h-16 border-b border-stone-300/60 px-6 flex items-center justify-between shrink-0 bg-[#EAE8E2]/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Home className="w-4 h-4" />
              <span>/</span>
              <span className="text-stone-900 font-medium">{activeNav}</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer gap-2">
                <span className="text-xs uppercase tracking-widest text-stone-500 font-medium hidden sm:inline" style={{ letterSpacing: "-0.025em" }}>Auto-Enrich</span>
                <button onClick={() => setAutoEnrich(!autoEnrich)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${autoEnrich ? "bg-stone-900" : "bg-stone-300"}`}>
                  <div className={`w-3 h-3 bg-[#EAE8E2] rounded-full absolute top-0.5 transition-transform ${autoEnrich ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </label>
              <div className="w-px h-4 bg-stone-300/80" />
              <button className="text-stone-500 hover:text-stone-900 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Toolbar */}
          <div className="p-4 md:p-6 border-b border-stone-300/40 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, role, or company..."
                  className="w-full bg-[#EAE8E2] border border-stone-400/40 rounded-sm py-2 pl-10 pr-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all shadow-inner shadow-stone-300/20" />
              </div>
              <button type="submit" disabled={searching}
                className="flex items-center gap-2 border border-stone-400/40 bg-[#EAE8E2] px-3 py-2 rounded-sm text-sm font-medium text-stone-700 hover:bg-stone-300/30 transition-colors shadow-sm disabled:opacity-50">
                <Filter className="w-4 h-4" />
                {searching ? "Searching..." : "Search"}
              </button>
            </form>
            <div className="flex items-center gap-2">
              <button onClick={handleExport}
                className="border border-stone-400/40 bg-[#EAE8E2] px-4 py-2 rounded-sm text-sm font-medium text-stone-700 hover:bg-stone-300/30 transition-colors shadow-sm">
                Export CSV
              </button>
              <button onClick={handleSaveToList} disabled={selected.size === 0 || savingList}
                className="bg-stone-900 text-[#EAE8E2] px-4 py-2 rounded-sm text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                <FolderPlus className="w-4 h-4" />
                Save to List {selected.size > 0 && `(${selected.size})`}
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto relative">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-[#EAE8E2] z-10 border-b border-stone-300/60">
                <tr>
                  <th className="py-3 px-6 w-12">
                    <button onClick={toggleSelectAll} className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${selected.size === leads.length && leads.length > 0 ? "bg-stone-900 border-stone-900" : "border-stone-400/60 bg-[#EAE8E2]"}`}>
                      {selected.size === leads.length && leads.length > 0 && <Check className="w-3 h-3 text-[#EAE8E2]" />}
                    </button>
                  </th>
                  <th className="py-3 px-6 font-medium text-xs uppercase tracking-widest text-stone-500" style={{ letterSpacing: "-0.025em" }}>Prospect</th>
                  <th className="py-3 px-6 font-medium text-xs uppercase tracking-widest text-stone-500" style={{ letterSpacing: "-0.025em" }}>Company</th>
                  <th className="py-3 px-6 font-medium text-xs uppercase tracking-widest text-stone-500" style={{ letterSpacing: "-0.025em" }}>Intent Score</th>
                  <th className="py-3 px-6 font-medium text-xs uppercase tracking-widest text-stone-500" style={{ letterSpacing: "-0.025em" }}>Contact Info</th>
                  <th className="py-3 px-6 w-16"></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-stone-300/40">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center text-stone-400 text-sm">Loading leads...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-stone-400 text-sm">
                    No leads yet. Search for prospects using the search bar above.
                  </td></tr>
                ) : leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-stone-300/20 transition-colors group">
                    <td className="py-4 px-6">
                      <button onClick={() => toggleSelect(lead.id)} className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${selected.has(lead.id) ? "bg-stone-900 border-stone-900" : "border-stone-400/60 bg-[#EAE8E2]"}`}>
                        {selected.has(lead.id) && <Check className="w-3 h-3 text-[#EAE8E2]" />}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center text-stone-600 font-medium text-xs">
                          {getInitials(lead.name)}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 tracking-tight">{lead.name}</p>
                          <p className="text-stone-500 text-xs">{lead.title || "Professional"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-stone-300 rounded-sm flex items-center justify-center text-[10px] font-medium text-stone-600">
                          {(lead.company || "?")[0]}
                        </div>
                        <span className="text-stone-700">{lead.company || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <IntentDot level={lead.intentLevel} />
                        <span className="font-medium text-stone-800">{lead.intentScore}</span>
                        <span className="text-xs text-stone-500 ml-1">{lead.intentLevel}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {lead.emailStatus === "verified" || lead.phoneStatus === "direct" ? (
                        <div className="flex gap-2">
                          {lead.emailStatus === "verified" && (
                            <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-700 px-2 py-1 rounded text-xs border border-stone-300/50">
                              <Mail className="w-3 h-3" /> Verified
                            </span>
                          )}
                          {lead.phoneStatus === "direct" && (
                            <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-700 px-2 py-1 rounded text-xs border border-stone-300/50">
                              <Phone className="w-3 h-3" /> Direct
                            </span>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => handleReveal(lead.id)}
                          className="text-xs font-medium text-stone-600 border border-stone-400/40 rounded px-2 py-1 hover:bg-stone-200 transition-colors">
                          Reveal Details
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-stone-400 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="h-14 border-t border-stone-300/60 px-6 flex items-center justify-between shrink-0 bg-[#EAE8E2]">
            <span className="text-xs text-stone-500 font-medium tracking-wide">
              Showing {leads.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, total)} of {total.toLocaleString()} leads
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-stone-300/60 text-stone-400 hover:bg-stone-200 hover:text-stone-800 transition-colors disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded border border-stone-300/60 text-xs transition-colors ${page === p ? "text-stone-800 bg-stone-200 font-medium" : "text-stone-600 hover:bg-stone-200"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-stone-300/60 text-stone-600 hover:bg-stone-200 hover:text-stone-800 transition-colors disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
