import React, { useState } from 'react';
import { useApp, genId } from '../store';
import { EmptyState, PrimaryButton, TextInput, TextArea, Dropdown, Toggle } from '../components/ui';
import type { Screen } from '../types';

/* ─── Notifications ─── */
export function NotificationsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, dispatch } = useApp();
  const { notifications } = state;

  const categoryIcons: Record<string, string> = {
    message: '💬', offer: '💰', exchange: '🔄', rental: '🕒',
    wishlist: '🤍', transaction: '🔁', moderation: '⚠️',
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('home')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={() => notifications.forEach((n) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id }))}
            className="ml-auto text-[var(--primary)] text-xs font-medium"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {notifications.length === 0 ? (
          <EmptyState icon="🔔" title="You're all caught up." body="No notifications right now." />
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-colors ${n.read ? 'bg-[var(--card)] border-[var(--border)]' : 'bg-[var(--primary)]/5 border-[var(--primary)]/20'}`}
              >
                <span className="text-xl">{categoryIcons[n.type] ?? '🔔'}</span>
                <div className="flex-1">
                  <p className="text-[var(--foreground)] text-sm font-display font-semibold">{n.title}</p>
                  <p className="text-[var(--muted-foreground)] text-xs mt-0.5">{n.body}</p>
                  <p className="text-[var(--muted-foreground)] text-[10px] mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-1" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Settings ─── */
export function SettingsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, dispatch } = useApp();
  const [notifs, setNotifs] = useState({
    messages: true, offers: true, wishlist: true, transactions: true,
    rentals: true, moderation: true,
  });

  function setTheme(t: 'dark' | 'light') {
    dispatch({ type: 'SET_THEME', payload: t });
    localStorage.setItem('thriftly_theme', t);
  }

  const notifItems: { key: keyof typeof notifs; label: string }[] = [
    { key: 'messages', label: 'Messages' },
    { key: 'offers', label: 'Offers' },
    { key: 'wishlist', label: 'Wishlist Updates' },
    { key: 'transactions', label: 'Transaction Status' },
    { key: 'rentals', label: 'Rental Reminders' },
    { key: 'moderation', label: 'Moderation Alerts' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">Settings</h1>
      </div>

      <div className="px-5 py-5 flex flex-col gap-6">
        {/* Notifications */}
        <section>
          <p className="text-[var(--muted-foreground)] text-xs font-display font-semibold uppercase tracking-wider mb-3">Notifications</p>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            {notifItems.map((item, i) => (
              <div key={item.key} className={`flex items-center justify-between px-4 py-4 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                <span className="text-[var(--foreground)] text-sm">{item.label}</span>
                <Toggle value={notifs[item.key]} onChange={(v) => setNotifs((n) => ({ ...n, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </section>

        {/* Appearance */}
        <section>
          <p className="text-[var(--muted-foreground)] text-xs font-display font-semibold uppercase tracking-wider mb-3">Appearance</p>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            {([
              { value: 'dark', icon: '🌙', label: 'Dark Mode' },
              { value: 'light', icon: '☀️', label: 'Light Mode' },
            ] as const).map((opt, i) => {
              const isActive = state.theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors ${i > 0 ? 'border-t border-[var(--border)]' : ''} ${isActive ? 'bg-[var(--primary)]/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.icon}</span>
                    <span className={`text-sm font-medium ${isActive ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)]'}`}>{opt.label}</span>
                    {isActive && (
                      <span className="text-[10px] font-display font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">✓ Selected</span>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'}`}>
                    {isActive && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Account */}
        <section>
          <p className="text-[var(--muted-foreground)] text-xs font-display font-semibold uppercase tracking-wider mb-3">Account</p>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            {['Account & Security', 'Change Password', 'Community Guidelines', 'Privacy', 'Help & Support'].map((item, i) => (
              <button key={item} className={`w-full flex items-center justify-between px-4 py-4 text-left ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                <span className="text-[var(--foreground)] text-sm">{item}</span>
                <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
            <button className="w-full flex items-center justify-between px-4 py-4 border-t border-[var(--border)] text-red-400">
              <span className="text-sm">Delete Account</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        <button
          onClick={() => dispatch({ type: 'LOGOUT' })}
          className="w-full py-4 rounded-2xl border border-red-500/30 text-red-400 font-display font-semibold"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

/* ─── Lost & Found ─── */
export function LostFoundScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<'lost' | 'found'>('lost');
  const [showPost, setShowPost] = useState(false);
  const [postType, setPostType] = useState<'lost' | 'found'>('lost');
  const [form, setForm] = useState({ itemName: '', location: '', date: '', description: '' });

  const posts = state.lostFound.filter((p) => p.type === tab);

  function handlePost() {
    if (!form.itemName || !form.location || !form.date) return;
    dispatch({
      type: 'ADD_LOST_FOUND',
      payload: {
        id: genId(),
        userId: state.user?.id ?? '',
        type: postType,
        itemName: form.itemName,
        location: form.location,
        date: form.date,
        description: form.description,
        photos: [],
        createdAt: new Date().toISOString(),
      },
    });
    setForm({ itemName: '', location: '', date: '', description: '' });
    setShowPost(false);
    setTab(postType);
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--foreground)]">Lost & Found 🔍</h1>
        <button
          onClick={() => { setPostType(tab); setShowPost(true); }}
          className="ml-auto px-3 py-1.5 bg-[var(--primary)] text-white rounded-xl text-xs font-display font-semibold"
        >
          + Post
        </button>
      </div>

      <div className="flex gap-3 px-5 py-3">
        <button onClick={() => setTab('lost')} className={`flex-1 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${tab === 'lost' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'}`}>Lost</button>
        <button onClick={() => setTab('found')} className={`flex-1 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${tab === 'found' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'}`}>Found</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {posts.length === 0 ? (
          <EmptyState icon={tab === 'lost' ? '🔎' : '📋'} title="No posts yet." body={`Be the first to post a ${tab} item.`} action="+ Post" onAction={() => { setPostType(tab); setShowPost(true); }} />
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-display font-bold text-sm text-[var(--foreground)]">{post.itemName}</p>
                  <span className={`text-[10px] font-bold font-display px-2 py-0.5 rounded-full ${post.type === 'lost' ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'}`}>{post.type.toUpperCase()}</span>
                </div>
                <p className="text-[var(--muted-foreground)] text-xs">📍 {post.location}</p>
                <p className="text-[var(--muted-foreground)] text-xs">📅 {post.date}</p>
                {post.description && <p className="text-[var(--secondary-foreground)] text-xs mt-2 leading-relaxed">{post.description}</p>}
                <button onClick={() => navigate('chat-thread')} className="mt-3 w-full py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-xl text-xs font-display font-semibold text-[var(--foreground)]">Contact via Chat</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post modal */}
      {showPost && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPost(false)} />
          <div className="relative w-full bg-[var(--card)] border-t border-[var(--border)] rounded-t-3xl p-6 pb-8">
            <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-5" />
            <h3 className="font-display font-bold text-base text-[var(--foreground)] mb-4">Post {postType === 'lost' ? 'Lost' : 'Found'} Item</h3>
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex gap-3">
                <button onClick={() => setPostType('lost')} className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${postType === 'lost' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'}`}>Lost</button>
                <button onClick={() => setPostType('found')} className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${postType === 'found' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]'}`}>Found</button>
              </div>
              <TextInput label="Item Name" placeholder="What is the item?" value={form.itemName} onChange={(v) => setForm((f) => ({ ...f, itemName: v }))} />
              <TextInput label="Location" placeholder="Where was it lost/found?" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
              <div>
                <p className="text-xs font-display font-medium text-[var(--muted-foreground)] mb-1.5">Date</p>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)]" />
              </div>
              <TextArea label="Description" placeholder="More details…" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} rows={3} />
            </div>
            <PrimaryButton onClick={handlePost} disabled={!form.itemName || !form.location || !form.date}>Post</PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
