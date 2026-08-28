import { useState } from 'react';
import { Bell, Gauge, Shield, SlidersHorizontal, Zap } from 'lucide-react';
import { PageHeading, PanelHeader } from '../components/ui';

export function SettingsPage() {
  const [thresholds, setThresholds] = useState({ warning: 70, high: 90, overload: 100 });
  const [refresh, setRefresh] = useState(30);
  const [notifications, setNotifications] = useState({ overload: true, predicted: true, voltage: true, temperature: true, outage: true });

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="SYSTEM CONFIGURATION" title="Settings" subtitle="Configure platform thresholds and preferences" />

      <section className="dashboard-grid">
        <div className="panel">
          <PanelHeader title="Alert thresholds" subtitle="Load percentage breakpoints for status" />
          <div style={{ padding: 22, display: 'grid', gap: 18 }}>
            <ThresholdSlider label="Warning" value={thresholds.warning} onChange={v => setThresholds({ ...thresholds, warning: v })} color="#db9f63" />
            <ThresholdSlider label="High load" value={thresholds.high} onChange={v => setThresholds({ ...thresholds, high: v })} color="#d58b58" />
            <ThresholdSlider label="Overloaded" value={thresholds.overload} onChange={v => setThresholds({ ...thresholds, overload: v })} color="#cb5d61" />
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="Data refresh" subtitle="Polling interval for live data" />
          <div style={{ padding: 22 }}>
            <ThresholdSlider label="Refresh interval (seconds)" value={refresh} onChange={setRefresh} min={5} max={120} color="#24838d" />
            <div style={{ marginTop: 16, fontSize: 10, color: '#9aa9af' }}>
              Dashboard data will update every <strong style={{ color: '#327e87' }}>{refresh} seconds</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 17 }}>
        <PanelHeader title="Notification preferences" subtitle="Choose which alerts trigger notifications" />
        <div style={{ padding: '15px 22px' }}>
          {Object.entries(notifications).map(([key, val]) => (
            <div key={key} className="attention-row" style={{ border: 'none', borderBottom: '1px solid #f0f3f3' }}>
              <div className={`attention-icon ${val ? 'green' : 'blue'}`}>
                {key === 'overload' ? <Zap size={17} /> : key === 'predicted' ? <SlidersHorizontal size={17} /> : key === 'voltage' ? <Gauge size={17} /> : key === 'temperature' ? <Shield size={17} /> : <Bell size={17} />}
              </div>
              <div className="attention-copy"><strong>{key.charAt(0).toUpperCase() + key.slice(1)} alerts</strong><span>Receive notifications for {key} events</span></div>
              <button className={`toggle ${val ? 'on' : ''}`} onClick={() => setNotifications({ ...notifications, [key]: !val })}>
                <span />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 17 }}>
        <PanelHeader title="System information" subtitle="Platform details" />
        <div style={{ padding: 22, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 11 }}>
          <InfoItem label="Version" value="v1.4.0" />
          <InfoItem label="Environment" value="Simulation" />
          <InfoItem label="Database" value="PostgreSQL" />
          <InfoItem label="Real-time" value="Supabase Live" />
          <InfoItem label="Data source" value="Simulator" />
          <InfoItem label="Region" value="All zones" />
        </div>
      </section>
    </div>
  );
}

function ThresholdSlider({ label, value, onChange, min = 0, max = 100, color }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
        <span style={{ color: '#728790' }}>{label}</span>
        <strong style={{ color }}>{value}{max === 100 ? '%' : ''}</strong>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} style={{ width: '100%', accentColor: color }} />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 12, background: '#f7fafb', borderRadius: 6, border: '1px solid #eef2f2' }}>
      <div style={{ color: '#9aa9af', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ color: '#3d5762', fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}
