import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton, TextButton, TextInput, VerifiedBadge } from '../components/ui';
import { useApp, genId } from '../store';
import type { Screen } from '../types';

/* ─── Accounts registry persisted in localStorage ─── */
const ACCOUNTS_KEY = 'thriftly_accounts';

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  studentId: string;
  joinedAt: string;
}

function getAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); } catch { return []; }
}

function saveAccount(acc: StoredAccount) {
  const accounts = getAccounts();
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, acc]));
}

function findAccount(email: string): StoredAccount | undefined {
  return getAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
}

/* ─── Onboarding ─── */
const SLIDES = [
  {
    icon: '🏛️',
    title: 'Your campus.\nYour marketplace.',
    body: 'Sell, exchange, give away, or rent useful items within your campus.',
    items: [
      { icon: '💰', label: 'Sell' },
      { icon: '🔄', label: 'Exchange' },
      { icon: '🎁', label: 'Give Away' },
      { icon: '🕒', label: 'Rent' },
    ],
  },
  {
    icon: '🎓',
    title: 'Only verified\nstudents.',
    body: 'Connect through your verified campus community.',
    items: [],
  },
  {
    icon: '♻️',
    title: 'Give useful things\na second life.',
    body: 'Reuse more, spend less, and keep useful items circulating.',
    items: [],
  },
];

export function OnboardingScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];

  return (
    <div className="flex flex-col h-full bg-[var(--background)] px-6 py-8">
      {/* Skip */}
      <div className="flex justify-end">
        {slide < 2 && (
          <TextButton onClick={() => navigate('login')}>Skip</TextButton>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <div className="text-8xl">{current.icon}</div>

        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--foreground)] leading-tight whitespace-pre-line mb-4">
            {current.title}
          </h1>
          <p className="text-[var(--secondary-foreground)] text-base leading-relaxed">{current.body}</p>
        </div>

        {current.items.length > 0 && (
          <div className="grid grid-cols-4 gap-3 w-full">
            {current.items.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[var(--foreground)] text-xs font-display font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {slide === 1 && (
          <div className="bg-[var(--accent)]/20 border border-[var(--accent-foreground)]/30 rounded-2xl px-6 py-4 w-full">
            <VerifiedBadge />
            <p className="text-[var(--secondary-foreground)] text-sm mt-1">VIT identity verified</p>
          </div>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${i === slide ? 'w-8 bg-[var(--primary)]' : 'w-2 bg-[var(--border)]'}`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {slide < 2 ? (
          <PrimaryButton onClick={() => setSlide((s) => s + 1)}>Next</PrimaryButton>
        ) : (
          <>
            <PrimaryButton onClick={() => navigate('signup')}>Get Started</PrimaryButton>
            <SecondaryButton onClick={() => navigate('login')}>Log In</SecondaryButton>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Login ─── */
export function LoginScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { dispatch } = useApp();

  function validate() {
    const e: Record<string, string> = {};
    if (!/^[a-zA-Z0-9._%+-]+@vit\.com$/.test(email.trim()))
      e.email = 'Only VIT email addresses are accepted (e.g. 22BCE1234@vit.com).';
    if (!password) e.password = 'Please enter your password.';
    return e;
  }

  function handleLogin() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const account = findAccount(email.trim());
    if (!account) {
      setErrors({ email: 'No account found with this email. Please sign up first.' });
      return;
    }
    if (account.password !== password) {
      setErrors({ password: 'Incorrect password. Please try again.' });
      return;
    }

    dispatch({
      type: 'SET_USER',
      payload: {
        id: account.id,
        name: account.name,
        email: account.email,
        studentId: account.studentId,
        campus: 'VIT',
        verified: true,
        ratingCount: 0,
        thriftPoints: 0,
        joinedAt: account.joinedAt,
      },
    });
    navigate('theme-selection');
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)] px-6 py-10 overflow-y-auto">
      <div className="mb-8">
        <div className="text-4xl mb-3">🛍️</div>
        <h1 className="font-display font-bold text-3xl text-[var(--foreground)]">Welcome back</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">Log in to your campus marketplace</p>
      </div>

      <div className="flex flex-col gap-4">
        <TextInput
          label="VIT Email"
          placeholder="RegNo@vit.com"
          value={email}
          onChange={setEmail}
          type="email"
          error={errors.email}
        />
        <TextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          type={showPass ? 'text' : 'password'}
          error={errors.password}
          rightEl={
            <button onClick={() => setShowPass(!showPass)} className="text-[var(--muted-foreground)] text-xs">
              {showPass ? 'Hide' : 'Show'}
            </button>
          }
        />
        <div className="text-right">
          <TextButton>Forgot Password?</TextButton>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <PrimaryButton onClick={handleLogin}>Log In</PrimaryButton>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[var(--muted-foreground)] text-xs">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <button className="w-full py-3.5 rounded-2xl border border-[var(--border)] flex items-center justify-center gap-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors">
          <span className="text-lg">🔵</span> Continue with Google
        </button>
      </div>

      <p className="text-center text-[var(--muted-foreground)] text-sm mt-8">
        Don&apos;t have an account?{' '}
        <button onClick={() => navigate('signup')} className="text-[var(--primary)] font-semibold">Sign Up</button>
      </p>
    </div>
  );
}

/* ─── Signup ─── */
export function SignupScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [form, setForm] = useState({
    name: '', email: '', studentId: '', password: '', confirm: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { dispatch } = useApp();

  function set(k: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!/^[a-zA-Z0-9._%+-]+@vit\.com$/.test(form.email.trim()))
      e.email = 'Only VIT email addresses are accepted (e.g. 22BCE1234@vit.com).';
    if (!form.studentId.trim()) e.studentId = 'Please enter your student ID.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  }

  function handleSignup() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    if (findAccount(form.email.trim())) {
      setErrors({ email: 'An account with this email already exists. Please log in.' });
      return;
    }

    const id = genId();
    const joinedAt = new Date().toISOString();

    saveAccount({
      id,
      name: form.name,
      email: form.email.trim(),
      password: form.password,
      studentId: form.studentId,
      joinedAt,
    });

    dispatch({
      type: 'SET_USER',
      payload: {
        id,
        name: form.name,
        email: form.email.trim(),
        campus: 'VIT',
        studentId: form.studentId,
        verified: false,
        ratingCount: 0,
        thriftPoints: 0,
        joinedAt,
      },
    });
    navigate('verify');
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto">
      <div className="px-6 py-6">
        <button onClick={() => navigate('login')} className="mb-6 text-[var(--muted-foreground)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-3xl text-[var(--foreground)]">Create Account</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">Join the VIT circular marketplace</p>
      </div>

      <div className="px-6 pb-8 flex flex-col gap-4">
        <TextInput label="Full Name" placeholder="Enter your full name" value={form.name} onChange={set('name')} error={errors.name} />
        <TextInput label="VIT Email" placeholder="RegNo@vit.com" value={form.email} onChange={set('email')} type="email" error={errors.email} />
        <TextInput label="Student ID" placeholder="Enter your student ID" value={form.studentId} onChange={set('studentId')} error={errors.studentId} />
        <TextInput
          label="Password"
          placeholder="Create a password"
          value={form.password}
          onChange={set('password')}
          type={showPass ? 'text' : 'password'}
          error={errors.password}
          rightEl={<button onClick={() => setShowPass(!showPass)} className="text-[var(--muted-foreground)] text-xs">{showPass ? 'Hide' : 'Show'}</button>}
        />
        <TextInput label="Confirm Password" placeholder="Confirm your password" value={form.confirm} onChange={set('confirm')} type="password" error={errors.confirm} />

        <div className="mt-2">
          <PrimaryButton onClick={handleSignup}>Create Account</PrimaryButton>
        </div>
        <p className="text-center text-[var(--muted-foreground)] text-sm">
          Already have an account?{' '}
          <button onClick={() => navigate('login')} className="text-[var(--primary)] font-semibold">Log In</button>
        </p>
      </div>
    </div>
  );
}

/* ─── Campus Verification ─── */
export function VerifyScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, dispatch } = useApp();
  const [phase, setPhase] = useState<'loading' | 'success' | 'failed'>('loading');

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('success'), 2200);
    return () => clearTimeout(t1);
  }, []);

  function handleContinue() {
    dispatch({ type: 'SET_USER', payload: { ...state.user!, verified: true } });
    // New user after signup — always show theme selection first
    navigate('theme-selection');
  }

  const steps = [
    { label: 'Checking email', done: true },
    { label: 'Validating student ID', done: phase !== 'loading' },
    { label: 'Verifying VIT enrollment', done: phase === 'success' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--background)] items-center justify-center px-8 text-center gap-8">
      {phase === 'loading' && (
        <>
          <div className="w-20 h-20 rounded-full border-4 border-[var(--primary)]/30 border-t-[var(--primary)] animate-spin" />
          <div>
            <h2 className="font-display font-bold text-2xl text-[var(--foreground)] mb-2">Verifying your VIT account…</h2>
            <p className="text-[var(--muted-foreground)] text-sm">Please wait while we validate your details.</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step.done ? 'bg-green-500' : 'bg-[var(--border)]'}`}>
                  {step.done ? '✓' : '·'}
                </div>
                <span className="text-[var(--foreground)] text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {phase === 'success' && (
        <>
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-green-400 mb-2">VIT Verified!</h2>
            <p className="text-[var(--secondary-foreground)] text-sm">
              You&apos;re verified as a{' '}
              <span className="font-semibold text-[var(--foreground)]">VIT student</span>
            </p>
          </div>
          <div className="w-full flex flex-col gap-3 mt-4">
            <PrimaryButton onClick={handleContinue}>Continue to Thriftly</PrimaryButton>
          </div>
        </>
      )}

      {phase === 'failed' && (
        <>
          <span className="text-5xl">❌</span>
          <div>
            <h2 className="font-display font-bold text-2xl text-red-400 mb-2">Couldn&apos;t verify your VIT account.</h2>
            <p className="text-[var(--muted-foreground)] text-sm">Check your details and try again.</p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <PrimaryButton onClick={() => setPhase('loading')}>Try Again</PrimaryButton>
            <SecondaryButton onClick={() => {}}>Contact Support</SecondaryButton>
          </div>
        </>
      )}
    </div>
  );
}
