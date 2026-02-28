import { useState, useEffect, useRef } from "react";

// ============================================================
// HAPPYCO DESIGN TOKENS (extracted from actual platform screenshots)
// ============================================================
const T = {
  navBg: "#1a1440",
  primary: "#5B4FCF",
  primaryLight: "#EDEDFC",
  teal: "#10B981",
  tealBg: "#ECFDF5",
  tealText: "#047857",
  sidebarBg: "#FFFFFF",
  sidebarBorder: "#E5E7EB",
  sidebarText: "#4B5563",
  bodyBg: "#F9FAFB",
  cardBg: "#FFFFFF",
  cardBorder: "#E5E7EB",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
  dangerText: "#991B1B",
  warningBg: "#FEF3C7",
  warningText: "#92400E",
  successBg: "#D1FAE5",
  successText: "#065F46",
  infoBg: "#DBEAFE",
  infoText: "#1E40AF",
  borderRadius: 8,
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

// ============================================================
// MOCK DATA
// ============================================================
const PROPERTY = { name: "Ridgewood Heights", address: "4200 Maple Creek Dr, Austin, TX 78745", units: 212 };
const UNIT = {
  number: "B-214", building: "Building B", floor: 2, bedrooms: 2, bathrooms: 2, sqft: 1085,
  resident: { name: "Marcus Thompson", phone: "(512) 555-0187", email: "m.thompson@email.com", leaseStart: "2024-03-15", leaseEnd: "2025-03-14", moveIn: "2024-03-15" },
};
const UNIT_INVENTORY = [
  { item: "Water Heater", brand: "Rheem", model: "PROG50-38N RH67", serial: "RH2019-44812", installed: "2019-06-12", warranty: "2029-06-12", status: "active" },
  { item: "HVAC System", brand: "Carrier", model: "24ACC636A003", serial: "CR2020-91034", installed: "2020-08-22", warranty: "2030-08-22", status: "active" },
  { item: "Dishwasher", brand: "Whirlpool", model: "WDT750SAKZ", serial: "WP2022-17823", installed: "2022-01-10", warranty: "2025-01-10", status: "expired" },
  { item: "Refrigerator", brand: "Samsung", model: "RF28R7351SR", serial: "SS2021-55019", installed: "2021-11-03", warranty: "2026-11-03", status: "active" },
  { item: "Garbage Disposal", brand: "InSinkErator", model: "Badger 5", serial: "IS2023-08841", installed: "2023-04-18", warranty: "2027-04-18", status: "active" },
];
const TECHNICIANS = [
  { name: "David Morales", skills: ["Plumbing", "HVAC", "General"], rating: 4.8, availability: "Available", load: "3/8", initials: "DM", color: "#10B981" },
  { name: "James Okafor", skills: ["Electrical", "HVAC", "Appliance"], rating: 4.9, availability: "Available", load: "5/8", initials: "JO", color: "#F59E0B" },
  { name: "Mike Reeves", skills: ["Plumbing", "General", "Drywall"], rating: 4.6, availability: "On Job", load: "7/8", initials: "MR", color: "#EF4444" },
  { name: "Ana Gutierrez", skills: ["HVAC", "Electrical", "Appliance"], rating: 4.7, availability: "Available", load: "2/8", initials: "AG", color: "#8B5CF6" },
];
const WO_HISTORY = [
  { id: "WO-4821", date: "2024-11-02", issue: "Garbage disposal jam", status: "Completed", tech: "David Morales", dur: "25 min" },
  { id: "WO-4455", date: "2024-08-17", issue: "AC not cooling", status: "Completed", tech: "Ana Gutierrez", dur: "1h 15min" },
  { id: "WO-4102", date: "2024-05-09", issue: "Leaky kitchen faucet", status: "Completed", tech: "David Morales", dur: "40 min" },
];

const AGENT_STEPS = [
  { id: 1, label: "Transcribing resident call...", duration: 1500, icon: "🎙️" },
  { id: 2, label: "Classifying urgency & category", duration: 1200, icon: "🏷️", result: { urgency: "High", category: "Plumbing", subcategory: "Water Heater — No Hot Water" } },
  { id: 3, label: "Pulling unit inventory for B-214", duration: 1000, icon: "📋", result: { match: "Water Heater", brand: "Rheem", model: "PROG50-38N RH67", warranty: "Active until 2029" } },
  { id: 4, label: "Checking warranty status with Rheem", duration: 1400, icon: "🛡️", result: { covered: "Yes — Parts & Labor", claim: "Auto-generated on dispatch" } },
  { id: 5, label: "Reviewing service history for B-214", duration: 800, icon: "📂", result: { related: "0 prior water heater issues", lastService: "Garbage disposal (Nov 2024)" } },
  { id: 6, label: "Finding available Plumbing techs", duration: 1100, icon: "👷", result: { recommended: "David Morales", reason: "Plumbing-cert, 4.8★, serviced unit before", window: "Today 2:00–4:00 PM" } },
  { id: 7, label: "Pre-drafting enriched work order", duration: 1300, icon: "📝", result: { status: "Ready for one-tap review" } },
  { id: 8, label: "Drafting resident confirmation", duration: 900, icon: "💬", result: { preview: "Hi Marcus — David M. scheduled today 2–4 PM for your water heater." } },
];

// ============================================================
// COMPONENT
// ============================================================
export default function ConciergeAgentPrototype() {
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState([]);
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [tab, setTab] = useState("agent");
  const [nav, setNav] = useState("tasks");
  const ref = useRef(null);

  const transcript = `"Hi, this is Marcus Thompson in unit B-214 at Ridgewood Heights. I have no hot water — it's been since last night. The water heater is making a clicking noise but nothing's heating up. I'm not sure if it's gas or electric. Can someone come look at it today? I have to work from home so I'm available anytime after 1 PM."`;

  const start = () => { setRunning(true); setStep(0); setDone([]); setReady(false); setDispatched(false); };

  useEffect(() => {
    if (!running || step < 0 || step >= AGENT_STEPS.length) return;
    const t = setTimeout(() => {
      setDone(p => [...p, step]);
      if (step < AGENT_STEPS.length - 1) setStep(p => p + 1);
      else { setRunning(false); setReady(true); }
    }, AGENT_STEPS[step].duration);
    return () => clearTimeout(t);
  }, [step, running]);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [done]);

  const pill = (bg, color) => ({ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, letterSpacing: 0.2 });
  const fLabel = { fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 };
  const fVal = { fontSize: 13, color: T.textPrimary, fontWeight: 500, background: T.bodyBg, padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.cardBorder}` };
  const card = { background: T.cardBg, borderRadius: T.borderRadius, border: `1px solid ${T.cardBorder}` };
  const navItem = (active, color) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "7px 16px", borderRadius: 6, fontSize: 13,
    fontWeight: active ? 600 : 400, color: active ? T.primary : T.sidebarText, background: active ? T.primaryLight : "transparent",
    cursor: "pointer", margin: "1px 8px", borderLeft: active ? `3px solid ${T.primary}` : "3px solid transparent",
  });

  const Chev = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>;
  const Check = ({ s: sz = 15, c = T.teal }) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>;
  const Spin = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const sideNav = [
    ["dashboards", "Dashboards", "📊"],
    ["units", "Units & Areas", "📋"],
    ["vendors", "Vendors", "👥"],
    ["documents", "Documents", "📁"],
    ["incidents", "Incidents", "⚠️"],
    ["work-assignment", "Work Assignment", "🖥️"],
    ["property-profile", "Property Profile", "🏠"],
  ];
  const appNav = [
    ["inspections", "Inspections", "✅", "#10B981"],
    ["tasks", "Tasks", "📝", "#EF4444"],
    ["projects", "Projects", "📐", "#F59E0B"],
    ["call-complete", "Call Complete", "📞", "#3B82F6"],
    ["insights", "Insights", "📈", "#EF4444"],
    ["inventory", "Inventory", "⭐", "#3B82F6"],
  ];

  return (
    <div style={{ fontFamily: T.font, background: T.bodyBg, minHeight: "100vh", color: T.textPrimary }}>

      {/* TOP NAV */}
      <nav style={{ background: T.navBg, height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo — interlocking circles */}
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="14" r="7.5" stroke="#A78BFA" strokeWidth="2.5" fill="none"/><circle cx="18" cy="14" r="7.5" stroke="#10B981" strokeWidth="2.5" fill="none"/></svg>
          {/* Grid icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="rgba(255,255,255,0.5)">{[[0,0],[0,6],[0,12],[6,0],[6,6],[6,12],[12,0],[12,6],[12,12]].map(([x,y])=><rect key={`${x}${y}`} x={x} y={y} width="3" height="3" rx="0.5"/>)}</svg>
          {/* Org pill */}
          <div style={{ background: T.primary, color: "#fff", padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>HPM - DEMO</div>
          {/* Property pill */}
          <div style={{ background: "rgba(16,185,129,0.15)", color: "#6EE7B7", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            🏠 {PROPERTY.name}
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Notification bell */}
          <div style={{ position: "relative", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div style={{ position: "absolute", top: -5, right: -7, background: T.danger, color: "#fff", minWidth: 16, height: 16, borderRadius: 8, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>82</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          {/* Avatar */}
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>SC</div>
        </div>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 48px)" }}>

        {/* SIDEBAR */}
        <aside style={{ width: 220, background: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, flexShrink: 0, overflowY: "auto" }}>
          <div style={{ padding: "16px 0" }}>
            <div style={{ padding: "0 20px 14px", fontWeight: 700, fontSize: 14 }}>Ridgewood Heights</div>
            {sideNav.map(([id, label, icon]) => (
              <div key={id} onClick={() => setNav(id)} style={navItem(nav === id)}>
                <span style={{ width: 20, textAlign: "center", fontSize: 14 }}>{icon}</span> {label}
              </div>
            ))}
            <div style={{ padding: "16px 20px 6px", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Apps</div>
            {appNav.map(([id, label, icon, color]) => (
              <div key={id} onClick={() => setNav(id)} style={navItem(nav === id, color)}>
                <span style={{ width: 20, textAlign: "center", fontSize: 14 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg>
              </div>
            ))}
            {/* Favorites */}
            <div style={{ padding: "16px 20px 6px", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Favorites <span style={{ color: T.teal, fontSize: 10, fontWeight: 700, marginLeft: 4 }}>NEW</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, overflow: "auto", maxHeight: "calc(100vh - 48px)" }}>
          {/* Page header — matches HappyCo's Tasks page header */}
          <div style={{ background: T.cardBg, borderBottom: `1px solid ${T.cardBorder}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📝</span>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Tasks</h1>
              <div style={pill(T.tealBg, T.tealText)}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }} />
                Work Orders
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg>
              </div>
              <div style={pill(T.tealBg, T.tealText)}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }} />
                Open
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Search bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${T.cardBorder}`, borderRadius: T.borderRadius, padding: "7px 14px", fontSize: 13, color: T.textMuted, minWidth: 260 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Search by assignee, category...
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: T.primary, cursor: "pointer", fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Add Filters
              </div>
              {/* Action button */}
              {!ready && !running && step === -1 ? (
                <button onClick={start} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: T.borderRadius, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  ✨ Run Concierge Agent
                </button>
              ) : ready && !dispatched ? (
                <button onClick={() => setDispatched(true)} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: T.borderRadius, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  ✅ Review & Dispatch
                </button>
              ) : dispatched ? (
                <div style={{ ...pill(T.successBg, T.successText), padding: "7px 14px", fontSize: 13 }}>
                  <Check s={14} c={T.tealText} /> WO-5103 dispatched
                </div>
              ) : (
                <div style={{ ...pill(T.warningBg, T.warningText), padding: "7px 14px", fontSize: 13 }}>
                  <Spin /> Enriching...
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: 24 }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
              <span style={{ cursor: "pointer", color: T.textSecondary }}>Work Orders</span><Chev /><span style={{ cursor: "pointer", color: T.textSecondary }}>{PROPERTY.name}</span><Chev /><span style={{ color: T.textPrimary, fontWeight: 600 }}>Incoming Request — B-214</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 370px", gap: 20, alignItems: "start" }}>
              {/* LEFT COL */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Header Card */}
                <div style={{ ...card, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={pill(T.warningBg, T.warningText)}>⚠ Incoming</span>
                        <span style={pill(T.dangerBg, T.dangerText)}>● High</span>
                        <span style={pill(T.infoBg, T.infoText)}>Service Request</span>
                        <span style={pill("#F3F4F6", T.textSecondary)}>Plumbing</span>
                      </div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>No Hot Water — Water Heater Issue</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: T.textSecondary }}>
                        <span>📍 Unit {UNIT.number} • {UNIT.building}</span>
                        <span>📞 Phone Call</span>
                        <span>🕐 {dateStr}</span>
                      </div>
                    </div>
                    <div style={{ color: T.textMuted, cursor: "pointer", padding: 4 }}>⋮</div>
                  </div>
                </div>

                {/* Agent Summary */}
                {ready && (
                  <div style={{ ...card, padding: 20, borderLeft: `3px solid ${T.primary}`, animation: "fi .4s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>✨</div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: T.primary }}>Concierge Agent Summary</span>
                      <span style={{ ...pill(T.primaryLight, T.primary), marginLeft: "auto", fontSize: 10 }}>AI-Generated</span>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0 }}>
                      Resident <strong>Marcus Thompson</strong> (Unit B-214) reports <strong>no hot water since last night</strong>. Water heater making a <strong>clicking noise</strong> but not heating. Unit has a <strong>Rheem PROG50-38N RH67</strong> gas unit installed June 2019 — <strong>warranty active until 2029</strong> (parts & labor). No prior water heater issues. Recommended: <strong>David Morales</strong> (4.8★, plumbing-certified, has serviced this unit). Window: <strong>Today 2:00–4:00 PM</strong>.
                    </p>
                  </div>
                )}

                {/* Transcript */}
                <div style={{ ...card, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Call Transcript</h3>
                  <div style={{ background: T.bodyBg, borderRadius: 6, padding: 14, fontSize: 13, lineHeight: 1.75, color: T.textSecondary, fontStyle: "italic", borderLeft: `3px solid ${T.primary}` }}>
                    {transcript}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 11, color: T.textMuted }}>
                    Duration: 0:42 • Via: Happy Force Call Center • Agent: Jennifer R.
                  </div>
                </div>

                {/* Work Order Form */}
                {ready && (
                  <div style={{ ...card, padding: 20, animation: "fi .4s ease" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Pre-Drafted Work Order</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {[["Category", "Plumbing"], ["Subcategory", "Water Heater — No Hot Water"], ["Property", PROPERTY.name], ["Unit", `${UNIT.number} (${UNIT.building}, Fl ${UNIT.floor})`], ["Resident", UNIT.resident.name], ["Priority", "High"], ["Assigned Tech", "David Morales"], ["Scheduled", "Today, 2:00–4:00 PM"]].map(([l, v]) => (
                        <div key={l}><div style={fLabel}>{l}</div><div style={fVal}>{v}</div></div>
                      ))}
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <div style={fLabel}>Description</div>
                      <div style={{ ...fVal, lineHeight: 1.6 }}>Resident reports no hot water since previous evening. Water heater producing clicking noise but not heating. Rheem PROG50-38N RH67 (gas, installed 06/2019). Warranty active — parts and labor covered through 06/2029. Resident available after 1:00 PM.</div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <div style={fLabel}>Warranty</div>
                      <div style={{ ...fVal, background: T.tealBg, color: T.tealText, border: "1px solid #A7F3D0" }}>🛡️ <strong>Active</strong> — Rheem 10-year parts & labor. Claim auto-generated on dispatch. No cost to property.</div>
                    </div>
                  </div>
                )}

                {/* Resident Message */}
                {dispatched && (
                  <div style={{ ...card, padding: 20, animation: "fi .4s ease" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Message Sent to Resident</h3>
                    <div style={{ background: T.primaryLight, borderRadius: 8, padding: 14, border: "1px solid #C4B5FD" }}>
                      <div style={{ fontSize: 11, color: T.primary, fontWeight: 600, marginBottom: 8 }}>To: Marcus Thompson • Via SMS • Sent just now</div>
                      <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                        Hi Marcus, we&apos;ve received your request about the water heater in unit B-214. Your technician <strong>David M.</strong> is scheduled for <strong>today between 2:00–4:00 PM</strong>. He&apos;s familiar with your Rheem unit and will bring diagnostic tools. Your water heater is under warranty, so there will be no charge. Reply to this message if you need to reschedule. — Ridgewood Heights Maintenance
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COL */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 72 }}>
                <div style={card}>
                  <div style={{ display: "flex", borderBottom: `1px solid ${T.cardBorder}` }}>
                    {[["agent", "🤖 Agent"], ["unit", "🏠 Unit"], ["history", "📋 History"]].map(([id, label]) => (
                      <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "11px 8px", fontSize: 12, fontWeight: 600, border: "none", background: "none", cursor: "pointer", color: tab === id ? T.primary : T.textMuted, borderBottom: tab === id ? `2px solid ${T.primary}` : "2px solid transparent" }}>{label}</button>
                    ))}
                  </div>
                  <div style={{ padding: 16, maxHeight: 440, overflowY: "auto" }}>

                    {tab === "agent" && (
                      <div>
                        {step === -1 && !ready && (
                          <div style={{ textAlign: "center", padding: "32px 16px", color: T.textMuted }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
                            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>Click <strong style={{ color: T.primary }}>&ldquo;Run Concierge Agent&rdquo;</strong> to begin AI enrichment</p>
                          </div>
                        )}
                        {AGENT_STEPS.map((s, i) => {
                          const d = done.includes(i), a = step === i && !d, w = i > step && !ready;
                          if (w) return null;
                          return (
                            <div key={s.id} style={{ marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                {d ? <Check /> : a ? <Spin /> : <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${T.cardBorder}` }} />}
                                <span style={{ fontSize: 12, fontWeight: 600, color: d ? T.tealText : a ? T.primary : T.textMuted }}>{s.icon} {s.label}</span>
                              </div>
                              {d && s.result && (
                                <div style={{ marginLeft: 23, background: T.bodyBg, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: T.textSecondary, lineHeight: 1.7, borderLeft: `2px solid ${T.primary}` }}>
                                  {Object.entries(s.result).map(([k, v]) => (
                                    <div key={k}><span style={{ color: T.textMuted, textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, ' $1')}:</span> <strong style={{ color: T.textPrimary }}>{String(v)}</strong></div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div ref={ref} />
                      </div>
                    )}

                    {tab === "unit" && (
                      <div>
                        <div style={{ marginBottom: 14 }}>
                          <div style={fLabel}>Resident</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{UNIT.resident.name}</div>
                          <div style={{ fontSize: 12, color: T.textSecondary }}>{UNIT.resident.phone} • {UNIT.resident.email}</div>
                          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Lease: {UNIT.resident.leaseStart} → {UNIT.resident.leaseEnd}</div>
                        </div>
                        <div style={{ ...fLabel, marginBottom: 8 }}>Unit Inventory</div>
                        {UNIT_INVENTORY.map(it => (
                          <div key={it.serial} style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.cardBorder}`, marginBottom: 6, fontSize: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: 13 }}>{it.item}</strong>
                              <span style={pill(it.status === "active" ? T.successBg : T.dangerBg, it.status === "active" ? T.successText : T.dangerText)}>
                                {it.status === "active" ? "✓ Warranty" : "✕ Expired"}
                              </span>
                            </div>
                            <div style={{ color: T.textMuted, marginTop: 3 }}>{it.brand} {it.model} • Installed {it.installed}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === "history" && (
                      <div>
                        <div style={{ ...fLabel, marginBottom: 8 }}>Past Work Orders — B-214</div>
                        {WO_HISTORY.map(wo => (
                          <div key={wo.id} style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.cardBorder}`, marginBottom: 6, fontSize: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <strong style={{ color: T.primary }}>{wo.id}</strong>
                              <span style={pill(T.successBg, T.successText)}>{wo.status}</span>
                            </div>
                            <div style={{ marginTop: 3 }}>{wo.issue}</div>
                            <div style={{ color: T.textMuted, marginTop: 3 }}>{wo.date} • {wo.tech} • {wo.dur}</div>
                          </div>
                        ))}
                        <div style={{ ...fLabel, marginTop: 14, marginBottom: 8 }}>Available Technicians</div>
                        {TECHNICIANS.map(t => (
                          <div key={t.name} style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.cardBorder}`, marginBottom: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: t.color, flexShrink: 0 }}>{t.initials}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name} <span style={{ fontWeight: 400, color: T.textMuted }}>★ {t.rating}</span></div>
                              <div style={{ color: T.textMuted, fontSize: 11 }}>{t.skills.join(", ")}</div>
                              <div style={{ fontSize: 11 }}>
                                <span style={{ color: t.availability === "Available" ? T.teal : "#F59E0B" }}>{t.availability}</span>
                                <span style={{ color: T.textMuted }}> • {t.load} load</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Resident card */}
                <div style={{ ...card, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#8B5CF622", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#8B5CF6" }}>MT</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{UNIT.resident.name}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>Unit {UNIT.number} • Since {UNIT.resident.moveIn}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                    {[["Lease End", UNIT.resident.leaseEnd], ["Past WOs", `${WO_HISTORY.length} (resolved)`], ["Unit", `${UNIT.bedrooms}BR/${UNIT.bathrooms}BA`], ["Contact", UNIT.resident.phone]].map(([l, v]) => (
                      <div key={l} style={{ background: T.bodyBg, padding: "5px 8px", borderRadius: 4 }}>
                        <div style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>{l}</div>
                        <div style={{ fontWeight: 600, marginTop: 1 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{`@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>
    </div>
  );
}
