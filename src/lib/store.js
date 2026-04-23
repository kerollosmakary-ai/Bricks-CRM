import { create } from "zustand";
export const useStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    leads: [],
    setLeads: (leads) => set({ leads }),
    currentLead: null,
    setCurrentLead: (lead) => set({ currentLead: lead }),
    currentAnalysis: null,
    setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
}));
