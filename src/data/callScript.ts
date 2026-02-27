/**
 * Simulated call script for the Maintenance Concierge demo.
 *
 * Source: Simulated_Call_Script.md
 * Scenario: Marcus Thompson (Unit B-214, Ridgewood Heights) calls about
 *           a broken water heater — no hot water since last night,
 *           clicking noise, Rheem gas unit under warranty.
 *
 * Each line has:
 *   - speaker: "agent" | "resident"
 *   - text: the dialogue
 *   - at: milliseconds from call start
 *   - triggers: (optional) agent enrichment actions fired by this line
 */

export const CALL_SCRIPT = [
  {
    speaker: "agent",
    text: "Happy Force maintenance line, this is Jennifer. How can I help you today?",
    at: 0,
  },
  {
    speaker: "resident",
    text: "Hi, this is Marcus Thompson. I'm in unit B-214 at Ridgewood Heights.",
    at: 3000,
    triggers: [
      { type: "lookup", label: "Searching resident database...", field: "resident", value: "Marcus Thompson" },
      { type: "lookup", label: "Pulling unit profile for B-214...", field: "unit", value: "B-214, Building B, Floor 2" },
      { type: "lookup", label: "Loading unit inventory...", field: "inventory", value: "5 tracked assets" },
      { type: "lookup", label: "Pulling lease & resident history...", field: "lease", value: "Active — expires 03/2025, 3 prior WOs (all resolved)" },
    ],
  },
  {
    speaker: "agent",
    text: "Hi Marcus, I've got your unit pulled up. What's going on?",
    at: 9000,
  },
  {
    speaker: "resident",
    text: "I have no hot water. It's been out since last night.",
    at: 12000,
    triggers: [
      { type: "classify", label: "Classifying: Plumbing → Water Heater → No Hot Water", field: "category", value: "Plumbing — Water Heater" },
      { type: "priority", label: "Urgency assessment: HIGH (essential utility, 12+ hours)", field: "priority", value: "High" },
    ],
  },
  {
    speaker: "resident",
    text: "The water heater is making a clicking noise but nothing's heating up.",
    at: 16000,
    triggers: [
      { type: "lookup", label: "Matching symptom to unit inventory...", field: "asset", value: "Rheem PROG50-38N RH67 (gas, installed 06/2019)" },
      { type: "lookup", label: "Checking warranty — Rheem PROG50-38N...", field: "warranty", value: "✓ Active until 06/2029 — Parts & Labor" },
      { type: "ai", label: "JoyAI: 'Clicking + no heat' on gas Rheem → likely pilot/igniter issue.", field: "diagnosis", value: "Probable pilot assembly or igniter — 45 min avg repair" },
    ],
  },
  {
    speaker: "agent",
    text: "I'm sorry about that, Marcus. Let me get someone out to you. It looks like it might be an igniter assembly issue. We will order the part first. Once we receive the part, a technician will reach out to schedule a time with you.",
    at: 22000,
    triggers: [
      { type: "schedule", label: "Identifying required part: Igniter assembly for Rheem PROG50...", field: "partNeeded", value: "Rheem SP20161 Igniter Assembly — ordering" },
      { type: "schedule", label: "Finding plumbing-certified techs with Rheem experience...", field: "tech", value: "David Morales — available once part arrives" },
    ],
  },
  { speaker: "resident", text: "Ok. Sounds good.", at: 25000 },
  {
    speaker: "resident",
    text: "I'm not sure if it's gas or electric, by the way.",
    at: 28000,
    triggers: [
      { type: "ai", label: "Unit inventory confirms: Gas water heater (Rheem PROG50 = natural gas)", field: "fuelType", value: "Confirmed: Natural Gas" },
    ],
  },
  {
    speaker: "agent",
    text: "No worries — I can see from your unit records it's a gas unit, a Rheem model. And great news, it's still under warranty so there won't be any charge.",
    at: 31000,
  },
  { speaker: "resident", text: "Oh that's great, thank you.", at: 36000 },
  {
    speaker: "agent",
    text: "I'm going to get a work order submitted for you right now. Once we get the part and a technician, you will receive a confirmation.",
    at: 38000,
    triggers: [
      { type: "draft", label: "Pre-drafting work order with all enriched fields...", field: "workOrder", value: "WO-5103 — Ready for review" },
      { type: "draft", label: "Preparing resident notification template...", field: "sms", value: "Template ready — will send on tech confirmation" },
    ],
  },
  { speaker: "resident", text: "Sounds good. Thanks so much, Jennifer.", at: 44000 },
  {
    speaker: "agent",
    text: "You're welcome, Marcus. We'll get this taken care of for you. Have a great day!",
    at: 46000,
  },
];

export const CALL_DURATION = 48000;
