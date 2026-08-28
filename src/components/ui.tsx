import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

export function PanelHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="panel-header">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, unit, meta, icon, tone, trend }: { label: string; value: string; unit?: string; meta: string; icon: ReactNode; tone: string; trend?: string }) {
  return (
    <div className="metric-card">
      <div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}>{icon}</span></div>
      <div className="metric-value">{value} <small>{unit}</small>{trend && <ArrowUpRight size={18} className="metric-trend" />}</div>
      <div className="metric-meta">{trend && <span className="positive">{meta}</span>}{!trend && meta}</div>
    </div>
  );
}

export function HealthBar({ label, value, width, color }: { label: string; value: string; width: string; color: string }) {
  return (
    <div className="health-bar">
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className="health-track"><i className={color} style={{ width }} /></div>
    </div>
  );
}

export function PageHeading({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <section className="page-heading">
      <div>
        <div className="eyebrow"><span className="pulse-dot" /> {eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div style={{ padding: '40px', textAlign: 'center', color: '#9aa9af', fontSize: 12 }}>{message}</div>;
}

export function LoadingState() {
  return <div style={{ padding: '40px', textAlign: 'center', color: '#9aa9af', fontSize: 12 }}>Loading…</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div style={{ padding: '40px', textAlign: 'center', color: '#cb5d61', fontSize: 12 }}>{message}</div>;
}
