import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import {
  Car,
  Power,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Check,
  X,
  Star,
  ShieldCheck,
  CreditCard,
  Send,
  Sparkles,
  AlertTriangle,
  FileText,
  UserPlus,
  Phone,
  Truck,
  Info,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2,
  Tag,
  Lock,
  Navigation
} from 'lucide-react';
import { maskPhoneNumber, maskMpesaCode, calculateDynamicEarnings } from '../../utils/privacy';

interface DriverDashboardProps {
  onOpenRegisterModal: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ onOpenRegisterModal }) => {
  const {
    currentDriver,
    driverIsOnline,
    toggleDriverOnline,
    activeTrip,
    pendingRequests,
    acceptRide,
    declineRide,
    driverSubmitBid,
    driverAcceptPassengerOffer,
    startTrip,
    completeTrip,
    requestInstantPayout,
    payoutHistory,
    tripHistory,
    paymentDetailsHidden,
    togglePaymentDetailsHidden,
    gpsTelemetry,
    simulateDriverConcurrencyCollision
  } = useRide();

  const [payoutAmountInput, setPayoutAmountInput] = useState<string>('1500');
  const [payoutProcessing, setPayoutProcessing] = useState<boolean>(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);
  const [selectedDriverTab, setSelectedDriverTab] = useState<'dispatch' | 'wallet' | 'reviews'>('dispatch');

  // Dynamic Driver Pricing State
  const [customBidTripId, setCustomBidTripId] = useState<string | null>(null);
  const [driverPriceInput, setDriverPriceInput] = useState<string>('');
  const [driverNoteInput, setDriverNoteInput] = useState<string>('');

  const handleInstantPayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmountInput);
    if (!amt || amt <= 0) return;

    setPayoutProcessing(true);
    const success = await requestInstantPayout(amt);
    setPayoutProcessing(false);

    if (success) {
      setPayoutSuccessMsg(`KSh ${amt.toLocaleString()} successfully sent via M-PESA B2C to ${maskPhoneNumber(currentDriver.phone, paymentDetailsHidden)}!`);
      setTimeout(() => setPayoutSuccessMsg(null), 4000);
    }
  };

  const handleSendDriverPrice = (tripId: string) => {
    const price = parseInt(driverPriceInput, 10);
    if (!price || price < 40) return;
    driverSubmitBid(tripId, price, driverNoteInput.trim() || 'Express route • Ready to pick up');
    setCustomBidTripId(null);
    setDriverPriceInput('');
    setDriverNoteInput('');
  };

  const completedTripsCount = tripHistory.filter(t => t.driverId === currentDriver.id).length;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden">
      {/* Top Driver Header: Online/Offline Toggle, Profile & Payment Privacy */}
      <div className="p-3.5 bg-neutral-900 text-white flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={currentDriver.driverPhotoUrl}
              alt={currentDriver.fullName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
              }}
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-neutral-900 ${
                driverIsOnline ? 'bg-emerald-500' : 'bg-neutral-500'
              }`}
            />
          </div>

          <div>
            <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
              <span>{currentDriver.fullName}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                {currentDriver.vehiclePlate}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 truncate max-w-[170px]">
              {currentDriver.vehicleMakeModel} • {currentDriver.saccoOrFleet || 'PickMeUp'}
            </div>
          </div>
        </div>

        {/* ACCESSIBLE ONLINE / OFFLINE TOGGLE & PRIVACY TOGGLE */}
        <div className="flex items-center gap-2">
          {/* Privacy Mask Button */}
          <button
            id="btn-driver-privacy-toggle"
            onClick={togglePaymentDetailsHidden}
            title={paymentDetailsHidden ? 'Payment details are hidden. Click to reveal.' : 'Payment details are visible. Click to hide.'}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 transition-colors"
          >
            {paymentDetailsHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            id="btn-driver-online-toggle"
            onClick={toggleDriverOnline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-all active:scale-95 ${
              driverIsOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{driverIsOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* GPS Distance-Filter Geofence & Battery-Saver Telemetry Bar */}
      <div className="bg-neutral-800 px-3 py-2 border-b border-neutral-700 flex items-center justify-between text-[11px] text-neutral-300">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              gpsTelemetry.mode === 'in_transit'
                ? 'bg-emerald-400 animate-pulse'
                : gpsTelemetry.mode === 'stationary'
                ? 'bg-amber-400'
                : 'bg-rose-400'
            }`}
          />
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-white font-bold">
              {gpsTelemetry.mode === 'in_transit'
                ? 'Moving (>15m)'
                : gpsTelemetry.mode === 'stationary'
                ? 'Stationary Stage (<15m)'
                : 'Offline Mode'}
            </span>
            <span className="text-neutral-400">
              • Polling: {gpsTelemetry.pollingIntervalMs > 0 ? `${gpsTelemetry.pollingIntervalMs / 1000}s` : 'Suspended (0s)'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-neutral-900 text-emerald-400 px-2 py-0.5 rounded font-mono border border-neutral-700">
            &gt;15m Filter: {gpsTelemetry.filteredUpdatesCount} saved
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex bg-neutral-200/80 p-0.5 rounded-lg text-xs font-semibold">
          <button
            id="tab-driver-dispatch"
            onClick={() => setSelectedDriverTab('dispatch')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedDriverTab === 'dispatch' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Dispatch ({pendingRequests.length})
          </button>
          <button
            id="tab-driver-wallet"
            onClick={() => setSelectedDriverTab('wallet')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedDriverTab === 'wallet' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            M-PESA Payouts
          </button>
          <button
            id="tab-driver-reviews"
            onClick={() => setSelectedDriverTab('reviews')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedDriverTab === 'reviews' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Ratings ({currentDriver.rating}★)
          </button>
        </div>

        <button
          id="btn-driver-re-register"
          onClick={onOpenRegisterModal}
          className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
          title="Update vehicle or add vehicle category"
        >
          <UserPlus className="w-3 h-3" />
          <span className="hidden sm:inline">Add Vehicle</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Offline Warning Card */}
        {!driverIsOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">You are currently OFFLINE.</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Switch to ONLINE above to start receiving ride & freight pickup requests around Nairobi.
              </p>
            </div>
          </div>
        )}

        {/* ACTIVE TRIP IN PROGRESS (DRIVER TURN-BY-TURN CONTROL) */}
        {activeTrip && (
          <div className="bg-emerald-950 text-white rounded-2xl p-4 shadow-xl border border-emerald-800 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Active Safari #{activeTrip.id.replace('trip-ke-', '')}
              </span>
              <span className="text-sm font-black text-emerald-300">
                Net Payout: +KSh {activeTrip.driverEarnings.toFixed(2)}
              </span>
            </div>

            {/* Passenger Info */}
            <div className="flex items-center justify-between bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60">
              <div>
                <div className="text-xs font-bold">{activeTrip.riderName}</div>
                <div className="text-[11px] text-emerald-300 font-mono">
                  {maskPhoneNumber(activeTrip.riderPhone, paymentDetailsHidden)}
                </div>
                {activeTrip.specialInstructions && (
                  <div className="text-[10px] text-amber-200 mt-0.5 italic">
                    Note: "{activeTrip.specialInstructions}"
                  </div>
                )}
              </div>
              <a
                href={`tel:${activeTrip.riderPhone}`}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full text-white"
                title="Call Passenger"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Stage Waypoints */}
            <div className="text-xs space-y-1 bg-black/30 p-2.5 rounded-lg text-emerald-100">
              <div><strong>Pickup:</strong> {activeTrip.pickup.name}</div>
              <div><strong>Dropoff:</strong> {activeTrip.dropoff.name}</div>
            </div>

            {/* Fee Deduction Transparency Note */}
            <div className="text-[10px] text-emerald-300/80 flex items-center justify-between bg-emerald-900/20 px-2 py-1 rounded">
              <span>Gross Safari Fare: KSh {activeTrip.fare}</span>
              <span>Platform Service Fee: -KSh {activeTrip.platformUsageFee.toFixed(2)}</span>
            </div>

            {/* Driver Navigation Action Buttons */}
            <div className="pt-1">
              {activeTrip.status === 'driver_arriving' && (
                <div className="text-center text-xs text-emerald-200 py-1 font-semibold animate-pulse">
                  Navigating to {activeTrip.pickup.name}... GPS tracking active
                </div>
              )}

              {activeTrip.status === 'arrived' && (
                <button
                  onClick={startTrip}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold rounded-xl text-xs shadow-md transition-transform active:scale-98"
                >
                  Passenger Boarded • Start Safari to Dropoff
                </button>
              )}

              {activeTrip.status === 'in_progress' && (
                <button
                  onClick={completeTrip}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-extrabold rounded-xl text-xs shadow-md transition-transform active:scale-98"
                >
                  Arrived at Dropoff • Complete & Disburse M-PESA
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: DISPATCH QUEUE WITH DYNAMIC PRICING & BIDDING */}
        {selectedDriverTab === 'dispatch' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-800">
                Incoming Pickup Requests (Nairobi)
              </h3>
              <span className="text-[11px] text-neutral-500 font-mono">
                {driverIsOnline ? 'Receiving Live Broadcasts' : 'Driver Offline'}
              </span>
            </div>

            {/* Informational banner on dynamic pricing */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <strong>No Fixed Prices:</strong> Passengers post their offered price. If you like it, tap <strong>Accept</strong> immediately. Otherwise, tap <strong>Set My Price</strong> to counter-offer!
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 p-6 space-y-2">
                <Car className="w-8 h-8 mx-auto text-neutral-300 animate-pulse" />
                <div className="font-semibold text-neutral-700">Waiting for passengers...</div>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  New Boda Boda, Matatu, Taxi, Pick-Up, School Bus, and Lorry dispatch requests around Nairobi will appear here with passenger-offered prices.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => {
                  const passengerOffer = req.passengerOfferedPrice || req.fare;
                  const passengerPricing = calculateDynamicEarnings(passengerOffer);
                  const isSettingCustomPrice = customBidTripId === req.id;
                  const myBid = req.bids.find(b => b.driver.id === currentDriver.id);

                  return (
                    <div
                      key={req.id}
                      className="p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-md space-y-3 animate-in fade-in duration-150"
                    >
                      {/* Header with Passenger Offer and Expected Net Earnings */}
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          {req.vehicleTypeName}
                        </span>
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-500 font-semibold">Passenger Offered:</div>
                          <div className="text-sm font-black text-neutral-900">
                            KSh {passengerOffer.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-bold">
                            Net: +KSh {passengerPricing.driverNetEarnings.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Pickup / Dropoff details */}
                      <div className="text-xs space-y-1 text-neutral-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate"><strong>Pickup:</strong> {req.pickup.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate"><strong>Dropoff:</strong> {req.dropoff.name}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 pl-5">
                          Est. Distance: {req.distanceKm} km • ~{req.durationMinutes} mins
                        </div>
                        {req.specialInstructions && (
                          <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 mt-1">
                            Note: "{req.specialInstructions}"
                          </div>
                        )}
                      </div>

                      {/* Fee deduction disclosure for driver */}
                      <div className="bg-neutral-50 p-2 rounded-lg text-[10px] text-neutral-500 flex justify-between border border-neutral-200">
                        <span>Platform service fee: KSh {passengerPricing.platformUsageFee.toFixed(2)}</span>
                        <span>Rate: KSh 0.70 per KSh 50</span>
                      </div>

                      {/* Atomic Concurrency Protection */}
                      <div className="flex items-center justify-between text-[10px] bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-200/80">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Atomic Transaction: Only first driver to accept locks safari</span>
                        </div>
                        <button
                          id={`btn-simulate-race-${req.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            simulateDriverConcurrencyCollision(req.id);
                          }}
                          title="Simulate a rival driver accepting 15ms before you to test race prevention"
                          className="text-[9px] font-bold text-neutral-500 hover:text-amber-700 bg-white hover:bg-amber-50 px-1.5 py-0.5 rounded border border-neutral-200 transition-colors"
                        >
                          Test Race Collision
                        </button>
                      </div>

                      {/* My Already Submitted Price (if any) */}
                      {myBid && (
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                          <span>Your Submitted Price: <strong>KSh {myBid.offeredPrice}</strong></span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                            {myBid.status === 'countered' ? 'Countered by Passenger' : 'Pending Review'}
                          </span>
                        </div>
                      )}

                      {/* Action buttons: Accept Passenger Offer or Set Driver Price */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => declineRide(req.id)}
                          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors"
                        >
                          Pass
                        </button>

                        <button
                          id={`btn-driver-accept-offer-${req.id}`}
                          onClick={() => driverAcceptPassengerOffer(req.id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept (KSh {passengerOffer})</span>
                        </button>

                        <button
                          id={`btn-driver-set-price-${req.id}`}
                          onClick={() => {
                            if (isSettingCustomPrice) {
                              setCustomBidTripId(null);
                            } else {
                              setCustomBidTripId(req.id);
                              setDriverPriceInput((passengerOffer + 50).toString());
                              setDriverNoteInput('Express route • 2 mins away');
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                            isSettingCustomPrice
                              ? 'bg-neutral-800 text-white'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>{isSettingCustomPrice ? 'Close' : 'Set My Price'}</span>
                        </button>
                      </div>

                      {/* INLINE DRIVER PRICE COUNTER-OFFER BUILDER */}
                      {isSettingCustomPrice && (
                        <div className="p-3 bg-neutral-900 text-white rounded-xl border border-neutral-700 space-y-3 animate-in fade-in">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-400">Set Your Driver Price</span>
                            <span className="text-neutral-400 text-[11px]">Passenger offered: KSh {passengerOffer}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2.5 top-2 text-xs font-bold text-neutral-400">KSh</span>
                              <input
                                type="number"
                                min="50"
                                step="10"
                                value={driverPriceInput}
                                onChange={e => setDriverPriceInput(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-600 rounded-lg py-1.5 pl-11 pr-2 text-sm font-black text-white focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            {/* Quick Price Buttons */}
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setDriverPriceInput(((parseInt(driverPriceInput, 10) || passengerOffer) + 30).toString())}
                                className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded border border-neutral-700"
                              >
                                +30
                              </button>
                              <button
                                type="button"
                                onClick={() => setDriverPriceInput(((parseInt(driverPriceInput, 10) || passengerOffer) + 50).toString())}
                                className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded border border-neutral-700"
                              >
                                +50
                              </button>
                              <button
                                type="button"
                                onClick={() => setDriverPriceInput(((parseInt(driverPriceInput, 10) || passengerOffer) + 100).toString())}
                                className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded border border-neutral-700"
                              >
                                +100
                              </button>
                            </div>
                          </div>

                          {/* Real-time fee & Net earnings preview */}
                          {driverPriceInput && (
                            <div className="bg-neutral-800/80 p-2 rounded-lg text-[11px] text-neutral-300 flex justify-between border border-neutral-700">
                              <span>Your Net: <strong className="text-emerald-400">KSh {calculateDynamicEarnings(parseInt(driverPriceInput, 10) || 0).driverNetEarnings.toFixed(2)}</strong></span>
                              <span>Fee (0.70/50): KSh {calculateDynamicEarnings(parseInt(driverPriceInput, 10) || 0).platformUsageFee.toFixed(2)}</span>
                            </div>
                          )}

                          {/* Driver Note */}
                          <div>
                            <input
                              type="text"
                              value={driverNoteInput}
                              onChange={e => setDriverNoteInput(e.target.value)}
                              placeholder="e.g. 'Ready at Stage • 2 mins away'"
                              className="w-full bg-neutral-800 border border-neutral-600 rounded-lg p-1.5 text-xs text-white"
                            />
                          </div>

                          <button
                            id={`btn-send-driver-bid-${req.id}`}
                            onClick={() => handleSendDriverPrice(req.id)}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Price Offer (KSh {driverPriceInput || passengerOffer}) to Passenger</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: M-PESA INSTANT PAYOUT WALLET WITH PAYMENT DETAILS PRIVACY */}
        {selectedDriverTab === 'wallet' && (
          <div className="space-y-4">
            {/* Privacy Shield Notice */}
            {paymentDetailsHidden && (
              <div className="bg-neutral-100 border border-neutral-200 p-2 rounded-lg text-[11px] text-neutral-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sensitive phone and M-Pesa receipt numbers are shielded from sight.</span>
                </div>
                <button
                  onClick={togglePaymentDetailsHidden}
                  className="font-bold text-emerald-700 hover:text-emerald-900"
                >
                  Reveal
                </button>
              </div>
            )}

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-emerald-800 to-neutral-900 text-white p-4 rounded-2xl shadow-lg space-y-3">
              <div className="flex justify-between items-center text-xs text-emerald-200">
                <span className="font-bold uppercase tracking-wider">M-PESA Driver Wallet</span>
                <span className="font-mono bg-emerald-700/50 px-2 py-0.5 rounded text-[11px]">
                  {maskPhoneNumber(currentDriver.phone, paymentDetailsHidden)}
                </span>
              </div>

              <div>
                <div className="text-[11px] text-emerald-200">Available Net Balance:</div>
                <div className="text-2xl font-black tracking-tight text-white">
                  KSh {currentDriver.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-[10px] text-emerald-300/80 border-t border-emerald-700/60 pt-2 flex items-center justify-between">
                <span>Total Completed Safaris: {currentDriver.totalTrips}</span>
                <span>Automatic 24/7 Safaricom M-Pesa B2C</span>
              </div>
            </div>

            {payoutSuccessMsg && (
              <div className="bg-emerald-100 text-emerald-800 p-3 rounded-xl text-xs font-bold border border-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{payoutSuccessMsg}</span>
              </div>
            )}

            {/* Instant Payout Form */}
            <form onSubmit={handleInstantPayoutSubmit} className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">
                  Instant M-PESA Cashout
                </span>
                <span className="text-[10px] text-neutral-500">M-Pesa B2C fee: KSh 15</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Amount to Disburse (KSh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-500">KSh</span>
                  <input
                    type="number"
                    min="50"
                    max={currentDriver.walletBalance}
                    value={payoutAmountInput}
                    onChange={e => setPayoutAmountInput(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-11 pr-3 py-2 text-xs font-bold text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={payoutProcessing || currentDriver.walletBalance < 50}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {payoutProcessing ? 'Disbursing via Safaricom M-Pesa...' : `Send to ${maskPhoneNumber(currentDriver.phone, paymentDetailsHidden)}`}
                </span>
              </button>
            </form>

            {/* Instant Payout History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800">Recent M-PESA Disbursements</h4>
              {payoutHistory.map(p => (
                <div
                  key={p.id}
                  className="p-2.5 bg-white rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-neutral-900">KSh {p.netPayout.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {maskMpesaCode(p.mpesaRef, paymentDetailsHidden)} • {p.date}
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RATINGS & REVIEWS FEED */}
        {selectedDriverTab === 'reviews' && (
          <div className="space-y-3">
            {/* Rating Stats Card */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center space-y-1">
              <div className="text-3xl font-extrabold text-neutral-900 flex items-center justify-center gap-1.5">
                <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
                <span>{currentDriver.rating.toFixed(2)}</span>
              </div>
              <p className="text-xs text-neutral-500">
                Based on {currentDriver.totalTrips} verified journeys across Nairobi
              </p>
            </div>

            {/* Compliments Earned */}
            <div>
              <h4 className="text-xs font-bold text-neutral-800 mb-1.5">Top Badges Earned</h4>
              <div className="flex flex-wrap gap-1.5">
                {['Safe Navigator', 'Beat The Nairobi Jam', 'Spotless Vehicle', 'Polite Rider', 'Fast Cargo Delivery'].map(badge => (
                  <span
                    key={badge}
                    className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800">Recent Passenger Feedback</h4>
              {tripHistory
                .filter(t => t.rating)
                .slice(0, 5)
                .map(t => (
                  <div
                    key={t.id}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{t.rating?.rating} Stars</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    {t.rating?.comment && (
                      <p className="text-neutral-700 italic text-[11px]">
                        "{t.rating.comment}"
                      </p>
                    )}
                    {t.rating?.feedbackTags && t.rating.feedbackTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {t.rating.feedbackTags.map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
