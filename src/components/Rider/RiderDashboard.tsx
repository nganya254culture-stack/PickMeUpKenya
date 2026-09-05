import React, { useState, useEffect } from 'react';
import { useRide } from '../../context/RideContext';
import { KenyanVehicleCategory, LocationPoint } from '../../types';
import { KENYAN_LOCATIONS, KENYAN_VEHICLE_TYPES } from '../../data/mockData';
import {
  MapPin,
  Navigation,
  Clock,
  Shield,
  Phone,
  CheckCircle2,
  Heart,
  CreditCard,
  Share2,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  ChevronRight,
  ArrowRight,
  Plus,
  Car,
  Truck,
  Sparkles,
  Info,
  DollarSign,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Sliders,
  Send
} from 'lucide-react';
import { maskPhoneNumber, maskMpesaCode, calculateDynamicEarnings } from '../../utils/privacy';

export const RiderDashboard: React.FC = () => {
  const {
    activeTrip,
    requestRide,
    cancelActiveTrip,
    isLocationSharingEnabled,
    toggleLocationSharing,
    savedRoutes,
    addSavedRoute,
    tripHistory,
    setSafetyShareModalOpen,
    currentUser,
    paymentDetailsHidden,
    togglePaymentDetailsHidden,
    passengerUpdateOfferedPrice,
    passengerAcceptDriverBid,
    passengerCounterDriverBid
  } = useRide();

  // Booking Form State with Kenyan Defaults
  const [pickupIndex, setPickupIndex] = useState<number>(0);
  const [dropoffIndex, setDropoffIndex] = useState<number>(1);
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<KenyanVehicleCategory>('bodaboda');
  const [specialNote, setSpecialNote] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'book' | 'history' | 'routes'>('book');

  // Custom Proposed Price State (No Fixed Price)
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [isPriceCustomized, setIsPriceCustomized] = useState<boolean>(false);

  // Active Negotiation State
  const [negotiatingBidId, setNegotiatingBidId] = useState<string | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState<string>('');
  const [raiseOfferAmount, setRaiseOfferAmount] = useState<number>(50);

  // Custom Saved Route modal state
  const [showAddRouteModal, setShowAddRouteModal] = useState<boolean>(false);
  const [newRouteTitle, setNewRouteTitle] = useState<string>('');

  const pickupLocation = KENYAN_LOCATIONS[pickupIndex];
  const dropoffLocation = KENYAN_LOCATIONS[dropoffIndex];
  const selectedVehicle = KENYAN_VEHICLE_TYPES.find(v => v.id === selectedVehicleCategory) || KENYAN_VEHICLE_TYPES[0];

  // Dynamic estimate benchmark based on Nairobi coordinates
  const dLat = (dropoffLocation.lat - pickupLocation.lat) * 111;
  const dLng = (dropoffLocation.lng - pickupLocation.lng) * 85;
  const estimatedDistanceKm = Math.max(1.5, Number(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1)));
  const estimatedDurationMin = Math.max(6, Math.round(estimatedDistanceKm * 3.2));

  // Benchmark estimated fair range for this vehicle and distance
  const benchmarkBase = Math.max(
    selectedVehicle.baseFare,
    Math.round(selectedVehicle.baseFare + estimatedDistanceKm * selectedVehicle.perKmRate + estimatedDurationMin * selectedVehicle.perMinRate)
  );
  const benchmarkLow = Math.max(selectedVehicle.baseFare, Math.round(benchmarkBase * 0.85 / 10) * 10);
  const benchmarkHigh = Math.round(benchmarkBase * 1.25 / 10) * 10;

  // Sync default suggested price when vehicle or route changes if user hasn't explicitly customized
  useEffect(() => {
    if (!isPriceCustomized) {
      setCustomPriceInput(benchmarkBase.toString());
    }
  }, [pickupIndex, dropoffIndex, selectedVehicleCategory, isPriceCustomized, benchmarkBase]);

  const currentOfferedPrice = parseInt(customPriceInput, 10) || benchmarkBase;
  const feeCalculation = calculateDynamicEarnings(currentOfferedPrice);

  const handlePriceAdjustment = (delta: number) => {
    setIsPriceCustomized(true);
    const newPrice = Math.max(50, (parseInt(customPriceInput, 10) || benchmarkBase) + delta);
    setCustomPriceInput(newPrice.toString());
  };

  const handleRequestTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupIndex === dropoffIndex) {
      alert('Tafadhali chagua sehemu tofauti ya kushuka (Please select different pickup and dropoff spots).');
      return;
    }
    const finalOffer = parseInt(customPriceInput, 10) || benchmarkBase;
    requestRide(pickupLocation, dropoffLocation, selectedVehicleCategory, finalOffer, specialNote);
  };

  const handleQuickBookRoute = (route: typeof savedRoutes[0]) => {
    const pIndex = KENYAN_LOCATIONS.findIndex(l => l.name === route.pickup.name);
    const dIndex = KENYAN_LOCATIONS.findIndex(l => l.name === route.dropoff.name);
    if (pIndex !== -1) setPickupIndex(pIndex);
    if (dIndex !== -1) setDropoffIndex(dIndex);
    setIsPriceCustomized(false);
    setSelectedTab('book');
  };

  const handleCreateCustomRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteTitle.trim()) return;
    addSavedRoute({
      title: newRouteTitle,
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      iconName: 'heart',
      frequency: 1
    });
    setNewRouteTitle('');
    setShowAddRouteModal(false);
  };

  const handleSendCounter = (bidId: string) => {
    const parsed = parseInt(counterPriceInput, 10);
    if (!parsed || parsed < 50) return;
    if (activeTrip) {
      passengerCounterDriverBid(activeTrip.id, bidId, parsed);
    }
    setNegotiatingBidId(null);
    setCounterPriceInput('');
  };

  const handleRaiseBroadcastOffer = () => {
    if (!activeTrip) return;
    const newPrice = activeTrip.passengerOfferedPrice + raiseOfferAmount;
    passengerUpdateOfferedPrice(activeTrip.id, newPrice);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden">
      {/* Subheader with Navigation Tabs & Privacy Status */}
      <div className="p-3 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex bg-neutral-200/80 p-0.5 rounded-lg text-xs font-semibold">
          <button
            id="tab-book-ride"
            onClick={() => setSelectedTab('book')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedTab === 'book' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Hailing & Cargo
          </button>
          <button
            id="tab-saved-routes"
            onClick={() => setSelectedTab('routes')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedTab === 'routes' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Saved Routes ({savedRoutes.length})
          </button>
          <button
            id="tab-trip-history"
            onClick={() => setSelectedTab('history')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedTab === 'history' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            M-PESA Logs
          </button>
        </div>

        {/* Payment & GPS Privacy Shields */}
        <div className="flex items-center gap-1.5">
          {/* Payment Privacy Mask Button */}
          <button
            id="btn-toggle-payment-details"
            onClick={togglePaymentDetailsHidden}
            title={paymentDetailsHidden ? 'Payment details hidden from sight. Click to reveal.' : 'Payment details visible. Click to hide.'}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-colors ${
              paymentDetailsHidden
                ? 'bg-neutral-900 text-emerald-400 border-neutral-800'
                : 'bg-white text-neutral-700 border-neutral-300'
            }`}
          >
            {paymentDetailsHidden ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-neutral-500" />}
            <span>{paymentDetailsHidden ? 'Payment Hidden' : 'Payment Shown'}</span>
          </button>

          {/* GPS Location Privacy Toggle */}
          <button
            id="btn-toggle-location-privacy"
            onClick={toggleLocationSharing}
            title={isLocationSharingEnabled ? 'Location sharing active. Click to mask GPS.' : 'Location masked. Click to share GPS.'}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-colors ${
              isLocationSharingEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">{isLocationSharingEnabled ? 'GPS Live' : 'Masked'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ACTIVE TRIP & DYNAMIC PRICE NEGOTIATION SCREEN */}
        {activeTrip && (
          <div
            id="active-trip-card"
            className="bg-neutral-900 text-white rounded-2xl p-4 shadow-xl border border-neutral-800 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* Status Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  {activeTrip.status === 'requesting' && 'Live Bidding & Price Negotiation'}
                  {activeTrip.status === 'driver_arriving' && 'Price Locked • Driver En Route'}
                  {activeTrip.status === 'arrived' && 'Driver Arrived at Stage'}
                  {activeTrip.status === 'in_progress' && 'In Transit to Dropoff'}
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400 font-bold">
                #{activeTrip.id.replace('trip-ke-', '')}
              </span>
            </div>

            {/* Route Summary */}
            <div className="space-y-1 text-xs text-neutral-300 bg-neutral-950/70 p-2.5 rounded-xl font-medium border border-neutral-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="truncate"><strong>Pickup:</strong> {activeTrip.pickup.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                <span className="truncate"><strong>Dropoff:</strong> {activeTrip.dropoff.name}</span>
              </div>
              <div className="text-[10px] text-neutral-400 pt-0.5 flex justify-between">
                <span>Vehicle: {activeTrip.vehicleTypeName}</span>
                <span>{activeTrip.distanceKm} km • ~{activeTrip.durationMinutes} min</span>
              </div>
            </div>

            {/* DYNAMIC NEGOTIATION SCREEN (When Searching / Bidding) */}
            {activeTrip.status === 'requesting' && (
              <div className="space-y-3 pt-1">
                {/* Passenger's Current Broadcast Offer */}
                <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                      Your Broadcast Offer:
                    </div>
                    <div className="text-xl font-black text-white">
                      KSh {activeTrip.passengerOfferedPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-300/80">
                      Visible to all available Nairobi drivers
                    </div>
                  </div>

                  {/* Raise offer button to attract faster responses */}
                  <button
                    id="btn-raise-offer"
                    onClick={handleRaiseBroadcastOffer}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1 shrink-0"
                    title="Raise offer to speed up driver acceptance"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Raise +KSh {raiseOfferAmount}</span>
                  </button>
                </div>

                {/* Incoming Driver Price Proposals / Marketplace */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Available Driver Offers ({activeTrip.bids.length})</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 animate-pulse">
                      Updating in real-time...
                    </span>
                  </div>

                  {activeTrip.bids.length === 0 ? (
                    <div className="p-4 bg-neutral-800/40 rounded-xl border border-neutral-800 text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <div className="text-xs text-neutral-300 font-semibold">
                        Broadcasting KSh {activeTrip.passengerOfferedPrice} to nearby {activeTrip.vehicleTypeName} drivers...
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Drivers can accept your price immediately or propose counter-offers.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeTrip.bids.map(bid => {
                        const isMatch = bid.offeredPrice === activeTrip.passengerOfferedPrice;
                        const isNegotiating = negotiatingBidId === bid.id;

                        return (
                          <div
                            key={bid.id}
                            className={`p-3 rounded-xl border transition-all ${
                              isMatch
                                ? 'bg-emerald-950/40 border-emerald-500/70'
                                : 'bg-neutral-800/80 border-neutral-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2.5">
                              {/* Driver Info */}
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={bid.driver.driverPhotoUrl}
                                  alt={bid.driver.fullName}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <div>
                                  <div className="font-bold text-xs text-white flex items-center gap-1">
                                    <span>{bid.driver.fullName}</span>
                                    <span className="text-amber-400 font-normal text-[11px]">
                                      ★ {bid.driver.rating}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-neutral-300">
                                    {bid.driver.vehicleMakeModel} • <span className="text-amber-300 font-mono font-semibold">{bid.driver.vehiclePlate}</span>
                                  </div>
                                  <div className="text-[10px] text-emerald-400 font-medium">
                                    {bid.etaMinutes} min away • {bid.driver.saccoOrFleet || 'PickMeUp'}
                                  </div>
                                </div>
                              </div>

                              {/* Price Proposal */}
                              <div className="text-right shrink-0">
                                <div className="text-base font-black text-emerald-400">
                                  KSh {bid.offeredPrice.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-bold">
                                  {isMatch ? (
                                    <span className="text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded">
                                      Matches Your Offer!
                                    </span>
                                  ) : (
                                    <span className="text-neutral-400">
                                      Driver Asking Price
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {bid.note && (
                              <p className="text-[11px] text-neutral-300 mt-1.5 italic bg-neutral-900/60 px-2 py-1 rounded">
                                "{bid.note}"
                              </p>
                            )}

                            {/* Action Buttons: Accept Trip or Negotiate */}
                            <div className="flex gap-2 mt-2.5 pt-2 border-t border-neutral-700/60">
                              <button
                                id={`btn-accept-driver-${bid.id}`}
                                onClick={() => passengerAcceptDriverBid(activeTrip.id, bid.id)}
                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Trip (KSh {bid.offeredPrice})</span>
                              </button>

                              <button
                                id={`btn-negotiate-driver-${bid.id}`}
                                onClick={() => {
                                  if (isNegotiating) {
                                    setNegotiatingBidId(null);
                                  } else {
                                    setNegotiatingBidId(bid.id);
                                    setCounterPriceInput(activeTrip.passengerOfferedPrice.toString());
                                  }
                                }}
                                className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{isNegotiating ? 'Close' : 'Negotiate'}</span>
                              </button>
                            </div>

                            {/* Inline Negotiate / Counter Offer Box */}
                            {isNegotiating && (
                              <div className="mt-2 p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 space-y-2 animate-in fade-in">
                                <div className="flex items-center justify-between text-[11px] text-neutral-300">
                                  <span className="font-bold">Propose Counter-Price:</span>
                                  <span className="text-neutral-400">Driver proposed: KSh {bid.offeredPrice}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <span className="absolute left-2.5 top-1.5 text-xs font-bold text-neutral-400">KSh</span>
                                    <input
                                      type="number"
                                      value={counterPriceInput}
                                      onChange={e => setCounterPriceInput(e.target.value)}
                                      className="w-full bg-neutral-800 border border-neutral-600 rounded-md py-1 pl-11 pr-2 text-xs font-bold text-white focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>

                                  <button
                                    onClick={() => handleSendCounter(bid.id)}
                                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-bold flex items-center gap-1 transition-colors"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Send</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MATCHED DRIVER DETAILS (Once Price Agreed and Status Arriving/In Progress) */}
            {activeTrip.driver && activeTrip.status !== 'requesting' && (
              <div className="flex items-center justify-between gap-3 bg-neutral-800/80 p-3 rounded-xl border border-neutral-700">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={activeTrip.driver.driverPhotoUrl}
                      alt={activeTrip.driver.fullName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5" title="Verified Driver">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{activeTrip.driver.fullName}</span>
                      <span className="text-xs text-amber-400 flex items-center font-normal">
                        ★ {activeTrip.driver.rating}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-300">
                      {activeTrip.driver.vehicleMakeModel}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-amber-300">
                      {activeTrip.driver.vehiclePlate} • {activeTrip.driver.saccoOrFleet || 'PickMeUp SACCO'}
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${activeTrip.driver.phone}`}
                  className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow transition-colors shrink-0"
                  title="Call Driver"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* M-PESA Agreed Safari Fare */}
            <div className="flex items-center justify-between text-xs bg-neutral-800/60 px-3 py-2 rounded-lg border border-neutral-700/50">
              <span className="text-neutral-400 text-[11px]">Agreed Safari Fare:</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                KSh {activeTrip.fare.toLocaleString()}
              </span>
            </div>

            {/* Trip Action Buttons: Route Share & Cancel */}
            <div className="flex gap-2 pt-1">
              <button
                id="btn-share-safety-route"
                onClick={() => setSafetyShareModalOpen(true)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Route with Family</span>
              </button>

              <button
                id="btn-cancel-trip"
                onClick={() => cancelActiveTrip('Cancelled by passenger')}
                className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: HAILING & CARGO BOOKING WITH DYNAMIC PRICING */}
        {selectedTab === 'book' && !activeTrip && (
          <form onSubmit={handleRequestTrip} className="space-y-4">
            {/* Pickup & Destination Selectors */}
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pickup Location (Nairobi Area)</span>
                </label>
                <select
                  id="pickup-location-select"
                  value={pickupIndex}
                  onChange={e => {
                    setPickupIndex(Number(e.target.value));
                    setIsPriceCustomized(false);
                  }}
                  className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {KENYAN_LOCATIONS.map((loc, idx) => (
                    <option key={loc.name} value={idx}>
                      {loc.name} - {loc.landmark}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-500 mt-1 truncate">
                  {pickupLocation.address}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-rose-600" />
                  <span>Dropoff Destination</span>
                </label>
                <select
                  id="dropoff-location-select"
                  value={dropoffIndex}
                  onChange={e => {
                    setDropoffIndex(Number(e.target.value));
                    setIsPriceCustomized(false);
                  }}
                  className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {KENYAN_LOCATIONS.map((loc, idx) => (
                    <option key={loc.name} value={idx}>
                      {loc.name} - {loc.landmark}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-500 mt-1 truncate">
                  {dropoffLocation.address}
                </p>
              </div>
            </div>

            {/* Special Instructions (e.g. School bus escort, Boda helmets, bulky goods) */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Instructions for Driver / Hauler (Optional)
              </label>
              <input
                type="text"
                value={specialNote}
                onChange={e => setSpecialNote(e.target.value)}
                placeholder="e.g. 'Boda: need 2 helmets', 'Moving 4 heavy boxes', 'Child pickup'"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Kenyan Vehicle & Transit Fleet Tiers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold text-neutral-900">
                  Select Transportation Mode
                </label>
                <span className="text-[10px] text-neutral-500">
                  {estimatedDistanceKm} km • ~{estimatedDurationMin} mins
                </span>
              </div>

              <div className="space-y-2">
                {KENYAN_VEHICLE_TYPES.map(vehicle => {
                  const isSelected = selectedVehicleCategory === vehicle.id;
                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicleCategory(vehicle.id);
                        setIsPriceCustomized(false);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                          <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-neutral-900">{vehicle.name}</span>
                            {vehicle.badge && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                                {vehicle.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500">{vehicle.capacity}</p>
                          <p className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                            {vehicle.popularFor}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-emerald-700">
                          No Fixed Price
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          Range: KSh {benchmarkLow} - {benchmarkHigh}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC PRICE SELECTION (NO FIXED PRICE - USER PROPOSES PRICE) */}
            <div className="bg-gradient-to-br from-emerald-50 via-neutral-50 to-white p-4 rounded-2xl border-2 border-emerald-500 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-neutral-950 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Set Your Offered Price</span>
                  </h4>
                  <p className="text-[11px] text-neutral-600">
                    No fixed rates! Propose what you want to pay. Available drivers can accept or counter.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 font-mono">Suggested Range</span>
                  <div className="text-xs font-bold text-neutral-800">
                    KSh {benchmarkLow} - {benchmarkHigh}
                  </div>
                </div>
              </div>

              {/* Interactive Price Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-sm font-extrabold text-emerald-700">KSh</span>
                  <input
                    id="input-passenger-proposed-price"
                    type="number"
                    min="30"
                    step="10"
                    value={customPriceInput}
                    onChange={e => {
                      setCustomPriceInput(e.target.value);
                      setIsPriceCustomized(true);
                    }}
                    placeholder={benchmarkBase.toString()}
                    className="w-full bg-white border-2 border-emerald-500 rounded-xl py-2 pl-12 pr-3 text-lg font-black text-neutral-950 shadow-inner focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Quick adjustments */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePriceAdjustment(-50)}
                    className="px-2.5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-lg border border-neutral-300 shadow-2xs"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceAdjustment(-20)}
                    className="px-2.5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-lg border border-neutral-300 shadow-2xs"
                  >
                    -20
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceAdjustment(+20)}
                    className="px-2.5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-lg border border-neutral-300 shadow-2xs"
                  >
                    +20
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceAdjustment(+50)}
                    className="px-2.5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-lg border border-neutral-300 shadow-2xs"
                  >
                    +50
                  </button>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/90 text-[11px] text-neutral-700 flex items-center justify-between">
                <div>
                  <span className="text-neutral-500 text-[11px] block">Your Proposed Safari Price:</span>
                  <span className="text-emerald-800 font-black text-base">KSh {feeCalculation.fare.toLocaleString()}</span>
                </div>
                <div className="text-right text-[11px] text-neutral-500">
                  <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    Pay via M-PESA or Cash
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-request-ride-submit"
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Broadcast Offer (KSh {currentOfferedPrice.toLocaleString()}) to Drivers</span>
            </button>
          </form>
        )}

        {/* TAB 2: SAVED FAVORITE ROUTES */}
        {selectedTab === 'routes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-800">Your Frequent Nairobi Routes</h3>
              <button
                onClick={() => setShowAddRouteModal(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Current Route</span>
              </button>
            </div>

            <div className="space-y-2">
              {savedRoutes.map(route => (
                <div
                  key={route.id}
                  className="bg-neutral-50 hover:bg-neutral-100 p-3 rounded-xl border border-neutral-200 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-white rounded-lg text-emerald-600 border border-neutral-200 shadow-2xs mt-0.5">
                      <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{route.title}</h4>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {route.pickup.name} → {route.dropoff.name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickBookRoute(route)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors shrink-0"
                  >
                    Choose
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Custom Modal */}
            {showAddRouteModal && (
              <div className="p-3.5 bg-white rounded-xl border-2 border-emerald-500 shadow-lg space-y-2.5">
                <h4 className="text-xs font-bold text-neutral-900">Name this route</h4>
                <input
                  type="text"
                  placeholder="e.g. My Gym in Kilimani"
                  value={newRouteTitle}
                  onChange={e => setNewRouteTitle(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-[11px] text-neutral-500">
                  Will save: <strong>{pickupLocation.name}</strong> to <strong>{dropoffLocation.name}</strong>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRouteModal(false)}
                    className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCustomRoute}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                  >
                    Save Route
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUTOMATED M-PESA TRIP HISTORY & RECEIPTS */}
        {selectedTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-800">
                Automated M-PESA Safari Logs & Receipts
              </h3>

              <button
                onClick={togglePaymentDetailsHidden}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                {paymentDetailsHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{paymentDetailsHidden ? 'Details Hidden (Safe)' : 'Details Revealed'}</span>
              </button>
            </div>

            {paymentDetailsHidden && (
              <div className="bg-neutral-100 border border-neutral-200 p-2 rounded-lg text-[11px] text-neutral-600 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Payment details hidden from sight for privacy against shoulder surfing.</span>
              </div>
            )}

            {tripHistory.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                No trip records yet. Completed rides will generate official M-Pesa receipts here.
              </div>
            ) : (
              <div className="space-y-3">
                {tripHistory.map(trip => (
                  <div
                    key={trip.id}
                    className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>{trip.vehicleTypeName}</span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        {maskMpesaCode(trip.payment?.mpesaReceiptNo || 'QKJ891201M', paymentDetailsHidden)}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-0.5 text-neutral-600">
                      <div><strong>From:</strong> {trip.pickup.name}</div>
                      <div><strong>To:</strong> {trip.dropoff.name}</div>
                      <div className="text-neutral-500 text-[10px]">
                        Driver: {trip.driver?.fullName} ({maskPhoneNumber(trip.driver?.phone || '+254722894102', paymentDetailsHidden)})
                      </div>
                    </div>

                    {/* Passenger Trip Breakdown */}
                    <div className="bg-white p-2.5 rounded-lg border border-neutral-200 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Agreed Safari Fare:</span>
                        <span className="font-semibold text-neutral-900">KSh {trip.fare.toLocaleString()}</span>
                      </div>
                      {trip.rating?.tipAmount ? (
                        <div className="flex justify-between text-emerald-700 font-semibold border-t border-neutral-100 pt-1">
                          <span>Driver Tip Added:</span>
                          <span>+ KSh {trip.rating.tipAmount.toLocaleString()}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between font-bold text-neutral-900 border-t border-neutral-100 pt-1">
                        <span>Total Paid:</span>
                        <span>KSh {((trip.fare || 0) + (trip.rating?.tipAmount || 0)).toLocaleString()}</span>
                      </div>
                    </div>

                    {trip.rating && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>Rated {trip.rating.rating} Stars</span>
                        {trip.rating.comment && (
                          <span className="text-neutral-500 font-normal italic ml-1">
                            "{trip.rating.comment}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
