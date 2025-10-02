"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [msg, setMsg] = useState<string | null>(null);

  async function invite() {
    const res = await fetch("/api/org/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setMsg(res.ok ? "Invitation sent" : "Failed to send invite");
  }

  return (
    <div className="space-y-2">
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="email@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select
        className="border rounded px-3 py-2"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <Button onClick={invite}>Send Invite</Button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}
