/**
 * Work Order fields — progressively filled by the Concierge Agent
 * during the live call simulation.
 */

export const WO_FIELDS = [
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
  { key: "tech", label: "Technician" },
  { key: "workOrder", label: "Work Order" },
  { key: "sms", label: "Resident Notification" },
] as const;

export type WOFieldKey = (typeof WO_FIELDS)[number]["key"];
export type WOFieldMap = Partial<Record<WOFieldKey, string>>;
