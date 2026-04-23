import { create } from "zustand";

export interface User {
  id: string;
  email: string;
}

export interface Lead {
  id: string;
  agent_id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  property_type?: string;
  budget_range?: string;
  status: string;
  language: string;
  created_at: string;
}

export interface CallAnalysis {
  id: string;
  call_id: string;
  suggested_sentiment: string;
  suggested_summary: string;
  suggested_summary_ar: string;
  suggested_next_action: string;
  suggested_reminder_days: number;
  keywords_matched: string[];
}

interface AppStore {
  user: User | null;
  setUser: (user: User | null) => void;
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  currentLead: Lead | null;
  setCurrentLead: (lead: Lead | null) => void;
  currentAnalysis: CallAnalysis | null;
  setCurrentAnalysis: (analysis: CallAnalysis | null) => void;
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  leads: [],
  setLeads: (leads) => set({ leads }),
  currentLead: null,
  setCurrentLead: (lead) => set({ currentLead: lead }),
  currentAnalysis: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
}));
