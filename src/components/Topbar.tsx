import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Clock3, Menu, X } from 'lucide-react';
import { useState } from 'react';

const labelMap: Record<string, string> = {
  '/': 'Overview',
  '/substations': 'Substations',
  '/monitoring': 'Live Monitoring',
  '/predictions': 'Predictions',
  '/optimization': 'Optimization',
  '/outages': 'Outage Analytics',
  '/alerts': 'Alerts',
  '/settings': 'Settings',
};

export function Topbar({ onMenu, alertCount }: { onMenu: () => void; alertCount: number }) {
  const location = useLocation();
  const label = labelMap[location.pathname] || 'Operations';
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="topbar">
      <button className="menu-button" onClick={onMenu} aria-label="Open menu"><Menu size={21} /></button>
      <div className="breadcrumb"><span>Operations</span><span>/</span><strong>{label}</strong></div>
      <div className="topbar-actions">
        <div className="live-indicator"><span className="pulse-dot" /> LIVE DATA</div>
        <button className="icon-button" onClick={() => setShowAlerts(!showAlerts)} aria-label="View notifications"><Bell size={18} /><i /></button>
        <div className="user-wrap">
          <button className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
            <span className="avatar">AR</span>
            <span className="user-copy"><strong>Alex Rao</strong><small>Administrator</small></span>
            <ChevronDown size={15} />
          </button>
          {showUserMenu && (
            <div className="popover user-popover">
              <strong>Alex Rao</strong><span>Administrator access</span>
              <button onClick={() => setShowUserMenu(false)}>Close menu</button>
            </div>
          )}
        </div>
        {showAlerts && (
          <div className="popover alerts-popover">
            <div className="popover-header"><strong>Active alerts</strong><span>{alertCount} active</span></div>
            <p>View the Alerts page for full details.</p>
            <button className="ack-button" onClick={() => setShowAlerts(false)} style={{ marginTop: 8 }}>Close</button>
          </div>
        )}
      </div>
    </header>
  );
}
