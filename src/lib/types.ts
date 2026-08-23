// Shared types for নেকির ঝুড়ি data models

export type Urgency = "critical" | "high" | "normal";
export type NeedCategory =
  | "madrasa"
  | "student"
  | "medical"
  | "family"
  | "emergency"
  | "general";

export interface UmmahNeed {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: NeedCategory;
  location: string | null;
  targetAmount: number;
  raisedAmount: number;
  image: string | null;
  urgency: Urgency;
  beneficiary: string | null;
  status: string;
  createdAt: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  date: string;
  title: string;
  description: string;
  image: string | null;
  collectedAmount: number;
  neededAmount: number;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string | null;
  status: string;
  targetAmount: number;
  raisedAmount: number;
  featuredImage: string | null;
  startDate: string;
  updates: ProjectUpdate[];
}

export type FixedProjectType =
  | "madrasha"
  | "moktob"
  | "orphanage"
  | "clinic"
  | "mosque";

export interface FixedProject {
  id: string;
  name: string;
  type: FixedProjectType;
  description: string;
  location: string | null;
  beneficiaries: number;
  monthlyCost: number;
  establishedAt: string | null;
  image: string | null;
  isActive: boolean;
}

export interface RevenueModule {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  funnelPercent: number;
  order: number;
}

// ---------- Helpers ----------
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function percent(raised: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
}

export const URGENCY_LABEL: Record<Urgency, string> = {
  critical: "জরুরি",
  high: "গুরুত্বপূর্ণ",
  normal: "সাধারণ",
};

export const CATEGORY_LABEL: Record<NeedCategory, string> = {
  madrasa: "মাদরাসা",
  student: "ছাত্র",
  medical: "চিকিৎসা",
  family: "পরিবার",
  emergency: "জরুরি ত্রাণ",
  general: "সাধারণ",
};

export const FIXED_TYPE_LABEL: Record<FixedProjectType, string> = {
  madrasha: "মাদরাসা",
  moktob: "মক্তব",
  orphanage: "এতিমখানা",
  clinic: "ক্লিনিক",
  mosque: "মসজিদ",
};
