import React, { useState, useEffect, useRef } from 'react';
import { EmptyState, SafetyBanner } from '../components/ui';
import { useApp } from '../store';
import type { Screen } from '../types';

/* ── Shared chat store in localStorage ── */
const CHAT_KEY = 'thriftly_chats';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;           // sorted participantIds joined by '_'
  participantIds: string[];
  participantNames: Record<string, string>;
  messages: ChatMessage[];
  lastUpdated: string;
}

function convId(a: string, b: string) {
  return [a, b].sort().join('_');
}

function loadChats(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); } catch { return []; }
}

function saveChats(chats: Conversation[]) {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(chats)); } catch {}
}

function getOrCreateConv(userId: string, userName: string, otherId: string, otherName: string): Conversation {
  const chats = loadChats();
  const cid = convId(userId, otherId);
  const existing = chats.find(c => c.id === cid);
  if (existing) {
    // Ensure names are up to date
    existing.participantNames[userId] = userName;
    existing.participantNames[otherId] = otherName;
    saveChats(chats);
    return existing;
  }
  const conv: Conversation = {
    id: cid,
    participantIds: [userId, otherId],
    participantNames: { [userId]: userName, [otherId]: otherName },
    messages: [],
    lastUpdated: new Date().toISOString(),
  };
  saveChats([...chats, conv]);
  return conv;
}

function sendMessage(convId_: string, msg: ChatMessage) {
  const chats = loadChats();
  const conv = chats.find(c => c.id === convId_);
  if (!conv) return;
  conv.messages.push(msg);
  conv.lastUpdated = msg.timestamp;
  saveChats(chats);
}

/* ── Pending chat target (set before navigating to chat-thread) ── */
const PENDING_CHAT_KEY = 'thriftly_pending_chat';

export function setPendingChat(otherId: string, otherName: string) {
  localStorage.setItem(PENDING_CHAT_KEY, JSON.stringify({ otherId, otherName }));
}

function consumePendingChat(): { otherId: string; otherName: string } | null {
  try {
    const raw = localStorage.getItem(PENDING_CHAT_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_CHAT_KEY);
    return JSON.parse(raw);
  } catch { return null; }
}

/* ── Chat List ── */
export function ChatListScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state } = useApp();
  const userId = state.user?.id ?? '';
  const [chats, setChats] = useState<Conversation[]>([]);

  useEffect(() => {
    const all = loadChats();
    setChats(all.filter(c => c.participantIds.includes(userId)));
  }, [userId]);

  const myChats = chats
    .filter(c => c.messages.length > 0)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)]">
        <h1 className="font-display font-bold text-xl text-[var(--foreground)]">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {myChats.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No conversations yet."
            body="Tap 'Chat with Seller' on any listing to start."
            action="Explore Marketplace"
            onAction={() => navigate('explore')}
          />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {myChats.map(conv => {
              const otherId = conv.participantIds.find(id => id !== userId) ?? '';
              const otherName = conv.participantNames[otherId] ?? 'User';
              const last = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setPendingChat(otherId, otherName);
                    navigate('chat-thread');
                  }}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--secondary)] transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-display font-bold flex-shrink-0">
                    {otherName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-display font-semibold text-sm text-[var(--foreground)]">{otherName}</p>
                      <span className="text-[var(--muted-foreground)] text-[10px] flex-shrink-0 ml-2">
                        {new Date(last.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[var(--muted-foreground)] text-xs truncate mt-0.5">
                      {last.senderId === userId ? 'You: ' : ''}{last.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Chat Thread ── */
export function ChatThreadScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state } = useApp();
  const userId = state.user?.id ?? '';
  const userName = state.user?.name ?? 'Me';

  const [conv, setConv] = useState<Conversation | null>(null);
  const [otherId, setOtherId] = useState('');
  const [otherName, setOtherName] = useState('');
  const [msg, setMsg] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pending = consumePendingChat();
    const oid = pending?.otherId ?? '';
    const oname = pending?.otherName ?? 'User';
    setOtherId(oid);
    setOtherName(oname);
    if (oid) {
      const c = getOrCreateConv(userId, userName, oid, oname);
      setConv(c);
    }
  }, [userId, userName]);

  // Poll for new messages every second (simulates real-time for same device demo)
  useEffect(() => {
    if (!conv) return;
    const interval = setInterval(() => {
      const fresh = loadChats().find(c => c.id === conv.id);
      if (fresh && fresh.messages.length !== conv.messages.length) {
        setConv({ ...fresh });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [conv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages.length]);

  function send() {
    if (!msg.trim() || !conv) return;
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      senderId: userId,
      senderName: userName,
      text: msg.trim(),
      timestamp: new Date().toISOString(),
    };
    sendMessage(conv.id, newMsg);
    setConv(prev => prev ? { ...prev, messages: [...prev.messages, newMsg], lastUpdated: newMsg.timestamp } : prev);
    setMsg('');
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <button onClick={() => navigate('chat-list')} className="text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-display font-bold text-sm flex-shrink-0">
          {otherName[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1">
          <p className="font-display font-semibold text-sm text-[var(--foreground)]">{otherName || '…'}</p>
          <p className="text-[var(--muted-foreground)] text-xs">VIT Verified</p>
        </div>
      </div>

      <div className="px-5 py-2">
        <SafetyBanner />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {(conv?.messages.length ?? 0) === 0 && (
          <p className="text-[var(--muted-foreground)] text-sm text-center mt-8">
            Send a message to start the conversation.
          </p>
        )}
        {conv?.messages.map((m) => {
          const mine = m.senderId === userId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                mine
                  ? 'bg-[var(--primary)] text-white rounded-br-sm'
                  : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-[var(--muted-foreground)]'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-8 pt-3 border-t border-[var(--border)]">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Type a message…"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            className="flex-1 bg-[var(--secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] transition-colors outline-none"
          />
          <button
            onClick={send}
            className="w-11 h-11 bg-[var(--primary)] rounded-2xl flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
