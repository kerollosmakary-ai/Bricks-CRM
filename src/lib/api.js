import { supabase } from "./supabase";
export async function createLead(lead) {
    return supabase.from("leads").insert([lead]).select().single();
}
export async function getLeads(agentId) {
    return supabase
        .from("leads")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });
}
export async function updateLead(id, updates) {
    return supabase.from("leads").update(updates).eq("id", id).select().single();
}
export async function createCall(call) {
    return supabase.from("calls").insert([call]).select().single();
}
export async function getCalls(agentId) {
    return supabase
        .from("calls")
        .select("*")
        .eq("agent_id", agentId)
        .order("call_date", { ascending: false });
}
export async function getCallsByLead(leadId) {
    return supabase
        .from("calls")
        .select("*")
        .eq("lead_id", leadId)
        .order("call_date", { ascending: false });
}
export async function createAnalysis(analysis) {
    return supabase.from("call_analysis").insert([analysis]).select().single();
}
export async function getAnalysisByCall(callId) {
    return supabase
        .from("call_analysis")
        .select("*")
        .eq("call_id", callId)
        .maybeSingle();
}
export async function updateAnalysis(id, updates) {
    return supabase.from("call_analysis").update(updates).eq("id", id).select().single();
}
export async function createReminder(reminder) {
    return supabase.from("reminders").insert([reminder]).select().single();
}
export async function getReminders(agentId) {
    return supabase
        .from("reminders")
        .select("*")
        .eq("agent_id", agentId)
        .eq("completed", false)
        .order("reminder_date", { ascending: true });
}
export async function updateReminder(id, updates) {
    return supabase.from("reminders").update(updates).eq("id", id).select().single();
}
export async function analyzeTranscript(transcript, language = "ar") {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze`;
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ transcript, language }),
    });
    if (!response.ok)
        throw new Error("Analysis failed");
    return response.json();
}
