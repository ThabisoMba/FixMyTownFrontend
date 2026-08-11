/**
 * Departments.jsx
 * ---------------
 * Recreates "Admin Departments View": a grid of department cards
 * showing open-issue and worker counts.
 */

import { useEffect, useState } from 'react';
import { Building2, Droplet, Zap, Trees, Trash2 } from 'lucide-react';
import api from '../../api/api';
import TopBar from '../../components/TopBar';

const ICONS = {
  'Roads & Transport': Building2,
  'Water & Sanitation': Droplet,
  Electricity: Zap,
  'Parks & Recreation': Trees,
  'Waste Management': Trash2
};

export default function Departments() {
  const [departments, setDepartments] = useState([]);

  function load() {
    api.get('/lookups/departments').then((res) => setDepartments(res.data)).catch(() => {});
  }

  useEffect(load, []);

  return (
    <div>
      <TopBar section="Admin" page="Departments" onRefresh={load} showExport />
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 18 }}>
            <Building2 size={17} /> Departments
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {departments.map((d) => {
              const Icon = ICONS[d.Name] || Building2;
              return (
                <div key={d.DepartmentID} className="card" style={{ padding: 22, textAlign: 'center' }}>
                  <Icon size={26} color="var(--navy-800)" style={{ marginBottom: 10 }} />
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.Name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    {d.OpenIssues} issues<br />{d.WorkerCount} workers
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
