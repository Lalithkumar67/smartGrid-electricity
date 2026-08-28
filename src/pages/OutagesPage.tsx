import { useState } from 'react';
import { AlertTriangle, Clock3, Gauge, Plus, X } from 'lucide-react';
import { createOutage, useOutages, useSubstations } from '../hooks';
import { ErrorState, LoadingState, MetricCard, PageHeading, PanelHeader } from '../components/ui';

export function OutagesPage() {
  const { outages, loading, error } = useOutages();
  const { substations } = useSubstations();
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const total = outages.length;
  const avgDuration = total > 0 ? (outages.reduce((s, o) => s + (o.duration_minutes || 0), 0) / total).toFixed(0) : '0';
  const totalConsumers = outages.reduce((s, o) => s + o.affected_consumers, 0);
  const major = outages.filter(o => o.severity === 'Major').length;

  const filtered = filter === 'all' ? outages : outages.filter(o => o.severity === filter);

  const byCause: Record<string, number> = {};
  outages.forEach(o => { if (o.cause) byCause[o.cause] = (byCause[o.cause] || 0) + 1; });

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="OUTAGE ANALYTICS" title="Outage Analytics" subtitle="Historical outage records and analysis"
        actions={<button className="primary-button" onClick={() => setShowModal(true)}><Plus size={15} /> Log outage</button>} />

      <section className="metric-grid">
        <MetricCard label="Total outages" value={String(total)} meta="All time" icon={<AlertTriangle size={17} />} tone="blue" />
        <MetricCard label="Avg duration" value={avgDuration} unit="min" meta="Mean time to restore" icon={<Clock3 size={17} />} tone="teal" />
        <MetricCard label="Consumer impact" value={totalConsumers.toLocaleString()} meta="Total affected" icon={<Gauge size={17} />} tone="orange" />
        <MetricCard label="Major outages" value={String(major)} meta="Severity classification" icon={<AlertTriangle size={17} />} tone="green" />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <PanelHeader title="Outages by cause" subtitle="Root cause distribution" />
          <div style={{ padding: 20, display: 'grid', gap: 14 }}>
            {Object.entries(byCause).map(([cause, count]) => (
              <div key={cause}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: '#728790' }}>{cause}</span>
                  <strong>{count}</strong>
                </div>
                <div className="util-track" style={{ width: '100%', height: 8 }}>
                  <span className="status-high" style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <PanelHeader title="Outages by substation" subtitle="Most failure-prone substations" />
          <div style={{ padding: 20, display: 'grid', gap: 14 }}>
            {substations.map(s => {
              const count = outages.filter(o => o.substation_id === s.id).length;
              if (count === 0) return null;
              return (
                <div key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                    <span style={{ color: '#728790' }}>{s.name}</span>
                    <strong>{count} outages</strong>
                  </div>
                  <div className="util-track" style={{ width: '100%', height: 8 }}>
                    <span className="status-warning" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel stations-panel">
        <PanelHeader title="Outage records" subtitle={`${filtered.length} outages`}
          action={
            <select className="outline-button" style={{ height: 29, fontSize: 10 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All severities</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          } />
        <div className="table-wrap">
          <table>
            <thead><tr><th>SUBSTATION</th><th>START</th><th>DURATION</th><th>CAUSE</th><th>AFFECTED AREA</th><th>CONSUMERS</th><th>SEVERITY</th><th>STATUS</th></tr></thead>
            <tbody>
              {filtered.map(o => {
                const sub = substations.find(s => s.id === o.substation_id);
                return (
                  <tr key={o.id}>
                    <td><div className="station-name"><span className="station-icon"><AlertTriangle size={14} /></span><div><strong>{sub?.name || '—'}</strong><small>{sub?.code || ''}</small></div></div></td>
                    <td>{new Date(o.start_time).toLocaleString()}</td>
                    <td>{o.duration_minutes || '—'} min</td>
                    <td>{o.cause || '—'}</td>
                    <td>{o.affected_area || '—'}</td>
                    <td>{o.affected_consumers.toLocaleString()}</td>
                    <td><span className={`status-pill ${o.severity === 'Major' ? 'status-overloaded' : 'status-normal'}`}><i />{o.severity}</span></td>
                    <td>{o.resolution_status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && <OutageModal substations={substations} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function OutageModal({ substations, onClose }: { substations: any[]; onClose: () => void }) {
  const [form, setForm] = useState({ substation_id: substations[0]?.id || '', cause: '', affected_area: '', affected_consumers: 0, severity: 'Minor' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await createOutage({ ...form, start_time: new Date().toISOString(), resolution_status: 'Ongoing' } as any);
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Log outage</h2><button className="mobile-close" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="form-grid">
            <label className="form-field"><span>Substation</span>
              <select value={form.substation_id} onChange={e => setForm({ ...form, substation_id: e.target.value })}>
                {substations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="form-field"><span>Cause</span><input value={form.cause} onChange={e => setForm({ ...form, cause: e.target.value })} /></label>
            <label className="form-field"><span>Affected area</span><input value={form.affected_area} onChange={e => setForm({ ...form, affected_area: e.target.value })} /></label>
            <label className="form-field"><span>Affected consumers</span><input type="number" value={form.affected_consumers} onChange={e => setForm({ ...form, affected_consumers: +e.target.value })} /></label>
            <label className="form-field"><span>Severity</span>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                <option>Minor</option><option>Major</option>
              </select>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="outline-button" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="primary-button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Log outage'}</button>
        </div>
      </div>
    </div>
  );
}
