import { NavLink } from 'react-router-dom';
import {
  Activity,
  Bell,
  LayoutDashboard,
  LineChart,
  Network,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
  X,
  Gauge,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/substations', label: 'Substations', icon: Network },
  { to: '/monitoring', label: 'Live Monitoring', icon: Activity },
  { to: '/predictions', label: 'Predictions', icon: LineChart },
  { to: '/optimization', label: 'Optimization', icon: SlidersHorizontal },
  { to: '/outages', label: 'Outage Analytics', icon: Gauge },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, onClose, alertCount }: { open: boolean; onClose: () => void; alertCount: number }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Zap size={20} strokeWidth={2.4} /></div>
        <div><strong>SmartGrid</strong><span>Operations Center</span></div>
        <button className="mobile-close" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
      </div>
      <div className="workspace-label">OPERATIONS</div>
      <nav className="main-nav">
        {navItems.slice(0, 6).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Icon size={17} strokeWidth={1.9} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="workspace-label secondary-label">SYSTEM</div>
      <nav className="main-nav">
        <NavLink key="/alerts" to="/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Bell size={17} /><span>Alerts</span>{alertCount > 0 && <b>{alertCount}</b>}
        </NavLink>
        <NavLink key="/settings" to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Settings size={17} /><span>Settings</span>
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="system-status"><span className="pulse-dot" /> <span>All systems operational</span><ShieldCheck size={15} /></div>
        <div className="sidebar-version">SMARTGRID PLATFORM <span>v1.4.0</span></div>
      </div>
    </aside>
  );
}
