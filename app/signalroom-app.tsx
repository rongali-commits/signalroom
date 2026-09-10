"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight, BarChart3, Bell, BrainCircuit, Check, ChevronDown,
  ChevronRight, CircleUserRound, FileText, Filter, Inbox,
  LayoutDashboard, Menu, MessageSquareText, Plus, Search, Settings,
  LoaderCircle, Send, Sparkles, Target, Upload, Users, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const themes = [
  { id: "onboarding", name: "Onboarding friction", signal: 92, trend: "+18%", mentions: 47, sources: 6, summary: "Teams understand the product value, but the first setup session asks for too many decisions at once." },
  { id: "reporting", name: "Reporting clarity", signal: 84, trend: "+11%", mentions: 32, sources: 5, summary: "Managers want a weekly view they can forward without explaining every chart." },
  { id: "permissions", name: "Role permissions", signal: 76, trend: "+7%", mentions: 29, sources: 4, summary: "Larger accounts need simpler roles before inviting contractors and external partners." },
  { id: "mobile", name: "Mobile review flow", signal: 69, trend: "-3%", mentions: 21, sources: 4, summary: "Approvers can read updates on mobile, but decision controls feel too easy to miss." },
];

const initialEvidence = [
  { quote: "I knew what I wanted to achieve, but the setup asked me to name every workflow before I had seen one working.", person: "Maya Chen", company: "Northstar Labs", source: "Customer interview", segment: "Growth" },
  { quote: "The weekly report is useful. I still rewrite the summary before I send it to leadership.", person: "David Romero", company: "Fieldhouse", source: "Support ticket", segment: "Scale" },
  { quote: "We delayed inviting our contractor because the editor role exposed settings we did not want them changing.", person: "Nina Patel", company: "Assembly Co.", source: "NPS follow-up", segment: "Growth" },
];

const nav = [
  ["Overview", LayoutDashboard], ["Evidence", Inbox], ["Themes", BrainCircuit],
  ["Opportunities", Target], ["Reports", FileText],
] as const;
type ViewName = (typeof nav)[number][0];

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { cells.push(value.trim()); value = ""; }
    else value += character;
  }
  cells.push(value.trim());
  return cells;
}

export function SignalRoomApp() {
  const [selected, setSelected] = useState(themes[0]);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewName>("Overview");
  const [importOpen, setImportOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [evidenceItems, setEvidenceItems] = useState(initialEvidence);
  const [question, setQuestion] = useState("What should the product team prioritize next, and why?");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [segmentFocus, setSegmentFocus] = useState(false);
  const visibleThemes = useMemo(() => themes.filter((theme) => theme.name.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "search_research_themes",
      title: "Search research themes",
      description: "Filter the visible SignalRoom research themes by a text query.",
      inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const value = input && typeof input === "object" && "query" in input ? String(input.query).slice(0, 80) : "";
        setQuery(value);
        return { query: value, visibleThemes: themes.filter((theme) => theme.name.toLowerCase().includes(value.toLowerCase())).map((theme) => theme.name) };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  async function analyzeEvidence() {
    if (!question.trim()) return;
    setAsking(true); setAnswer("");
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, evidence: evidenceItems }) });
      const payload = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !payload.answer) throw new Error(payload.error || "Analysis unavailable");
      setAnswer(payload.answer);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis unavailable");
    } finally { setAsking(false); }
  }

  async function importCsv(file: File | undefined) {
    if (!file) return;
    if (file.size > 500_000) { toast.error("Choose a CSV under 500 KB."); return; }
    const text = await file.text();
    const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(1, 51);
    const imported = rows.map((row, index) => {
      const [quote = "", person = "Imported customer", company = "Unknown company", source = "CSV import", segment = "Unassigned"] = parseCsvLine(row);
      return { quote: quote || `Imported evidence ${index + 1}`, person, company, source, segment };
    }).filter((item) => item.quote);
    if (!imported.length) { toast.error("No evidence rows were found."); return; }
    setEvidenceItems((current) => [...imported, ...current]);
    setImportOpen(false); toast.success(`${imported.length} evidence items imported.`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-shell">
        <aside className={cn("sidebar", mobileOpen && "sidebar-open")}>
          <div className="brand-row">
            <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
            <div><p className="brand-name">SignalRoom</p><p className="workspace-name">Northstar workspace</p></div>
            <Button className="mobile-close" variant="ghost" size="icon-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></Button>
          </div>
          <nav aria-label="Primary navigation" className="primary-nav">
            {nav.map(([label, Icon]) => (
              <button key={label} className={cn("nav-item", activeView === label && "nav-item-active")} onClick={() => { setActiveView(label); setMobileOpen(false); }}>
                <Icon /><span>{label}</span>{label === "Evidence" && <span className="nav-count">128</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-spacer" />
          <div className="signal-health">
            <div className="section-label-row"><span className="eyebrow">Research health</span><span className="health-score">82%</span></div>
            <Progress value={82} className="health-progress" />
            <p>Strong coverage across six active customer segments.</p>
          </div>
          <nav aria-label="Workspace navigation" className="secondary-nav">
            <button className="nav-item" onClick={() => toast.info("Three workspace members have access.")}><Users /><span>Team</span></button>
            <button className="nav-item" onClick={() => toast.info("Workspace safeguards are active.")}><Settings /><span>Settings</span></button>
          </nav>
          <button className="account-row" onClick={() => toast.info("Signed in as the Northstar product lead.")}><span className="avatar">RC</span><span><strong>Rongali Chaitanya</strong><small>Product lead</small></span><ChevronDown /></button>
        </aside>
        {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

        <main className="main-area">
          <header className="topbar">
            <Button className="mobile-menu" variant="outline" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></Button>
            <div className="breadcrumb"><span>Research</span><ChevronRight /><strong>{activeView}</strong></div>
            <div className="topbar-actions">
              <Button variant="outline" size="sm" className="import-button" onClick={() => setImportOpen(true)}><Upload /> Import evidence</Button>
              <Button size="sm" onClick={() => setImportOpen(true)}><Plus /> New study</Button>
              <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => toast.success("You are caught up.")}><Bell /></Button>
              <Button variant="ghost" size="icon" aria-label="Account" onClick={() => toast.info("Northstar workspace · Product lead")}><CircleUserRound /></Button>
            </div>
          </header>

          <section className="content-wrap">
            {activeView === "Overview" ? <>
            <div className="page-heading">
              <div>
                <p className="eyebrow live-label"><span /> Live research pulse</p>
                <h1>What customers are telling you, clearly.</h1>
                <p>Evidence from interviews, support, surveys, and reviews, organized into decisions your team can trust.</p>
              </div>
              <div className="heading-actions"><Button variant="outline" onClick={() => setSegmentFocus((value) => !value)}><BarChart3 /> {segmentFocus ? "All segments" : "Compare segments"}</Button><Button onClick={() => setAskOpen(true)}><Sparkles /> Ask SignalRoom</Button></div>
            </div>

            <div className="metric-grid" aria-label="Research overview">
              <Metric label="Evidence items" value={String(125 + evidenceItems.length)} detail={`${evidenceItems.length} in the current view`} accent="lime" />
              <Metric label="Active themes" value="12" detail="4 require attention" accent="blue" />
              <Metric label="Open opportunities" value="7" detail="$184k revenue linked" accent="orange" />
              <Metric label="Coverage" value="82%" detail="Across 6 segments" accent="violet" />
            </div>

            <div className="workspace-grid">
              <section className="panel themes-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">Signal map</p><h2>Emerging themes</h2></div>
                  <div className="panel-tools"><label className="search-field"><Search /><Input aria-label="Search themes" placeholder="Search themes" value={query} onChange={(event) => setQuery(event.target.value)} /></label><Button variant="outline" size="icon" aria-label="Filter themes" onClick={() => setQuery(query ? "" : "onboarding")}><Filter /></Button></div>
                </div>
                <div className="theme-list">
                  {visibleThemes.map((theme, index) => (
                    <button key={theme.id} onClick={() => setSelected(theme)} className={cn("theme-row", selected.id === theme.id && "theme-row-selected")}>
                      <span className="theme-rank">{String(index + 1).padStart(2, "0")}</span><span className="theme-copy"><strong>{theme.name}</strong><small>{theme.mentions} mentions · {theme.sources} sources</small></span><span className="theme-score"><strong>{theme.signal}</strong><small>signal</small></span><Badge variant="outline" className={cn("trend-badge", theme.trend.startsWith("-") && "trend-down")}>{theme.trend}</Badge><ChevronRight className="row-chevron" />
                    </button>
                  ))}
                  {!visibleThemes.length && <div className="empty-search">No themes match “{query}”.</div>}
                </div>
              </section>

              <aside className="panel insight-panel">
                <div className="insight-topline"><Badge className="insight-badge">Priority signal</Badge><span>Updated 8 min ago</span></div>
                <h2>{selected.name}</h2><p className="insight-summary">{selected.summary}</p>
                <div className="confidence-row"><span>Evidence confidence</span><strong>{selected.signal}%</strong></div><Progress value={selected.signal} className="confidence-progress" />
                <blockquote><MessageSquareText /><p>“{evidenceItems[0].quote}”</p><footer>{evidenceItems[0].person}, {evidenceItems[0].company}</footer></blockquote>
                <div className="insight-actions"><Button className="flex-1" onClick={() => document.getElementById("evidence-repository")?.scrollIntoView({ behavior: "smooth" })}>Review evidence <ArrowUpRight /></Button><Button variant="outline" size="icon" aria-label="Mark insight reviewed" onClick={() => setReviewed((current) => current.includes(selected.id) ? current.filter((id) => id !== selected.id) : [...current, selected.id])}><Check className={reviewed.includes(selected.id) ? "reviewed-check" : ""} /></Button></div>
              </aside>
            </div>

            <section className="panel evidence-strip" id="evidence-repository">
              <div className="panel-heading compact-heading"><div><p className="eyebrow">Fresh evidence</p><h2>Recently captured</h2></div><Button variant="ghost" onClick={() => setImportOpen(true)}>Add evidence <ArrowUpRight /></Button></div>
              <div className="evidence-grid">
                {evidenceItems.slice(0, 6).map((item, index) => (
                  <article key={`${item.person}-${index}`} className="evidence-card"><div className="evidence-meta"><Badge variant="outline">{item.source}</Badge><span>{item.segment}</span></div><p>“{item.quote}”</p><footer><span className="mini-avatar">{item.person.split(" ").map((part) => part[0]).join("")}</span><span><strong>{item.person}</strong><small>{item.company}</small></span></footer></article>
                ))}
              </div>
            </section>
            </> : <SecondaryWorkspace view={activeView} evidenceItems={evidenceItems} onAsk={() => setAskOpen(true)} onImport={() => setImportOpen(true)} />}
          </section>
        </main>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="import-dialog">
          <DialogHeader><DialogTitle>Bring customer evidence into the room</DialogTitle><DialogDescription>Upload a CSV with columns for quote, person, company, source, and segment. Up to 50 rows are added to this research session.</DialogDescription></DialogHeader>
          <label className="upload-zone"><Upload /><strong>Choose a CSV file</strong><span>Maximum 500 KB</span><input type="file" accept=".csv,text/csv" onChange={(event) => void importCsv(event.target.files?.[0])} /></label>
          <div className="csv-example"><span>Expected header</span><code>quote,person,company,source,segment</code></div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <Dialog open={askOpen} onOpenChange={setAskOpen}>
        <DialogContent className="ask-dialog">
          <DialogHeader><DialogTitle>Ask the evidence</DialogTitle><DialogDescription>SignalRoom answers from the customer evidence in this workspace and identifies the supporting sources.</DialogDescription></DialogHeader>
          <Textarea rows={4} maxLength={600} value={question} onChange={(event) => setQuestion(event.target.value)} />
          {answer && <div className="ai-answer"><p className="eyebrow">Evidence-backed answer</p><div>{answer}</div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setAskOpen(false)}>Close</Button><Button onClick={() => void analyzeEvidence()} disabled={asking || !question.trim()}>{asking ? <LoaderCircle className="animate-spin" /> : <Send />} Analyze evidence</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster position="bottom-right" />
    </div>
  );
}

function Metric({ label, value, detail, accent }: { label: string; value: string; detail: string; accent: string }) {
  return <article className="metric-card"><span className={cn("metric-accent", `metric-${accent}`)} /><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}

function SecondaryWorkspace({ view, evidenceItems, onAsk, onImport }: { view: Exclude<ViewName, "Overview">; evidenceItems: typeof initialEvidence; onAsk: () => void; onImport: () => void }) {
  const [repositoryQuery, setRepositoryQuery] = useState("");
  const repositoryEvidence = [...evidenceItems, ...initialEvidence].filter((item) => Object.values(item).some((value) => value.toLowerCase().includes(repositoryQuery.toLowerCase()))).slice(0, 8);
  if (view === "Evidence") return (
    <>
      <WorkspaceHeading eyebrow="Evidence repository" title="Every insight starts with a source." copy="Search, segment, and review the customer language behind every product decision." action="Import evidence" onAction={onImport} />
      <div className="repository-layout">
        <section className="panel repository-panel">
          <div className="repository-toolbar"><label className="search-field wide-search"><Search /><Input aria-label="Search evidence" placeholder="Search quotes, people, or companies" value={repositoryQuery} onChange={(event) => setRepositoryQuery(event.target.value)} /></label><Button variant="outline" onClick={() => setRepositoryQuery(repositoryQuery ? "" : "Growth")}><Filter /> {repositoryQuery ? "Clear filter" : "Growth only"}</Button></div>
          <div className="repository-table" role="table" aria-label="Customer evidence">
            <div className="repository-head" role="row"><span>Evidence</span><span>Source</span><span>Segment</span><span>Confidence</span></div>
            {repositoryEvidence.map((item, index) => (
              <article className="repository-row" role="row" key={`${item.person}-${index}`}><div><p>“{item.quote}”</p><small>{item.person} · {item.company}</small></div><Badge variant="outline">{item.source}</Badge><span>{item.segment}</span><strong>{94 - index * 4}%</strong></article>
            ))}
            {!repositoryEvidence.length && <div className="empty-search">No evidence matches “{repositoryQuery}”.</div>}
          </div>
        </section>
        <aside className="panel coverage-panel"><p className="eyebrow">Source coverage</p><h2>Balanced evidence, fewer blind spots.</h2>{[["Interviews", 86], ["Support", 72], ["Surveys", 64], ["Reviews", 48]].map(([label, value]) => <div className="coverage-row" key={String(label)}><div><span>{label}</span><strong>{value}%</strong></div><Progress value={Number(value)} /></div>)}</aside>
      </div>
    </>
  );

  if (view === "Themes") return (
    <>
      <WorkspaceHeading eyebrow="Theme intelligence" title="Patterns with proof attached." copy="Track how customer needs change over time and inspect the evidence behind each signal." action="Ask the evidence" onAction={onAsk} />
      <section className="panel theme-board">
        <div className="theme-board-chart">
          <div className="chart-axis"><span>Signal strength</span><span>100</span></div>
          <div className="bubble-field" aria-label="Theme signal map">
            {themes.map((theme, index) => <button key={theme.id} className={`signal-bubble bubble-${index + 1}`} style={{ width: `${theme.signal * .9}px`, height: `${theme.signal * .9}px` }}><strong>{theme.signal}</strong><span>{theme.name}</span></button>)}
          </div>
        </div>
        <div className="theme-board-list">{themes.map((theme, index) => <article key={theme.id}><span className="theme-rank">0{index + 1}</span><div><strong>{theme.name}</strong><small>{theme.summary}</small></div><Badge variant="outline">{theme.mentions} mentions</Badge></article>)}</div>
      </section>
    </>
  );

  if (view === "Opportunities") return (
    <>
      <WorkspaceHeading eyebrow="Decision pipeline" title="Turn repeated pain into the right bets." copy="Prioritize opportunities using customer reach, urgency, confidence, and commercial relevance." action="Ask SignalRoom" onAction={onAsk} />
      <div className="opportunity-grid">
        {[
          ["Guided workspace setup", "Onboarding", "High", "$72k", 91],
          ["Forwardable weekly brief", "Reporting", "High", "$48k", 86],
          ["Custom contractor role", "Permissions", "Medium", "$39k", 78],
          ["Mobile decision tray", "Mobile", "Medium", "$25k", 71],
        ].map(([name, theme, priority, revenue, score], index) => <article className="panel opportunity-card" key={String(name)}><div className="opportunity-top"><span>SR-{104 + index}</span><Badge className={priority === "High" ? "priority-high" : "priority-medium"}>{priority}</Badge></div><h2>{name}</h2><p>Connected to the {String(theme).toLowerCase()} theme and supported by multiple customer segments.</p><div className="opportunity-data"><span><small>Opportunity score</small><strong>{score}</strong></span><span><small>Revenue linked</small><strong>{revenue}</strong></span></div><Progress value={Number(score)} /><Button variant="outline" onClick={() => toast.info(`${name} decision brief opened.`)}>Open decision brief <ArrowUpRight /></Button></article>)}
      </div>
    </>
  );

  return (
    <>
      <WorkspaceHeading eyebrow="Stakeholder reports" title="Decisions people can verify." copy="Package evidence, recommendations, and unresolved questions into a concise shareable research brief." action="Create report" onAction={() => toast.success("A new report draft is ready.")} />
      <div className="reports-layout">
        <section className="panel report-feature"><div className="report-cover"><span className="eyebrow">September research brief</span><h2>Three customer signals that should shape the next release.</h2><div className="report-visual"><span style={{ height: "82%" }} /><span style={{ height: "64%" }} /><span style={{ height: "47%" }} /><span style={{ height: "31%" }} /></div><footer><span>Northstar workspace</span><span>12 sources · 128 evidence items</span></footer></div><div className="report-actions"><div><Badge>Ready to share</Badge><p>Updated 18 minutes ago</p></div><Button onClick={() => toast.info("September research brief opened.")}>Open report <ArrowUpRight /></Button></div></section>
        <aside className="report-list"><p className="eyebrow">Recent reports</p>{["Onboarding friction deep dive", "Enterprise permissions review", "Q3 customer voice summary"].map((name, index) => <button className="panel report-row" key={name} onClick={() => toast.info(`${name} opened in the report viewer.`)}><span className="file-icon"><FileText /></span><span><strong>{name}</strong><small>{index + 2} weeks ago · {18 + index * 7} sources</small></span><ChevronRight /></button>)}</aside>
      </div>
    </>
  );
}

function WorkspaceHeading({ eyebrow, title, copy, action, onAction }: { eyebrow: string; title: string; copy: string; action: string; onAction: () => void }) {
  return <div className="secondary-heading"><div><p className="eyebrow live-label"><span /> {eyebrow}</p><h1>{title}</h1><p>{copy}</p></div><Button onClick={onAction}><Plus /> {action}</Button></div>;
}
