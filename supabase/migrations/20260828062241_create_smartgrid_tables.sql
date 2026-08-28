/*
# SmartGrid Platform — Core Schema

## Overview
Creates the core tables for the SmartGrid Substation Load Optimization & Outage Analytics Platform.
This is a single-tenant (no-auth) operational dashboard, so all policies allow anon + authenticated CRUD.

## New Tables
1. `substations` — Electrical substations with capacity, location, and live readings.
2. `load_measurements` — Time-series of power/load readings per substation.
3. `alerts` — Operational alerts (overload, temperature, voltage, etc.).
4. `outages` — Outage records with cause, duration, affected consumers.
5. `predictions` — Predicted load/risk for a substation over a horizon.
6. `optimization_recommendations` — Load transfer recommendations between substations.

## Security
- RLS enabled on every table.
- Anon + authenticated CRUD allowed (single-tenant, no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS substations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  zone text NOT NULL,
  latitude double precision DEFAULT 0,
  longitude double precision DEFAULT 0,
  capacity_mw double precision NOT NULL DEFAULT 100,
  current_load_mw double precision NOT NULL DEFAULT 0,
  voltage_kv double precision DEFAULT 11.5,
  current_a double precision DEFAULT 0,
  frequency_hz double precision DEFAULT 50,
  temperature_c double precision DEFAULT 25,
  status text NOT NULL DEFAULT 'Normal',
  active boolean NOT NULL DEFAULT true,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS load_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  substation_id uuid NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  load_mw double precision NOT NULL,
  voltage_kv double precision,
  current_a double precision,
  frequency_hz double precision,
  temperature_c double precision,
  capacity_mw double precision
);
CREATE INDEX IF NOT EXISTS idx_load_meas_substation_ts ON load_measurements (substation_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  substation_id uuid REFERENCES substations(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'Warning',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts (status);

CREATE TABLE IF NOT EXISTS outages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  substation_id uuid NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration_minutes integer,
  cause text,
  affected_area text,
  affected_consumers integer DEFAULT 0,
  severity text NOT NULL DEFAULT 'Minor',
  resolution_status text NOT NULL DEFAULT 'Ongoing',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_outages_substation ON outages (substation_id);

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  substation_id uuid NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
  predicted_load_mw double precision NOT NULL,
  capacity_mw double precision NOT NULL,
  predicted_utilization double precision NOT NULL,
  risk_level text NOT NULL DEFAULT 'LOW',
  horizon_minutes integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_predictions_substation ON predictions (substation_id);

CREATE TABLE IF NOT EXISTS optimization_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_substation_id uuid NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
  destination_substation_id uuid NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
  transfer_mw double precision NOT NULL,
  source_utilization double precision,
  destination_utilization double precision,
  expected_source_utilization double precision,
  expected_destination_utilization double precision,
  reason text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE substations ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outages ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- Substations policies
DROP POLICY IF EXISTS "anon_select_substations" ON substations;
CREATE POLICY "anon_select_substations" ON substations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_substations" ON substations;
CREATE POLICY "anon_insert_substations" ON substations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_substations" ON substations;
CREATE POLICY "anon_update_substations" ON substations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_substations" ON substations;
CREATE POLICY "anon_delete_substations" ON substations FOR DELETE TO anon, authenticated USING (true);

-- Load measurements policies
DROP POLICY IF EXISTS "anon_select_load_measurements" ON load_measurements;
CREATE POLICY "anon_select_load_measurements" ON load_measurements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_load_measurements" ON load_measurements;
CREATE POLICY "anon_insert_load_measurements" ON load_measurements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_load_measurements" ON load_measurements;
CREATE POLICY "anon_update_load_measurements" ON load_measurements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_load_measurements" ON load_measurements;
CREATE POLICY "anon_delete_load_measurements" ON load_measurements FOR DELETE TO anon, authenticated USING (true);

-- Alerts policies
DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
CREATE POLICY "anon_select_alerts" ON alerts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
CREATE POLICY "anon_insert_alerts" ON alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
CREATE POLICY "anon_update_alerts" ON alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;
CREATE POLICY "anon_delete_alerts" ON alerts FOR DELETE TO anon, authenticated USING (true);

-- Outages policies
DROP POLICY IF EXISTS "anon_select_outages" ON outages;
CREATE POLICY "anon_select_outages" ON outages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_outages" ON outages;
CREATE POLICY "anon_insert_outages" ON outages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_outages" ON outages;
CREATE POLICY "anon_update_outages" ON outages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_outages" ON outages;
CREATE POLICY "anon_delete_outages" ON outages FOR DELETE TO anon, authenticated USING (true);

-- Predictions policies
DROP POLICY IF EXISTS "anon_select_predictions" ON predictions;
CREATE POLICY "anon_select_predictions" ON predictions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
CREATE POLICY "anon_insert_predictions" ON predictions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_predictions" ON predictions;
CREATE POLICY "anon_update_predictions" ON predictions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_predictions" ON predictions;
CREATE POLICY "anon_delete_predictions" ON predictions FOR DELETE TO anon, authenticated USING (true);

-- Optimization recommendations policies
DROP POLICY IF EXISTS "anon_select_recommendations" ON optimization_recommendations;
CREATE POLICY "anon_select_recommendations" ON optimization_recommendations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_recommendations" ON optimization_recommendations;
CREATE POLICY "anon_insert_recommendations" ON optimization_recommendations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_recommendations" ON optimization_recommendations;
CREATE POLICY "anon_update_recommendations" ON optimization_recommendations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_recommendations" ON optimization_recommendations;
CREATE POLICY "anon_delete_recommendations" ON optimization_recommendations FOR DELETE TO anon, authenticated USING (true);