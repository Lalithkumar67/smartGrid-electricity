import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Check, Clock3, Gauge, LineChart, MapPin, MoreHorizontal, Network, Thermometer, Zap, Activity } from 'lucide-react';
import { useAlerts, useSubstations, useOutages, usePredictions, acknowledgeAlert } from '../hooks';
import { statusClass } from '../types';
import { ErrorState, HealthBar, LoadingState, MetricCard, PageHeading, PanelHeader } from '../components/ui';

export function OverviewPage() {
  const navigate = useNavigate();
  const { substations, loading: sl, error: se } = useSubstations();
  const { alerts, loading: al, error: ae } = useAlerts();
  const { outages } = useOutages();
  const { predictions } = usePredictions();

  if (sl || al) return <LoadingState />;
  if (se || ae) return <ErrorState message={se || ae || 'Failed to load'} />;

  const total = substations.length;
  const active = substations.filter(s => s.active).length;
  const overloaded = substations.filter(s => s.status === 'Overloaded').length;
  const critical = substations.filter(s => s.status === 'High Load').length;
  const totalDemand = substations.reduce((sum, s) => sum + s.current_load_mw, 0);
  const totalCapacity = substations.reduce((sum, s) => sum + s.capacity_mw, 0);
  const available = totalCapacity - totalDemand;
  const activeOutages = outages.filter(o => o.resolution_status !== 'Resolved').length;
  const activeAlerts = alerts.filter(a => a.status === 'Active').length;
  const predictedOverloads = predictions.filter(p => p.risk_level === 'HIGH').length;
  const healthScore = Math.max(0, Math.min(100, 100 - overloaded * 8 - critical * 4));

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="SYSTEM MONITORING" title="Good morning, Alex" subtitle="Here's the latest view of your grid operations."
        actions={<><div className="last-updated"><Clock3 size={14} /> Last updated <strong>just now</strong></div><button className="outline-button"><MapPin size={15} />All zones<ChevronDownDummy /></button></>} />

      <section className="metric-grid">
        <MetricCard label="Total substations" value={String(total)} meta={`${active} active`} icon={<Network size={17} />} tone="blue" />
        <MetricCard label="Current demand" value={totalDemand.toFixed(0)} unit="MW" meta={`↑ ${(totalDemand / totalCapacity * 100).toFixed(1)}% of capacity`} icon={<Zap size={17} />} tone="teal" trend="up" />
        <MetricCard label="Available capacity" value={available.toFixed(0)} unit="MW" meta={`${(available / totalCapacity * 100).toFixed(1)}% headroom`} icon={<Gauge size={17} />} tone="green" />
        <MetricCard label="Active outages" value={String(activeOutages)} meta={`${overloaded} overloaded`} icon={<AlertTriangle size={17} />} tone="orange" />
      </section>

      <section className="metric-grid">
        <MetricCard label="Overloaded substations" value={String(overloaded)} meta="Requires immediate action" icon={<AlertTriangle size={17} />} tone="orange" />
        <MetricCard label="Critical substations" value={String(critical)} meta="High load conditions" icon={<Gauge size={17} />} tone="blue" />
        <MetricCard label="Active alerts" value={String(activeAlerts)} meta="Needs operator review" icon={<Activity size={17} />} tone="teal" />
        <MetricCard label="Predicted overloads" value={String(predictedOverloads)} meta="Next 30 minutes" icon={<LineChart size={17} />} tone="green" />
      </section>

      <section className="dashboard-grid">
        <div className="panel load-panel">
          <PanelHeader title="System load trend" subtitle="Aggregate demand across all substations" />
          <div className="chart-legend"><span><i className="legend-line actual" />Actual load</span><span><i className="legend-line projected" />Projected</span><span className="chart-unit">MW</span></div>
          <div className="line-chart">
            <div className="y-axis"><span>2,000</span><span>1,500</span><span>1,000</span><span>500</span><span>0</span></div>
            <div className="chart-area">
              <div className="grid-lines"><i /><i /><i /><i /><i /></div>
              <svg viewBox="0 0 700 250" preserveAspectRatio="none" role="img" aria-label="System load trend line chart">
                <defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1b7990" stopOpacity=".18" /><stop offset="100%" stopColor="#1b7990" stopOpacity="0" /></linearGradient></defs>
                <path className="chart-area-fill" d="M0 180 C30 168 38 174 62 162 S100 147 125 155 S165 135 188 138 S225 120 248 132 S283 112 310 118 S347 88 375 99 S410 74 438 84 S470 58 498 67 S530 47 556 51 S594 34 619 41 S660 19 700 12 L700 250 L0 250Z" />
                <path className="chart-line" d="M0 180 C30 168 38 174 62 162 S100 147 125 155 S165 135 188 138 S225 120 248 132 S283 112 310 118 S347 88 375 99 S410 74 438 84 S470 58 498 67 S530 47 556 51 S594 34 619 41 S660 19 700 12" />
                <line className="chart-marker" x1="590" x2="590" y1="0" y2="250" /><circle className="chart-point" cx="590" cy="37" r="5" />
              </svg>
              <div className="x-axis"><span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span><span>Now</span></div>
            </div>
          </div>
        </div>

        <div className="panel health-panel">
          <PanelHeader title="Grid health" subtitle="Current status overview" action={<button className="more-button"><MoreHorizontal size={17} /></button>} />
          <div className="health-score">
            <div className="score-ring"><div><strong>{healthScore}</strong><span>/100</span></div></div>
            <div><span className="healthy-label"><i className="pulse-dot" /> {healthScore > 85 ? 'HEALTHY' : 'ATTENTION'}</span><p>Grid performance is {healthScore > 85 ? 'stable' : 'stable with a few areas requiring attention'}.</p></div>
          </div>
          <div className="health-bars">
            <HealthBar label="Capacity utilization" value={`${(totalDemand / totalCapacity * 100).toFixed(0)}%`} width={`${Math.min(100, totalDemand / totalCapacity * 100)}%`} color="teal" />
            <HealthBar label="Voltage stability" value="98.2%" width="98.2%" color="green" />
            <HealthBar label="Frequency stability" value="99.7%" width="99.7%" color="blue" />
          </div>
          <button className="text-button" onClick={() => navigate('/monitoring')}>View detailed health <ArrowUpRight size={15} /></button>
        </div>
      </section>

      <section className="panel stations-panel">
        <PanelHeader title="Substation load distribution" subtitle="Live utilization across your network"
          action={<button className="outline-button compact" onClick={() => navigate('/substations')}>View all substations <ArrowUpRight size={14} /></button>} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>SUBSTATION</th><th>ZONE</th><th>LOAD</th><th>UTILIZATION</th><th>TEMPERATURE</th><th>STATUS</th><th>UPDATED</th><th /></tr></thead>
            <tbody>
              {substations.slice(0, 6).map(s => (
                <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/substations')}>
                  <td><div className="station-name"><span className="station-icon"><Zap size={14} /></span><div><strong>{s.name}</strong><small>{s.code}</small></div></div></td>
                  <td>{s.zone}</td>
                  <td><strong>{s.current_load_mw.toFixed(0)} MW</strong><small>of {s.capacity_mw.toFixed(0)} MW</small></td>
                  <td><div className="utilization"><div className="util-track"><span className={statusClass(s.status)} style={{ width: `${Math.min(s.load_percentage, 100)}%` }} /></div><strong className={statusClass(s.status)}>{s.load_percentage}%</strong></div></td>
                  <td><span className={s.temperature_c > 80 ? 'temp-hot' : ''}><Thermometer size={14} />{s.temperature_c}°C</span></td>
                  <td><span className={`status-pill ${statusClass(s.status)}`}><i />{s.status}</span></td>
                  <td>{timeAgo(s.last_updated)}</td>
                  <td><button className="row-more"><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel alerts-panel">
          <PanelHeader title="Requires attention" subtitle="Items that need operator review"
            action={<button className="text-button" onClick={() => navigate('/alerts')}>See all <ArrowUpRight size={14} /></button>} />
          <div className="attention-list">
            {alerts.filter(a => a.status === 'Active').slice(0, 4).map(a => (
              <AttentionRowDisplay key={a.id} alert={a} substationName={substations.find(s => s.id === a.substation_id)?.name || 'Unknown'} />
            ))}
            {alerts.filter(a => a.status === 'Active').length === 0 && <EmptyAttention />}
          </div>
        </div>
        <div className="panel activity-panel">
          <PanelHeader title="Recent activity" subtitle="Latest events across the network" action={<button className="more-button"><MoreHorizontal size={17} /></button>} />
          <div className="activity-list">
            <ActivityRowDisplay icon={<Check size={15} />} title="Alert acknowledged" detail="Voltage fluctuation · SS-1011" time="10:42 AM" color="green" />
            <ActivityRowDisplay icon={<ArrowDownRight size={15} />} title="Load transfer completed" detail="2 MW moved from SS-1028 to SS-1033" time="10:18 AM" color="blue" />
            <ActivityRowDisplay icon={<Activity size={15} />} title="Measurement received" detail="All substations reporting normally" time="9:55 AM" color="teal" />
          </div>
        </div>
      </section>
      <footer><span>SmartGrid Operations Center</span><span>Data refreshes every 30 seconds · Simulation mode</span></footer>
    </div>
  );
}

function AttentionRowDisplay({ alert, substationName }: { alert: any; substationName: string }) {
  const icon = alert.alert_type.includes('Overload') ? <AlertTriangle size={17} /> : alert.alert_type.includes('Temperature') ? <Thermometer size={17} /> : <LineChart size={17} />;
  const tone = alert.severity === 'Critical' ? 'red' : alert.severity === 'High' ? 'orange' : 'blue';
  return (
    <div className="attention-row">
      <div className={`attention-icon ${tone}`}>{icon}</div>
      <div className="attention-copy"><strong>{substationName} · {alert.alert_type}</strong><span>{alert.message}</span></div>
      <time>{timeAgo(alert.created_at)}</time>
      <button className="ack-button" onClick={() => acknowledgeAlert(alert.id)}>Ack</button>
    </div>
  );
}

function ActivityRowDisplay({ icon, title, detail, time, color }: { icon: any; title: string; detail: string; time: string; color: string }) {
  return (
    <div className="activity-row">
      <div className={`activity-icon ${color}`}>{icon}</div>
      <div><strong>{title}</strong><span>{detail}</span></div>
      <time>{time}</time>
    </div>
  );
}

function EmptyAttention() {
  return <div style={{ padding: '20px', textAlign: 'center', color: '#9aa9af', fontSize: 11 }}>No active alerts. All systems normal.</div>;
}

function ChevronDownDummy() {
  return <span style={{ display: 'inline-flex', alignItems: 'center' }}><ChevronDownIcon /></span>;
}
function ChevronDownIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  return `${Math.floor(hr / 24)} days ago`;
}
