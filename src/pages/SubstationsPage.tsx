import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, MoreHorizontal, Plus, Search, Thermometer, Zap, X } from 'lucide-react';
import { createSubstation, deleteSubstation, updateSubstation, useSubstations } from '../hooks';
import { statusClass } from '../types';
import { ErrorState, LoadingState, PageHeading, PanelHeader } from '../components/ui';
import type { Substation } from '../types';

export function SubstationsPage() {
  const navigate = useNavigate();
  const { substations, loading, error } = useSubstations();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Substation | null>(null);

  const filtered = substations.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.zone.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="ASSET MANAGEMENT" title="Substations" subtitle={`${substations.length} substations across your network`}
        actions={<>
          <div className="search-bar"><Search size={15} /><input placeholder="Search substations…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className="primary-button" onClick={() => { setEditing(null); setShowModal(true); }}><Plus size={15} /> Add substation</button>
        </>} />

      <section className="panel stations-panel">
        <PanelHeader title="All substations" subtitle="Manage your grid assets"
          action={<button className="outline-button compact">Export <ArrowUpRight size={14} /></button>} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>SUBSTATION</th><th>ZONE</th><th>CAPACITY</th><th>LOAD</th><th>UTILIZATION</th><th>VOLTAGE</th><th>TEMP</th><th>STATUS</th><th /></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/substations/${s.id}`)}>
                  <td><div className="station-name"><span className="station-icon"><Zap size={14} /></span><div><strong>{s.name}</strong><small>{s.code}</small></div></div></td>
                  <td>{s.zone}</td>
                  <td>{s.capacity_mw} MW</td>
                  <td><strong>{s.current_load_mw} MW</strong></td>
                  <td><div className="utilization"><div className="util-track"><span className={statusClass(s.status)} style={{ width: `${Math.min(s.load_percentage, 100)}%` }} /></div><strong className={statusClass(s.status)}>{s.load_percentage}%</strong></div></td>
                  <td>{s.voltage_kv} kV</td>
                  <td><span className={s.temperature_c > 80 ? 'temp-hot' : ''}><Thermometer size={14} />{s.temperature_c}°C</span></td>
                  <td><span className={`status-pill ${statusClass(s.status)}`}><i />{s.status}</span></td>
                  <td>
                    <button className="row-more" onClick={e => { e.stopPropagation(); setEditing(s); setShowModal(true); }}><MoreHorizontal size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && <SubstationModal substation={editing} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function SubstationModal({ substation, onClose }: { substation: Substation | null; onClose: () => void }) {
  const [form, setForm] = useState({
    code: substation?.code || '',
    name: substation?.name || '',
    zone: substation?.zone || '',
    capacity_mw: substation?.capacity_mw || 100,
    current_load_mw: substation?.current_load_mw || 0,
    voltage_kv: substation?.voltage_kv || 11.5,
    temperature_c: substation?.temperature_c || 25,
    latitude: substation?.latitude || 0,
    longitude: substation?.longitude || 0,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (substation) {
      await updateSubstation(substation.id, form);
    } else {
      await createSubstation(form);
    }
    setSaving(false);
    onClose();
  };

  const remove = async () => {
    if (!substation) return;
    await deleteSubstation(substation.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{substation ? 'Edit substation' : 'Add substation'}</h2>
          <button className="mobile-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <FormField label="Code" value={form.code} onChange={v => setForm({ ...form, code: v })} />
            <FormField label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <FormField label="Zone" value={form.zone} onChange={v => setForm({ ...form, zone: v })} />
            <FormField label="Capacity (MW)" type="number" value={String(form.capacity_mw)} onChange={v => setForm({ ...form, capacity_mw: +v })} />
            <FormField label="Current load (MW)" type="number" value={String(form.current_load_mw)} onChange={v => setForm({ ...form, current_load_mw: +v })} />
            <FormField label="Voltage (kV)" type="number" value={String(form.voltage_kv)} onChange={v => setForm({ ...form, voltage_kv: +v })} />
            <FormField label="Temperature (°C)" type="number" value={String(form.temperature_c)} onChange={v => setForm({ ...form, temperature_c: +v })} />
            <FormField label="Latitude" type="number" value={String(form.latitude)} onChange={v => setForm({ ...form, latitude: +v })} />
            <FormField label="Longitude" type="number" value={String(form.longitude)} onChange={v => setForm({ ...form, longitude: +v })} />
          </div>
        </div>
        <div className="modal-footer">
          {substation && <button className="danger-button" onClick={remove} disabled={saving}>Deactivate</button>}
          <button className="outline-button" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="primary-button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}
