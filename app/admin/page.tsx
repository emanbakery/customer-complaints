'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Complaint, ComplaintStatus } from '@/lib/types';

const STATUS_LABELS: Record<ComplaintStatus, { ar: string; en: string; color: string }> = {
  new: { ar: 'جديدة', en: 'New', color: 'bg-red-100 text-red-700' },
  in_progress: { ar: 'قيد المعالجة', en: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  resolved: { ar: 'تم الحل', en: 'Resolved', color: 'bg-green-100 text-green-700' },
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | ComplaintStatus>('all');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setAuthed(true); fetchComplaints(); }
      setLoading(false);
    });
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthErr(error.message); setAuthLoading(false); return; }
    setAuthed(true);
    fetchComplaints();
    setAuthLoading(false);
  };

  const fetchComplaints = async () => {
    setLoading(true);
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints((data as Complaint[]) || []);
    setLoading(false);
  };

  const updateComplaint = async (id: string, status: ComplaintStatus, adminNotes: string) => {
    setSaving(true);
    await supabase.from('complaints').update({ status, admin_notes: adminNotes }).eq('id', id);
    await fetchComplaints();
    setSelected(null);
    setSaving(false);
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const counts = {
    all: complaints.length,
    new: complaints.filter(c => c.status === 'new').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-sm w-full">
          <h1 className="text-2xl font-bold text-brand mb-6 text-center">🔐 Admin Login</h1>
          <form onSubmit={login} className="space-y-4">
            <input className="input-field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            {authErr && <p className="text-red-500 text-sm">{authErr}</p>}
            <button className="btn-primary w-full" disabled={authLoading}>{authLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 p-4 md:p-8" dir="ltr">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand">Eman Bakery</h1>
            <p className="text-gray-500">Complaint Management Dashboard</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => setAuthed(false))} className="text-sm text-red-500 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">Logout</button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'new', 'in_progress', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === f ? 'bg-brand text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_LABELS[f].en} ({counts[f]})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-16">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500">No complaints found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(c => (
              <div key={c.id} className="card flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setSelected(c); setNotes(c.admin_notes || ''); }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_LABELS[c.status].color}`}>{STATUS_LABELS[c.status].en}</span>
                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('en-SA')}</span>
                  </div>
                  <h3 className="font-bold text-gray-800">{c.shop_name}</h3>
                  <p className="text-sm text-gray-500">{c.mobile}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.description}</p>
                </div>
                {c.photo_url && (
                  <img src={c.photo_url} alt="complaint" width={80} height={80} loading="lazy" className="rounded-xl object-cover w-20 h-20 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" dir="ltr" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selected.shop_name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-1">📞 {selected.mobile}</p>
            <p className="text-sm text-gray-500 mb-4">🕐 {new Date(selected.created_at).toLocaleString('en-SA')}</p>
            <p className="text-gray-700 mb-4">{selected.description}</p>
            {selected.photo_url && (
              <a href={selected.photo_url} target="_blank" rel="noopener noreferrer">
                <img src={selected.photo_url} alt="complaint photo" loading="lazy" className="rounded-xl w-full max-h-64 object-cover mb-4" />
              </a>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Status</label>
                <select
                  className="input-field"
                  value={selected.status}
                  onChange={e => setSelected({ ...selected, status: e.target.value as ComplaintStatus })}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Admin Notes</label>
                <textarea className="input-field min-h-[80px] resize-none" placeholder="Add internal notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <button
                className="btn-primary w-full"
                disabled={saving}
                onClick={() => updateComplaint(selected.id, selected.status, notes)}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
