import React, { useState, useRef } from 'react';
import {
  PrimaryButton, SecondaryButton, TextInput, TextArea, Dropdown,
  StepIndicator, TopNav, SmartSavings, PriceInput, ImgPlaceholder, Toast,
} from '../components/ui';
import { useApp, genId } from '../store';
import type { Screen, TransactionType, Category, Condition, Listing } from '../types';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'books', label: 'Books' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'bags', label: 'Bags' },
  { value: 'stationery', label: 'Stationery' },
  { value: 'hostel-essentials', label: 'Hostel Essentials' },
  { value: 'other', label: 'Other' },
];

const CONDITIONS: { value: Condition; label: string; desc: string }[] = [
  { value: 'new', label: 'New', desc: 'Never used, in original packaging' },
  { value: 'like-new', label: 'Like New', desc: 'Used once or twice, no visible wear' },
  { value: 'good', label: 'Good', desc: 'Some signs of use but works perfectly' },
  { value: 'used', label: 'Used', desc: 'Noticeable wear, functions well' },
];

const EXCHANGE_POINTS = [
  'Main Gate', 'Central Library', 'Cafeteria Block', 'Student Activity Centre',
  'Hostel Common Area', 'Department Block', 'Sports Complex', 'Other',
];

type Step = 1 | 2 | 3 | 4;

export function CreateListingScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<Step>(1);
  const [txType, setTxType] = useState<TransactionType | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<Condition | ''>('');
  const [exchangePoint, setExchangePoint] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [exchangePref, setExchangePref] = useState('');
  const [rentalRateDay, setRentalRateDay] = useState('');
  const [rentalRateWeek, setRentalRateWeek] = useState('');
  const [rentalDeposit, setRentalDeposit] = useState('');
  const [rentalStart, setRentalStart] = useState('');
  const [rentalEnd, setRentalEnd] = useState('');
  const [rentalNotes, setRentalNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgentReason, setUrgentReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);

  const txOptions: { type: TransactionType; icon: string; label: string; desc: string }[] = [
    { type: 'sell', icon: '💰', label: 'Sell', desc: 'Set a price and sell your item' },
    { type: 'exchange', icon: '🔄', label: 'Exchange', desc: 'Swap with another item you want' },
    { type: 'give-away', icon: '🎁', label: 'Give Away', desc: 'Give it away for free' },
    { type: 'rent', icon: '🕒', label: 'Rent', desc: 'Lend it out for a daily or weekly rate' },
  ];

  function validateStep2() {
    const e: Record<string, string> = {};
    if (photos.length === 0) e.photos = 'Please upload at least one photo.';
    if (!title.trim()) e.title = 'Please enter a title.';
    if (!category) e.category = 'Please select a category.';
    if (!description.trim()) e.description = 'Please describe your item.';
    if (!condition) e.condition = 'Please select the condition.';
    if (!exchangePoint) e.exchangePoint = 'Please select an exchange point.';
    return e;
  }

  function validateStep3() {
    const e: Record<string, string> = {};
    if (txType === 'sell') {
      if (!price || Number(price) <= 0) e.price = 'Please enter a price.';
      if (originalPrice && Number(originalPrice) <= Number(price)) e.originalPrice = 'Original price must be greater than the THRIFTLY price.';
    }
    if (txType === 'exchange' && !exchangePref.trim()) e.exchangePref = 'Please enter your exchange preference.';
    if (txType === 'rent') {
      if (!rentalRateDay || Number(rentalRateDay) <= 0) e.rentalRateDay = 'Please enter a daily rate.';
      if (!rentalStart) e.rentalStart = 'Please select a start date.';
      if (!rentalEnd) e.rentalEnd = 'Please select an end date.';
      if (rentalStart && rentalEnd && rentalEnd <= rentalStart) e.rentalEnd = 'Return date must be after the start date.';
    }
    return e;
  }

  function handleNextStep() {
    if (step === 1) {
      if (!txType) { setErrors({ txType: 'Please choose a transaction type.' }); return; }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
      setStep(3);
    } else if (step === 3) {
      const e = validateStep3();
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
      setStep(4);
    }
  }

  function handlePublish(asDraft = false) {
    if (!txType || !category || !condition) return;
    const listing: Listing = {
      id: genId(),
      sellerId: state.user?.id ?? '',
      sellerName: state.user?.name ?? 'VIT Student',
      title,
      description,
      category,
      condition,
      transactionType: txType,
      photos,
      status: asDraft ? 'draft' : 'available',
      price: txType === 'sell' ? Number(price) : undefined,
      originalPrice: txType === 'sell' && originalPrice ? Number(originalPrice) : undefined,
      exchangePreference: txType === 'exchange' ? exchangePref : undefined,
      rentalRateDay: txType === 'rent' ? Number(rentalRateDay) : undefined,
      rentalRateWeek: txType === 'rent' && rentalRateWeek ? Number(rentalRateWeek) : undefined,
      rentalDeposit: txType === 'rent' && rentalDeposit ? Number(rentalDeposit) : undefined,
      rentalStartDate: txType === 'rent' ? rentalStart : undefined,
      rentalEndDate: txType === 'rent' ? rentalEnd : undefined,
      rentalNotes: txType === 'rent' ? rentalNotes : undefined,
      exchangePoint,
      isUrgent,
      urgentReason: isUrgent ? urgentReason : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_LISTING', payload: listing });
    dispatch({ type: 'ADD_THRIFT_POINTS', payload: 10 });
    if (!asDraft) setPublished(true);
    else navigate('my-listings');
  }

  /* ─── Published ─── */
  if (published) {
    return (
      <div className="flex flex-col h-full bg-[var(--background)] items-center justify-center px-8 text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="text-5xl">✅</span>
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-green-400 mb-2">Listing Published ✓</h2>
          <p className="text-[var(--secondary-foreground)] text-sm">{title} is now live and available on the marketplace.</p>
        </div>
        <div className="bg-green-500/15 border border-green-500/30 rounded-xl px-4 py-2">
          <span className="text-green-400 text-xs font-display font-bold">● AVAILABLE</span>
        </div>
        <div className="w-full flex flex-col gap-3 mt-4">
          <PrimaryButton onClick={() => navigate('my-listings')}>View My Listings</PrimaryButton>
          <SecondaryButton onClick={() => { setStep(1); setTxType(null); setTitle(''); setCategory(''); setDescription(''); setCondition(''); setExchangePoint(''); setPrice(''); setOriginalPrice(''); setPublished(false); }}>
            List Another Item
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => step === 1 ? navigate('home') : setStep((s) => (s - 1) as Step)} className="text-[var(--muted-foreground)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-lg text-[var(--foreground)] flex-1">
            {step === 1 ? 'Choose Type' : step === 2 ? 'Item Details' : step === 3 ? 'Pricing & Terms' : 'Review Listing'}
          </h1>
        </div>
        <StepIndicator current={step - 1} total={4} />
        <p className="text-[var(--muted-foreground)] text-xs mt-1.5">Step {step} of 4</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* STEP 1: Transaction Type */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-[var(--secondary-foreground)] text-sm">What do you want to do?</p>
            {txOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => { setTxType(opt.type); setErrors({}); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  txType === opt.type
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] bg-[var(--card)]'
                }`}
              >
                <span className="text-4xl">{opt.icon}</span>
                <div>
                  <p className="font-display font-bold text-base text-[var(--foreground)]">{opt.label}</p>
                  <p className="text-[var(--muted-foreground)] text-xs mt-0.5">{opt.desc}</p>
                </div>
                {txType === opt.type && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
            {errors.txType && <p className="text-red-400 text-xs">{errors.txType}</p>}
          </div>
        )}

        {/* STEP 2: Item Details */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Photo upload */}
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 font-display">Photos</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      setPhotos((ps) => ps.length < 6 ? [...ps, dataUrl] : ps);
                    };
                    reader.readAsDataURL(file);
                  });
                  e.target.value = '';
                }}
              />
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative aspect-square bg-[var(--secondary)] rounded-xl overflow-hidden border border-[var(--border)]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                    >×</button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-[var(--secondary)] rounded-xl border border-dashed border-[var(--primary)]/50 flex flex-col items-center justify-center gap-1 hover:bg-[var(--primary)]/5 transition-colors"
                  >
                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[var(--primary)] text-xs font-display">Add</span>
                  </button>
                )}
              </div>
              {errors.photos && <p className="mt-1 text-xs text-red-400">{errors.photos}</p>}
            </div>

            <TextInput label="Title" placeholder="Enter item name" value={title} onChange={setTitle} error={errors.title} />
            <Dropdown
              label="Category"
              placeholder="Select a category"
              value={category}
              onChange={(v) => setCategory(v as Category)}
              options={CATEGORIES}
              error={errors.category}
            />
            <TextArea label="Description" placeholder="Describe your item's condition and details…" value={description} onChange={setDescription} error={errors.description} />
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2 font-display">Condition</p>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCondition(c.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      condition === c.value
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border)] bg-[var(--secondary)]'
                    }`}
                  >
                    <p className="font-display font-semibold text-xs text-[var(--foreground)]">{c.label}</p>
                    <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">{c.desc}</p>
                  </button>
                ))}
              </div>
              {errors.condition && <p className="mt-1 text-xs text-red-400">{errors.condition}</p>}
            </div>
            <Dropdown
              label="Campus Exchange Point"
              placeholder="Select exchange point"
              value={exchangePoint}
              onChange={setExchangePoint}
              options={EXCHANGE_POINTS.map((p) => ({ value: p, label: p }))}
              error={errors.exchangePoint}
            />
          </div>
        )}

        {/* STEP 3: Pricing */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            {txType === 'sell' && (
              <>
                <PriceInput label="THRIFTLY Price *" value={price} onChange={setPrice} error={errors.price} />
                <PriceInput label="Original New Price (Optional)" value={originalPrice} onChange={setOriginalPrice} placeholder="Enter original price" />
                {originalPrice && price && Number(originalPrice) > Number(price) && (
                  <SmartSavings original={Number(originalPrice)} thriftly={Number(price)} />
                )}
                <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display font-semibold text-sm text-[var(--foreground)]">⚡ Mark as Urgent Sale</p>
                    <button
                      onClick={() => setIsUrgent(!isUrgent)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${isUrgent ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
                    >
                      <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform ${isUrgent ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {isUrgent && (
                    <select
                      value={urgentReason}
                      onChange={(e) => setUrgentReason(e.target.value)}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] mt-2"
                    >
                      <option value="">Select reason (optional)</option>
                      <option value="moving-out">Moving Out</option>
                      <option value="hostel-checkout">Hostel Checkout</option>
                      <option value="graduation">Graduation</option>
                      <option value="need-quick">Need to Sell Quickly</option>
                      <option value="other">Other</option>
                    </select>
                  )}
                </div>
              </>
            )}

            {txType === 'exchange' && (
              <TextArea
                label="What are you looking for in exchange?"
                placeholder="What would you like in exchange? Be specific about what items or categories you're interested in."
                value={exchangePref}
                onChange={setExchangePref}
                error={errors.exchangePref}
                rows={5}
              />
            )}

            {txType === 'give-away' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <span className="text-7xl">🎁</span>
                <div className="text-center">
                  <p className="font-display font-bold text-2xl text-green-400">FREE</p>
                  <p className="text-[var(--secondary-foreground)] text-sm mt-1">This item will be listed as free for your campus community.</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 w-full text-center">
                  <p className="text-green-400 text-xs font-medium">No price required for give-away items.</p>
                </div>
              </div>
            )}

            {txType === 'rent' && (
              <>
                <PriceInput label="Rate per Day *" value={rentalRateDay} onChange={setRentalRateDay} placeholder="Enter daily rate" error={errors.rentalRateDay} />
                <PriceInput label="Rate per Week (Optional)" value={rentalRateWeek} onChange={setRentalRateWeek} placeholder="Enter weekly rate" />
                <PriceInput label="Refundable Deposit (Optional)" value={rentalDeposit} onChange={setRentalDeposit} placeholder="Enter deposit amount" />
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 font-display">Availability Start *</p>
                  <input
                    type="date"
                    value={rentalStart}
                    onChange={(e) => setRentalStart(e.target.value)}
                    className={`w-full bg-[var(--secondary)] border rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] transition-colors ${errors.rentalStart ? 'border-red-500' : 'border-[var(--border)]'}`}
                  />
                  {errors.rentalStart && <p className="mt-1 text-xs text-red-400">{errors.rentalStart}</p>}
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 font-display">Availability End *</p>
                  <input
                    type="date"
                    value={rentalEnd}
                    onChange={(e) => setRentalEnd(e.target.value)}
                    className={`w-full bg-[var(--secondary)] border rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] transition-colors ${errors.rentalEnd ? 'border-red-500' : 'border-[var(--border)]'}`}
                  />
                  {errors.rentalEnd && <p className="mt-1 text-xs text-red-400">{errors.rentalEnd}</p>}
                </div>
                <TextArea label="Rental Notes" placeholder="Any special instructions or notes for the renter…" value={rentalNotes} onChange={setRentalNotes} rows={3} />
              </>
            )}
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              {photos[0] ? (
                <img src={photos[0]} alt="listing" className="w-full h-48 object-cover" />
              ) : (
                <ImgPlaceholder className="w-full h-48" label="No photos added" />
              )}
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3">
              <Row label="Title" value={title || '—'} />
              <Row label="Type" value={txType ?? '—'} />
              <Row label="Category" value={category || '—'} />
              <Row label="Condition" value={condition || '—'} />
              <Row label="Exchange Point" value={exchangePoint || '—'} />
              {txType === 'sell' && <Row label="Price" value={price ? `₹${Number(price).toLocaleString('en-IN')}` : '—'} />}
              {txType === 'sell' && originalPrice && <Row label="Original Price" value={`₹${Number(originalPrice).toLocaleString('en-IN')}`} />}
              {txType === 'exchange' && <Row label="Exchange For" value={exchangePref || '—'} />}
              {txType === 'rent' && <Row label="Daily Rate" value={rentalRateDay ? `₹${Number(rentalRateDay).toLocaleString('en-IN')}/day` : '—'} />}
              {txType === 'rent' && rentalDeposit && <Row label="Deposit" value={`₹${Number(rentalDeposit).toLocaleString('en-IN')}`} />}
              {txType === 'rent' && <Row label="Available" value={`${rentalStart} → ${rentalEnd}`} />}
              {isUrgent && <Row label="Urgent" value="⚡ Yes" />}
            </div>
            <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-3">
              <p className="text-[var(--muted-foreground)] text-xs">{description || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-4 border-t border-[var(--border)] flex flex-col gap-3">
        {step < 4 ? (
          <PrimaryButton onClick={handleNextStep}>
            {step === 3 ? 'Review Listing' : 'Next'}
          </PrimaryButton>
        ) : (
          <>
            <PrimaryButton onClick={() => handlePublish(false)}>Publish Listing</PrimaryButton>
            <SecondaryButton onClick={() => handlePublish(true)}>Save as Draft</SecondaryButton>
            <button onClick={() => setStep(2)} className="text-[var(--muted-foreground)] text-sm font-medium text-center">Edit Details</button>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--muted-foreground)] text-xs font-display">{label}</span>
      <span className="text-[var(--foreground)] text-xs font-medium text-right flex-1 max-w-[60%] capitalize">{value}</span>
    </div>
  );
}
