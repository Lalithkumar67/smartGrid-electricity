import { useState } from 'react';
import { AlertTriangle, Check, Clock3, Thermometer, Zap, Activity, LineChart } from 'lucide-react';
import { acknowledgeAlert, resolveAlert, useAlerts, useSubstations } from '../hooks';
import { ErrorState, LoadingState, MetricCard, PageHeading, PanelHeader } from '../components/ui';

export function AlertsPage() {
  const { alerts, loading, error } = useAlerts();
  const { substations } = useSubstations();
  const [filter, setFilter] = useState('all');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const active = alerts.filter(a => a.status === 'Active').length;
  const acknowledged = alerts.filter(a => a.status === 'Acknowledged').length;
  const resolved = alerts.filter(a => a.status === 'Resolved').length;
  const critical = alerts.filter(a => a.severity === 'Critical').length;

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

  const iconFor = (type: string) => {
    if (type.includes('Overload')) return <Zap size={17} />;
    if (type.includes('Temperature')) return <Thermometer size={17} />;
    if (type.includes('Voltage')) return <Activity size={17} />;
    if (type.includes('Predict')) return <LineChart size={17} />;
    return <AlertTriangle size={17} />;
  };
  const toneFor = (severity: string) => severity === 'Critical' ? 'red' : severity === 'High' ? 'orange' : 'blue';

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="ALERT MANAGEMENT" title="Alerts" subtitle="Monitor and manage operational alerts"
        actions={<div className="last-updated"><Clock3 size={14} /> {active} active alerts</div>} />

      <section className="metric-grid">
        <MetricCard label="Active" value={String(active)} meta="Needs attention" icon={<AlertTriangle size={17} />} tone="orange" />
        <MetricCard label="Acknowledged" value={String(acknowledged)} meta="Being reviewed" icon={<Check size={17} />} tone="blue" />
        <MetricCard label="Resolved" value={String(resolved)} meta="Closed alerts" icon={<Check size={17} />} tone="green" />
        <MetricCard label="Critical" value={String(critical)} meta="High severity" icon={<AlertTriangle size={17} />} tone="orange" />
      </section>

      <section className="panel stations-panel">
        <PanelHeader title="All alerts" subtitle={`${filtered.length} alerts`}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'Active', 'Acknowledged', 'Resolved'].map(f => (
                <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          } />
        <div className="attention-list" style={{ padding: '15px 19px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9aa9af', fontSize: 11 }}>No alerts in this category</div>
          ) : filtered.map(a => {
            const sub = substations.find(s => s.id === a.substation_id);
            return (
              <div className="attention-row" key={a.id}>
                <div className={`attention-icon ${toneFor(a.severity)}`}>{iconFor(a.alert_type)}</div>
                <div className="attention-copy">
                  <strong>{sub?.name || 'System'} · {a.alert_type}</strong>
                  <span>{a.message}</span>
                </div>
                <time>{new Date(a.created_at).toLocaleString()}</time>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`status-pill ${a.status === 'Active' ? 'status-overloaded' : a.status === 'Acknowledged' ? 'status-high' : 'status-normal'}`}><i />{a.status}</span>
                  {a.status === 'Active' && <button className="ack-button" onClick={() => acknowledgeAlert(a.id)}>Ack</button>}
                  {a.status === 'Acknowledged' && <button className="ack-button" onClick={() => resolveAlert(a.id)}><Check size={14} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
