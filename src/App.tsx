import React, { useState } from 'react';
import { AppProvider, useApp } from './store';
import type { Screen } from './types';

import { OnboardingScreen, LoginScreen, SignupScreen, VerifyScreen } from './screens/Auth';
import { HomeScreen } from './screens/Home';
import { ExploreScreen } from './screens/Explore';
import { CreateListingScreen } from './screens/CreateListing';
import { ProductDetailScreen } from './screens/ProductDetail';
import {
  CartSellScreen, CartExchangeScreen, CartGiveAwayScreen, CartRentScreen,
} from './screens/Cart';
import { ChatListScreen, ChatThreadScreen } from './screens/Chat';
import { SavedScreen } from './screens/Saved';
import {
  ProfileScreen, MyListingsScreen, MyOffersScreen, MyTransactionsScreen,
} from './screens/Profile';
import { ImpactScreen, ThriftPointsScreen } from './screens/Impact';
import { NotificationsScreen, SettingsScreen } from './screens/Misc';
import { ThemeSelectionScreen } from './screens/ThemeSelection';

type CartData = {
  listingId: string;
  agreedPrice?: number;
  rentStart?: string;
  rentEnd?: string;
  fee?: number;
  deposit?: number;
  pickupPoint?: string;
  returnPoint?: string;
  myListingId?: string;
};

function BottomNav({
  active,
  onNavigate,
}: {
  active: 'home' | 'explore' | 'create' | 'saved' | 'profile';
  onNavigate: (tab: 'home' | 'explore' | 'create' | 'saved' | 'profile') => void;
}) {
  const tabs = [
    { key: 'home' as const, icon: HomeIcon, label: 'Home' },
    { key: 'explore' as const, icon: ExploreIcon, label: 'Explore' },
    { key: 'create' as const, icon: PlusIcon, label: 'List', center: true },
    { key: 'saved' as const, icon: SavedIcon, label: 'Saved' },
    { key: 'profile' as const, icon: ProfileIcon, label: 'Profile' },
  ];

  return (
    <div className="flex items-center justify-around bg-[var(--card)] border-t border-[var(--border)] px-2 pb-safe pt-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        if (tab.center) {
          return (
            <button
              key={tab.key}
              onClick={() => onNavigate(tab.key)}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
                <tab.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[var(--primary)] text-[10px] font-display font-semibold mt-1">{tab.label}</span>
            </button>
          );
        }
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            className="flex flex-col items-center gap-1 py-1 px-3"
          >
            <tab.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
            <span className={`text-[10px] font-display font-semibold transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const THEME_KEY = 'thriftly_theme';

function AppShell() {
  const { state, dispatch } = useApp();
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [selectedListingId, setSelectedListingId] = useState('');
  const [cartData, setCartData] = useState<CartData>({ listingId: '' });
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'create' | 'saved' | 'profile'>('home');

  // On mount, restore saved theme from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
    if (saved) dispatch({ type: 'SET_THEME', payload: saved });
  }, []);

  // Persist theme to localStorage whenever it changes
  React.useEffect(() => {
    if (state.theme) localStorage.setItem(THEME_KEY, state.theme);
  }, [state.theme]);

  // When user logs out (user becomes null), return to onboarding
  React.useEffect(() => {
    if (!state.user) setScreen('onboarding');
  }, [state.user]);

const showBottomNav = state.user != null && !['onboarding', 'login', 'signup', 'verify'].includes(screen);

  function navigate(s: Screen) {
    setScreen(s);
  }

  function onProductSelect(id: string) {
    setSelectedListingId(id);
  }

  function onCartNavigate(s: Screen, data?: CartData) {
    if (data) setCartData(data);
    setScreen(s);
  }

  function handleTabChange(tab: 'home' | 'explore' | 'create' | 'saved' | 'profile') {
    setActiveTab(tab);
    if (tab === 'home') navigate('home');
    else if (tab === 'explore') navigate('explore');
    else if (tab === 'create') navigate('create-listing');
    else if (tab === 'saved') navigate('saved');
    else if (tab === 'profile') navigate('profile');
  }

  // Update active tab when navigating to main screens
  const tabScreenMap: Partial<Record<Screen, 'home' | 'explore' | 'create' | 'saved' | 'profile'>> = {
    home: 'home',
    explore: 'explore',
    'create-listing': 'create',
    saved: 'saved',
    profile: 'profile',
  };

  function nav(s: Screen) {
    // Returning users (already have a saved theme) skip theme selection
    if (s === 'theme-selection' && localStorage.getItem(THEME_KEY)) {
      setActiveTab('home');
      setScreen('home');
      return;
    }
    if (tabScreenMap[s]) setActiveTab(tabScreenMap[s]!);
    setScreen(s);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#030310]">
      {/* Mobile frame — theme class scopes CSS vars inside */}
      <div
        className={`relative w-full max-w-sm h-[100svh] max-h-[900px] overflow-hidden flex flex-col bg-[var(--background)] shadow-2xl ${state.theme === 'light' ? 'theme-light' : ''}`}
        style={{ borderRadius: '0px' }}
      >

        {/* Screen content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {screen === 'onboarding' && <OnboardingScreen navigate={nav} />}
          {screen === 'login' && <LoginScreen navigate={nav} />}
          {screen === 'signup' && <SignupScreen navigate={nav} />}
          {screen === 'verify' && <VerifyScreen navigate={nav} />}

          {screen === 'home' && <HomeScreen navigate={nav} onProductSelect={onProductSelect} />}
          {screen === 'explore' && <ExploreScreen navigate={nav} onProductSelect={onProductSelect} />}
          {screen === 'create-listing' && <CreateListingScreen navigate={nav} />}

          {screen === 'product-detail' && (
            <ProductDetailScreen
              listingId={selectedListingId}
              navigate={nav}
              onCartNavigate={onCartNavigate}
            />
          )}

          {screen === 'cart-sell' && <CartSellScreen data={cartData} navigate={nav} />}
          {screen === 'cart-exchange' && <CartExchangeScreen data={{ ...cartData }} navigate={nav} />}
          {screen === 'cart-give-away' && <CartGiveAwayScreen data={cartData} navigate={nav} />}
          {screen === 'cart-rent' && <CartRentScreen data={cartData} navigate={nav} />}

          {screen === 'chat-list' && <ChatListScreen navigate={nav} />}
          {screen === 'chat-thread' && <ChatThreadScreen navigate={nav} />}

          {screen === 'saved' && <SavedScreen navigate={nav} onProductSelect={onProductSelect} />}

          {screen === 'profile' && <ProfileScreen navigate={nav} />}
          {screen === 'my-listings' && <MyListingsScreen navigate={nav} />}
          {screen === 'my-offers' && <MyOffersScreen navigate={nav} />}
          {screen === 'my-transactions' && <MyTransactionsScreen navigate={nav} />}

          {screen === 'impact' && <ImpactScreen navigate={nav} />}
          {screen === 'thrift-points' && <ThriftPointsScreen navigate={nav} />}

          {screen === 'notifications' && <NotificationsScreen navigate={nav} />}
          {screen === 'settings' && <SettingsScreen navigate={nav} />}
          {screen === 'theme-selection' && <ThemeSelectionScreen navigate={nav} />}
        </div>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <BottomNav active={activeTab} onNavigate={handleTabChange} />
        )}
      </div>
    </div>
  );
}

/* ─── Icons ─── */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function ExploreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
function SavedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
