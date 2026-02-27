# 🤖🔧 Maintenance Concierge

**AI-powered agentic workflow prototype for multifamily property maintenance**

An interactive demo showing how AI agents can augment human operators during resident maintenance calls — automatically enriching work orders, tracking parts, and keeping residents proactively informed.

Built as a product concept for [HappyCo](https://happy.co)'s maintenance platform.

---

## 🎬 What It Does

The demo walks through a complete maintenance lifecycle in 5 steps:

| Step | View | Screen |
|------|------|--------|
| 1 | 📞 **Operator: Live Call** | Simulates a 48-second resident call. The Concierge Agent listens alongside the human operator, auto-pulling unit data, checking warranties, finding techs, and pre-drafting the work order in real-time. |
| 2 | 📦 **Operator: Part Confirmed** | After the call, the operator sees a notification that the igniter assembly has been ordered with an ETA. |
| 3 | 📱 **Resident: Waiting for Parts** | The resident's mobile view shows their work order status with a proactive message from Jennifer. |
| 4 | ✅ **Operator: Part Received** | 3 days later — the part arrives, technician Alan is auto-assigned, and the operator is notified. |
| 5 | 📱 **Resident: Tech Assigned** | The resident sees their updated status with Alan's profile and a second proactive message. |

### Key Concepts Demonstrated

- **Concierge Agent as "Second Brain"** — The AI doesn't replace the human operator; it enriches every conversation in real-time so the human is 5x more effective
- **Progressive Work Order Building** — 14 fields auto-populated during a 48-second call, with operator review and one-tap submission
- **Proactive Status Updates** — Residents are kept informed at every state change, eliminating follow-up calls
- **Dual-Persona Views** — Same data, different experiences: desktop operator view + mobile resident view

---

## 🏗️ Project Structure

```
maintenance-concierge/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Tailwind + HappyCo animations
│   │   └── demo/
│   │       └── page.tsx        # Main demo page
│   ├── components/
│   │   ├── CombinedFlow.jsx    # ⭐ Combined 5-step interactive demo
│   │   ├── call/
│   │   │   └── LiveCallScreen.jsx    # Phase 2: Standalone live call
│   │   ├── operator/
│   │   │   └── PostCallReview.jsx    # Phase 1: Post-call work order view
│   │   ├── resident/           # (Future: standalone resident components)
│   │   └── shared/
│   │       └── ProactiveStatusFlow.jsx  # Phase 3: 4-step status timeline
│   ├── data/
│   │   ├── callScript.ts       # Timed call transcript + agent triggers
│   │   └── workOrderFields.ts  # WO field definitions + types
│   └── lib/
│       └── tokens.ts           # HappyCo design system tokens
├── docs/
│   └── Simulated_Call_Script.md  # Original call script
├── public/                     # Static assets
├── package.json
├── tailwind.config.js          # Extended with HappyCo colors
├── tsconfig.json
└── next.config.js
```

### Component Architecture

- **`CombinedFlow.jsx`** — The main artifact. Self-contained React component with a timeline stepper that renders all 5 screens. This is what `/demo` renders.
- **`call/LiveCallScreen.jsx`** — Standalone Phase 2 component with full call simulation (ringing → live transcript → agent enrichment → WO builder → submit modal)
- **`operator/PostCallReview.jsx`** — Phase 1 operator view with post-call work order review and HappyCo design system
- **`shared/ProactiveStatusFlow.jsx`** — Phase 3 standalone with 4-step operator/resident views for parts tracking

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/maintenance-concierge.git
cd maintenance-concierge

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → click **Launch Demo** → click **Simulate Incoming Call**.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/maintenance-concierge)

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | Server components, file-based routing, Vercel-native |
| UI | React 18 + Inline Styles | Self-contained components, no external UI lib needed |
| Styling | Tailwind CSS | Utility-first, extended with HappyCo design tokens |
| Types | TypeScript | Data layer typed, components in JSX for prototype speed |
| Hosting | Vercel (free tier) | Zero-config Next.js deployment |

### Future Stack (for production prototype)

| Layer | Upgrade Path |
|-------|-------------|
| LLM | Groq API (Llama 3.3 70B) — 14,400 req/day free, 300+ tok/sec |
| Voice STT | Web Speech API → Deepgram |
| Voice TTS | Browser native → ElevenLabs |
| Real-time | LiveKit Agents or Pipecat |

---

## 📋 Call Script

The demo simulates a real maintenance call based on `docs/Simulated_Call_Script.md`:

> **Resident:** Marcus Thompson, Unit B-214, Ridgewood Heights
> **Issue:** No hot water since last night, water heater clicking but not heating
> **Agent:** Jennifer R. (Happy Force)
> **Resolution:** Rheem gas water heater igniter assembly — under warranty, part ordered, tech assigned

The Concierge Agent automatically:
1. Identifies the resident and pulls unit records
2. Classifies the issue and assesses urgency
3. Matches symptoms to the specific asset in inventory
4. Checks warranty status
5. Runs JoyAI diagnostic analysis
6. Identifies the required part
7. Finds a qualified technician
8. Pre-drafts the complete work order

---

## 📊 Research Foundation

This prototype is grounded in HappyCo's own research and industry data:

- **82%** of residents prefer humans for urgent maintenance issues
- **11-point** renewal intent gap between human-available vs AI-primary properties
- **$4,000** average cost per resident turnover
- **5.7-day** average unit turns achieved by Blanton Turner using HappyCo (down from 12-14)
- **<4 min** average response time for Happy Force calls

Source: [HappyCo "Beyond the Bot" Report (Dec 2025)](https://happy.co)

---

## 📝 License

MIT — Built as a product concept prototype.
