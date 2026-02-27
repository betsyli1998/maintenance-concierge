import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// HAPPYCO DESIGN TOKENS
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
  liveBg: "#DC2626", liveGlow: "rgba(220,38,38,0.3)",
  borderRadius: 8,
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

// ============================================================
// CALL TRANSCRIPT — timed segments simulating a real call
// Each segment has: speaker, text, timestamp (ms from call start),
// and optional "triggers" that fire agent enrichment actions
// ============================================================
const CALL_SCRIPT = [
  { speaker: "agent", text: "Happy Force maintenance line, this is Jennifer. How can I help you today?", at: 0 },
  { speaker: "resident", text: "Hi, this is Marcus Thompson. I'm in unit B-214 at Ridgewood Heights.", at: 3000, triggers: [
    { type: "lookup", label: "Searching resident database...", field: "resident", value: "Marcus Thompson" },
    { type: "lookup", label: "Pulling unit profile for B-214...", field: "unit", value: "B-214, Building B, Floor 2" },
    { type: "lookup", label: "Loading unit inventory...", field: "inventory", value: "5 tracked assets" },
    { type: "lookup", label: "Pulling lease & resident history...", field: "lease", value: "Active — expires 03/2025, 3 prior WOs (all resolved)" },
  ]},
  { speaker: "agent", text: "Hi Marcus, I've got your unit pulled up. What's going on?", at: 9000 },
  { speaker: "resident", text: "I have no hot water. It's been out since last night.", at: 12000, triggers: [
    { type: "classify", label: "Classifying: Plumbing → Water Heater → No Hot Water", field: "category", value: "Plumbing — Water Heater" },
    { type: "priority", label: "Urgency assessment: HIGH (essential utility, 12+ hours)", field: "priority", value: "High" },
  ]},
  { speaker: "resident", text: "The water heater is making a clicking noise but nothing's heating up.", at: 16000, triggers: [
    { type: "lookup", label: "Matching symptom to unit inventory...", field: "asset", value: "Rheem PROG50-38N RH67 (gas, installed 06/2019)" },
    { type: "lookup", label: "Checking warranty — Rheem PROG50-38N...", field: "warranty", value: "✓ Active until 06/2029 — Parts & Labor" },
    { type: "ai", label: "JoyAI: 'Clicking + no heat' on gas Rheem → likely pilot/igniter issue. Avg repair: 45 min.", field: "diagnosis", value: "Probable pilot assembly or igniter — 45 min avg repair" },
  ]},
  { speaker: "agent", text: "I'm sorry about that, Marcus. Let me get someone out to you. It looks like it might be an igniter assembly issue. We will order the part first. Once we receive the part, a technician will reach out to schedule a time with you.", at: 22000, triggers: [
    { type: "schedule", label: "Identifying required part: Igniter assembly for Rheem PROG50...", field: "partNeeded", value: "Rheem SP20161 Igniter Assembly — ordering" },
    { type: "schedule", label: "Finding plumbing-certified techs with Rheem experience...", field: "tech", value: "David Morales — available once part arrives" },
  ]},
  { speaker: "resident", text: "Ok. Sounds good.", at: 25000 },
  { speaker: "resident", text: "I'm not sure if it's gas or electric, by the way.", at: 28000, triggers: [
    { type: "ai", label: "Unit inventory confirms: Gas water heater (Rheem PROG50 = natural gas)", field: "fuelType", value: "Confirmed: Natural Gas" },
  ]},
  { speaker: "agent", text: "No worries — I can see from your unit records it's a gas unit, a Rheem model. And great news, it's still under warranty so there won't be any charge.", at: 31000 },
  { speaker: "resident", text: "Oh that's great, thank you.", at: 36000 },
  { speaker: "agent", text: "I'm going to get a work order submitted for you right now. Once we get the part and a technician, you will receive a confirmation.", at: 38000, triggers: [
    { type: "draft", label: "Pre-drafting work order with all enriched fields...", field: "workOrder", value: "WO-5103 — Ready for review" },
    { type: "draft", label: "Preparing resident notification template...", field: "sms", value: "Template ready — will send on tech confirmation" },
  ]},
  { speaker: "resident", text: "Sounds good. Thanks so much, Jennifer.", at: 44000 },
  { speaker: "agent", text: "You're welcome, Marcus. We'll get this taken care of for you. Have a great day!", at: 46000 },
];

const CALL_DURATION = 48000; // total call length in ms

// ============================================================
// WORK ORDER FIELDS (progressively filled by agent)
// ============================================================
const WO_FIELDS_ORDER = [
  { key: "resident", label: "Resident" },
  { key: "unit", label: "Unit" },
  { key: "lease", label: "Lease Status" },
  { key: "inventory", label: "Unit Inventory" },
  { key: "category", label: "Category" },
  { key: "priority", label: "Priority" },
  { key: "asset", label: "Asset" },
  { key: "warranty", label: "Warranty" },
  { key: "diagnosis", label: "AI Diagnosis" },
  { key: "fuelType", label: "Fuel Type" },
  { key: "partNeeded", label: "Part Needed" },
  { key: "workOrder", label: "Work Order" },
  { key: "sms", label: "Resident Notification" },
];

// ============================================================
// COMPONENT
// ============================================================
export default function LiveCallScreen() {
  const [callState, setCallState] = useState("idle"); // idle | ringing | live | ended
  const [elapsed, setElapsed] = useState(0);
  const [transcriptLines, setTranscriptLines] = useState([]);
  const [agentActions, setAgentActions] = useState([]);
  const [woFields, setWoFields] = useState({});
  const [pendingActions, setPendingActions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const callStartRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef(null);
  const agentRef = useRef(null);
  const triggeredRef = useRef(new Set());
  const [nav, setNav] = useState("call-complete");

  // Start ringing
  const startCall = () => {
    setCallState("ringing");
  };

  // Accept call — start the live flow
  const acceptCall = () => {
    setCallState("live");
    callStartRef.current = Date.now();
    triggeredRef.current = new Set();
    setTranscriptLines([]);
    setAgentActions([]);
    setWoFields({});
    setPendingActions([]);
    setSubmitted(false);
    setEditingField(null);
    setShowModal(false);
  };

  // Reject call — return to idle
  const rejectCall = () => {
    setCallState("idle");
  };

  // Timer
  useEffect(() => {
    if (callState !== "live") return;
    timerRef.current = setInterval(() => {
      const e = Date.now() - callStartRef.current;
      setElapsed(e);
      if (e >= CALL_DURATION) {
        setCallState("ended");
        clearInterval(timerRef.current);
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [callState]);

  // Script processor — add transcript lines and trigger agent actions
  useEffect(() => {
    if (callState !== "live") return;
    const interval = setInterval(() => {
      const e = Date.now() - callStartRef.current;
      CALL_SCRIPT.forEach((line, i) => {
        if (e >= line.at && !triggeredRef.current.has(i)) {
          triggeredRef.current.add(i);
          setTranscriptLines(prev => [...prev, { speaker: line.speaker, text: line.text, time: line.at }]);
          // Queue triggers with staggered delays
          if (line.triggers) {
            line.triggers.forEach((trigger, ti) => {
              const delay = 400 + ti * 800;
              setTimeout(() => {
                // Add "processing" action
                const actionId = `${i}-${ti}`;
                setAgentActions(prev => [...prev, { ...trigger, id: actionId, status: "processing" }]);
                setPendingActions(prev => [...prev, actionId]);
                // Complete after a moment
                setTimeout(() => {
                  setAgentActions(prev => prev.map(a => a.id === actionId ? { ...a, status: "done" } : a));
                  setPendingActions(prev => prev.filter(p => p !== actionId));
                  if (trigger.field) {
                    setWoFields(prev => ({ ...prev, [trigger.field]: trigger.value }));
                  }
                }, 600 + Math.random() * 400);
              }, delay);
            });
          }
        }
      });
    }, 150);
    return () => clearInterval(interval);
  }, [callState]);

  // Auto-scroll transcript and agent panels
  useEffect(() => { transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" }); }, [transcriptLines]);
  useEffect(() => { agentRef.current?.scrollTo({ top: agentRef.current.scrollHeight, behavior: "smooth" }); }, [agentActions]);

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const woFieldKeys = WO_FIELDS_ORDER.map(f => f.key);
  const filledCount = woFieldKeys.filter(k => !!woFields[k]).length;
  const totalFields = WO_FIELDS_ORDER.length;
  const completionPct = Math.round((filledCount / totalFields) * 100);
  const allFieldsFilled = filledCount >= totalFields;

  const pill = (bg, color) => ({ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 });
  const card = { background: T.cardBg, borderRadius: T.borderRadius, border: `1px solid ${T.cardBorder}` };
  const fLabel = { fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 };
  const navItem = (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "7px 16px", borderRadius: 6, fontSize: 13,
    fontWeight: active ? 600 : 400, color: active ? T.primary : T.sidebarText, background: active ? T.primaryLight : "transparent",
    cursor: "pointer", margin: "1px 8px", borderLeft: active ? `3px solid ${T.primary}` : "3px solid transparent",
  });

  const Check = ({ s: sz = 14, c = T.teal }) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>;
  const Spin = ({ s: sz = 14 }) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>;

  // Waveform bars animation
  const WaveForm = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 24 }}>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: callState === "live" ? T.liveBg : T.textMuted,
          animation: callState === "live" ? `wave 0.8s ease-in-out ${i * 0.05}s infinite alternate` : "none",
          height: callState === "live" ? undefined : 4,
        }} />
      ))}
    </div>
  );

  const sideNav = [
    ["dashboards", "Dashboards", "📊"], ["units", "Units & Areas", "📋"], ["vendors", "Vendors", "👥"],
    ["documents", "Documents", "📁"], ["incidents", "Incidents", "⚠️"],
    ["work-assignment", "Work Assignment", "🖥️"], ["property-profile", "Property Profile", "🏠"],
  ];
  const appNav = [
    ["inspections", "Inspections", "✅"], ["tasks", "Tasks", "📝"], ["projects", "Projects", "📐"],
    ["call-complete", "Resident Call History", "📞"], ["insights", "Insights", "📈"], ["inventory", "Inventory", "⭐"],
  ];

  return (
    <div style={{ fontFamily: T.font, background: T.bodyBg, minHeight: "100vh", color: T.textPrimary }}>
      {/* TOP NAV */}
      <nav style={{ background: T.navBg, height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="14" r="7.5" stroke="#A78BFA" strokeWidth="2.5" fill="none"/><circle cx="18" cy="14" r="7.5" stroke="#10B981" strokeWidth="2.5" fill="none"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="rgba(255,255,255,0.5)">{[[0,0],[0,6],[0,12],[6,0],[6,6],[6,12],[12,0],[12,6],[12,12]].map(([x,y])=><rect key={`${x}${y}`} x={x} y={y} width="3" height="3" rx="0.5"/>)}</svg>
          <div style={{ background: T.primary, color: "#fff", padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>HPM - DEMO</div>
          <div style={{ background: "rgba(16,185,129,0.15)", color: "#6EE7B7", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            🏠 Ridgewood Heights <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg>
          </div>
          {/* Live call indicator in top nav */}
          {callState === "live" && (
            <div style={{ background: T.liveBg, color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, animation: "pulse 2s infinite" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "blink 1s infinite" }} />
              LIVE CALL — {formatTime(elapsed)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div style={{ position: "absolute", top: -5, right: -7, background: T.danger, color: "#fff", minWidth: 16, height: 16, borderRadius: 8, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>82</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
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
            {appNav.map(([id, label, icon]) => (
              <div key={id} onClick={() => setNav(id)} style={navItem(nav === id)}>
                <span style={{ width: 20, textAlign: "center", fontSize: 14 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, overflow: "auto", maxHeight: "calc(100vh - 48px)" }}>
          {/* Page Header */}
          <div style={{ background: T.cardBg, borderBottom: `1px solid ${T.cardBorder}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📞</span>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Ongoing Call</h1>
              <div style={pill(T.tealBg, T.tealText)}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }} />
                Concierge Agent
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {callState === "idle" && (
                <button onClick={startCall} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: T.borderRadius, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  📞 Simulate Incoming Call
                </button>
              )}
              {callState === "ringing" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ ...pill(T.warningBg, T.warningText), padding: "8px 16px", fontSize: 13, animation: "pulse 1s infinite" }}>
                    📱 Incoming call from (512) 555-0187...
                  </div>
                  <button onClick={acceptCall} style={{ background: T.teal, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Accept</button>
                  <button onClick={rejectCall} style={{ background: T.danger, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                </div>
              )}
              {callState === "live" && (
                <div style={{ ...pill(T.dangerBg, T.dangerText), padding: "8px 16px", fontSize: 13 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.danger, animation: "blink 1s infinite" }} />
                  Live — {formatTime(elapsed)} — Agent enriching in real-time
                </div>
              )}
              {callState === "ended" && !submitted && (
                <div style={{ ...pill(T.successBg, T.successText), padding: "8px 16px", fontSize: 13 }}>
                  <Check s={14} c={T.tealText} /> Call ended — Review & submit work order
                </div>
              )}
              {callState === "ended" && submitted && (
                <div style={{ ...pill(T.successBg, T.successText), padding: "8px 16px", fontSize: 13 }}>
                  <Check s={14} c={T.tealText} /> WO-5103 submitted — Resident notified
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            {/* Pre-call idle state */}
            {callState === "idle" && (
              <div style={{ ...card, padding: 48, textAlign: "center", maxWidth: 600, margin: "60px auto" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖📞</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Concierge Agent — Live Call Mode</h2>
                <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.7, marginBottom: 24 }}>
                  When a resident calls the Happy Force maintenance line, the Concierge Agent listens alongside the human operator. 
                  As the conversation unfolds, it automatically pulls unit data, checks warranties, finds available technicians, 
                  and pre-drafts the work order — so by the time the call ends, everything is ready for one-tap dispatch.
                </p>
                <button onClick={startCall} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: T.borderRadius, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10 }}>
                  📞 Simulate Incoming Call
                </button>
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 12 }}>This will simulate a 48-second call between a resident and a Happy Force agent.</p>
              </div>
            )}

            {/* Ringing state */}
            {callState === "ringing" && (
              <div style={{ ...card, padding: 48, textAlign: "center", maxWidth: 500, margin: "60px auto" }}>
                <div style={{ fontSize: 56, marginBottom: 16, animation: "ring 0.5s ease-in-out infinite alternate" }}>📱</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Incoming Call</h2>
                <p style={{ fontSize: 16, color: T.textSecondary }}>(512) 555-0187</p>
                <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>Happy Force agent Jennifer R. standing by</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                  <button onClick={acceptCall} style={{ background: T.teal, color: "#fff", border: "none", borderRadius: T.borderRadius, padding: "12px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    📞 Accept
                  </button>
                  <button onClick={rejectCall} style={{ background: T.danger, color: "#fff", border: "none", borderRadius: T.borderRadius, padding: "12px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            )}

            {/* Live call + Ended state — three-panel layout */}
            {(callState === "live" || callState === "ended") && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
                {/* LEFT: Call panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Call status bar */}
                  <div style={{ ...card, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Caller avatar */}
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: callState === "live" ? T.danger + "22" : T.successBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: callState === "live" ? T.danger : T.successText }}>MT</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>Marcus Thompson</div>
                          <div style={{ fontSize: 12, color: T.textMuted }}>(512) 555-0187 • Unit B-214</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: callState === "live" ? T.danger : T.textPrimary }}>{formatTime(elapsed)}</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>Happy Force Agent: Jennifer R.</div>
                      </div>
                    </div>
                    {/* Waveform */}
                    <div style={{ background: T.bodyBg, borderRadius: 6, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <WaveForm />
                    </div>
                    {callState === "ended" && (
                      <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, color: T.successText, fontWeight: 600 }}>
                        ✓ Call completed — {formatTime(CALL_DURATION)}
                      </div>
                    )}
                  </div>

                  {/* Live Transcript */}
                  <div style={{ ...card, display: "flex", flexDirection: "column", maxHeight: 420 }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Live Transcript</span>
                      <span style={{ fontSize: 11, color: T.textMuted }}>{transcriptLines.length} messages</span>
                    </div>
                    <div ref={transcriptRef} style={{ padding: 16, overflowY: "auto", flex: 1, minHeight: 200 }}>
                      {transcriptLines.length === 0 && (
                        <div style={{ textAlign: "center", color: T.textMuted, fontSize: 13, padding: 24 }}>Waiting for conversation to begin...</div>
                      )}
                      {transcriptLines.map((line, i) => (
                        <div key={i} style={{ marginBottom: 12, display: "flex", gap: 10, animation: "fi .3s ease" }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, marginTop: 2,
                            background: line.speaker === "agent" ? T.primaryLight : "#FEE2E2",
                            color: line.speaker === "agent" ? T.primary : T.danger,
                          }}>
                            {line.speaker === "agent" ? "JR" : "MT"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 2 }}>
                              {line.speaker === "agent" ? "Jennifer R. (Agent)" : "Marcus Thompson (Resident)"}
                              <span style={{ fontWeight: 400, marginLeft: 8 }}>{formatTime(line.time)}</span>
                            </div>
                            <div style={{ fontSize: 13, lineHeight: 1.6, color: T.textPrimary }}>{line.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Agent enrichment + Work order */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Agent Activity Feed */}
                  <div style={{ ...card, display: "flex", flexDirection: "column", maxHeight: 280 }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>✨</div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Concierge Agent</span>
                      </div>
                      {agentActions.length > 0 && (
                        <span style={{ fontSize: 11, color: T.textMuted }}>{agentActions.filter(a => a.status === "done").length}/{agentActions.length} actions</span>
                      )}
                    </div>
                    <div ref={agentRef} style={{ padding: 12, overflowY: "auto", flex: 1, minHeight: 80 }}>
                      {agentActions.length === 0 && (
                        <div style={{ textAlign: "center", color: T.textMuted, fontSize: 12, padding: 16 }}>Listening for actionable information...</div>
                      )}
                      {agentActions.map((action, i) => (
                        <div key={action.id} style={{ marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 8, animation: "fi .3s ease" }}>
                          <div style={{ marginTop: 1, flexShrink: 0 }}>
                            {action.status === "done" ? <Check s={13} /> : <Spin s={13} />}
                          </div>
                          <div style={{ fontSize: 12, color: action.status === "done" ? T.tealText : T.primary, fontWeight: 500, lineHeight: 1.5 }}>
                            {action.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progressive Work Order */}
                  <div style={card}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {submitted ? "Work Order WO-5103" : filledCount > 0 ? "Work Order (Building...)" : "Work Order"}
                      </span>
                      {!submitted && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 80, height: 6, borderRadius: 3, background: T.cardBorder, overflow: "hidden" }}>
                            <div style={{ width: `${completionPct}%`, height: "100%", borderRadius: 3, background: completionPct === 100 ? T.teal : T.primary, transition: "width 0.5s ease" }} />
                          </div>
                          <span style={{ fontSize: 11, color: T.textMuted, fontVariantNumeric: "tabular-nums" }}>{completionPct}%</span>
                        </div>
                      )}
                      {submitted && (
                        <span style={{ ...pill(T.successBg, T.successText), fontSize: 11 }}>
                          <Check s={12} c={T.tealText} /> Submitted
                        </span>
                      )}
                    </div>
                    <div style={{ padding: 12, maxHeight: 380, overflowY: "auto" }}>
                      {submitted && (
                        <div style={{ background: T.successBg, borderRadius: 6, padding: 12, marginBottom: 12, animation: "fi .4s ease" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.successText, marginBottom: 4 }}>✅ Work order submitted successfully</div>
                          <div style={{ fontSize: 12, color: T.tealText, lineHeight: 1.6 }}>
                            WO-5103 has been submitted. A confirmation has been sent to the resident.
                          </div>
                        </div>
                      )}
                      {WO_FIELDS_ORDER.map(({ key, label }) => {
                        const value = woFields[key];
                        const isFilled = !!value;
                        const isEditing = editingField === key;
                        return (
                          <div key={key} style={{
                            marginBottom: 8, padding: "6px 10px", borderRadius: 6,
                            border: `1px solid ${isEditing ? T.primary : isFilled ? T.cardBorder : "transparent"}`,
                            background: isEditing ? "#F5F3FF" : isFilled ? T.cardBg : T.bodyBg,
                            transition: "all 0.3s ease",
                            cursor: isFilled && !submitted ? "pointer" : "default",
                          }}
                          onClick={() => { if (isFilled && !submitted && !isEditing) setEditingField(key); }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                              {isFilled && !submitted && !isEditing && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              )}
                            </div>
                            {isEditing ? (
                              <input
                                autoFocus
                                value={value || ""}
                                onChange={(e) => setWoFields(prev => ({ ...prev, [key]: e.target.value }))}
                                onBlur={() => setEditingField(null)}
                                onKeyDown={(e) => { if (e.key === "Enter") setEditingField(null); if (e.key === "Escape") setEditingField(null); }}
                                style={{
                                  width: "100%", fontSize: 13, color: T.textPrimary, fontWeight: 500, padding: "4px 0",
                                  border: "none", outline: "none", background: "transparent", fontFamily: T.font,
                                }}
                              />
                            ) : isFilled ? (
                              <div style={{ fontSize: 13, color: submitted ? T.textSecondary : T.textPrimary, fontWeight: 500, animation: "fi .4s ease" }}>{value}</div>
                            ) : (
                              <div style={{ fontSize: 12, color: T.cardBorder, fontStyle: "italic" }}>Waiting for call data...</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Submit Work Order button */}
                    {filledCount > 0 && !submitted && (
                      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.cardBorder}` }}>
                        <button
                          onClick={() => { if (allFieldsFilled) setShowModal(true); }}
                          disabled={!allFieldsFilled}
                          style={{
                            background: allFieldsFilled ? T.primary : T.cardBorder,
                            color: allFieldsFilled ? "#fff" : T.textMuted,
                            border: "none", borderRadius: T.borderRadius, padding: "10px 0", fontSize: 13,
                            fontWeight: 600, cursor: allFieldsFilled ? "pointer" : "not-allowed",
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            transition: "all 0.3s ease",
                          }}
                        >
                          {allFieldsFilled
                            ? "Submit Work Order"
                            : callState === "live"
                            ? "⏳ Waiting for call to end..."
                            : `⏳ ${completionPct}% complete...`}
                        </button>
                        {allFieldsFilled && (
                          <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center", marginTop: 6 }}>
                            Click any field above to edit before submitting
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===================== CONFIRMATION MODAL ===================== */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn .2s ease" }}>
          <div style={{ background: T.cardBg, borderRadius: 12, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "modalIn .3s ease" }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Submit Work Order</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.7, margin: "0 0 20px" }}>
                You are about to submit work order <strong style={{ color: T.textPrimary }}>WO-5103</strong> with the following details:
              </p>
              {/* Summary grid */}
              <div style={{ background: T.bodyBg, borderRadius: 8, padding: 16, marginBottom: 20 }}>
                {[
                  ["Resident", woFields.resident],
                  ["Unit", woFields.unit],
                  ["Category", woFields.category],
                  ["Priority", woFields.priority],
                  ["Asset", woFields.asset],
                  ["Warranty", woFields.warranty],
                  ["Part Needed", woFields.partNeeded],
                ].map(([label, value]) => value ? (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                    <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, minWidth: 100 }}>{label}</span>
                    <span style={{ fontSize: 12, color: T.textPrimary, fontWeight: 500, textAlign: "right", flex: 1, marginLeft: 12 }}>{value}</span>
                  </div>
                ) : null)}
              </div>
              {/* Notification note */}
              <div style={{ background: T.primaryLight, borderRadius: 8, padding: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💬</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.primary, marginBottom: 2 }}>Resident Notification</div>
                  <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>
                    Marcus Thompson will receive an SMS confirmation. Once this work order is submitted, additional SMS may be sent out once the part is ordered, arrived, and when a technician is scheduled.
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div style={{ padding: "16px 24px 20px", borderTop: `1px solid ${T.cardBorder}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: `1px solid ${T.cardBorder}`, borderRadius: T.borderRadius, padding: "9px 20px", fontSize: 13, fontWeight: 600, color: T.textSecondary, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => { setShowModal(false); setSubmitted(true); }} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: T.borderRadius, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fi { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes ring { from { transform: rotate(-8deg); } to { transform: rotate(8deg); } }
        @keyframes wave {
          from { height: 4px; }
          to { height: ${16 + Math.random() * 8}px; }
        }
        ${Array.from({ length: 20 }, (_, i) => `
          div[style*="wave"] > div:nth-child(${i + 1}) {
            animation-duration: ${0.4 + Math.random() * 0.6}s !important;
          }
        `).join("")}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
      `}</style>
    </div>
  );
}
