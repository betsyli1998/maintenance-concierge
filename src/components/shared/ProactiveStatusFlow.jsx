import { useState } from "react";

// ============================================================
// DESIGN TOKENS
// ============================================================
const T = {
  navBg: "#1a1440", primary: "#5B4FCF", primaryLight: "#EDEDFC",
  teal: "#10B981", tealBg: "#ECFDF5", tealText: "#047857",
  sidebarBg: "#FFFFFF", sidebarBorder: "#E5E7EB", sidebarText: "#4B5563",
  bodyBg: "#F9FAFB", cardBg: "#FFFFFF", cardBorder: "#E5E7EB",
  textPrimary: "#111827", textSecondary: "#6B7280", textMuted: "#9CA3AF",
  danger: "#EF4444", dangerBg: "#FEE2E2", dangerText: "#991B1B",
  warningBg: "#FEF3C7", warningText: "#92400E",
  successBg: "#D1FAE5", successText: "#065F46",
  infoBg: "#DBEAFE", infoText: "#1E40AF",
  borderRadius: 8,
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const C = {
  purple: "#5B4FCF", purpleLight: "#EDEDFC", purpleMuted: "#8B82D6",
  purpleBg: "#F7F6FD", bg: "#FFFFFF", border: "#E5E7EB",
  textPrimary: "#111827", textSecondary: "#6B7280", textMuted: "#9CA3AF",
  statusActive: "#5B4FCF", statusInactive: "#D1D5DB",
  warningBg: "#FEF3C7", warningText: "#92400E",
};

// Dates
const callDate = new Date();
const arrivalDate = new Date(callDate);
arrivalDate.setDate(arrivalDate.getDate() + 3);
const fmt = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const fmtShort = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtTS = (d) => fmt(d) + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

// Steps definition
const STEPS = [
  { id: 1, actor: "Operator", label: "Part Confirmed", icon: "📦" },
  { id: 2, actor: "Resident", label: "Waiting for Parts", icon: "📱" },
  { id: 3, actor: "Operator", label: "Part Received", icon: "✅" },
  { id: 4, actor: "Resident", label: "Tech Assigned", icon: "📱" },
];

// ============================================================
// SHARED COMPONENTS
// ============================================================
const pill = (bg, color) => ({ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 });
const card = { background: T.cardBg, borderRadius: T.borderRadius, border: `1px solid ${T.cardBorder}` };

// Water heater icon
const WaterHeaterIcon = ({ size = 22, color = C.purple }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <circle cx="12" cy="16" r="2" />
    <path d="M10 7c0.5-1 1-1.5 2-1.5s1.5 0.5 2 1.5" />
    <path d="M10 10c0.5-1 1-1.5 2-1.5s1.5 0.5 2 1.5" />
  </svg>
);

// HappyCo top nav
const TopNav = () => (
  <nav style={{ background: T.navBg, height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="14" r="7.5" stroke="#A78BFA" strokeWidth="2.5" fill="none"/><circle cx="18" cy="14" r="7.5" stroke="#10B981" strokeWidth="2.5" fill="none"/></svg>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="rgba(255,255,255,0.5)">{[[0,0],[0,6],[0,12],[6,0],[6,6],[6,12],[12,0],[12,6],[12,12]].map(([x,y])=><rect key={`${x}${y}`} x={x} y={y} width="3" height="3" rx="0.5"/>)}</svg>
      <div style={{ background: T.primary, color: "#fff", padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>HPM - DEMO</div>
      <div style={{ background: "rgba(16,185,129,0.15)", color: "#6EE7B7", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        🏠 Ridgewood Heights <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", color: "rgba(255,255,255,0.7)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <div style={{ position: "absolute", top: -5, right: -7, background: T.danger, color: "#fff", minWidth: 16, height: 16, borderRadius: 8, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>83</div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.7)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>SC</div>
    </div>
  </nav>
);

// HappyCo sidebar
const Sidebar = ({ nav, setNav }) => {
  const sideNav = [["dashboards","Dashboards","📊"],["units","Units & Areas","📋"],["vendors","Vendors","👥"],["documents","Documents","📁"],["incidents","Incidents","⚠️"],["work-assignment","Work Assignment","🖥️"],["property-profile","Property Profile","🏠"]];
  const appNav = [["inspections","Inspections","✅"],["tasks","Tasks","📝"],["projects","Projects","📐"],["call-complete","Resident Call History","📞"],["insights","Insights","📈"],["inventory","Inventory","⭐"]];
  const ni = (active) => ({ display:"flex",alignItems:"center",gap:10,padding:"7px 16px",borderRadius:6,fontSize:13,fontWeight:active?600:400,color:active?T.primary:T.sidebarText,background:active?T.primaryLight:"transparent",cursor:"pointer",margin:"1px 8px",borderLeft:active?`3px solid ${T.primary}`:"3px solid transparent" });
  return (
    <aside style={{ width: 220, background: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, flexShrink: 0, overflowY: "auto" }}>
      <div style={{ padding: "16px 0" }}>
        <div style={{ padding: "0 20px 14px", fontWeight: 700, fontSize: 14 }}>Ridgewood Heights</div>
        {sideNav.map(([id,l,ic]) => <div key={id} onClick={() => setNav(id)} style={ni(nav===id)}><span style={{width:20,textAlign:"center",fontSize:14}}>{ic}</span> {l}</div>)}
        <div style={{ padding:"16px 20px 6px",fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.8 }}>Apps</div>
        {appNav.map(([id,l,ic]) => <div key={id} onClick={() => setNav(id)} style={ni(nav===id)}><span style={{width:20,textAlign:"center",fontSize:14}}>{ic}</span><span style={{flex:1}}>{l}</span></div>)}
      </div>
    </aside>
  );
};

// Mobile phone frame
const PhoneFrame = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px" }}>
    <div style={{ width: 390, background: C.bg, borderRadius: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", overflow: "hidden", border: "8px solid #1a1a1a" }}>
      {/* Status bar */}
      <div style={{ background: "#1a1a1a", padding: "8px 24px 4px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", fontSize: 12, fontWeight: 600 }}>
        <span>1:29</span>
        <div style={{ width: 80, height: 24, background: "#333", borderRadius: 12 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
          <svg width="16" height="14" viewBox="0 0 24 20" fill="#fff"><rect x="0" y="8" width="3" height="12" rx="1"/><rect x="5" y="5" width="3" height="15" rx="1"/><rect x="10" y="2" width="3" height="18" rx="1"/><rect x="15" y="0" width="3" height="20" rx="1"/></svg>
          <svg width="22" height="12" viewBox="0 0 28 14" fill="none"><rect x="0" y="0" width="24" height="14" rx="3" stroke="#fff" strokeWidth="1.5"/><rect x="2" y="2" width="18" height="10" rx="1.5" fill="#fff"/><rect x="25.5" y="4" width="2" height="6" rx="1" fill="#fff"/></svg>
        </div>
      </div>
      {/* Browser bar */}
      <div style={{ background: "#F3F4F6", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="14" r="6" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="18" cy="14" r="6" stroke="#fff" strokeWidth="2" fill="none"/></svg>
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: C.textSecondary }}>manage.happyco.com</div>
      </div>
      <div style={{ overflowY: "auto", maxHeight: 620 }}>{children}</div>
    </div>
  </div>
);

// Progress bar for resident view
const ProgressBar = ({ steps }) => (
  <div style={{ padding: "20px 16px 16px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
      <div style={{ position: "absolute", top: 8, left: 40, right: 40, height: 3, background: C.statusInactive, borderRadius: 2, zIndex: 0 }}>
        <div style={{ width: steps.filter(s=>s.active).length <= 1 ? "15%" : "38%", height: "100%", background: C.statusActive, borderRadius: 2 }} />
      </div>
      {steps.map(s => (
        <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: s.active ? C.statusActive : "#fff", border: s.active ? "none" : `2px solid ${C.statusInactive}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
          </div>
          <span style={{ fontSize: 11, color: s.active ? C.textPrimary : C.textMuted, fontWeight: s.active ? 600 : 400 }}>{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// Message bubble
const Msg = ({ text, date }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ background: C.purpleBg, borderRadius: 12, padding: 14, marginBottom: 6, maxWidth: "90%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.purpleMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>JR</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.purple }}>Jennifer R.</span>
      </div>
      <p style={{ fontSize: 14, color: C.textPrimary, lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
    <div style={{ fontSize: 11, color: C.textMuted, paddingLeft: 4 }}>{fmtTS(date)}</div>
  </div>
);

// Task table rows
const TaskRows = ({ highlighted }) => {
  const rows = [
    ["Heating & Cooling", "Annual maintenance need...", "Normal", "Open", "Urban Oasis Reside...", "Aron Finneran"],
    ["Heating & Cooling", "Annual maintenance need...", "Normal", "Open", "The Neon Niche", "Bob's Carpet"],
    ["Heating & Cooling", "Annual maintenance need...", "Normal", "Open", "The Neon Niche", "Unassigned"],
  ];
  return rows.map(([title,desc,pri,status,loc,assignee], i) => (
    <div key={i} style={{ display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,alignItems:"center",fontSize:13 }}>
      <div><input type="checkbox" readOnly style={{ accentColor: T.primary }} /></div>
      <div><div style={{ fontWeight: 500 }}>🌡️ {title}</div><div style={{ fontSize: 11, color: T.textMuted }}>{desc}</div></div>
      <div><span style={pill("#F3F4F6", T.textSecondary)}>● {pri}</span></div>
      <div><span style={pill(T.successBg, T.successText)}>● {status}</span></div>
      <div style={{ fontSize: 12, color: T.textSecondary }}>{loc}<br/><span style={{ color: T.textMuted }}>COMMON AREA</span></div>
      <div style={{ fontSize: 12, color: T.textMuted }}>{assignee}</div>
      <div style={{ fontSize: 12, color: T.textMuted }}>May 2, 2024</div>
    </div>
  ));
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Phase3Combined() {
  const [step, setStep] = useState(0);
  const [nav, setNav] = useState("tasks");
  const [tab, setTab] = useState("messages");

  const isOperator = STEPS[step].actor === "Operator";

  // ---- OPERATOR SCREEN 1: Part Confirmed ----
  const OpScreen1 = () => (
    <>
      <div style={{ ...card, padding: 0, marginBottom: 20, borderLeft: `4px solid ${T.primary}`, animation: "fi .4s ease", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📦</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Part Confirmed — WO-5103</span>
              <span style={pill(T.infoBg, T.infoText)}>Procurement</span>
              <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>Just now</span>
            </div>
            <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.7, margin: "0 0 8px" }}>
              The igniter assembly for <strong style={{ color: T.textPrimary }}>WO-5103</strong> is confirmed. Estimated arrival time: <strong style={{ color: T.textPrimary }}>{fmt(arrivalDate)}</strong>. A notification has been sent to the resident.
            </p>
            <div style={{ fontSize: 12, color: T.textMuted }}>Unit B-214 • Marcus Thompson • Rheem SP20161 Igniter Assembly</div>
          </div>
        </div>
        <div style={{ background: T.bodyBg, padding: "10px 20px", borderTop: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.tealText }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            Resident notified via SMS
          </div>
          <span style={{ color: T.cardBorder }}>|</span>
          <span style={{ fontSize: 12, color: T.primary, fontWeight: 500, cursor: "pointer" }}>View Work Order →</span>
        </div>
      </div>
      {/* Task list */}
      <div style={card}>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Tasks</span><span style={pill(T.tealBg, T.tealText)}>2113</span>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"8px 16px",borderBottom:`1px solid ${T.cardBorder}`,fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5 }}>
          <div></div><div>Title</div><div>Priority</div><div>Status</div><div>Location</div><div>Assignee</div><div>Created</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,background:"#FEFCE8",alignItems:"center",fontSize:13 }}>
          <div><input type="checkbox" readOnly style={{ accentColor: T.primary }} /></div>
          <div>
            <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>🔥 Water Heater — No Hot Water <span style={pill(T.warningBg, T.warningText)}>Waiting for Parts</span></div>
            <div style={{ fontSize: 11, color: T.textMuted }}>WO-5103 • Plumbing</div>
          </div>
          <div><span style={pill(T.dangerBg, T.dangerText)}>● High</span></div>
          <div><span style={pill(T.warningBg, T.warningText)}>⏳ Parts</span></div>
          <div style={{ fontSize: 12, color: T.textSecondary }}>Ridgewood Heights<br/><span style={{ color: T.textMuted }}>B-214</span></div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Unassigned</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{fmtShort(callDate)}</div>
        </div>
        <TaskRows />
      </div>
    </>
  );

  // ---- OPERATOR SCREEN 2: Part Received ----
  const OpScreen2 = () => (
    <>
      <div style={{ ...card, padding: 0, marginBottom: 20, borderLeft: `4px solid ${T.teal}`, animation: "fi .4s ease", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.tealBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✅</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Part Received & Technician Assigned — WO-5103</span>
              <span style={pill(T.successBg, T.successText)}>Update</span>
              <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>Just now</span>
            </div>
            <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.7, margin: "0 0 8px" }}>
              Igniter assembly for <strong style={{ color: T.textPrimary }}>WO-5103</strong> has been received. Technician <strong style={{ color: T.textPrimary }}>Alan</strong> has been assigned to complete the work order. The resident has been notified that the part is delivered and a technician is assigned.
            </p>
            <div style={{ fontSize: 12, color: T.textMuted }}>Unit B-214 • Marcus Thompson • Technician: Alan</div>
          </div>
        </div>
        <div style={{ background: T.bodyBg, padding: "10px 20px", borderTop: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.tealText }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            Resident notified via SMS
          </div>
          <span style={{ color: T.cardBorder }}>|</span>
          <span style={{ fontSize: 12, color: T.primary, fontWeight: 500, cursor: "pointer" }}>View Work Order →</span>
        </div>
      </div>
      <div style={card}>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Tasks</span><span style={pill(T.tealBg, T.tealText)}>2113</span>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"8px 16px",borderBottom:`1px solid ${T.cardBorder}`,fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5 }}>
          <div></div><div>Title</div><div>Priority</div><div>Status</div><div>Location</div><div>Assignee</div><div>Created</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,background:"#ECFDF5",alignItems:"center",fontSize:13 }}>
          <div><input type="checkbox" readOnly style={{ accentColor: T.primary }} /></div>
          <div>
            <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>🔥 Water Heater — No Hot Water <span style={pill(T.successBg, T.successText)}>Assigned</span></div>
            <div style={{ fontSize: 11, color: T.textMuted }}>WO-5103 • Plumbing</div>
          </div>
          <div><span style={pill(T.dangerBg, T.dangerText)}>● High</span></div>
          <div><span style={pill(T.successBg, T.successText)}>● Assigned</span></div>
          <div style={{ fontSize: 12, color: T.textSecondary }}>Ridgewood Heights<br/><span style={{ color: T.textMuted }}>B-214</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: T.primary }}>A</div>
            <span style={{ fontSize: 12 }}>Alan</span>
          </div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{fmtShort(callDate)}</div>
        </div>
        <TaskRows />
      </div>
    </>
  );

  // ---- RESIDENT SCREEN 1: Waiting for Parts ----
  const ResScreen1 = () => (
    <PhoneFrame>
      <div style={{ padding: "0 0 24px" }}>
        <div style={{ padding: "12px 16px 8px", display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, color: C.textSecondary }}>Cancel</button>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.purpleLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
        <div style={{ padding: "0 16px 8px" }}>
          <span style={{ background: C.warningBg, color: C.warningText, padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>▶ Waiting for Parts</span>
        </div>
        <div style={{ padding: "0 16px 4px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.purpleLight, display: "flex", alignItems: "center", justifyContent: "center" }}><WaterHeaterIcon /></div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Water Heater</div>
            <div style={{ fontSize: 14, color: C.textSecondary }}>Ridgewood Heights</div>
          </div>
        </div>
        <ProgressBar steps={[{ label: "Received", active: true }, { label: "Assigned", active: false }, { label: "Scheduled", active: false }, { label: "Resolved", active: false }]} />
        <div style={{ padding: "0 16px 16px" }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>Description</h3>
          <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>Water heater is not heating. Probable cause pilot assembly or igniter.</p>
        </div>
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", borderBottom: `2px solid ${C.border}`, marginBottom: 16 }}>
            {["Messages", "Activity"].map(t => (
              <button key={t} onClick={() => setTab(t.toLowerCase())} style={{ background: "none", border: "none", padding: "10px 16px", fontSize: 14, fontWeight: tab === t.toLowerCase() ? 700 : 400, color: tab === t.toLowerCase() ? C.textPrimary : C.textMuted, borderBottom: tab === t.toLowerCase() ? `2px solid ${C.textPrimary}` : "2px solid transparent", cursor: "pointer", marginBottom: -2 }}>{t}</button>
            ))}
          </div>
          {tab === "messages" && (
            <Msg text={`Hi Marcus! The part for your WO-5103 Water Heater has been purchased. We're expected to receive it on ${fmt(arrivalDate)}. We'll send another confirmation after the part is delivered and a technician has been assigned!`} date={callDate} />
          )}
          {tab === "activity" && (
            <div style={{ fontSize: 13, color: C.textMuted, padding: "12px 0" }}>
              {[["Work order WO-5103 created", callDate], ["Part ordered — Igniter assembly", callDate]].map(([t,d],i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.purple, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{t}</span><span style={{ fontSize: 11 }}>{fmtTS(d)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.textMuted, marginBottom: 10 }}>Send a message</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: C.textSecondary }}>Add attachment</button>
            <button style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600 }}>Send</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );

  // ---- RESIDENT SCREEN 2: Assigned ----
  const ResScreen2 = () => (
    <PhoneFrame>
      <div style={{ padding: "0 0 24px" }}>
        <div style={{ padding: "12px 16px 8px", display: "flex", justifyContent: "space-between" }}>
          <button style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, color: C.textSecondary }}>Cancel</button>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.purpleLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
        <div style={{ padding: "0 16px 8px" }}>
          <span style={{ background: C.purpleLight, color: C.purple, padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>▶ Assigned</span>
        </div>
        <div style={{ padding: "0 16px 4px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.purpleLight, display: "flex", alignItems: "center", justifyContent: "center" }}><WaterHeaterIcon /></div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Water Heater</div>
            <div style={{ fontSize: 14, color: C.textSecondary }}>Ridgewood Heights</div>
          </div>
        </div>
        <ProgressBar steps={[{ label: "Received", active: true }, { label: "Assigned", active: true }, { label: "Scheduled", active: false }, { label: "Resolved", active: false }]} />
        {/* Technician card */}
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ background: C.purpleBg, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.purpleMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff", position: "relative" }}>
              A
              <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: C.purple, border: "2px solid #fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: C.textSecondary }}>Your technician:</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Alan</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>Description</h3>
          <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>Water heater is not heating. Probable cause pilot assembly or igniter.</p>
        </div>
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", borderBottom: `2px solid ${C.border}`, marginBottom: 16 }}>
            {["Messages", "Activity"].map(t => (
              <button key={t} onClick={() => setTab(t.toLowerCase())} style={{ background: "none", border: "none", padding: "10px 16px", fontSize: 14, fontWeight: tab === t.toLowerCase() ? 700 : 400, color: tab === t.toLowerCase() ? C.textPrimary : C.textMuted, borderBottom: tab === t.toLowerCase() ? `2px solid ${C.textPrimary}` : "2px solid transparent", cursor: "pointer", marginBottom: -2 }}>{t}</button>
            ))}
          </div>
          {tab === "messages" && (
            <>
              <Msg text={`Hi Marcus! The part for your WO-5103 Water Heater has been purchased. We're expected to receive it on ${fmt(arrivalDate)}. We'll send another confirmation after the part is delivered and a technician has been assigned!`} date={callDate} />
              <Msg text="Hi Marcus! The part for your WO-5103 has been received. Our technician Alan will reach out to you to coordinate a time." date={arrivalDate} />
            </>
          )}
          {tab === "activity" && (
            <div style={{ fontSize: 13, color: C.textMuted, padding: "12px 0" }}>
              {[["Work order WO-5103 created", callDate], ["Part ordered — Igniter assembly", callDate], ["Part received — Igniter assembly", arrivalDate], ["Technician Alan assigned", arrivalDate]].map(([t,d],i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.purple, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{t}</span><span style={{ fontSize: 11 }}>{fmtTS(d)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.textMuted, marginBottom: 10 }}>Send a message</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: C.textSecondary }}>Add attachment</button>
            <button style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600 }}>Send</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );

  const screens = [OpScreen1, ResScreen1, OpScreen2, ResScreen2];
  const Screen = screens[step];

  return (
    <div style={{ fontFamily: T.font, background: T.bodyBg, minHeight: "100vh", color: T.textPrimary }}>
      {/* Timeline stepper — fixed at top */}
      <div style={{ background: T.cardBg, borderBottom: `1px solid ${T.cardBorder}`, padding: "12px 24px", position: "sticky", top: 0, zIndex: 300 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>
            Proactive Status Flow — WO-5103
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setStep(Math.max(0, step - 1)); setTab("messages"); }} disabled={step === 0} style={{ background: step === 0 ? T.cardBorder : T.primary, color: step === 0 ? T.textMuted : "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: step === 0 ? "not-allowed" : "pointer" }}>← Previous</button>
            <button onClick={() => { setStep(Math.min(3, step + 1)); setTab("messages"); }} disabled={step === 3} style={{ background: step === 3 ? T.cardBorder : T.primary, color: step === 3 ? T.textMuted : "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: step === 3 ? "not-allowed" : "pointer" }}>Next →</button>
          </div>
        </div>
        {/* Step indicators */}
        <div style={{ display: "flex", gap: 4 }}>
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => { setStep(i); setTab("messages"); }} style={{
              flex: 1, padding: "8px 8px", borderRadius: 6, border: "none", cursor: "pointer",
              background: i === step ? (s.actor === "Operator" ? T.primaryLight : "#FEE2E2") : T.bodyBg,
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s ease",
            }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: i === step ? T.primary : T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.actor}</div>
                <div style={{ fontSize: 12, fontWeight: i === step ? 700 : 500, color: i === step ? T.textPrimary : T.textSecondary }}>{s.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Render operator or resident screen */}
      {isOperator ? (
        <>
          <TopNav />
          <div style={{ display: "flex", minHeight: "calc(100vh - 140px)" }}>
            <Sidebar nav={nav} setNav={setNav} />
            <main style={{ flex: 1, overflow: "auto" }}>
              <div style={{ background: T.cardBg, borderBottom: `1px solid ${T.cardBorder}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📝</span>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Tasks</h1>
                <div style={pill(T.tealBg, T.tealText)}><span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }} /> Work Orders</div>
              </div>
              <div style={{ padding: 24 }}><Screen /></div>
            </main>
          </div>
        </>
      ) : (
        <div style={{ background: "#F3F4F6", minHeight: "calc(100vh - 90px)" }}>
          <Screen />
        </div>
      )}

      <style>{`
        @keyframes fi { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        button:hover { opacity: 0.92; }
      `}</style>
    </div>
  );
}
