import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Gauge,
  LayoutDashboard,
  LineChart,
  MapPin,
  Menu,
  MoreHorizontal,
  Network,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Thermometer,
  Zap,
  X,
} from 'lucide-react';

type NavItem = { label: string; icon: typeof LayoutDashboard };
type Status = 'Normal' | 'Warning' | 'High Load' | 'Overloaded';
type Substation = {
  id: string;
  name: string;
  zone: string;
  load: number;
  capacity: number;
  voltage: number;
  temperature: number;
  updated: string;
  status: Status;
};

const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Substations', icon: Network },
  { label: 'Live Monitoring', icon: Activity },
  { label: 'Predictions', icon: LineChart },
  { label: 'Optimization', icon: SlidersHorizontal },
  { label: 'Outage Analytics', icon: Gauge },
];

const stations: Substation[] = [
  { id: 'SS-1042', name: 'East River', zone: 'North Grid', load: 105, capacity: 100, voltage: 11.2, temperature: 86, updated: '12 sec ago', status: 'Overloaded' },
  { id: 'SS-1028', name: 'Industrial Park', zone: 'Central Grid', load: 91, capacity: 100, voltage: 11.5, temperature: 74, updated: '18 sec ago', status: 'High Load' },
  { id: 'SS-1011', name: 'Riverside', zone: 'West Grid', load: 72, capacity: 100, voltage: 11.8, temperature: 61, updated: '21 sec ago', status: 'Warning' },
  { id: 'SS-1033', name: 'Lakeside', zone: 'South Grid', load: 48, capacity: 100, voltage: 12.1, temperature: 44, updated: '25 sec ago', status: 'Normal' },
  { id: 'SS-1007', name: 'Hillview', zone: 'North Grid', load: 68, capacity: 100, voltage: 11.9, temperature: 55, updated: '31 sec ago', status: 'Normal' },
];

const trendData = [42, 46, 44, 51, 54, 52, 59, 63, 61, 70, 67, 72, 78, 75, 84, 81, 88, 92, 89, 94, 91, 97, 95, 101];

function statusClass(status: Status) {
  return {
    Normal: 'status-normal',
    Warning: 'status-warning',
    'High Load': 'status-high',
    Overloaded: 'status-overloaded',
  }[status];
}

function App() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [range, setRange] = useState('Last 24 hours');
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const visibleStations = useMemo(() => stations, []);
  const acknowledge = (id: string) => setAcknowledged((current) => [...new Set([...current, id])]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Zap size={20} strokeWidth={2.4} /></div>
          <div><strong>SmartGrid</strong><span>Operations Center</span></div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="workspace-label">OPERATIONS</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setSidebarOpen(false); }}>
              <Icon size={17} strokeWidth={1.9} /><span>{label}</span>{label === 'Alerts' && <b>3</b>}
            </button>
          ))}
        </nav>
        <div className="workspace-label secondary-label">SYSTEM</div>
        <nav className="main-nav">
          <button className="nav-item" onClick={() => setActiveNav('Alerts')}><Bell size={17} /><span>Alerts</span><b>3</b></button>
          <button className="nav-item" onClick={() => setActiveNav('Settings')}><Settings size={17} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status"><span className="pulse-dot" /> <span>All systems operational</span><ShieldCheck size={15} /></div>
          <div className="sidebar-version">SMARTGRID PLATFORM <span>v1.4.0</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Operations</span><span>/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <div className="live-indicator"><span className="pulse-dot" /> LIVE DATA</div>
            <button className="icon-button" onClick={() => setShowAlerts(!showAlerts)} aria-label="View notifications"><Bell size={18} /><i /></button>
            <div className="user-wrap">
              <button className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}><span className="avatar">AR</span><span className="user-copy"><strong>Alex Rao</strong><small>Administrator</small></span><ChevronDown size={15} /></button>
              {showUserMenu && <div className="popover user-popover"><strong>Alex Rao</strong><span>Administrator access</span><button onClick={() => setShowUserMenu(false)}>Close menu</button></div>}
            </div>
          </div>
          {showAlerts && <div className="popover alerts-popover"><div className="popover-header"><strong>Active alerts</strong><span>3 new</span></div><p><AlertTriangle size={14} /> East River is overloaded at 105%</p><p><Thermometer size={14} /> Transformer temperature above threshold</p><p><Zap size={14} /> Predicted overload in 30 minutes</p></div>}
        </header>

        <div className="page-wrap">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="pulse-dot" /> SYSTEM MONITORING</div><h1>Good morning, Alex</h1><p>Here’s the latest view of your grid operations.</p></div>
            <div className="heading-actions"><div className="last-updated"><Clock3 size={14} /> Last updated <strong>just now</strong></div><button className="outline-button"><MapPin size={15} />All zones<ChevronDown size={15} /></button></div>
          </section>

          <section className="metric-grid">
            <MetricCard label="Total substations" value="24" meta="Across 4 zones" icon={<Network size={17} />} tone="blue" />
            <MetricCard label="Current demand" value="1,842" unit="MW" meta="↑ 8.4% vs. yesterday" icon={<Zap size={17} />} tone="teal" trend="up" />
            <MetricCard label="Available capacity" value="463" unit="MW" meta="20.1% headroom" icon={<Gauge size={17} />} tone="green" />
            <MetricCard label="Active outages" value="2" meta="1 major · 1 minor" icon={<AlertTriangle size={17} />} tone="orange" />
          </section>

          <section className="dashboard-grid">
            <div className="panel load-panel">
              <PanelHeader title="System load trend" subtitle="Aggregate demand across all substations" action={<select value={range} onChange={(event) => setRange(event.target.value)}><option>Last 24 hours</option><option>Last 7 days</option><option>Last 30 days</option></select>} />
              <div className="chart-legend"><span><i className="legend-line actual" />Actual load</span><span><i className="legend-line projected" />Projected</span><span className="chart-unit">MW</span></div>
              <div className="line-chart"><div className="y-axis"><span>2,000</span><span>1,500</span><span>1,000</span><span>500</span><span>0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 700 250" preserveAspectRatio="none" role="img" aria-label="System load trend line chart"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1b7990" stopOpacity=".18" /><stop offset="100%" stopColor="#1b7990" stopOpacity="0" /></linearGradient></defs><path className="chart-area-fill" d="M0 180 C30 168 38 174 62 162 S100 147 125 155 S165 135 188 138 S225 120 248 132 S283 112 310 118 S347 88 375 99 S410 74 438 84 S470 58 498 67 S530 47 556 51 S594 34 619 41 S660 19 700 12 L700 250 L0 250Z" /><path className="chart-line" d="M0 180 C30 168 38 174 62 162 S100 147 125 155 S165 135 188 138 S225 120 248 132 S283 112 310 118 S347 88 375 99 S410 74 438 84 S470 58 498 67 S530 47 556 51 S594 34 619 41 S660 19 700 12" /><line className="chart-marker" x1="590" x2="590" y1="0" y2="250" /><circle className="chart-point" cx="590" cy="37" r="5" /></svg><div className="x-axis"><span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span><span>Now</span></div></div></div>
            </div>

            <div className="panel health-panel">
              <PanelHeader title="Grid health" subtitle="Current status overview" action={<button className="more-button"><MoreHorizontal size={17} /></button>} />
              <div className="health-score"><div className="score-ring"><div><strong>92</strong><span>/100</span></div></div><div><span className="healthy-label"><i className="pulse-dot" /> HEALTHY</span><p>Grid performance is stable with a few areas requiring attention.</p></div></div>
              <div className="health-bars"><HealthBar label="Capacity utilization" value="68%" width="68%" color="teal" /><HealthBar label="Voltage stability" value="98.2%" width="98.2%" color="green" /><HealthBar label="Frequency stability" value="99.7%" width="99.7%" color="blue" /></div>
              <button className="text-button" onClick={() => setActiveNav('Live Monitoring')}>View detailed health <ArrowUpRight size={15} /></button>
            </div>
          </section>

          <section className="panel stations-panel">
            <PanelHeader title="Substation load distribution" subtitle="Live utilization across your network" action={<button className="outline-button compact" onClick={() => setActiveNav('Substations')}>View all substations <ArrowUpRight size={14} /></button>} />
            <div className="table-wrap"><table><thead><tr><th>SUBSTATION</th><th>ZONE</th><th>LOAD</th><th>UTILIZATION</th><th>TEMPERATURE</th><th>STATUS</th><th>UPDATED</th><th /></tr></thead><tbody>{visibleStations.map((station) => <tr key={station.id}><td><div className="station-name"><span className="station-icon"><Zap size={14} /></span><div><strong>{station.name}</strong><small>{station.id}</small></div></div></td><td>{station.zone}</td><td><strong>{station.load} MW</strong><small>of {station.capacity} MW</small></td><td><div className="utilization"><div className="util-track"><span className={statusClass(station.status)} style={{ width: `${Math.min(station.load, 100)}%` }} /></div><strong className={statusClass(station.status)}>{station.load}%</strong></div></td><td><span className={station.temperature > 80 ? 'temp-hot' : ''}><Thermometer size={14} />{station.temperature}°C</span></td><td><span className={`status-pill ${statusClass(station.status)}`}><i />{station.status}</span></td><td>{station.updated}</td><td><button className="row-more"><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div>
          </section>

          <section className="bottom-grid">
            <div className="panel alerts-panel"><PanelHeader title="Requires attention" subtitle="Items that need operator review" action={<button className="text-button" onClick={() => setActiveNav('Alerts')}>See all <ArrowUpRight size={14} /></button>} /><div className="attention-list"><AttentionRow icon={<AlertTriangle size={17} />} tone="red" title="East River substation overloaded" detail="Load exceeded safe capacity by 5 MW" time="2 min ago" id="overload" acknowledged={acknowledged.includes('overload')} onAcknowledge={acknowledge} /><AttentionRow icon={<Thermometer size={17} />} tone="orange" title="Transformer temperature rising" detail="Industrial Park · 74°C and increasing" time="18 min ago" id="temperature" acknowledged={acknowledged.includes('temperature')} onAcknowledge={acknowledge} /><AttentionRow icon={<LineChart size={17} />} tone="blue" title="Predicted overload detected" detail="East River likely to exceed capacity in 30 min" time="26 min ago" id="prediction" acknowledged={acknowledged.includes('prediction')} onAcknowledge={acknowledge} /></div></div>
            <div className="panel activity-panel"><PanelHeader title="Recent activity" subtitle="Latest events across the network" action={<button className="more-button"><MoreHorizontal size={17} /></button>} /><div className="activity-list"><ActivityRow icon={<Check size={15} />} title="Alert acknowledged" detail="Voltage fluctuation · SS-1011" time="10:42 AM" color="green" /><ActivityRow icon={<ArrowDownRight size={15} />} title="Load transfer completed" detail="2 MW moved from SS-1028 to SS-1033" time="10:18 AM" color="blue" /><ActivityRow icon={<Activity size={15} />} title="Measurement received" detail="All substations reporting normally" time="9:55 AM" color="teal" /></div></div>
          </section>
          <footer><span>SmartGrid Operations Center</span><span>Data refreshes every 30 seconds · Simulation mode</span></footer>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, unit, meta, icon, tone, trend }: { label: string; value: string; unit?: string; meta: string; icon: React.ReactNode; tone: string; trend?: string }) { return <div className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}>{icon}</span></div><div className="metric-value">{value} <small>{unit}</small>{trend && <ArrowUpRight size={18} className="metric-trend" />}</div><div className="metric-meta">{trend && <span className="positive">{meta.split(' ')[0]} {meta.split(' ')[1]}</span>}{!trend && meta}</div></div>; }
function PanelHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) { return <div className="panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>; }
function HealthBar({ label, value, width, color }: { label: string; value: string; width: string; color: string }) { return <div className="health-bar"><div><span>{label}</span><strong>{value}</strong></div><div className="health-track"><i className={color} style={{ width }} /></div></div>; }
function AttentionRow({ icon, tone, title, detail, time, id, acknowledged, onAcknowledge }: { icon: React.ReactNode; tone: string; title: string; detail: string; time: string; id: string; acknowledged: boolean; onAcknowledge: (id: string) => void }) { return <div className={`attention-row ${acknowledged ? 'acknowledged' : ''}`}><div className={`attention-icon ${tone}`}>{icon}</div><div className="attention-copy"><strong>{title}</strong><span>{detail}</span></div><time>{time}</time><button className="ack-button" onClick={() => onAcknowledge(id)}>{acknowledged ? <Check size={14} /> : 'Ack'}</button></div>; }
function ActivityRow({ icon, title, detail, time, color }: { icon: React.ReactNode; title: string; detail: string; time: string; color: string }) { return <div className="activity-row"><div className={`activity-icon ${color}`}>{icon}</div><div><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>; }

export default App;
