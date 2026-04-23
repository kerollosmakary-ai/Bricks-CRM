import { supabase } from "./supabase";
import { Lead } from "./store";

export async function createLead(lead: Omit<Lead, "id" | "created_at">) {
  return supabase.from("leads").insert([lead]).select().single();
}

export async function getLeads(agentId: string) {
  return supabase
    .from("leads")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  return supabase.from("leads").update(updates).eq("id", id).select().single();
}

export async function createCall(call: any) {
  return supabase.from("calls").insert([call]).select().single();
}

export async function getCalls(agentId: string) {
  return supabase
    .from("calls")
    .select("*")
    .eq("agent_id", agentId)
    .order("call_date", { ascending: false });
}

export async function getCallsByLead(leadId: string) {
  return supabase
    .from("calls")
    .select("*")
    .eq("lead_id", leadId)
    .order("call_date", { ascending: false });
}

export async function createAnalysis(analysis: any) {
  return supabase.from("call_analysis").insert([analysis]).select().single();
}

export async function getAnalysisByCall(callId: string) {
  return supabase
    .from("call_analysis")
    .select("*")
    .eq("call_id", callId)
    .maybeSingle();
}

export async function updateAnalysis(id: string, updates: any) {
  return supabase.from("call_analysis").update(updates).eq("id", id).select().single();
}

export async function createReminder(reminder: any) {
  return supabase.from("reminders").insert([reminder]).select().single();
}

export async function getReminders(agentId: string) {
  return supabase
    .from("reminders")
    .select("*")
    .eq("agent_id", agentId)
    .eq("completed", false)
    .order("reminder_date", { ascending: true });
}

export async function updateReminder(id: string, updates: any) {
  return supabase.from("reminders").update(updates).eq("id", id).select().single();
}

export async function analyzeTranscript(transcript: string, language: string = "ar") {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ transcript, language }),
  });

  if (!response.ok) throw new Error("Analysis failed");
  return response.json();
}
