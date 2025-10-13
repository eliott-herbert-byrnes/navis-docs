'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SubscriptionButtons() {
  const [loading, setLoading] = useState(false);

  async function goCheckout(plan: 'business' | 'enterprise') {
    setLoading(true);
    const res = await fetch('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) });
    const { url } = await res.json();
    window.location.href = url;
  }

  async function goPortal() {
    setLoading(true);
    const res = await fetch('/api/billing/portal', { method: 'POST' });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => goCheckout('enterprise')} disabled={loading}>Upgrade to Enterprise</Button>
      <Button variant="outline" onClick={goPortal} disabled={loading}>Manage billing</Button>
    </div>
  );
}