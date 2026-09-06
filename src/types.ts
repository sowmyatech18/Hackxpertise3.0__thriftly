export type TransactionType = 'sell' | 'exchange' | 'give-away' | 'rent';

export type ListingStatus =
  | 'available'
  | 'offer-pending'
  | 'proposal-pending'
  | 'request-pending'
  | 'rental-request'
  | 'reserved'
  | 'sold'
  | 'exchanged'
  | 'given-away'
  | 'rented-out'
  | 'return-pending'
  | 'returned'
  | 'draft'
  | 'removed';

export type Condition = 'new' | 'like-new' | 'good' | 'used';

export type Category =
  | 'books'
  | 'electronics'
  | 'furniture'
  | 'fashion'
  | 'bags'
  | 'stationery'
  | 'hostel-essentials'
  | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  campus: string;
  verified: boolean;
  avatar?: string;
  rating?: number;
  ratingCount: number;
  thriftPoints: number;
  joinedAt: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName?: string;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  transactionType: TransactionType;
  photos: string[];
  status: ListingStatus;
  price?: number;
  originalPrice?: number;
  exchangePreference?: string;
  rentalRateDay?: number;
  rentalRateWeek?: number;
  rentalDeposit?: number;
  rentalStartDate?: string;
  rentalEndDate?: string;
  rentalNotes?: string;
  exchangePoint: string;
  isUrgent?: boolean;
  urgentReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  counterAmount?: number;
  createdAt: string;
}

export interface ExchangeProposal {
  id: string;
  listingId: string;
  proposerId: string;
  myListingId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface RentalRequest {
  id: string;
  listingId: string;
  requesterId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter';
  totalFee: number;
  pickupPoint: string;
  returnPoint: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  offerId?: string;
  proposalId?: string;
  rentalId?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  participantIds: string[];
  messages: Message[];
  lastActivity: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  transactionType: TransactionType;
  agreedPrice?: number;
  exchangePoint: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  rentalPeriod?: { start: string; end: string };
  rentalFee?: number;
  deposit?: number;
  completedAt?: string;
  createdAt: string;
}

export interface WishlistItem {
  listingId: string;
  savedAt: string;
}

export interface Notification {
  id: string;
  type:
    | 'message'
    | 'offer'
    | 'exchange'
    | 'rental'
    | 'wishlist'
    | 'transaction'
    | 'moderation';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface LostFoundPost {
  id: string;
  userId: string;
  type: 'lost' | 'found';
  itemName: string;
  location: string;
  date: string;
  description: string;
  photos: string[];
  createdAt: string;
}

export interface AppState {
  user: User | null;
  theme: Theme | null;
  listings: Listing[];
  wishlist: WishlistItem[];
  conversations: Conversation[];
  transactions: Transaction[];
  offers: Offer[];
  proposals: ExchangeProposal[];
  rentalRequests: RentalRequest[];
  notifications: Notification[];
  lostFound: LostFoundPost[];
}

export type Theme = 'dark' | 'light';

export type Screen =
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'verify'
  | 'home'
  | 'explore'
  | 'product-detail'
  | 'create-listing'
  | 'offer-modal'
  | 'exchange-proposal'
  | 'rent-request'
  | 'give-away-request'
  | 'cart-sell'
  | 'cart-exchange'
  | 'cart-give-away'
  | 'cart-rent'
  | 'transaction-confirmed'
  | 'chat-list'
  | 'chat-thread'
  | 'saved'
  | 'profile'
  | 'my-listings'
  | 'my-offers'
  | 'my-transactions'
  | 'impact'
  | 'thrift-points'
  | 'leaderboard'
  | 'notifications'
  | 'settings'
  | 'lost-found'
  | 'rating'
  | 'report'
  | 'theme-selection';
