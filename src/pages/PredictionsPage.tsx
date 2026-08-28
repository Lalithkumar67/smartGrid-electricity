import { LineChart as LineIcon, AlertTriangle, Clock3, TrendingUp } from 'lucide-react';
import { usePredictions, useSubstations } from '../hooks';
import { ErrorState, LoadingState, MetricCard, PageHeading, PanelHeader } from '../components/ui';

export function PredictionsPage() {
  const { predictions, loading, error } = usePredictions();
  const { substations } = useSubstations();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const highRisk = predictions.filter(p => p.risk_level === 'HIGH').length;
  const mediumRisk = predictions.filter(p => p.risk_level === 'MEDIUM').length;
  const lowRisk = predictions.filter(p => p.risk_level === 'LOW').length;
  const avgUtil = predictions.length > 0 ? (predictions.reduce((s, p) => s + p.predicted_utilization, 0) / predictions.length).toFixed(0) : '0';

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="PREDICTIVE ANALYTICS" title="Overload Predictions" subtitle="ML-based load forecasting for the next 30 minutes"
        actions={<div className="last-updated"><Clock3 size={14} /> Horizon <strong>30 min</strong></div>} />

      <section className="metric-grid">
        <MetricCard label="High risk" value={String(highRisk)} meta="Likely to overload" icon={<AlertTriangle size={17} />} tone="orange" />
        <MetricCard label="Medium risk" value={String(mediumRisk)} meta="Approaching threshold" icon={<TrendingUp size={17} />} tone="blue" />
        <MetricCard label="Low risk" value={String(lowRisk)} meta="Operating normally" icon={<LineIcon size={17} />} tone="green" />
        <MetricCard label="Avg predicted utilization" value={`${avgUtil}`} unit="%" meta="Across all substations" icon={<TrendingUp size={17} />} tone="teal" />
      </section>

      <section className="panel stations-panel">
        <PanelHeader title="Prediction results" subtitle="Predicted load and risk per substation" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>SUBSTATION</th><th>PREDICTED LOAD</th><th>CAPACITY</th><th>UTILIZATION</th><th>RISK</th><th>HORIZON</th></tr></thead>
            <tbody>
              {predictions.map(p => {
                const sub = substations.find(s => s.id === p.substation_id);
                const riskClass = p.risk_level === 'HIGH' ? 'status-overloaded' : p.risk_level === 'MEDIUM' ? 'status-high' : 'status-normal';
                return (
                  <tr key={p.id}>
                    <td><div className="station-name"><span className="station-icon"><LineIcon size={14} /></span><div><strong>{sub?.name || 'Unknown'}</strong><small>{sub?.code || ''}</small></div></div></td>
                    <td><strong>{p.predicted_load_mw} MW</strong></td>
                    <td>{p.capacity_mw} MW</td>
                    <td><div className="utilization"><div className="util-track"><span className={riskClass} style={{ width: `${Math.min(p.predicted_utilization, 100)}%` }} /></div><strong className={riskClass}>{p.predicted_utilization.toFixed(0)}%</strong></div></td>
                    <td><span className={`status-pill ${riskClass}`}><i />{p.risk_level}</span></td>
                    <td>{p.horizon_minutes} min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <PanelHeader title="Predicted vs actual" subtitle="Load comparison chart" />
          <div className="chart-legend"><span><i className="legend-line actual" />Actual</span><span><i className="legend-line projected" />Predicted</span><span className="chart-unit">MW</span></div>
          <div className="line-chart">
            <div className="y-axis"><span>120</span><span>90</span><span>60</span><span>30</span><span>0</span></div>
            <div className="chart-area">
              <div className="grid-lines"><i /><i /><i /><i /><i /></div>
              <svg viewBox="0 0 700 250" preserveAspectRatio="none">
                <path className="chart-line" d="M0 180 C50 170 100 160 150 150 S250 130 300 120 S400 100 450 90 S550 70 600 60 S650 50 700 45" style={{ stroke: '#24838d' }} />
                <path className="chart-line" d="M0 175 C50 165 100 155 150 145 S250 125 300 115 S400 95 450 85 S550 65 600 55 S650 45 700 40" style={{ stroke: '#a4ccd0', strokeDasharray: '5 4' }} />
              </svg>
              <div className="x-axis"><span>Now</span><span>+5m</span><span>+10m</span><span>+15m</span><span>+20m</span><span>+25m</span><span>+30m</span></div>
            </div>
          </div>
        </div>
        <div className="panel">
          <PanelHeader title="Risk distribution" subtitle="Predictions by risk level" />
          <div style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
            <RiskDonut high={highRisk} medium={mediumRisk} low={lowRisk} total={predictions.length} />
            <div style={{ display: 'flex', gap: 20, fontSize: 10 }}>
              <span style={{ color: '#cb5d61' }}>● High: {highRisk}</span>
              <span style={{ color: '#db9f63' }}>● Medium: {mediumRisk}</span>
              <span style={{ color: '#55ad96' }}>● Low: {lowRisk}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RiskDonut({ high, medium, low, total }: { high: number; medium: number; low: number; total: number }) {
  if (total === 0) return <div style={{ color: '#9aa9af', fontSize: 12 }}>No predictions</div>;
  const highPct = (high / total) * 360;
  const medPct = (medium / total) * 360;
  const lowPct = (low / total) * 360;
  return (
    <div className="score-ring" style={{ width: 120, height: 120, flex: '0 0 120px', background: `conic-gradient(#cb5d61 0 ${highPct}deg, #db9f63 ${highPct}deg ${highPct + medPct}deg, #55ad96 ${highPct + medPct}deg 360deg)` }}>
      <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <strong style={{ fontSize: 22 }}>{total}</strong>
        <span style={{ fontSize: 9 }}>predictions</span>
      </div>
    </div>
  );
}
