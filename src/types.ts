export type Status = 'Normal' | 'Warning' | 'High Load' | 'Overloaded';

export interface Substation {
  id: string;
  code: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  capacity_mw: number;
  current_load_mw: number;
  voltage_kv: number;
  current_a: number;
  frequency_hz: number;
  temperature_c: number;
  status: string;
  active: boolean;
  last_updated: string;
  created_at: string;
}

export interface Alert {
  id: string;
  substation_id: string | null;
  alert_type: string;
  severity: string;
  message: string;
  status: string;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

export interface Outage {
  id: string;
  substation_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  cause: string | null;
  affected_area: string | null;
  affected_consumers: number;
  severity: string;
  resolution_status: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  substation_id: string;
  predicted_load_mw: number;
  capacity_mw: number;
  predicted_utilization: number;
  risk_level: string;
  horizon_minutes: number;
  created_at: string;
}

export interface Recommendation {
  id: string;
  source_substation_id: string;
  destination_substation_id: string;
  transfer_mw: number;
  source_utilization: number | null;
  destination_utilization: number | null;
  expected_source_utilization: number | null;
  expected_destination_utilization: number | null;
  reason: string | null;
  status: string;
  created_at: string;
}

export interface SubstationWithMeta extends Substation {
  load_percentage: number;
}

export function computeStatus(loadPct: number): Status {
  if (loadPct > 100) return 'Overloaded';
  if (loadPct >= 90) return 'High Load';
  if (loadPct >= 70) return 'Warning';
  return 'Normal';
}

export function statusClass(status: string): string {
  return {
    Normal: 'status-normal',
    Warning: 'status-warning',
    'High Load': 'status-high',
    Overloaded: 'status-overloaded',
  }[status] || 'status-normal';
}
