import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Substation, SubstationWithMeta, Alert, Outage, Prediction, Recommendation } from '../types';
import { computeStatus } from '../types';

function withMeta(s: Substation): SubstationWithMeta {
  const pct = s.capacity_mw > 0 ? (s.current_load_mw / s.capacity_mw) * 100 : 0;
  return { ...s, load_percentage: Math.round(pct) };
}

export function useSubstations() {
  const [substations, setSubstations] = useState<SubstationWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from('substations').select('*').order('name');
      if (!active) return;
      if (error) { setError(error.message); setLoading(false); return; }
      setSubstations((data || []).map(withMeta));
      setLoading(false);
    };
    load();
    const channel = supabase.channel('substations').on('postgres_changes', { event: '*', schema: 'public', table: 'substations' }, () => load()).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return { substations, loading, error };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
      if (!active) return;
      if (error) { setError(error.message); setLoading(false); return; }
      setAlerts(data || []);
      setLoading(false);
    };
    load();
    const channel = supabase.channel('alerts').on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => load()).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return { alerts, loading, error };
}

export function useOutages() {
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from('outages').select('*').order('start_time', { ascending: false });
      if (!active) return;
      if (error) { setError(error.message); setLoading(false); return; }
      setOutages(data || []);
      setLoading(false);
    };
    load();
    const channel = supabase.channel('outages').on('postgres_changes', { event: '*', schema: 'public', table: 'outages' }, () => load()).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return { outages, loading, error };
}

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from('predictions').select('*').order('created_at', { ascending: false });
      if (!active) return;
      if (error) { setError(error.message); setLoading(false); return; }
      setPredictions(data || []);
      setLoading(false);
    };
    load();
    const channel = supabase.channel('predictions').on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, () => load()).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return { predictions, loading, error };
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from('optimization_recommendations').select('*').order('created_at', { ascending: false });
      if (!active) return;
      if (error) { setError(error.message); setLoading(false); return; }
      setRecommendations(data || []);
      setLoading(false);
    };
    load();
    const channel = supabase.channel('recommendations').on('postgres_changes', { event: '*', schema: 'public', table: 'optimization_recommendations' }, () => load()).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return { recommendations, loading, error };
}

export async function acknowledgeAlert(id: string) {
  return supabase.from('alerts').update({ status: 'Acknowledged', acknowledged_at: new Date().toISOString() }).eq('id', id);
}

export async function resolveAlert(id: string) {
  return supabase.from('alerts').update({ status: 'Resolved', resolved_at: new Date().toISOString() }).eq('id', id);
}

export async function createSubstation(payload: Partial<Substation>) {
  const status = payload.capacity_mw && payload.current_load_mw ? computeStatus((payload.current_load_mw / payload.capacity_mw) * 100) : 'Normal';
  return supabase.from('substations').insert([{ ...payload, status, last_updated: new Date().toISOString() }]);
}

export async function updateSubstation(id: string, payload: Partial<Substation>) {
  let status = payload.status;
  if (payload.capacity_mw && payload.current_load_mw) {
    status = computeStatus((payload.current_load_mw / payload.capacity_mw) * 100);
  }
  return supabase.from('substations').update({ ...payload, status, last_updated: new Date().toISOString() }).eq('id', id);
}

export async function deleteSubstation(id: string) {
  return supabase.from('substations').delete().eq('id', id);
}

export async function createOutage(payload: Partial<Outage>) {
  return supabase.from('outages').insert([payload]);
}

export async function updateRecommendationStatus(id: string, status: string) {
  return supabase.from('optimization_recommendations').update({ status }).eq('id', id);
}
