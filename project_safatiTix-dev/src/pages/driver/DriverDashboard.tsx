import React from 'react';
import Card from '../../components/common/Card';

export default function DriverDashboard() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Driver Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <Card><div style={{ fontWeight: 700 }}>Assigned Trips</div><div>5</div></Card>
        <Card><div style={{ fontWeight: 700 }}>Today Earnings</div><div>RWF 24,000</div></Card>
        <Card><div style={{ fontWeight: 700 }}>Pending Checks</div><div>1</div></Card>
        <Card><div style={{ fontWeight: 700 }}>Notifications</div><div>2</div></Card>
      </div>
    </div>
  );
}
