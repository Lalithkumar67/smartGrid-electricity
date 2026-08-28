import { Activity, Gauge, Thermometer, Zap, AlertTriangle, ArrowUpRight, Clock3 } from 'lucide-react';
import { useAlerts, useSubstations } from '../hooks';
import { statusClass } from '../types';
import { ErrorState, HealthBar, LoadingState, MetricCard, PageHeading, PanelHeader } from '../components/ui';

export function MonitoringPage() {
  const { substations, loading, error } = useSubstations();
  const { alerts } = useAlerts();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const totalDemand = substations.reduce((s, st) => s + st.current_load_mw, 0);
  const totalCapacity = substations.reduce((s, st) => s + st.capacity_mw, 0);
  const avgVoltage = (substations.reduce((s, st) => s + st.voltage_kv, 0) / substations.length).toFixed(1);
  const avgFreq = (substations.reduce((s, st) => s + st.frequency_hz, 0) / substations.length).toFixed(2);
  const avgTemp = (substations.reduce((s, st) => s + st.temperature_c, 0) / substations.length).toFixed(0);
  const activeAlerts = alerts.filter(a => a.status === 'Active').length;

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="REAL-TIME MONITORING" title="Live Monitoring" subtitle="Continuous electrical measurements across your grid"
        actions={<div className="last-updated"><Clock3 size={14} /> Refreshes <strong>every 30s</strong></div>} />

      <section className="metric-grid">
        <MetricCard label="Total demand" value={totalDemand.toFixed(0)} unit="MW" meta={`${(totalDemand/totalCapacity*100).toFixed(1)}% of capacity`} icon={<Zap size={17} />} tone="teal" />
        <MetricCard label="Avg voltage" value={avgVoltage} unit="kV" meta="Across all substations" icon={<Activity size={17} />} tone="blue" />
        <MetricCard label="Avg frequency" value={avgFreq} unit="Hz" meta="Within normal range" icon={<Gauge size={17} />} tone="green" />
        <MetricCard label="Avg temperature" value={avgTemp} unit="°C" meta="Transformer temps" icon={<Thermometer size={17} />} tone="orange" />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <PanelHeader title="Load distribution" subtitle="Real-time utilization per substation" />
          <div style={{ padding: '20px', display: 'grid', gap: '14px' }}>
            {substations.map(s => (
              <div key={s.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: '#728790' }}>{s.name}</span>
                  <strong className={statusClass(s.status)}>{s.load_percentage}%</strong>
                </div>
                <div className="util-track" style={{ width: '100%', height: 8 }}>
                  <span className={statusClass(s.status)} style={{ width: `${Math.min(s.load_percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="System metrics" subtitle="Aggregate grid health" />
          <div className="health-bars" style={{ borderTop: 'none', paddingTop: 20 }}>
            <HealthBar label="Capacity utilization" value={`${(totalDemand/totalCapacity*100).toFixed(0)}%`} width={`${Math.min(100, totalDemand/totalCapacity*100)}%`} color="teal" />
            <HealthBar label="Voltage stability" value="98.2%" width="98.2%" color="green" />
            <HealthBar label="Frequency stability" value="99.7%" width="99.7%" color="blue" />
            <HealthBar label="Thermal load" value={`${avgTemp}°C`} width={`${Math.min(100, +avgTemp)}%`} color="orange" />
          </div>
          <div style={{ padding: '0 22px 20px' }}>
            <div className="system-status" style={{ marginTop: 12 }}>
              <span className="pulse-dot" /> <span>{activeAlerts} active alerts · {substations.filter(s => s.status === 'Overloaded').length} overloaded</span>
              <AlertTriangle size={15} style={{ color: activeAlerts > 0 ? '#cb5d61' : '#55ad96' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="panel stations-panel">
        <PanelHeader title="Live readings" subtitle="Current measurements per substation" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>SUBSTATION</th><th>LOAD</th><th>UTILIZATION</th><th>VOLTAGE</th><th>CURRENT</th><th>FREQUENCY</th><th>TEMP</th><th>STATUS</th></tr></thead>
            <tbody>
              {substations.map(s => (
                <tr key={s.id}>
                  <td><div className="station-name"><span className="station-icon"><Zap size={14} /></span><div><strong>{s.name}</strong><small>{s.code}</small></div></div></td>
                  <td><strong>{s.current_load_mw} MW</strong></td>
                  <td><div className="utilization"><div className="util-track"><span className={statusClass(s.status)} style={{ width: `${Math.min(s.load_percentage, 100)}%` }} /></div><strong className={statusClass(s.status)}>{s.load_percentage}%</strong></div></td>
                  <td>{s.voltage_kv} kV</td>
                  <td>{s.current_a} A</td>
                  <td>{s.frequency_hz} Hz</td>
                  <td><span className={s.temperature_c > 80 ? 'temp-hot' : ''}><Thermometer size={14} />{s.temperature_c}°C</span></td>
                  <td><span className={`status-pill ${statusClass(s.status)}`}><i />{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
