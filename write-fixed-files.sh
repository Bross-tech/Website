#!/usr/bin/env bash
set -e

# Safety: create backup folder (timestamped)
bak="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$bak"
echo "Backing up target files to ./$bak"
for f in lib/supabaseClient.ts components/AdminDashboard.tsx pages/AdminDashboard.tsx pages/UserDashboard.tsx pages/app.tsx pages/login.tsx pages/signup.tsx pages/profile.tsx pages/reset-password.tsx supabase/001_create_profiles.sql supabase/policies.sql; do
  if [ -f "$f" ]; then
    mkdir -p "$(dirname "$bak/$f")"
    cp -a "$f" "$bak/$f"
  fi
done

mkdir -p lib components pages supabase

cat > lib/supabaseClient.ts <<'EOF'
/**
 * lib/supabaseClient.ts
 * Exports two clients:
 *  - supabase: client for frontend (anon key)
 *  - supabaseAdmin: server-side client (service_role key)
 *
 * Make sure your env:
 * NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Frontend client (safe to use in browser)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin/server client (use only in server-side code)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
EOF

cat > components/AdminDashboard.tsx <<'EOF'
/**
 * components/AdminDashboard.tsx
 * A self-contained admin panel component.
 * Expects a `user` prop with { id, email } (from Supabase).
 *
 * Features:
 *  - List profiles (id, email, username, role, phone)
 *  - Block / Unblock user (role update)
 *  - Announcements CRUD (admin only)
 *  - Basic UI; extend as needed
 */
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  email?: string;
  username?: string;
  role?: string;
  phone?: string;
};

export default function AdminDashboard({ user }: { user: any }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, username, role, phone")
      .order("created_at", { ascending: false });

    if (profilesError) console.error("profiles:", profilesError);
    else setProfiles(profilesData ?? []);

    // announcements
    const { data: annData, error: annError } = await supabase
      .from("announcements")
      .select("*")
      .order("date", { ascending: false });

    if (annError) console.error("ann:", annError);
    else setAnnouncements(annData ?? []);
  }

  async function updateRole(id: string, newRole: string) {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (error) return alert("Failed to update role: " + error.message);
    setProfiles((p) => p.map((x) => (x.id === id ? { ...x, role: newRole } : x)));
  }

  async function sendAnnouncement() {
    if (!msg.trim()) return;
    const { data, error } = await supabase
      .from("announcements")
      .insert([{ admin_id: user.id, message: msg, date: new Date().toISOString() }])
      .select()
      .single();
    if (error) return alert("Announcement failed: " + error.message);
    setAnnouncements((s) => [data, ...s]);
    setMsg("");
  }

  return (
    <section style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>

      <section style={{ marginTop: 16 }}>
        <h3>Manage Users</h3>
        <ul>
          {profiles.map((p) => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <strong>{p.email ?? p.username ?? p.id}</strong> — {p.role ?? "user"}{" "}
              {p.role !== "blocked" ? (
                <button onClick={() => updateRole(p.id, "blocked")} style={{ marginLeft: 8 }}>
                  Block
                </button>
              ) : (
                <button onClick={() => updateRole(p.id, "user")} style={{ marginLeft: 8 }}>
                  Unblock
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Announcements</h3>
        <textarea
          placeholder="Write announcement..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          style={{ width: "100%", minHeight: 80 }}
        />
        <div style={{ marginTop: 8 }}>
          <button onClick={sendAnnouncement}>Send</button>
        </div>
        <ul style={{ marginTop: 12 }}>
          {announcements.map((a) => (
            <li key={a.id}>
              <strong>{new Date(a.date).toLocaleString()}:</strong> {a.message}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
EOF

cat > pages/AdminDashboard.tsx <<'EOF'
/**
 * pages/AdminDashboard.tsx
 * A simple page wrapper that requires server-side rendering (keeps dynamic)
 * This page can be protected via logic in _app or in getServerSideProps
 */
import React from "react";
import AdminDashboard from "../components/AdminDashboard";
import { supabase } from "../lib/supabaseClient";

export default function Page({ user }: { user: any }) {
  // user is fetched client-side in your /app page — here we accept prop optional
  return <AdminDashboard user={user} />;
}

// Optional: ensure page is not statically optimized
export async function getServerSideProps() {
  return { props: {} };
}
EOF

cat > pages/UserDashboard.tsx <<'EOF'
/**
 * pages/UserDashboard.tsx
 * Simple user dashboard. Extend as needed.
 */
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function UserDashboard() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      setProfile(prof);
    };
    fetch();
  }, []);

  if (!profile) return <p>Loading profile…</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Welcome, {profile.username ?? profile.email}</h2>
      <p>Role: {profile.role ?? "user"}</p>
      <p>Phone: {profile.phone ?? "not provided"}</p>
      {/* add wallet / purchases / etc */}
    </div>
  );
}
EOF

cat > pages/app.tsx <<'EOF'
/**
 * pages/app.tsx
 * Auth-aware landing page: shows login prompt if not logged in,
 * or appropriate dashboard if logged in (admin / user).
 */
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminDashboard from "../components/AdminDashboard";
import dynamic from "next/dynamic";

const UserDashboard = dynamic(() => import("./UserDashboard"), { ssr: false });

export default function AppPage() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);

      if (data.user) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        setRole(prof?.role ?? "user");
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setRole(prof?.role ?? "user");
      } else setRole(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <p>Loading…</p>;

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h1>Welcome to DATA STORE 4GH ⚡</h1>
        <p>Please log in or sign up to continue.</p>
        <div style={{ marginTop: 16 }}>
          <a href="/login">Log in</a> · <a href="/signup">Sign up</a>
        </div>
      </div>
    );
  }

  // Render dashboard based on role
  if (role === "admin") return <AdminDashboard user={user} />;
  return <UserDashboard />;
}

// ensure dynamic server rendering behaviour
export async function getServerSideProps() {
  return { props: {} };
}
EOF

cat > pages/login.tsx <<'EOF'
/**
 * pages/login.tsx
 * Email + password login and magic link (OTP) support.
 */
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for a login link.");
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert(error.message);
    else router.push("/app");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
      <h2>Log in</h2>
      <form onSubmit={handlePasswordLogin} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in (password)"}</button>
          <button onClick={handleEmailLogin} type="button" disabled={loading}>{loading ? "…" : "Send magic link"}</button>
        </div>
      </form>
      <p style={{ marginTop: 12 }}>
        <Link href="/signup">Create account</Link> · <Link href="/reset-password">Forgot password</Link>
      </p>
    </div>
  );
}
EOF

cat > pages/signup.tsx <<'EOF'
/**
 * pages/signup.tsx
 * Sign up with email + password + username + phone (creates profiles row).
 */
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // create auth user
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      return alert(error.message);
    }

    // create profile row using anon client; if you require service_role usage, do it server-side.
    // We assume RLS allows insert on profiles for auth.uid() via Supabase auth trigger.
    // If profile row must be inserted now, use supabase.from('profiles').insert(...)
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({ id: userId, email, username, phone, role: "user" });
    }

    setLoading(false);
    alert("Signup success. Check your email for confirmation if required.");
    router.push("/login");
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
      <h2>Create account</h2>
      <form onSubmit={handleSignup} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
      </form>
    </div>
  );
}
EOF

cat > pages/profile.tsx <<'EOF'
/**
 * pages/profile.tsx
 * Simple profile page: allows username & phone update and change password via Supabase
 */
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setLoading(false);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      setProfile(prof);
      setUsername(prof?.username ?? "");
      setPhone(prof?.phone ?? "");
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!profile) return <p>Please login to view profile.</p>;

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ username, phone }).eq("id", profile.id);
    setLoading(false);
    if (error) alert("Update failed: " + error.message);
    else alert("Profile updated");
  }

  async function changePassword() {
    const newPassword = prompt("Enter new password (min length depends on your Supabase settings)");
    if (!newPassword) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else alert("Password updated");
  }

  return (
    <div style={{ maxWidth: 560, margin: "32px auto" }}>
      <h2>Account</h2>
      <form onSubmit={updateProfile} style={{ display: "grid", gap: 8 }}>
        <input value={profile.email ?? ""} disabled />
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Save</button>
          <button onClick={(e) => { e.preventDefault(); changePassword(); }}>Change password</button>
        </div>
      </form>
    </div>
  );
}
EOF

cat > pages/reset-password.tsx <<'EOF'
/**
 * pages/reset-password.tsx
 * Request password reset by sending a magic link / reset email.
 */
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/profile' });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for a password reset link.");
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
      <h2>Reset password</h2>
      <form onSubmit={handleReset} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Sending…" : "Send reset email"}</button>
      </form>
    </div>
  );
}
EOF

cat > supabase/001_create_profiles.sql <<'EOF'
-- supabase/001_create_profiles.sql
-- Creates profiles and announcements tables used by the app
create table if not exists profiles (
  id uuid primary key,
  email text,
  username text,
  phone text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id) on delete set null,
  message text,
  date timestamptz default now()
);
EOF

cat > supabase/policies.sql <<'EOF'
-- supabase/policies.sql
-- Enables RLS and sensible policies for profiles and announcements

-- Enable RLS
alter table profiles enable row level security;
alter table announcements enable row level security;

-- PROFILES
-- Allow authenticated users to insert their own profile (auth.uid() must equal id)
create policy "Insert own profile" on profiles for insert
with check (auth.uid() = id);

-- Allow authenticated users to select their own profile
create policy "Select own profile" on profiles for select
using (auth.uid() = id);

-- Allow authenticated users to update their own profile (username/phone)
create policy "Update own profile" on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Admins: allow full access for rows where profiles.role = 'admin'
create policy "Admins manage profiles" on profiles for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ANNOUNCEMENTS
-- Everyone (authenticated) can read announcements
create policy "Select announcements" on announcements for select using (true);

-- Only admins can insert announcements
create policy "Admins insert announcements" on announcements for insert
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Only admins can update/delete announcements
create policy "Admins update announcements" on announcements for update
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins delete announcements" on announcements for delete
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
EOF

echo "WROTE files. Review them now. (Backups kept in $bak)"
echo "Next steps:"
echo "  git add ."
echo '  git commit -m "Replace conflicted files with modernized versions"'
echo "  git push"
