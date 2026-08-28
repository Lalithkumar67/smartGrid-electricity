import { useParams, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, Thermometer, Zap, Gauge, Activity, AlertTriangle, Clock3, MapPin } from 'lucide-react';
import { useAlerts, useOutages, usePredictions, useRecommendations, useSubstations } from '../hooks';
import { statusClass } from '../types';
import { ErrorState, LoadingState, PanelHeader } from '../components/ui';

export function SubstationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { substations, loading: sl } = useSubstations();
  const { alerts, loading: al } = useAlerts();
  const { outages, loading: ol } = useOutages();
  const { predictions, loading: pl } = usePredictions();
  const { recommendations, loading: rl } = useRecommendations();

  if (sl || al || ol || pl || rl) return <LoadingState />;

  const substation = substations.find(s => s.id === id);
  if (!substation) return <ErrorState message="Substation not found" />;

  const subAlerts = alerts.filter(a => a.substation_id === id);
  const subOutages = outages.filter(o => o.substation_id === id);
  const subPredictions = predictions.filter(p => p.substation_id === id);
  const subRecs = recommendations.filter(r => r.source_substation_id === id || r.destination_substation_id === id);

  const pct = substation.load_percentage;
  const trendData = Array.from({ length: 24 }, (_, i) => {
    const base = substation.current_load_mw;
    const variation = Math.sin(i / 3) * 15 + Math.cos(i / 5) * 8;
    return Math.max(0, base - (24 - i) * 0.5 + variation);
  });

  return (
    <div className="page-wrap">
      <button className="text-button" onClick={() => navigate('/substations')} style={{ marginBottom: 16 }}><ChevronLeft size={15} /> Back to substations</button>

      <section className="page-heading">
        <div>
          <div className="eyebrow"><span className="pulse-dot" /> SUBSTATION DETAIL</div>
          <h1>{substation.name}</h1>
          <p>{substation.code} · {substation.zone} · <MapPin size={12} style={{ display: 'inline' }} /> {substation.latitude.toFixed(4)}, {substation.longitude.toFixed(4)}</p>
        </div>
        <div className="heading-actions">
          <div className="last-updated"><Clock3 size={14} /> Last updated <strong>{new Date(substation.last_updated).toLocaleTimeString()}</strong></div>
          <span className={`status-pill ${statusClass(substation.status)}`} style={{ fontSize: 11, padding: '6px 12px' }}><i />{substation.status}</span>
        </div>
      </section>

      <section className="metric-grid">
        <DetailMetric label="Current load" value={`${substation.current_load_mw} MW`} icon={<Zap size={17} />} tone="teal" />
        <DetailMetric label="Capacity" value={`${substation.capacity_mw} MW`} icon={<Gauge size={17} />} tone="blue" />
        <DetailMetric label="Utilization" value={`${pct}%`} icon={<Activity size={17} />} tone={pct > 100 ? 'orange' : 'green'} />
        <DetailMetric label="Temperature" value={`${substation.temperature_c}°C`} icon={<Thermometer size={17} />} tone={substation.temperature_c > 80 ? 'orange' : 'green'} />
        <DetailMetric label="Voltage" value={`${substation.voltage_kv} kV`} icon={<Zap size={17} />} tone="blue" />
        <DetailMetric label="Frequency" value={`${substation.frequency_hz} Hz`} icon={<Activity size={17} />} tone="teal" />
      </section>

      <section className="dashboard-grid">
        <div className="panel load-panel">
          <PanelHeader title="Historical load" subtitle="Last 24 hours of measurements" />
          <div className="chart-legend"><span><i className="legend-line actual" />Load (MW)</span><span className="chart-unit">MW</span></div>
          <div className="line-chart">
            <div className="y-axis"><span>{substation.capacity_mw}</span><span>{(substation.capacity_mw * 0.75).toFixed(0)}</span><span>{(substation.capacity_mw * 0.5).toFixed(0)}</span><span>{(substation.capacity_mw * 0.25).toFixed(0)}</span><span>0</span></div>
            <div className="chart-area">
              <div className="grid-lines"><i /><i /><i /><i /><i /></div>
              <svg viewBox="0 0 700 250" preserveAspectRatio="none">
                <path className="chart-area-fill" d={buildPath(trendData, true)} />
                <path className="chart-line" d={buildPath(trendData, false)} />
              </svg>
              <div className="x-axis"><span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span><span>Now</span></div>
            </div>
          </div>
        </div>

        <div className="panel health-panel">
          <PanelHeader title="Predicted load" subtitle="Next 30 minutes" />
          {subPredictions.length > 0 ? (
            <div style={{ padding: '20px' }}>
              <div className="health-score">
                <div className="score-ring" style={{ background: `conic-gradient(${subPredictions[0].risk_level === 'HIGH' ? '#cb5d61' : subPredictions[0].risk_level === 'MEDIUM' ? '#db9f63' : '#55ad96'} 0 ${subPredictions[0].predicted_utilization}deg, #e4eff0 ${subPredictions[0].predicted_utilization}deg 360deg)` }}>
                  <div><strong>{subPredictions[0].predicted_utilization.toFixed(0)}</strong><span>%</span></div>
                </div>
                <div>
                  <span className="healthy-label" style={{ color: subPredictions[0].risk_level === 'HIGH' ? '#cb5d61' : subPredictions[0].risk_level === 'MEDIUM' ? '#db9f63' : '#55ad96' }}>
                    <i className="pulse-dot" style={{ background: subPredictions[0].risk_level === 'HIGH' ? '#cb5d61' : '#55ad96' }} /> {subPredictions[0].risk_level} RISK
                  </span>
                  <p>Predicted load: <strong>{subPredictions[0].predicted_load_mw} MW</strong> in {subPredictions[0].horizon_minutes} min</p>
                </div>
              </div>
            </div>
          ) : <div style={{ padding: 20, color: '#9aa9af', fontSize: 11 }}>No predictions available</div>}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel alerts-panel">
          <PanelHeader title="Alerts" subtitle={`${subAlerts.length} alerts for this substation`} />
          <div className="attention-list">
            {subAlerts.length > 0 ? subAlerts.map(a => (
              <div className="attention-row" key={a.id}>
                <div className={`attention-icon ${a.severity === 'Critical' ? 'red' : 'orange'}`}><AlertTriangle size={17} /></div>
                <div className="attention-copy"><strong>{a.alert_type}</strong><span>{a.message}</span></div>
                <time>{a.status}</time>
              </div>
            )) : <div style={{ padding: 20, color: '#9aa9af', fontSize: 11 }}>No alerts</div>}
          </div>
        </div>
        <div className="panel activity-panel">
          <PanelHeader title="Outage history" subtitle={`${subOutages.length} outages recorded`} />
          <div className="activity-list">
            {subOutages.length > 0 ? subOutages.slice(0, 5).map(o => (
              <div className="activity-row" key={o.id}>
                <div className={`activity-icon ${o.severity === 'Major' ? 'blue' : 'teal'}`}><AlertTriangle size={15} /></div>
                <div><strong>{o.cause}</strong><span>{o.duration_minutes} min · {o.affected_consumers} consumers</span></div>
                <time>{new Date(o.start_time).toLocaleDateString()}</time>
              </div>
            )) : <div style={{ padding: 20, color: '#9aa9af', fontSize: 11 }}>No outages recorded</div>}
          </div>
        </div>
      </section>

      {subRecs.length > 0 && (
        <section className="panel" style={{ marginTop: 17 }}>
          <PanelHeader title="Optimization recommendations" subtitle="Load transfer suggestions" />
          <div className="table-wrap">
            <table>
              <thead><tr><th>SOURCE</th><th>DESTINATION</th><th>TRANSFER</th><th>STATUS</th><th>REASON</th></tr></thead>
              <tbody>
                {subRecs.map(r => (
                  <tr key={r.id}>
                    <td><strong>{substations.find(s => s.id === r.source_substation_id)?.name || '—'}</strong></td>
                    <td><strong>{substations.find(s => s.id === r.destination_substation_id)?.name || '—'}</strong></td>
                    <td>{r.transfer_mw} MW</td>
                    <td><span className="status-pill status-warning"><i />{r.status}</span></td>
                    <td>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function DetailMetric({ label, value, icon, tone }: { label: string; value: string; icon: any; tone: string }) {
  return (
    <div className="metric-card">
      <div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}>{icon}</span></div>
      <div className="metric-value" style={{ fontSize: 20 }}>{value}</div>
    </div>
  );
}

function buildPath(data: number[], fill: boolean): string {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 700;
    const y = 250 - (v / max) * 220;
    return `${x} ${y}`;
  });
  let path = `M${points[0]}`;
  for (let i = 1; i < points.length; i++) path += ` L${points[i]}`;
  if (fill) path += ' L700 250 L0 250 Z';
  return path;
}
