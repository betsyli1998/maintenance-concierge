import { useState, useEffect, useRef } from "react";
const T={navBg:"#1a1440",primary:"#5B4FCF",primaryLight:"#EDEDFC",teal:"#10B981",tealBg:"#ECFDF5",tealText:"#047857",sidebarBg:"#FFFFFF",sidebarBorder:"#E5E7EB",sidebarText:"#4B5563",bodyBg:"#F9FAFB",cardBg:"#FFFFFF",cardBorder:"#E5E7EB",textPrimary:"#111827",textSecondary:"#6B7280",textMuted:"#9CA3AF",danger:"#EF4444",dangerBg:"#FEE2E2",dangerText:"#991B1B",warningBg:"#FEF3C7",warningText:"#92400E",successBg:"#D1FAE5",successText:"#065F46",infoBg:"#DBEAFE",infoText:"#1E40AF",liveBg:"#DC2626",borderRadius:8,font:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"};
const C={purple:"#5B4FCF",purpleLight:"#EDEDFC",purpleMuted:"#8B82D6",purpleBg:"#F7F6FD",bg:"#FFFFFF",border:"#E5E7EB",textPrimary:"#111827",textSecondary:"#6B7280",textMuted:"#9CA3AF",statusActive:"#5B4FCF",statusInactive:"#D1D5DB",warningBg:"#FEF3C7",warningText:"#92400E"};
const callDate=new Date();const arrivalDate=new Date(callDate);arrivalDate.setDate(arrivalDate.getDate()+3);
const fmt=(d)=>d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const fmtShort=(d)=>d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
const fmtTS=(d)=>fmt(d)+" "+d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const CALL_SCRIPT=[
{speaker:"agent",text:"Happy Force maintenance line, this is Jennifer. How can I help you today?",at:0},
{speaker:"resident",text:"Hi, this is Marcus Thompson. I'm in unit B-214 at Ridgewood Heights.",at:3000,triggers:[
{type:"lookup",label:"Searching resident database...",field:"resident",value:"Marcus Thompson"},
{type:"lookup",label:"Pulling unit profile for B-214...",field:"unit",value:"B-214, Building B, Floor 2"},
{type:"lookup",label:"Loading unit inventory...",field:"inventory",value:"5 tracked assets"},
{type:"lookup",label:"Pulling lease & resident history...",field:"lease",value:"Active — expires 03/2025, 3 prior WOs (all resolved)"}]},
{speaker:"agent",text:"Hi Marcus, I've got your unit pulled up. What's going on?",at:9000},
{speaker:"resident",text:"I have no hot water. It's been out since last night.",at:12000,triggers:[
{type:"classify",label:"Classifying: Plumbing → Water Heater → No Hot Water",field:"category",value:"Plumbing — Water Heater"},
{type:"priority",label:"Urgency assessment: HIGH (essential utility, 12+ hours)",field:"priority",value:"High"}]},
{speaker:"resident",text:"The water heater is making a clicking noise but nothing's heating up.",at:16000,triggers:[
{type:"lookup",label:"Matching symptom to unit inventory...",field:"asset",value:"Rheem PROG50-38N RH67 (gas, installed 06/2019)"},
{type:"lookup",label:"Checking warranty — Rheem PROG50-38N...",field:"warranty",value:"✓ Active until 06/2029 — Parts & Labor"},
{type:"ai",label:"JoyAI: Clicking + no heat on gas Rheem → likely pilot/igniter issue.",field:"diagnosis",value:"Probable pilot assembly or igniter — 45 min avg repair"}]},
{speaker:"agent",text:"I'm sorry about that, Marcus. Let me get someone out to you. It looks like it might be an igniter assembly issue. We will order the part first. Once we receive the part, a technician will reach out to schedule a time with you.",at:22000,triggers:[
{type:"schedule",label:"Identifying required part: Igniter assembly for Rheem PROG50...",field:"partNeeded",value:"Rheem SP20161 Igniter Assembly — ordering"},
{type:"schedule",label:"Finding plumbing-certified techs with Rheem experience...",field:"tech",value:"David Morales — available once part arrives"}]},
{speaker:"resident",text:"Ok. Sounds good.",at:25000},
{speaker:"resident",text:"I'm not sure if it's gas or electric, by the way.",at:28000,triggers:[
{type:"ai",label:"Unit inventory confirms: Gas water heater (Rheem PROG50 = natural gas)",field:"fuelType",value:"Confirmed: Natural Gas"}]},
{speaker:"agent",text:"No worries — I can see from your unit records it's a gas unit, a Rheem model. And great news, it's still under warranty so there won't be any charge.",at:31000},
{speaker:"resident",text:"Oh that's great, thank you.",at:36000},
{speaker:"agent",text:"I'm going to get a work order submitted for you right now. Once we get the part and a technician, you will receive a confirmation.",at:38000,triggers:[
{type:"draft",label:"Pre-drafting work order with all enriched fields...",field:"workOrder",value:"WO-5103 — Ready for review"},
{type:"draft",label:"Preparing resident notification template...",field:"sms",value:"Template ready — will send on tech confirmation"}]},
{speaker:"resident",text:"Sounds good. Thanks so much, Jennifer.",at:44000},
{speaker:"agent",text:"You're welcome, Marcus. We'll get this taken care of for you. Have a great day!",at:46000}];
const CALL_DURATION=48000;
const WO_FIELDS_ORDER=[
{key:"resident",label:"Resident"},{key:"unit",label:"Unit"},{key:"lease",label:"Lease Status"},
{key:"inventory",label:"Unit Inventory"},{key:"category",label:"Category"},{key:"priority",label:"Priority"},
{key:"asset",label:"Asset"},{key:"warranty",label:"Warranty"},{key:"diagnosis",label:"AI Diagnosis"},
{key:"fuelType",label:"Fuel Type"},{key:"partNeeded",label:"Part Needed"},{key:"tech",label:"Technician"},
{key:"workOrder",label:"Work Order"},{key:"sms",label:"Resident Notification"}];
const STEPS=[
{id:0,actor:"Operator",label:"Live Call",icon:"📞"},
{id:1,actor:"Operator",label:"Part Confirmed",icon:"📦"},
{id:2,actor:"Resident",label:"Waiting for Parts",icon:"📱"},
{id:3,actor:"Operator",label:"Part Received",icon:"✅"},
{id:4,actor:"Resident",label:"Tech Assigned",icon:"📱"}];
const pill=(bg,color)=>({background:bg,color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4});
const cardS={background:T.cardBg,borderRadius:T.borderRadius,border:`1px solid ${T.cardBorder}`};
const WHIcon=()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="16" r="2"/><path d="M10 7c.5-1 1-1.5 2-1.5s1.5.5 2 1.5"/><path d="M10 10c.5-1 1-1.5 2-1.5s1.5.5 2 1.5"/></svg>;
const Chk=({s:z=14,c=T.teal})=><svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>;
const Spn=({s:z=14})=><svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>;
const TopNav=({extra})=>(
<nav style={{background:T.navBg,height:48,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px"}}>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="14" r="7.5" stroke="#A78BFA" strokeWidth="2.5" fill="none"/><circle cx="18" cy="14" r="7.5" stroke="#10B981" strokeWidth="2.5" fill="none"/></svg>
<svg width="16" height="16" viewBox="0 0 16 16" fill="rgba(255,255,255,0.5)">{[[0,0],[0,6],[0,12],[6,0],[6,6],[6,12],[12,0],[12,6],[12,12]].map(([x,y])=><rect key={`${x}${y}`} x={x} y={y} width="3" height="3" rx="0.5"/>)}</svg>
<div style={{background:T.primary,color:"#fff",padding:"4px 14px",borderRadius:6,fontSize:12,fontWeight:600}}>HPM - DEMO</div>
<div style={{background:"rgba(16,185,129,0.15)",color:"#6EE7B7",padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:500,display:"flex",alignItems:"center",gap:6}}>🏠 Ridgewood Heights</div>
{extra}
</div>
<div style={{display:"flex",alignItems:"center",gap:16}}>
<div style={{position:"relative",color:"rgba(255,255,255,0.7)"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
<div style={{position:"absolute",top:-5,right:-7,background:T.danger,color:"#fff",minWidth:16,height:16,borderRadius:8,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>82</div>
</div>
<div style={{width:30,height:30,borderRadius:"50%",background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>SC</div>
</div></nav>);
const SB=({nav,setNav})=>{
const sn=[["dashboards","Dashboards","📊"],["units","Units & Areas","📋"],["vendors","Vendors","👥"],["documents","Documents","📁"],["incidents","Incidents","⚠️"],["work-assignment","Work Assignment","🖥️"],["property-profile","Property Profile","🏠"]];
const an=[["inspections","Inspections","✅"],["tasks","Tasks","📝"],["projects","Projects","📐"],["call-complete","Resident Call History","📞"],["insights","Insights","📈"],["inventory","Inventory","⭐"]];
const ni=(a)=>({display:"flex",alignItems:"center",gap:10,padding:"7px 16px",borderRadius:6,fontSize:13,fontWeight:a?600:400,color:a?T.primary:T.sidebarText,background:a?T.primaryLight:"transparent",cursor:"pointer",margin:"1px 8px",borderLeft:a?`3px solid ${T.primary}`:"3px solid transparent"});
return(<aside style={{width:220,background:T.sidebarBg,borderRight:`1px solid ${T.sidebarBorder}`,flexShrink:0,overflowY:"auto"}}>
<div style={{padding:"16px 0"}}>
<div style={{padding:"0 20px 14px",fontWeight:700,fontSize:14}}>Ridgewood Heights</div>
{sn.map(([id,l,ic])=><div key={id} onClick={()=>setNav(id)} style={ni(nav===id)}><span style={{width:20,textAlign:"center",fontSize:14}}>{ic}</span> {l}</div>)}
<div style={{padding:"16px 20px 6px",fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.8}}>Apps</div>
{an.map(([id,l,ic])=><div key={id} onClick={()=>setNav(id)} style={ni(nav===id)}><span style={{width:20,textAlign:"center",fontSize:14}}>{ic}</span><span style={{flex:1}}>{l}</span></div>)}
</div></aside>);};
const PF=({children})=>(
<div style={{display:"flex",justifyContent:"center",padding:"24px 16px"}}>
<div style={{width:390,background:C.bg,borderRadius:24,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",overflow:"hidden",border:"8px solid #1a1a1a"}}>
<div style={{background:"#1a1a1a",padding:"8px 24px 4px",display:"flex",justifyContent:"space-between",alignItems:"center",color:"#fff",fontSize:12,fontWeight:600}}>
<span>1:29</span><div style={{width:80,height:24,background:"#333",borderRadius:12}}/>
<div style={{display:"flex",alignItems:"center",gap:4}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
<svg width="22" height="12" viewBox="0 0 28 14" fill="none"><rect x="0" y="0" width="24" height="14" rx="3" stroke="#fff" strokeWidth="1.5"/><rect x="2" y="2" width="18" height="10" rx="1.5" fill="#fff"/><rect x="25.5" y="4" width="2" height="6" rx="1" fill="#fff"/></svg>
</div></div>
<div style={{background:"#F3F4F6",padding:"8px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${C.border}`}}>
<div style={{width:24,height:24,borderRadius:"50%",background:C.purple,display:"flex",alignItems:"center",justifyContent:"center"}}>
<svg width="12" height="12" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="14" r="6" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="18" cy="14" r="6" stroke="#fff" strokeWidth="2" fill="none"/></svg>
</div>
<div style={{flex:1,background:"#fff",borderRadius:8,padding:"6px 12px",fontSize:12,color:C.textSecondary}}>manage.happyco.com</div>
</div>
<div style={{overflowY:"auto",maxHeight:620}}>{children}</div>
</div></div>);
const PB=({steps})=>(
<div style={{padding:"20px 16px 16px"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative"}}>
<div style={{position:"absolute",top:8,left:40,right:40,height:3,background:C.statusInactive,borderRadius:2,zIndex:0}}>
<div style={{width:steps.filter(s=>s.active).length<=1?"15%":"38%",height:"100%",background:C.statusActive,borderRadius:2}}/></div>
{steps.map(s=>(
<div key={s.label} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,zIndex:1}}>
<div style={{width:18,height:18,borderRadius:"50%",background:s.active?C.statusActive:"#fff",border:s.active?"none":`2px solid ${C.statusInactive}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
{s.active&&<div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}</div>
<span style={{fontSize:11,color:s.active?C.textPrimary:C.textMuted,fontWeight:s.active?600:400}}>{s.label}</span>
</div>))}</div></div>);
const MsgB=({text,date})=>(
<div style={{marginBottom:16}}>
<div style={{background:C.purpleBg,borderRadius:12,padding:14,marginBottom:6,maxWidth:"90%"}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
<div style={{width:24,height:24,borderRadius:"50%",background:C.purpleMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>JR</div>
<span style={{fontSize:12,fontWeight:600,color:C.purple}}>Jennifer R.</span></div>
<p style={{fontSize:14,color:C.textPrimary,lineHeight:1.6,margin:0}}>{text}</p></div>
<div style={{fontSize:11,color:C.textMuted,paddingLeft:4}}>{fmtTS(date)}</div></div>);
const TR=()=>(<>
{[["Heating & Cooling","Annual maintenance...","Normal","Open","Urban Oasis","Aron Finneran"],["Heating & Cooling","Annual maintenance...","Normal","Open","The Neon Niche","Bob's Carpet"],["Heating & Cooling","Annual maintenance...","Normal","Open","The Neon Niche","Unassigned"]].map(([t,d,p,s,l,a],i)=>(
<div key={i} style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,alignItems:"center",fontSize:13}}>
<div><input type="checkbox" readOnly style={{accentColor:T.primary}}/></div>
<div><div style={{fontWeight:500}}>🌡️ {t}</div><div style={{fontSize:11,color:T.textMuted}}>{d}</div></div>
<div><span style={pill("#F3F4F6",T.textSecondary)}>● {p}</span></div>
<div><span style={pill(T.successBg,T.successText)}>● {s}</span></div>
<div style={{fontSize:12,color:T.textSecondary}}>{l}</div>
<div style={{fontSize:12,color:T.textMuted}}>{a}</div>
<div style={{fontSize:12,color:T.textMuted}}>May 2, 2024</div></div>))}</>);

export default function CombinedFlow(){
const[step,setStep]=useState(0);
const[nav,setNav]=useState("call-complete");
const[msgTab,setMsgTab]=useState("messages");
const[callState,setCallState]=useState("idle");
const[elapsed,setElapsed]=useState(0);
const[tLines,setTLines]=useState([]);
const[aActs,setAActs]=useState([]);
const[woF,setWoF]=useState({});
const[submitted,setSub]=useState(false);
const[editF,setEditF]=useState(null);
const[showModal,setShowModal]=useState(false);
const csRef=useRef(null);const tmRef=useRef(null);const trRef=useRef(null);const agRef=useRef(null);const trgRef=useRef(new Set());

const startCall=()=>setCallState("ringing");
const acceptCall=()=>{setCallState("live");csRef.current=Date.now();trgRef.current=new Set();setTLines([]);setAActs([]);setWoF({});setSub(false);setEditF(null);setShowModal(false);};
const rejectCall=()=>setCallState("idle");

useEffect(()=>{
if(callState!=="live")return;
tmRef.current=setInterval(()=>{const e=Date.now()-csRef.current;setElapsed(e);if(e>=CALL_DURATION){setCallState("ended");clearInterval(tmRef.current);}},100);
return()=>clearInterval(tmRef.current);},[callState]);

useEffect(()=>{
if(callState!=="live")return;
const iv=setInterval(()=>{const e=Date.now()-csRef.current;
CALL_SCRIPT.forEach((line,i)=>{if(e>=line.at&&!trgRef.current.has(i)){trgRef.current.add(i);
setTLines(p=>[...p,{speaker:line.speaker,text:line.text,time:line.at}]);
if(line.triggers){line.triggers.forEach((tr,ti)=>{const dl=400+ti*800;
setTimeout(()=>{const aid=`${i}-${ti}`;
setAActs(p=>[...p,{...tr,id:aid,status:"processing"}]);
setTimeout(()=>{setAActs(p=>p.map(a=>a.id===aid?{...a,status:"done"}:a));
if(tr.field)setWoF(p=>({...p,[tr.field]:tr.value}));},600+Math.random()*400);},dl);});}
}});},150);
return()=>clearInterval(iv);},[callState]);

useEffect(()=>{trRef.current?.scrollTo({top:trRef.current.scrollHeight,behavior:"smooth"});},[tLines]);
useEffect(()=>{agRef.current?.scrollTo({top:agRef.current.scrollHeight,behavior:"smooth"});},[aActs]);

const fmtT=(ms)=>{const s=Math.floor(ms/1000);return`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;};
const filled=WO_FIELDS_ORDER.filter(x=>!!woF[x.key]).length;
const pct=Math.round((filled/WO_FIELDS_ORDER.length)*100);
const allFilled=filled>=WO_FIELDS_ORDER.length;
const isOp=STEPS[step].actor==="Operator";
const mx=STEPS.length-1;

const Wave=()=>(<div style={{display:"flex",alignItems:"center",gap:2,height:24}}>
{Array.from({length:20},(_,i)=>(<div key={i} style={{width:3,borderRadius:2,background:callState==="live"?T.liveBg:T.textMuted,animation:callState==="live"?`wave 0.8s ease-in-out ${i*0.05}s infinite alternate`:"none",height:callState==="live"?undefined:4}}/>))}</div>);

const liveInd=step===0&&callState==="live"?(<div style={{background:T.liveBg,color:"#fff",padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:6,animation:"pulse 2s infinite"}}>
<span style={{width:6,height:6,borderRadius:"50%",background:"#fff",animation:"blink 1s infinite"}}/>LIVE — {fmtT(elapsed)}</div>):null;

const P2=()=>(<>
<div style={{background:T.cardBg,borderBottom:`1px solid ${T.cardBorder}`,padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<span style={{fontSize:18}}>📞</span><h1 style={{fontSize:22,fontWeight:700,margin:0}}>Ongoing Call</h1>
<div style={pill(T.tealBg,T.tealText)}><span style={{width:6,height:6,borderRadius:"50%",background:T.teal}}/>Concierge Agent</div></div>
<div style={{display:"flex",alignItems:"center",gap:12}}>
{callState==="idle"&&<button onClick={startCall} style={{background:T.primary,color:"#fff",border:"none",borderRadius:T.borderRadius,padding:"9px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>📞 Simulate Incoming Call</button>}
{callState==="ringing"&&(<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{...pill(T.warningBg,T.warningText),padding:"8px 16px",fontSize:13,animation:"pulse 1s infinite"}}>📱 Incoming call...</div>
<button onClick={acceptCall} style={{background:T.teal,color:"#fff",border:"none",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Accept</button>
<button onClick={rejectCall} style={{background:T.danger,color:"#fff",border:"none",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Reject</button></div>)}
{callState==="live"&&<div style={{...pill(T.dangerBg,T.dangerText),padding:"8px 16px",fontSize:13}}><span style={{width:8,height:8,borderRadius:"50%",background:T.danger,animation:"blink 1s infinite"}}/>Live — {fmtT(elapsed)} — Agent enriching</div>}
{callState==="ended"&&!submitted&&<div style={{...pill(T.successBg,T.successText),padding:"8px 16px",fontSize:13}}><Chk s={14} c={T.tealText}/>Call ended — Review & submit</div>}
{callState==="ended"&&submitted&&<div style={{...pill(T.successBg,T.successText),padding:"8px 16px",fontSize:13}}><Chk s={14} c={T.tealText}/>WO-5103 submitted</div>}
</div></div>
<div style={{padding:24}}>
{callState==="idle"&&(<div style={{...cardS,padding:48,textAlign:"center",maxWidth:600,margin:"60px auto"}}>
<div style={{fontSize:48,marginBottom:16}}>🤖📞</div>
<h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>Concierge Agent — Live Call Mode</h2>
<p style={{fontSize:14,color:T.textSecondary,lineHeight:1.7,marginBottom:24}}>When a resident calls Happy Force, the Concierge Agent listens alongside the human operator. It automatically pulls unit data, checks warranties, finds technicians, and pre-drafts the work order — so by the time the call ends, everything is ready for one-tap dispatch.</p>
<button onClick={startCall} style={{background:T.primary,color:"#fff",border:"none",borderRadius:T.borderRadius,padding:"12px 28px",fontSize:15,fontWeight:600,cursor:"pointer"}}>📞 Simulate Incoming Call</button>
<p style={{fontSize:12,color:T.textMuted,marginTop:12}}>Simulates a 48-second call between a resident and a Happy Force agent.</p></div>)}
{callState==="ringing"&&(<div style={{...cardS,padding:48,textAlign:"center",maxWidth:500,margin:"60px auto"}}>
<div style={{fontSize:56,marginBottom:16,animation:"ring 0.5s ease-in-out infinite alternate"}}>📱</div>
<h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>Incoming Call</h2>
<p style={{fontSize:16,color:T.textSecondary}}>(512) 555-0187</p>
<p style={{fontSize:13,color:T.textMuted,marginBottom:24}}>Happy Force agent Jennifer R. standing by</p>
<div style={{display:"flex",justifyContent:"center",gap:16}}>
<button onClick={acceptCall} style={{background:T.teal,color:"#fff",border:"none",borderRadius:T.borderRadius,padding:"12px 32px",fontSize:14,fontWeight:600,cursor:"pointer"}}>📞 Accept</button>
<button onClick={rejectCall} style={{background:T.danger,color:"#fff",border:"none",borderRadius:T.borderRadius,padding:"12px 32px",fontSize:14,fontWeight:600,cursor:"pointer"}}>✕ Reject</button></div></div>)}
{(callState==="live"||callState==="ended")&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
<div style={{display:"flex",flexDirection:"column",gap:16}}>
<div style={{...cardS,padding:16}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<div style={{width:40,height:40,borderRadius:"50%",background:callState==="live"?T.danger+"22":T.successBg,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:callState==="live"?T.danger:T.successText}}>MT</div>
<div><div style={{fontSize:14,fontWeight:700}}>Marcus Thompson</div><div style={{fontSize:12,color:T.textMuted}}>(512) 555-0187 • Unit B-214</div></div></div>
<div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:700,fontVariantNumeric:"tabular-nums",color:callState==="live"?T.danger:T.textPrimary}}>{fmtT(elapsed)}</div>
<div style={{fontSize:11,color:T.textMuted}}>Agent: Jennifer R.</div></div></div>
<div style={{background:T.bodyBg,borderRadius:6,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"center"}}><Wave/></div>
{callState==="ended"&&<div style={{marginTop:10,textAlign:"center",fontSize:12,color:T.successText,fontWeight:600}}>✓ Call completed — {fmtT(CALL_DURATION)}</div>}</div>
<div style={{...cardS,display:"flex",flexDirection:"column",maxHeight:420}}>
<div style={{padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<span style={{fontSize:13,fontWeight:700}}>Live Transcript</span>
<span style={{fontSize:11,color:T.textMuted}}>{tLines.length} messages</span></div>
<div ref={trRef} style={{padding:16,overflowY:"auto",flex:1,minHeight:200}}>
{tLines.length===0&&<div style={{textAlign:"center",color:T.textMuted,fontSize:13,padding:24}}>Waiting for conversation...</div>}
{tLines.map((ln,i)=>(
<div key={i} style={{marginBottom:12,display:"flex",gap:10,animation:"fi .3s ease"}}>
<div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,marginTop:2,background:ln.speaker==="agent"?T.primaryLight:"#FEE2E2",color:ln.speaker==="agent"?T.primary:T.danger}}>{ln.speaker==="agent"?"JR":"MT"}</div>
<div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:T.textMuted,marginBottom:2}}>{ln.speaker==="agent"?"Jennifer R. (Agent)":"Marcus Thompson"}<span style={{fontWeight:400,marginLeft:8}}>{fmtT(ln.time)}</span></div>
<div style={{fontSize:13,lineHeight:1.6,color:T.textPrimary}}>{ln.text}</div></div></div>))}</div></div></div>
<div style={{display:"flex",flexDirection:"column",gap:16}}>
<div style={{...cardS,display:"flex",flexDirection:"column",maxHeight:280}}>
<div style={{padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{width:20,height:20,borderRadius:5,background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>✨</div>
<span style={{fontSize:13,fontWeight:700}}>Concierge Agent</span></div>
{aActs.length>0&&<span style={{fontSize:11,color:T.textMuted}}>{aActs.filter(a=>a.status==="done").length}/{aActs.length}</span>}</div>
<div ref={agRef} style={{padding:12,overflowY:"auto",flex:1,minHeight:80}}>
{aActs.length===0&&<div style={{textAlign:"center",color:T.textMuted,fontSize:12,padding:16}}>Listening for actionable information...</div>}
{aActs.map(a=>(
<div key={a.id} style={{marginBottom:8,display:"flex",alignItems:"flex-start",gap:8,animation:"fi .3s ease"}}>
<div style={{marginTop:1,flexShrink:0}}>{a.status==="done"?<Chk s={13}/>:<Spn s={13}/>}</div>
<div style={{fontSize:12,color:a.status==="done"?T.tealText:T.primary,fontWeight:500,lineHeight:1.5}}>{a.label}</div></div>))}</div></div>
<div style={cardS}>
<div style={{padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<span style={{fontSize:13,fontWeight:700}}>{submitted?"Work Order WO-5103":filled>0?"Work Order (Building...)":"Work Order"}</span>
{!submitted&&<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{width:80,height:6,borderRadius:3,background:T.cardBorder,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",borderRadius:3,background:pct===100?T.teal:T.primary,transition:"width 0.5s ease"}}/></div>
<span style={{fontSize:11,color:T.textMuted}}>{pct}%</span></div>}
{submitted&&<span style={{...pill(T.successBg,T.successText),fontSize:11}}><Chk s={12} c={T.tealText}/>Submitted</span>}</div>
<div style={{padding:12,maxHeight:380,overflowY:"auto"}}>
{submitted&&<div style={{background:T.successBg,borderRadius:6,padding:12,marginBottom:12,animation:"fi .4s ease"}}>
<div style={{fontSize:13,fontWeight:600,color:T.successText,marginBottom:4}}>✅ Work order submitted</div>
<div style={{fontSize:12,color:T.tealText}}>WO-5103 submitted. Confirmation sent to resident.</div></div>}
{WO_FIELDS_ORDER.map(({key,label})=>{const v=woF[key];const fl=!!v;const ed=editF===key;return(
<div key={key} style={{marginBottom:8,padding:"6px 10px",borderRadius:6,border:`1px solid ${ed?T.primary:fl?T.cardBorder:"transparent"}`,background:ed?"#F5F3FF":fl?T.cardBg:T.bodyBg,transition:"all .3s",cursor:fl&&!submitted?"pointer":"default"}} onClick={()=>{if(fl&&!submitted&&!ed)setEditF(key);}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<div style={{fontSize:10,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{label}</div>
{fl&&!submitted&&!ed&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}</div>
{ed?<input autoFocus value={v||""} onChange={e=>setWoF(p=>({...p,[key]:e.target.value}))} onBlur={()=>setEditF(null)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")setEditF(null);}} style={{width:"100%",fontSize:13,color:T.textPrimary,fontWeight:500,padding:"4px 0",border:"none",outline:"none",background:"transparent",fontFamily:T.font}}/>
:fl?<div style={{fontSize:13,color:submitted?T.textSecondary:T.textPrimary,fontWeight:500,animation:"fi .4s ease"}}>{v}</div>
:<div style={{fontSize:12,color:T.cardBorder,fontStyle:"italic"}}>Waiting for call data...</div>}
</div>);})}
</div>
{filled>0&&!submitted&&<div style={{padding:"12px 16px",borderTop:`1px solid ${T.cardBorder}`}}>
<button onClick={()=>{if(allFilled)setShowModal(true);}} disabled={!allFilled} style={{background:allFilled?T.primary:T.cardBorder,color:allFilled?"#fff":T.textMuted,border:"none",borderRadius:T.borderRadius,padding:"10px 0",fontSize:13,fontWeight:600,cursor:allFilled?"pointer":"not-allowed",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
{allFilled?"Submit Work Order":callState==="live"?"⏳ Waiting for call to end...":`⏳ ${pct}% complete...`}</button>
{allFilled&&<div style={{fontSize:11,color:T.textMuted,textAlign:"center",marginTop:6}}>Click any field to edit before submitting</div>}</div>}
</div></div></div>)}
</div></>);

const Op1=()=>(<div style={{padding:24}}>
<div style={{...cardS,padding:0,marginBottom:20,borderLeft:`4px solid ${T.primary}`,animation:"fi .4s ease",overflow:"hidden"}}>
<div style={{padding:"16px 20px",display:"flex",alignItems:"flex-start",gap:14}}>
<div style={{width:40,height:40,borderRadius:"50%",background:T.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📦</div>
<div style={{flex:1}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
<span style={{fontSize:14,fontWeight:700}}>Part Confirmed — WO-5103</span>
<span style={pill(T.infoBg,T.infoText)}>Procurement</span>
<span style={{fontSize:11,color:T.textMuted,marginLeft:"auto"}}>Just now</span></div>
<p style={{fontSize:13,color:T.textSecondary,lineHeight:1.7,margin:"0 0 8px"}}>The igniter assembly for <strong style={{color:T.textPrimary}}>WO-5103</strong> is confirmed. Estimated arrival: <strong style={{color:T.textPrimary}}>{fmt(arrivalDate)}</strong>. Resident has been notified.</p>
<div style={{fontSize:12,color:T.textMuted}}>Unit B-214 • Marcus Thompson • Rheem SP20161 Igniter Assembly</div></div></div>
<div style={{background:T.bodyBg,padding:"10px 20px",borderTop:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:12}}>
<div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.tealText}}><Chk s={14} c={T.tealText}/>Resident notified via SMS</div>
<span style={{color:T.cardBorder}}>|</span>
<span style={{fontSize:12,color:T.primary,fontWeight:500,cursor:"pointer"}}>View Work Order →</span></div></div>
<div style={cardS}>
<div style={{padding:"10px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:700}}>Tasks</span><span style={pill(T.tealBg,T.tealText)}>2113</span></div>
<div style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"8px 16px",borderBottom:`1px solid ${T.cardBorder}`,fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5}}><div/><div>Title</div><div>Priority</div><div>Status</div><div>Location</div><div>Assignee</div><div>Created</div></div>
<div style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,background:"#FEFCE8",alignItems:"center",fontSize:13}}>
<div><input type="checkbox" readOnly style={{accentColor:T.primary}}/></div>
<div><div style={{fontWeight:600,display:"flex",alignItems:"center",gap:6}}>🔥 Water Heater — No Hot Water <span style={pill(T.warningBg,T.warningText)}>Waiting for Parts</span></div><div style={{fontSize:11,color:T.textMuted}}>WO-5103 • Plumbing</div></div>
<div><span style={pill(T.dangerBg,T.dangerText)}>● High</span></div><div><span style={pill(T.warningBg,T.warningText)}>⏳ Parts</span></div>
<div style={{fontSize:12,color:T.textSecondary}}>Ridgewood Heights<br/><span style={{color:T.textMuted}}>B-214</span></div>
<div style={{fontSize:12,color:T.textMuted}}>Unassigned</div><div style={{fontSize:12,color:T.textMuted}}>{fmtShort(callDate)}</div></div>
<TR/></div></div>);

const Op2=()=>(<div style={{padding:24}}>
<div style={{...cardS,padding:0,marginBottom:20,borderLeft:`4px solid ${T.teal}`,animation:"fi .4s ease",overflow:"hidden"}}>
<div style={{padding:"16px 20px",display:"flex",alignItems:"flex-start",gap:14}}>
<div style={{width:40,height:40,borderRadius:"50%",background:T.tealBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✅</div>
<div style={{flex:1}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
<span style={{fontSize:14,fontWeight:700}}>Part Received & Tech Assigned — WO-5103</span>
<span style={pill(T.successBg,T.successText)}>Update</span>
<span style={{fontSize:11,color:T.textMuted,marginLeft:"auto"}}>Just now</span></div>
<p style={{fontSize:13,color:T.textSecondary,lineHeight:1.7,margin:"0 0 8px"}}>Igniter assembly for <strong style={{color:T.textPrimary}}>WO-5103</strong> received. Technician <strong style={{color:T.textPrimary}}>Alan</strong> assigned. Resident notified.</p>
<div style={{fontSize:12,color:T.textMuted}}>Unit B-214 • Marcus Thompson • Technician: Alan</div></div></div>
<div style={{background:T.bodyBg,padding:"10px 20px",borderTop:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:12}}>
<div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.tealText}}><Chk s={14} c={T.tealText}/>Resident notified via SMS</div>
<span style={{color:T.cardBorder}}>|</span>
<span style={{fontSize:12,color:T.primary,fontWeight:500,cursor:"pointer"}}>View Work Order →</span></div></div>
<div style={cardS}>
<div style={{padding:"10px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:700}}>Tasks</span><span style={pill(T.tealBg,T.tealText)}>2113</span></div>
<div style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"8px 16px",borderBottom:`1px solid ${T.cardBorder}`,fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5}}><div/><div>Title</div><div>Priority</div><div>Status</div><div>Location</div><div>Assignee</div><div>Created</div></div>
<div style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 100px 140px 120px 100px",padding:"12px 16px",borderBottom:`1px solid ${T.cardBorder}`,background:"#ECFDF5",alignItems:"center",fontSize:13}}>
<div><input type="checkbox" readOnly style={{accentColor:T.primary}}/></div>
<div><div style={{fontWeight:600,display:"flex",alignItems:"center",gap:6}}>🔥 Water Heater — No Hot Water <span style={pill(T.successBg,T.successText)}>Assigned</span></div><div style={{fontSize:11,color:T.textMuted}}>WO-5103 • Plumbing</div></div>
<div><span style={pill(T.dangerBg,T.dangerText)}>● High</span></div><div><span style={pill(T.successBg,T.successText)}>● Assigned</span></div>
<div style={{fontSize:12,color:T.textSecondary}}>Ridgewood Heights<br/><span style={{color:T.textMuted}}>B-214</span></div>
<div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:24,height:24,borderRadius:"50%",background:T.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:T.primary}}>A</div><span style={{fontSize:12}}>Alan</span></div>
<div style={{fontSize:12,color:T.textMuted}}>{fmtShort(callDate)}</div></div>
<TR/></div></div>);

const Res=({assigned})=>(<div style={{padding:"0 0 24px"}}>
<div style={{padding:"12px 16px 8px",display:"flex",justifyContent:"space-between"}}>
<button style={{background:"none",border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 14px",fontSize:12,color:C.textSecondary}}>Cancel</button>
<div style={{width:28,height:28,borderRadius:"50%",background:C.purpleLight,display:"flex",alignItems:"center",justifyContent:"center"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div></div>
<div style={{padding:"0 16px 8px"}}><span style={{background:assigned?C.purpleLight:C.warningBg,color:assigned?C.purple:C.warningText,padding:"4px 12px",borderRadius:4,fontSize:12,fontWeight:600}}>▶ {assigned?"Assigned":"Waiting for Parts"}</span></div>
<div style={{padding:"0 16px 4px",display:"flex",alignItems:"center",gap:10}}>
<div style={{width:36,height:36,borderRadius:8,background:C.purpleLight,display:"flex",alignItems:"center",justifyContent:"center"}}><WHIcon/></div>
<div><div style={{fontSize:20,fontWeight:700}}>Water Heater</div><div style={{fontSize:14,color:C.textSecondary}}>Ridgewood Heights</div></div></div>
<PB steps={[{label:"Received",active:true},{label:"Assigned",active:assigned},{label:"Scheduled",active:false},{label:"Resolved",active:false}]}/>
{assigned&&<div style={{padding:"0 16px 16px"}}>
<div style={{background:C.purpleBg,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:12}}>
<div style={{width:48,height:48,borderRadius:"50%",background:C.purpleMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",position:"relative"}}>A
<div style={{position:"absolute",bottom:-2,right:-2,width:16,height:16,borderRadius:"50%",background:C.purple,border:"2px solid #fff"}}/></div>
<div><div style={{fontSize:13,color:C.textSecondary}}>Your technician:</div><div style={{fontSize:17,fontWeight:700}}>Alan</div></div></div></div>}
<div style={{padding:"0 16px 16px"}}><h3 style={{fontSize:17,fontWeight:700,margin:"0 0 6px"}}>Description</h3>
<p style={{fontSize:14,color:C.textSecondary,lineHeight:1.6,margin:0}}>Water heater is not heating. Probable cause pilot assembly or igniter.</p></div>
<div style={{padding:"0 16px"}}>
<div style={{display:"flex",borderBottom:`2px solid ${C.border}`,marginBottom:16}}>
{["Messages","Activity"].map(t=><button key={t} onClick={()=>setMsgTab(t.toLowerCase())} style={{background:"none",border:"none",padding:"10px 16px",fontSize:14,fontWeight:msgTab===t.toLowerCase()?700:400,color:msgTab===t.toLowerCase()?C.textPrimary:C.textMuted,borderBottom:msgTab===t.toLowerCase()?`2px solid ${C.textPrimary}`:"2px solid transparent",cursor:"pointer",marginBottom:-2}}>{t}</button>)}</div>
{msgTab==="messages"&&<><MsgB text={`Hi Marcus! The part for your WO-5103 Water Heater has been purchased. We expect to receive it on ${fmt(arrivalDate)}. We'll send another confirmation after the part is delivered and a technician has been assigned!`} date={callDate}/>
{assigned&&<MsgB text="Hi Marcus! The part for your WO-5103 has been received. Our technician Alan will reach out to you to coordinate a time." date={arrivalDate}/>}</>}
{msgTab==="activity"&&<div style={{fontSize:13,color:C.textMuted,padding:"12px 0"}}>
{[["Work order WO-5103 created",callDate],["Part ordered — Igniter assembly",callDate],...(assigned?[["Part received — Igniter assembly",arrivalDate],["Technician Alan assigned",arrivalDate]]:[])].map(([t,d],i)=>(
<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
<div style={{width:6,height:6,borderRadius:"50%",background:C.purple,flexShrink:0}}/>
<span style={{flex:1}}>{t}</span><span style={{fontSize:11}}>{fmtTS(d)}</span></div>))}</div>}</div>
<div style={{padding:"12px 16px 0"}}>
<div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,color:C.textMuted,marginBottom:10}}>Send a message</div>
<div style={{display:"flex",justifyContent:"space-between"}}>
<button style={{background:"none",border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,color:C.textSecondary}}>Add attachment</button>
<button style={{background:C.purple,color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",fontSize:13,fontWeight:600}}>Send</button></div></div></div>);

return(<div style={{fontFamily:T.font,background:T.bodyBg,minHeight:"100vh",color:T.textPrimary}}>
<div style={{background:T.cardBg,borderBottom:`1px solid ${T.cardBorder}`,padding:"12px 24px"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
<div style={{fontSize:13,fontWeight:700}}>Maintenance Concierge — WO-5103 Flow</div>
<div style={{display:"flex",gap:8}}>
<button onClick={()=>{setStep(Math.max(0,step-1));setMsgTab("messages");}} disabled={step===0} style={{background:step===0?T.cardBorder:T.primary,color:step===0?T.textMuted:"#fff",border:"none",borderRadius:6,padding:"6px 16px",fontSize:12,fontWeight:600,cursor:step===0?"not-allowed":"pointer"}}>← Previous</button>
<button onClick={()=>{setStep(Math.min(mx,step+1));setMsgTab("messages");}} disabled={step===mx} style={{background:step===mx?T.cardBorder:T.primary,color:step===mx?T.textMuted:"#fff",border:"none",borderRadius:6,padding:"6px 16px",fontSize:12,fontWeight:600,cursor:step===mx?"not-allowed":"pointer"}}>Next →</button></div></div>
<div style={{display:"flex",gap:4}}>
{STEPS.map((s,i)=>(<button key={s.id} onClick={()=>{setStep(i);setMsgTab("messages");}} style={{flex:1,padding:"8px 8px",borderRadius:6,border:"none",cursor:"pointer",background:i===step?(s.actor==="Operator"?T.primaryLight:"#FEE2E2"):T.bodyBg,display:"flex",alignItems:"center",gap:6,transition:"all 0.2s ease"}}>
<span style={{fontSize:14}}>{s.icon}</span>
<div style={{textAlign:"left"}}><div style={{fontSize:10,fontWeight:600,color:i===step?T.primary:T.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>{s.actor}</div>
<div style={{fontSize:11,fontWeight:i===step?700:500,color:i===step?T.textPrimary:T.textSecondary,whiteSpace:"nowrap"}}>{s.label}</div></div></button>))}</div></div>

{isOp?(<><TopNav extra={liveInd}/>
<div style={{display:"flex",minHeight:"calc(100vh - 140px)"}}>
<SB nav={nav} setNav={setNav}/>
<main style={{flex:1,overflow:"auto"}}>
{step===0&&<P2/>}
{step===1&&<><div style={{background:T.cardBg,borderBottom:`1px solid ${T.cardBorder}`,padding:"14px 28px",display:"flex",alignItems:"center",gap:10}}>
<span style={{fontSize:18}}>📝</span><h1 style={{fontSize:22,fontWeight:700,margin:0}}>Tasks</h1>
<div style={pill(T.tealBg,T.tealText)}><span style={{width:6,height:6,borderRadius:"50%",background:T.teal}}/>Work Orders</div></div><Op1/></>}
{step===3&&<><div style={{background:T.cardBg,borderBottom:`1px solid ${T.cardBorder}`,padding:"14px 28px",display:"flex",alignItems:"center",gap:10}}>
<span style={{fontSize:18}}>📝</span><h1 style={{fontSize:22,fontWeight:700,margin:0}}>Tasks</h1>
<div style={pill(T.tealBg,T.tealText)}><span style={{width:6,height:6,borderRadius:"50%",background:T.teal}}/>Work Orders</div></div><Op2/></>}
</main></div></>)
:(<div style={{background:"#F3F4F6",minHeight:"calc(100vh - 90px)"}}>
{step===2&&<PF><Res assigned={false}/></PF>}
{step===4&&<PF><Res assigned={true}/></PF>}</div>)}

{showModal&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,animation:"fadeIn .2s ease"}}>
<div style={{background:T.cardBg,borderRadius:12,width:480,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",animation:"modalIn .3s ease"}}>
<div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<h3 style={{fontSize:17,fontWeight:700,margin:0}}>Submit Work Order</h3>
<button onClick={()=>setShowModal(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:20,padding:4}}>✕</button></div>
<div style={{padding:"20px 24px"}}>
<p style={{fontSize:14,color:T.textSecondary,lineHeight:1.7,margin:"0 0 20px"}}>Submit work order <strong style={{color:T.textPrimary}}>WO-5103</strong>:</p>
<div style={{background:T.bodyBg,borderRadius:8,padding:16,marginBottom:20}}>
{[["Resident",woF.resident],["Unit",woF.unit],["Category",woF.category],["Priority",woF.priority],["Asset",woF.asset],["Warranty",woF.warranty],["Part",woF.partNeeded]].map(([l,v])=>v?<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.cardBorder}`}}>
<span style={{fontSize:12,color:T.textMuted,fontWeight:600,minWidth:80}}>{l}</span>
<span style={{fontSize:12,color:T.textPrimary,fontWeight:500,textAlign:"right",flex:1,marginLeft:12}}>{v}</span></div>:null)}</div>
<div style={{background:T.primaryLight,borderRadius:8,padding:12,display:"flex",alignItems:"flex-start",gap:10}}>
<span style={{fontSize:16,flexShrink:0}}>💬</span>
<div><div style={{fontSize:12,fontWeight:600,color:T.primary,marginBottom:2}}>Resident Notification</div>
<div style={{fontSize:12,color:T.textSecondary,lineHeight:1.6}}>Marcus Thompson will receive SMS confirmation. Additional SMS sent when part arrives and technician is scheduled.</div></div></div></div>
<div style={{padding:"16px 24px 20px",borderTop:`1px solid ${T.cardBorder}`,display:"flex",justifyContent:"flex-end",gap:10}}>
<button onClick={()=>setShowModal(false)} style={{background:"none",border:`1px solid ${T.cardBorder}`,borderRadius:T.borderRadius,padding:"9px 20px",fontSize:13,fontWeight:600,color:T.textSecondary,cursor:"pointer"}}>Cancel</button>
<button onClick={()=>{setShowModal(false);setSub(true);}} style={{background:T.primary,color:"#fff",border:"none",borderRadius:T.borderRadius,padding:"9px 24px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Confirm & Submit</button></div></div></div>)}

<style>{`
@keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.85}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes ring{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
@keyframes wave{from{height:4px}to{height:20px}}
*{box-sizing:border-box}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}
button:hover{opacity:.92}
`}</style></div>);}
