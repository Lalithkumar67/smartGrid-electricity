import { useState } from 'react';
import { ArrowRight, Check, Clock3, Play, SlidersHorizontal, Zap } from 'lucide-react';
import { updateRecommendationStatus, useRecommendations, useSubstations } from '../hooks';
import { ErrorState, LoadingState, MetricCard, PageHeading, PanelHeader } from '../components/ui';

export function OptimizationPage() {
  const { recommendations, loading, error } = useRecommendations();
  const { substations } = useSubstations();
  const [running, setRunning] = useState(false);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const pending = recommendations.filter(r => r.status === 'Pending').length;
  const approved = recommendations.filter(r => r.status === 'Approved').length;
  const totalTransfer = recommendations.filter(r => r.status === 'Pending').reduce((s, r) => s + r.transfer_mw, 0);

  const runOptimization = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 1500);
  };

  const approve = async (id: string) => {
    await updateRecommendationStatus(id, 'Approved');
  };

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="LOAD OPTIMIZATION" title="Power Distribution Optimization" subtitle="AI-driven load redistribution recommendations"
        actions={<button className="primary-button" onClick={runOptimization} disabled={running}><Play size={15} /> {running ? 'Running…' : 'Run optimization'}</button>} />

      <section className="metric-grid">
        <MetricCard label="Pending recommendations" value={String(pending)} meta="Awaiting approval" icon={<SlidersHorizontal size={17} />} tone="orange" />
        <MetricCard label="Approved transfers" value={String(approved)} meta="Ready for execution" icon={<Check size={17} />} tone="green" />
        <MetricCard label="Total transfer" value={totalTransfer.toFixed(0)} unit="MW" meta="Proposed redistribution" icon={<Zap size={17} />} tone="teal" />
        <MetricCard label="Last run" value="—" meta="Manual trigger" icon={<Clock3 size={17} />} tone="blue" />
      </section>

      <section className="panel stations-panel">
        <PanelHeader title="Recommendations" subtitle="Load transfer suggestions between substations" />
        {recommendations.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9aa9af', fontSize: 12 }}>
            No recommendations yet. Click "Run optimization" to generate new recommendations.
          </div>
        ) : (
          <div style={{ padding: '20px', display: 'grid', gap: 16 }}>
            {recommendations.map(r => {
              const source = substations.find(s => s.id === r.source_substation_id);
              const dest = substations.find(s => s.id === r.destination_substation_id);
              return (
                <div key={r.id} className="rec-card">
                  <div className="rec-flow">
                    <div className="rec-station">
                      <span className="rec-label">FROM</span>
                      <strong>{source?.name || '—'}</strong>
                      <small>{r.source_utilization?.toFixed(0)}% → {r.expected_source_utilization?.toFixed(0)}%</small>
                    </div>
                    <div className="rec-arrow">
                      <Zap size={16} />
                      <span>{r.transfer_mw} MW</span>
                      <ArrowRight size={20} />
                    </div>
                    <div className="rec-station">
                      <span className="rec-label">TO</span>
                      <strong>{dest?.name || '—'}</strong>
                      <small>{r.destination_utilization?.toFixed(0)}% → {r.expected_destination_utilization?.toFixed(0)}%</small>
                    </div>
                  </div>
                  <div className="rec-reason">{r.reason}</div>
                  <div className="rec-footer">
                    <span className={`status-pill ${r.status === 'Approved' ? 'status-normal' : 'status-warning'}`}><i />{r.status}</span>
                    {r.status === 'Pending' && <button className="primary-button compact" onClick={() => approve(r.id)}><Check size={14} /> Approve</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
