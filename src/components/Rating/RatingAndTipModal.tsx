import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import { Star, Heart, ThumbsUp, DollarSign, Check, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { maskMpesaCode, maskPhoneNumber } from '../../utils/privacy';

const KENYAN_COMPLIMENT_TAGS = [
  'Beat The Nairobi Jam',
  'Clean Helmet & Vehicle',
  'Smooth & Safe Driving',
  'Polite & Respectful',
  'Great Music & Vibe',
  'Careful Cargo Handling'
];

export const RatingAndTipModal: React.FC = () => {
  const { ratingModalOpen, setRatingModalOpen, lastCompletedTrip, submitRatingAndTip, paymentDetailsHidden } = useRide();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Beat The Nairobi Jam', 'Smooth & Safe Driving']);
  const [comment, setComment] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<number>(50);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);

  if (!ratingModalOpen || !lastCompletedTrip) return null;

  const driver = lastCompletedTrip.driver;
  const fare = lastCompletedTrip.fare;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectTip = (amount: number) => {
    setIsCustomTip(false);
    setTipAmount(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTip = isCustomTip ? (parseFloat(customTipInput) || 0) : tipAmount;

    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback
    }

    submitRatingAndTip(rating, selectedTags, comment, finalTip);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-emerald-600 shadow-md">
            <img
              src={driver?.driverPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
              alt={driver?.fullName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <h3 className="text-base font-extrabold text-neutral-900">
            How was your safari with {driver?.fullName || 'your driver'}?
          </h3>
          <p className="text-xs text-neutral-500">
            {lastCompletedTrip.vehicleTypeName} • Arrived at {lastCompletedTrip.dropoff.name}
          </p>
          {lastCompletedTrip.payment?.mpesaReceiptNo && (
            <div className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-200">
              Receipt: {maskMpesaCode(lastCompletedTrip.payment.mpesaReceiptNo, paymentDetailsHidden)}
            </div>
          )}
        </div>

        {/* 5-Star Interactive Rating */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 text-neutral-300 hover:scale-110 transition-transform focus:outline-hidden"
            >
              <Star
                className={`w-8 h-8 ${
                  (hoverRating || rating) >= star
                    ? 'fill-amber-400 stroke-amber-500'
                    : 'stroke-neutral-300'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Compliment Badges */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 text-center">
            Leave a compliment for {driver?.fullName?.split(' ')[0] || 'the driver'}
          </label>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {KENYAN_COMPLIMENT_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tipping in Kenyan Shillings */}
        <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-800 flex items-center gap-1">
              <span>Add Driver Tip (M-PESA Direct)</span>
            </span>
            <span className="text-neutral-500 text-[11px]">Fare: KSh {fare.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0, 50, 100, 200].map((amt) => {
              const active = !isCustomTip && tipAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectTip(amt)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                  }`}
                >
                  {amt === 0 ? 'No Tip' : `KSh ${amt}`}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="number"
              min="0"
              step="10"
              placeholder="Custom Tip (KSh)"
              value={customTipInput}
              onChange={(e) => {
                setCustomTipInput(e.target.value);
                setIsCustomTip(true);
              }}
              className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Written Review */}
        <div>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Feedback builds trust on PickMeUp across Kenya (optional)..."
            className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setRatingModalOpen(false)}
            className="w-1/3 py-2.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold transition-colors"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-98"
          >
            Submit Feedback & Tip
          </button>
        </div>
      </div>
    </div>
  );
};
