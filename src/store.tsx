import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { AppState, Listing, User, WishlistItem, Notification, LostFoundPost, Offer, ExchangeProposal, RentalRequest, Transaction, Theme } from './types';
import { SEED_LISTINGS } from './seedData';

/* ── Per-user data persisted across logout/login ── */
const USER_DATA_KEY = 'thriftly_userdata';

interface PerUserData {
  wishlist: WishlistItem[];
  thriftPoints: number;
  transactions: Transaction[];
  offers: Offer[];
  proposals: ExchangeProposal[];
  rentalRequests: RentalRequest[];
  notifications: Notification[];
}

const EMPTY_USER_DATA: PerUserData = {
  wishlist: [], thriftPoints: 0, transactions: [],
  offers: [], proposals: [], rentalRequests: [], notifications: [],
};

function loadUserData(userId: string): PerUserData {
  try {
    const all = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
    return { ...EMPTY_USER_DATA, ...(all[userId] ?? {}) };
  } catch {
    return { ...EMPTY_USER_DATA };
  }
}

function saveUserData(userId: string, data: PerUserData) {
  try {
    const all = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
    all[userId] = data;
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(all));
  } catch {}
}

/* ── Shared marketplace listings persisted across all users ── */
const MARKETPLACE_KEY = 'thriftly_marketplace';

function loadMarketplace(): Listing[] {
  try {
    const stored = JSON.parse(localStorage.getItem(MARKETPLACE_KEY) || '[]') as Listing[];
    // Strip any seed listings that may have been written by old code, then prepend fresh seeds
    const userListings = stored.filter(l => !l.id.startsWith('seed-'));
    return [...userListings, ...SEED_LISTINGS];
  } catch {
    return SEED_LISTINGS;
  }
}

function saveMarketplace(listings: Listing[]) {
  // Only persist user-created listings; seed data is always rebuilt from code
  const userListings = listings.filter(l => !l.id.startsWith('seed-'));
  try { localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(userListings)); } catch {}
}

type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_LISTING'; payload: Listing }
  | { type: 'UPDATE_LISTING'; payload: Listing }
  | { type: 'REMOVE_LISTING'; payload: string }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_OFFER'; payload: Offer }
  | { type: 'UPDATE_OFFER'; payload: Offer }
  | { type: 'ADD_PROPOSAL'; payload: ExchangeProposal }
  | { type: 'UPDATE_PROPOSAL'; payload: ExchangeProposal }
  | { type: 'ADD_RENTAL_REQUEST'; payload: RentalRequest }
  | { type: 'UPDATE_RENTAL_REQUEST'; payload: RentalRequest }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_LOST_FOUND'; payload: LostFoundPost }
  | { type: 'ADD_THRIFT_POINTS'; payload: number }
  | { type: 'SET_THEME'; payload: Theme };

function makeInitialState(): AppState {
  return {
    user: null,
    theme: null,
    listings: loadMarketplace(),
    wishlist: [],
    conversations: [],
    transactions: [],
    offers: [],
    proposals: [],
    rentalRequests: [],
    notifications: [],
    lostFound: [],
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER': {
      const userData = loadUserData(action.payload.id);
      return {
        ...state,
        user: { ...action.payload, thriftPoints: userData.thriftPoints },
        wishlist: userData.wishlist,
        transactions: userData.transactions,
        offers: userData.offers,
        proposals: userData.proposals,
        rentalRequests: userData.rentalRequests,
        notifications: userData.notifications,
      };
    }
    case 'LOGOUT':
      return makeInitialState();
    case 'ADD_LISTING':
      return { ...state, listings: [action.payload, ...state.listings] };
    case 'UPDATE_LISTING':
      return {
        ...state,
        listings: state.listings.map((l) => (l.id === action.payload.id ? action.payload : l)),
      };
    case 'REMOVE_LISTING':
      return {
        ...state,
        listings: state.listings.map((l) =>
          l.id === action.payload ? { ...l, status: 'removed' as const } : l
        ),
      };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.some((w) => w.listingId === action.payload);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter((w) => w.listingId !== action.payload)
          : [...state.wishlist, { listingId: action.payload, savedAt: new Date().toISOString() }],
      };
    }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'ADD_OFFER':
      return { ...state, offers: [action.payload, ...state.offers] };
    case 'UPDATE_OFFER':
      return {
        ...state,
        offers: state.offers.map((o) => (o.id === action.payload.id ? action.payload : o)),
      };
    case 'ADD_PROPOSAL':
      return { ...state, proposals: [action.payload, ...state.proposals] };
    case 'UPDATE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'ADD_RENTAL_REQUEST':
      return { ...state, rentalRequests: [action.payload, ...state.rentalRequests] };
    case 'UPDATE_RENTAL_REQUEST':
      return {
        ...state,
        rentalRequests: state.rentalRequests.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'ADD_LOST_FOUND':
      return { ...state, lostFound: [action.payload, ...state.lostFound] };
    case 'ADD_THRIFT_POINTS':
      return state.user
        ? { ...state, user: { ...state.user, thriftPoints: state.user.thriftPoints + action.payload } }
        : state;
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  // Persist shared marketplace listings
  useEffect(() => {
    saveMarketplace(state.listings);
  }, [state.listings]);

  // Persist all per-user activity whenever anything changes
  useEffect(() => {
    if (state.user) {
      saveUserData(state.user.id, {
        wishlist: state.wishlist,
        thriftPoints: state.user.thriftPoints,
        transactions: state.transactions,
        offers: state.offers,
        proposals: state.proposals,
        rentalRequests: state.rentalRequests,
        notifications: state.notifications,
      });
    }
  }, [
    state.user?.id,
    state.wishlist,
    state.user?.thriftPoints,
    state.transactions,
    state.offers,
    state.proposals,
    state.rentalRequests,
    state.notifications,
  ]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function formatINR(amount: number): string {
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(1)}L`;
  }
  const s = amount.toLocaleString('en-IN');
  return `₹${s}`;
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}
