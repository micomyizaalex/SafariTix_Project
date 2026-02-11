import React from 'react';
import Card from '../../components/common/Card';

export default function AdminDashboard() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Admin Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <Card><div style={{ fontWeight: 700 }}>Companies</div><div>14</div></Card>
        <Card><div style={{ fontWeight: 700 }}>Active Users</div><div>3,210</div></Card>
        <Card><div style={{ fontWeight: 700 }}>Revenue (MTD)</div><div>RWF 6,120,000</div></Card>
        <Card><div style={{ fontWeight: 700 }}>System Alerts</div><div>0</div></Card>
      </div>
    </div>
  );
}
