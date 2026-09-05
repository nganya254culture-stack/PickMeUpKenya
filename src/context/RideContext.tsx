import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  DriverBidOffer,
  DriverProfile,
  InstantPayout,
  KenyanVehicleCategory,
  LocationPoint,
  PaymentTransaction,
  PushNotification,
  SavedRoute,
  Trip,
  UserRole,
  VehicleType,
  GpsTrackingTelemetry
} from '../types';
import {
  INITIAL_KENYAN_DRIVERS,
  INITIAL_KENYAN_SAVED_ROUTES,
  INITIAL_KENYAN_TRIP_LOGS,
  KENYAN_LOCATIONS,
  KENYAN_VEHICLE_TYPES,
  PLATFORM_TREASURY_PHONE,
  calculateKenyanFare,
  generateRoutePoints
} from '../data/mockData';
import { calculateDynamicEarnings } from '../utils/privacy';
import { executeAtomicSafariLock, SafariLockResult } from '../utils/atomicLock';
import {
  evaluateGpsFilter,
  DISTANCE_FILTER_METERS,
  POLLING_INTERVAL_IN_TRANSIT_MS,
  POLLING_INTERVAL_STATIONARY_MS,
  POLLING_INTERVAL_OFFLINE_MS
} from '../utils/geofencing';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: 'rider' | 'driver';
  registeredAt: string;
}

interface RideContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  registerUser: (name: string, phone: string, targetRole: 'rider' | 'driver') => void;
  // Payment Privacy: Sensitive details concealed from sight
  paymentDetailsHidden: boolean;
  setPaymentDetailsHidden: (hidden: boolean) => void;
  togglePaymentDetailsHidden: () => void;
  // Rider state
  isLocationSharingEnabled: boolean;
  toggleLocationSharing: () => void;
  savedRoutes: SavedRoute[];
  addSavedRoute: (route: Omit<SavedRoute, 'id'>) => void;
  removeSavedRoute: (id: string) => void;
  // Driver state
  currentDriver: DriverProfile;
  driverIsOnline: boolean;
  setDriverIsOnline: (online: boolean) => void;
  toggleDriverOnline: () => void;
  registerDriver: (driver: Partial<DriverProfile>) => void;
  requestInstantPayout: (amount: number) => Promise<boolean>;
  payoutHistory: InstantPayout[];
  allDrivers: DriverProfile[];
  // Trip management & Dynamic Negotiation Bidding
  activeTrip: Trip | null;
  pendingRequests: Trip[];
  tripHistory: Trip[];
  vehicleTypes: VehicleType[];
  requestRide: (
    pickup: LocationPoint,
    dropoff: LocationPoint,
    vehicleCategoryId: KenyanVehicleCategory,
    passengerOfferedPrice?: number,
    specialInstructions?: string
  ) => Trip;
  passengerUpdateOfferedPrice: (tripId: string, newOfferedPrice: number) => void;
  passengerAcceptDriverBid: (tripId: string, bidId: string) => void;
  passengerCounterDriverBid: (tripId: string, bidId: string, counterPrice: number) => void;
  driverSubmitBid: (tripId: string, driverOfferPrice: number, note?: string) => void;
  driverAcceptPassengerOffer: (tripId: string) => void;
  acceptRide: (tripId: string) => void;
  declineRide: (tripId: string) => void;
  startTrip: () => void;
  completeTrip: () => void;
  cancelActiveTrip: (reason?: string) => void;
  submitRatingAndTip: (rating: number, tags: string[], comment: string, tip: number) => void;
  // UI & Notifications
  notifications: PushNotification[];
  dismissNotification: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  safetyShareModalOpen: boolean;
  setSafetyShareModalOpen: (open: boolean) => void;
  ratingModalOpen: boolean;
  setRatingModalOpen: (open: boolean) => void;
  lastCompletedTrip: Trip | null;
  // Atomic Concurrency & Geofencing Telemetry
  gpsTelemetry: GpsTrackingTelemetry;
  simulateDriverConcurrencyCollision: (tripId: string) => Promise<SafariLockResult>;
  expoModalOpen: boolean;
  setExpoModalOpen: (open: boolean) => void;
  playSound: (type: 'beep' | 'success' | 'alert' | 'mpesa') => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('rider');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pickmeup_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-ke-001',
      name: 'Amani Mwangi',
      phone: '+254720918273',
      role: 'rider',
      registeredAt: new Date().toISOString()
    };
  });

  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState<boolean>(true);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(() => {
    const local = localStorage.getItem('pickmeup_saved_routes');
    return local ? JSON.parse(local) : INITIAL_KENYAN_SAVED_ROUTES;
  });

  const [allDrivers, setAllDrivers] = useState<DriverProfile[]>(() => {
    const local = localStorage.getItem('pickmeup_drivers');
    return local ? JSON.parse(local) : INITIAL_KENYAN_DRIVERS;
  });

  const [currentDriver, setCurrentDriver] = useState<DriverProfile>(() => allDrivers[0]);
  const [driverIsOnline, setDriverIsOnlineState] = useState<boolean>(true);

  const [payoutHistory, setPayoutHistory] = useState<InstantPayout[]>(() => {
    const local = localStorage.getItem('pickmeup_payouts');
    return local ? JSON.parse(local) : [
      {
        id: 'payout-ke-101',
        driverId: 'drv-ke-001',
        driverPhone: '+254722894102',
        amount: 2500,
        platformFee: 35,
        netPayout: 2465,
        mpesaRef: 'QKH781290M',
        date: '03 Sep 2026 • 2:15 PM',
        status: 'completed'
      }
    ];
  });

  const [tripHistory, setTripHistory] = useState<Trip[]>(() => {
    const local = localStorage.getItem('pickmeup_trip_history');
    return local ? JSON.parse(local) : INITIAL_KENYAN_TRIP_LOGS;
  });

  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Trip[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif-welcome',
      title: 'Karibu PickMeUp Kenya!',
      message: 'Boda Boda, Matatu, Taxi, Pick-Ups, School Buses & Lorries available across Nairobi.',
      timestamp: 'Just now',
      type: 'safety',
      read: false
    }
  ]);

  const [safetyShareModalOpen, setSafetyShareModalOpen] = useState<boolean>(false);
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [expoModalOpen, setExpoModalOpen] = useState<boolean>(false);
  const [lastCompletedTrip, setLastCompletedTrip] = useState<Trip | null>(null);

  // Payment Details Hidden by default (privacy shielding against public shoulder surfing)
  const [paymentDetailsHidden, setPaymentDetailsHidden] = useState<boolean>(() => {
    const local = localStorage.getItem('pickmeup_payment_privacy');
    return local !== null ? JSON.parse(local) : true;
  });

  const togglePaymentDetailsHidden = () => {
    setPaymentDetailsHidden(prev => {
      const next = !prev;
      addNotification(
        next ? 'Payment Details Concealed' : 'Payment Details Visible',
        next
          ? 'Phone numbers, M-Pesa codes & routing details are now hidden from sight.'
          : 'Payment numbers and transaction codes are now unmasked.',
        'safety'
      );
      return next;
    });
  };

  const simulationIntervalRef = useRef<number | null>(null);
  const lastEmittedPosRef = useRef<{ lat: number; lng: number } | null>(null);

  // GPS Distance-Filter & Adaptive Polling Telemetry (>15m threshold)
  const [gpsTelemetry, setGpsTelemetry] = useState<GpsTrackingTelemetry>({
    lastEmittedPos: null,
    lastDistanceDeltaMeters: 0,
    mode: 'stationary',
    pollingIntervalMs: POLLING_INTERVAL_STATIONARY_MS,
    filteredUpdatesCount: 0,
    emittedUpdatesCount: 0,
    distanceFilterMeters: DISTANCE_FILTER_METERS
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('pickmeup_payment_privacy', JSON.stringify(paymentDetailsHidden));
  }, [paymentDetailsHidden]);
  useEffect(() => {
    localStorage.setItem('pickmeup_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pickmeup_saved_routes', JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  useEffect(() => {
    localStorage.setItem('pickmeup_trip_history', JSON.stringify(tripHistory));
  }, [tripHistory]);

  useEffect(() => {
    localStorage.setItem('pickmeup_drivers', JSON.stringify(allDrivers));
  }, [allDrivers]);

  useEffect(() => {
    localStorage.setItem('pickmeup_payouts', JSON.stringify(payoutHistory));
  }, [payoutHistory]);

  const addNotification = (title: string, message: string, type: PushNotification['type']) => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  };

  const playSound = (type: 'beep' | 'success' | 'alert' | 'mpesa') => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      if (type === 'mpesa') {
        // High double-tone chime reminiscent of Safaricom M-Pesa receipt tone
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'beep') {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(440, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // AudioContext fallback
    }
  };

  const registerUser = (name: string, phone: string, targetRole: 'rider' | 'driver') => {
    const user: UserProfile = {
      id: `usr-ke-${Date.now().toString().slice(-4)}`,
      name,
      phone,
      role: targetRole,
      registeredAt: new Date().toISOString()
    };
    setCurrentUser(user);
    setRole(targetRole);

    addNotification(
      'Account Verified',
      `Welcome to PickMeUp, ${name}! Logged in as ${targetRole === 'rider' ? 'Passenger' : 'Driver'}.`,
      'safety'
    );
    playSound('success');
  };

  const toggleLocationSharing = () => {
    setIsLocationSharingEnabled(prev => {
      const next = !prev;
      addNotification(
        'Location Privacy Updated',
        next ? 'Real-time GPS location sharing is ACTIVE for trip safety.' : 'Location sharing turned OFF. Coordinates hidden from public share.',
        'safety'
      );
      if (activeTrip) {
        setActiveTrip(curr => curr ? { ...curr, isLocationSharingEnabled: next } : null);
      }
      return next;
    });
  };

  const toggleDriverOnline = () => {
    setDriverIsOnlineState(prev => {
      const next = !prev;
      setGpsTelemetry(curr => ({
        ...curr,
        mode: next ? 'stationary' : 'offline',
        pollingIntervalMs: next ? POLLING_INTERVAL_STATIONARY_MS : POLLING_INTERVAL_OFFLINE_MS
      }));
      addNotification(
        next ? 'Driver Online (Nairobi Fleet)' : 'Driver Offline',
        next
          ? 'Online and receiving dispatch requests. GPS distance filter (>15m) & adaptive polling active.'
          : 'Offline mode active. GPS polling completely suspended (0 polling / 0 battery drain).',
        'driver_alert'
      );
      return next;
    });
  };

  const setDriverIsOnline = (online: boolean) => {
    setDriverIsOnlineState(online);
    setGpsTelemetry(curr => ({
      ...curr,
      mode: online ? 'stationary' : 'offline',
      pollingIntervalMs: online ? POLLING_INTERVAL_STATIONARY_MS : POLLING_INTERVAL_OFFLINE_MS
    }));
  };

  const addSavedRoute = (route: Omit<SavedRoute, 'id'>) => {
    const newRoute: SavedRoute = {
      ...route,
      id: `route-ke-${Date.now()}`
    };
    setSavedRoutes(prev => [newRoute, ...prev]);
    addNotification('Favorite Route Saved', `"${route.title}" added to your 1-tap bookings.`, 'ride_update');
  };

  const removeSavedRoute = (id: string) => {
    setSavedRoutes(prev => prev.filter(r => r.id !== id));
  };

  /**
   * Driver Registration: Takes vehicle category (bodaboda, matatu, taxi, pickup, school_bus, lorry),
   * driver's M-Pesa payout phone number (+254...), national ID, plate, and photo.
   * Directs driver straight to their individual Driver Portal!
   */
  const registerDriver = (driverData: Partial<DriverProfile>) => {
    const category = driverData.vehicleCategory || 'bodaboda';
    const vType = KENYAN_VEHICLE_TYPES.find(v => v.id === category) || KENYAN_VEHICLE_TYPES[0];

    const newDriver: DriverProfile = {
      id: `drv-ke-${Date.now().toString().slice(-4)}`,
      fullName: driverData.fullName || 'Registered Kenyan Driver',
      phone: driverData.phone || '+254700000000',
      nationalId: driverData.nationalId || 'ID-30000000',
      vehicleCategory: category,
      vehicleMakeModel: driverData.vehicleMakeModel || `${vType.name} (Custom)`,
      vehiclePlate: driverData.vehiclePlate || 'KDM 102Z',
      vehicleColor: driverData.vehicleColor || 'White / Decorated',
      vehiclePhotoUrl: driverData.vehiclePhotoUrl || vType.image,
      driverPhotoUrl: driverData.driverPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      saccoOrFleet: driverData.saccoOrFleet || 'Independent Fleet',
      rating: 5.0,
      totalTrips: 0,
      isOnline: true,
      walletBalance: 0,
      verified: true,
      currentLocation: { lat: -1.2864, lng: 36.8250 },
      heading: 90
    };

    setAllDrivers(prev => [newDriver, ...prev]);
    setCurrentDriver(newDriver);
    setDriverIsOnlineState(true);

    // Update user profile and switch to driver view
    setCurrentUser(prev => ({
      ...prev,
      name: newDriver.fullName,
      phone: newDriver.phone,
      role: 'driver'
    }));
    setRole('driver');

    addNotification(
      'Driver Registration Approved! 🇰🇪',
      `Welcome ${newDriver.fullName}! Vehicle ${newDriver.vehicleMakeModel} (${newDriver.vehiclePlate}) is active. Instant M-Pesa payouts configured to ${newDriver.phone}.`,
      'driver_alert'
    );
    playSound('mpesa');
  };

  /**
   * Driver instant M-Pesa payout to their registered phone number
   */
  const requestInstantPayout = async (amount: number): Promise<boolean> => {
    if (amount <= 0 || amount > currentDriver.walletBalance) {
      return false;
    }

    const fee = 15; // M-Pesa B2C withdrawal tariff in KSh
    const net = Math.max(0, amount - fee);
    const mpesaCode = `QKM${Math.floor(100000 + Math.random() * 900000)}M`;

    const newPayout: InstantPayout = {
      id: `payout-ke-${Date.now()}`,
      driverId: currentDriver.id,
      driverPhone: currentDriver.phone,
      amount,
      platformFee: fee,
      netPayout: net,
      mpesaRef: mpesaCode,
      date: new Date().toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed'
    };

    const updatedBalance = Number((currentDriver.walletBalance - amount).toFixed(2));
    setCurrentDriver(prev => ({ ...prev, walletBalance: updatedBalance }));
    setAllDrivers(prev => prev.map(d => d.id === currentDriver.id ? { ...d, walletBalance: updatedBalance } : d));
    setPayoutHistory(prev => [newPayout, ...prev]);

    addNotification(
      'M-PESA Instant Payout Sent!',
      `${mpesaCode} Confirmed. KSh ${net.toLocaleString()} sent to ${currentDriver.phone}. Available immediately.`,
      'mpesa'
    );
    playSound('mpesa');
    return true;
  };

  /**
   * Add a driver price bid / counter-offer to a trip
   */
  const addDriverBidToTrip = (tripId: string, bid: DriverBidOffer) => {
    setActiveTrip(curr => {
      if (!curr || curr.id !== tripId || curr.status !== 'requesting') return curr;
      if (curr.bids.some(b => b.driverId === bid.driverId)) {
        return {
          ...curr,
          bids: curr.bids.map(b => b.driverId === bid.driverId ? bid : b)
        };
      }
      return { ...curr, bids: [bid, ...curr.bids] };
    });

    setPendingRequests(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      if (t.bids.some(b => b.driverId === bid.driverId)) {
        return { ...t, bids: t.bids.map(b => b.driverId === bid.driverId ? bid : b) };
      }
      return { ...t, bids: [bid, ...t.bids] };
    }));

    addNotification(
      bid.isAcceptanceOfPassengerPrice ? 'Driver Accepted Your Offer! 🇰🇪' : 'New Driver Counter-Offer Received',
      `${bid.driver.fullName} (${bid.driver.vehiclePlate}) offered KSh ${bid.offeredPrice.toLocaleString()} (ETA: ${bid.etaMinutes} mins). Tap to view & accept.`,
      'driver_alert'
    );
    playSound('beep');
  };

  /**
   * Trip Request with NO FIXED PRICE:
   * Passenger sets their offered price, broadcasted to all available online drivers.
   */
  const requestRide = (
    pickup: LocationPoint,
    dropoff: LocationPoint,
    vehicleCategoryId: KenyanVehicleCategory,
    passengerOfferedPrice?: number,
    specialInstructions?: string
  ): Trip => {
    const vType = KENYAN_VEHICLE_TYPES.find(v => v.id === vehicleCategoryId) || KENYAN_VEHICLE_TYPES[0];
    
    // Distance in km & time
    const dLat = (dropoff.lat - pickup.lat) * 111;
    const dLng = (dropoff.lng - pickup.lng) * 85;
    const distanceKm = Math.max(1.5, Number(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1)));
    const durationMin = Math.max(6, Math.round(distanceKm * 3.2));
    
    // Recommended starting guideline if none provided
    const defaultBenchmark = Math.max(vType.baseFare, Math.round(vType.baseFare + distanceKm * vType.perKmRate + durationMin * vType.perMinRate));
    const initialPrice = passengerOfferedPrice && passengerOfferedPrice > 0 ? Math.round(passengerOfferedPrice) : defaultBenchmark;
    const pricing = calculateDynamicEarnings(initialPrice);

    const newTrip: Trip = {
      id: `trip-ke-${Date.now().toString().slice(-4)}`,
      riderId: currentUser.id,
      riderName: currentUser.name,
      riderPhone: currentUser.phone,
      pickup,
      dropoff,
      vehicleCategory: vType.id,
      vehicleTypeName: vType.name,
      passengerOfferedPrice: initialPrice,
      bids: [],
      fare: initialPrice,
      driverEarnings: pricing.driverNetEarnings,
      platformUsageFee: pricing.platformUsageFee, // 70 cents per 50 KSh sent to +254115540711
      distanceKm,
      durationMinutes: durationMin,
      status: 'requesting',
      requestedAt: new Date().toISOString(),
      safetyShareToken: `pickmeup-${Math.random().toString(36).substring(2, 9)}`,
      isLocationSharingEnabled,
      specialInstructions,
      currentPosition: { ...pickup }
    };

    setActiveTrip(newTrip);
    setPendingRequests(prev => [newTrip, ...prev]);

    addNotification(
      'Price Offer Broadcasted! 🇰🇪',
      `Your proposed fare of KSh ${initialPrice.toLocaleString()} is live for all available ${vType.name} drivers in Nairobi.`,
      'ride_update'
    );
    playSound('beep');

    // Simulate responsive nearby drivers in Nairobi bidding/accepting
    setTimeout(() => {
      const driver1 = allDrivers.find(d => d.isOnline && d.vehicleCategory === vehicleCategoryId) || allDrivers[0];
      if (driver1) {
        const d1Earnings = calculateDynamicEarnings(initialPrice);
        const bid1: DriverBidOffer = {
          id: `bid-${Date.now()}-1`,
          driverId: driver1.id,
          driver: driver1,
          offeredPrice: initialPrice, // Pleased with passenger price!
          driverEarnings: d1Earnings.driverNetEarnings,
          platformUsageFee: d1Earnings.platformUsageFee,
          etaMinutes: 2,
          offeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Pleased with KSh ${initialPrice}! Ready at nearby stage.`,
          isAcceptanceOfPassengerPrice: true,
          status: 'pending'
        };
        addDriverBidToTrip(newTrip.id, bid1);
      }
    }, 1600);

    setTimeout(() => {
      const driver2 = allDrivers.find(d => d.isOnline && d.id !== allDrivers[0]?.id) || allDrivers[1] || allDrivers[0];
      if (driver2) {
        // Driver 2 proposes custom driver price (e.g. slight premium for fast express trip)
        const driverPrice = Math.round((initialPrice * 1.15) / 10) * 10;
        const d2Earnings = calculateDynamicEarnings(driverPrice);
        const bid2: DriverBidOffer = {
          id: `bid-${Date.now()}-2`,
          driverId: driver2.id,
          driver: driver2,
          offeredPrice: driverPrice,
          driverEarnings: d2Earnings.driverNetEarnings,
          platformUsageFee: d2Earnings.platformUsageFee,
          etaMinutes: 4,
          offeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: 'Avoids heavy highway jam • High safety rating',
          isAcceptanceOfPassengerPrice: false,
          status: 'pending'
        };
        addDriverBidToTrip(newTrip.id, bid2);
      }
    }, 3200);

    return newTrip;
  };

  /**
   * Passenger raises or adjusts their offered price while searching
   */
  const passengerUpdateOfferedPrice = (tripId: string, newOfferedPrice: number) => {
    const pricing = calculateDynamicEarnings(newOfferedPrice);
    setActiveTrip(curr => {
      if (!curr || curr.id !== tripId) return curr;
      return {
        ...curr,
        passengerOfferedPrice: newOfferedPrice,
        fare: newOfferedPrice,
        driverEarnings: pricing.driverNetEarnings,
        platformUsageFee: pricing.platformUsageFee
      };
    });

    setPendingRequests(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        passengerOfferedPrice: newOfferedPrice,
        fare: newOfferedPrice,
        driverEarnings: pricing.driverNetEarnings,
        platformUsageFee: pricing.platformUsageFee
      };
    }));

    addNotification(
      'Offer Raised to KSh ' + newOfferedPrice.toLocaleString(),
      'Broadcast updated to nearby drivers. Higher offer increases acceptance rate.',
      'ride_update'
    );
    playSound('beep');
  };

  /**
   * Passenger is pleased with a driver's proposed price and accepts the trip
   */
  const passengerAcceptDriverBid = (tripId: string, bidId: string) => {
    setActiveTrip(curr => {
      if (!curr || curr.id !== tripId) return curr;
      const targetBid = curr.bids.find(b => b.id === bidId);
      if (!targetBid) return curr;

      const driver = targetBid.driver;
      const routePoints = generateRoutePoints(driver.currentLocation, curr.pickup, 20);

      const updated: Trip = {
        ...curr,
        driverId: driver.id,
        driver,
        fare: targetBid.offeredPrice,
        driverEarnings: targetBid.driverEarnings,
        platformUsageFee: targetBid.platformUsageFee,
        status: 'driver_arriving',
        acceptedAt: new Date().toISOString(),
        routePolyline: routePoints,
        currentPosition: driver.currentLocation
      };

      addNotification(
        'Trip Confirmed at KSh ' + targetBid.offeredPrice.toLocaleString() + '! 🇰🇪',
        `${driver.fullName} (${driver.vehiclePlate}) is en route to ${curr.pickup.name}. Agreed fare: KSh ${targetBid.offeredPrice.toLocaleString()}.`,
        'ride_update'
      );
      playSound('success');

      startSimulation(updated, 'to_pickup');
      return updated;
    });

    setPendingRequests(prev => prev.filter(r => r.id !== tripId));
  };

  /**
   * Passenger negotiates / counters a driver's bid
   */
  const passengerCounterDriverBid = (tripId: string, bidId: string, counterPrice: number) => {
    const pricing = calculateDynamicEarnings(counterPrice);
    setActiveTrip(curr => {
      if (!curr || curr.id !== tripId) return curr;
      const updatedBids = curr.bids.map(b => {
        if (b.id === bidId) {
          return {
            ...b,
            offeredPrice: counterPrice,
            driverEarnings: pricing.driverNetEarnings,
            platformUsageFee: pricing.platformUsageFee,
            status: 'countered' as const,
            note: `Passenger countered: KSh ${counterPrice}`
          };
        }
        return b;
      });
      return {
        ...curr,
        bids: updatedBids,
        passengerOfferedPrice: counterPrice
      };
    });

    addNotification(
      'Counter-Offer Dispatched',
      `Sent KSh ${counterPrice.toLocaleString()} counter-offer to driver. Awaiting driver response.`,
      'ride_update'
    );
    playSound('beep');
  };

  /**
   * Driver submits their proposed price / counter-offer for a trip
   */
  const driverSubmitBid = (tripId: string, driverOfferPrice: number, note?: string) => {
    const target = pendingRequests.find(r => r.id === tripId) || activeTrip;
    if (!target) return;

    const pricing = calculateDynamicEarnings(driverOfferPrice);
    const newBid: DriverBidOffer = {
      id: `bid-drv-${Date.now()}`,
      driverId: currentDriver.id,
      driver: currentDriver,
      offeredPrice: driverOfferPrice,
      driverEarnings: pricing.driverNetEarnings,
      platformUsageFee: pricing.platformUsageFee,
      etaMinutes: 3,
      offeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note || `Driver proposed KSh ${driverOfferPrice}`,
      isAcceptanceOfPassengerPrice: driverOfferPrice === target.passengerOfferedPrice,
      status: 'pending'
    };

    addDriverBidToTrip(tripId, newBid);

    addNotification(
      'Your Price Offer Sent! 🇰🇪',
      `Sent KSh ${driverOfferPrice.toLocaleString()} to ${target.riderName}. Waiting for passenger to accept or negotiate.`,
      'driver_alert'
    );
    playSound('beep');
  };

  /**
   * Driver accepts the passenger's offered price.
   * Executes ATOMIC DATABASE TRANSACTION (simulating Firestore runTransaction / SQL SELECT FOR UPDATE)
   * so ONLY the first driver to accept locks the safari.
   */
  const driverAcceptPassengerOffer = async (tripId: string) => {
    const lockResult = await executeAtomicSafariLock(
      tripId,
      currentDriver,
      pendingRequests,
      activeTrip
    );

    if (!lockResult.success || !lockResult.lockedTrip) {
      playSound('alert');
      addNotification(
        'Concurrency Collision: Safari Already Secured ⚠️',
        lockResult.message,
        'driver_alert'
      );
      // Remove trip from pending queue since another driver claimed it
      setPendingRequests(prev => prev.filter(r => r.id !== tripId));
      return;
    }

    const updated = lockResult.lockedTrip;
    const routePoints = generateRoutePoints(currentDriver.currentLocation, updated.pickup, 20);
    updated.routePolyline = routePoints;
    updated.currentPosition = currentDriver.currentLocation;
    lastEmittedPosRef.current = currentDriver.currentLocation;

    setActiveTrip(updated);
    setPendingRequests(prev => prev.filter(r => r.id !== tripId));

    addNotification(
      'Atomic Lock Secured! 🇰🇪 (First to Accept)',
      `Trip locked under revision #${updated.lockVersion || 1}. Agreed on KSh ${updated.fare.toLocaleString()} with ${updated.riderName}. Net Payout: KSh ${updated.driverEarnings.toFixed(2)}.`,
      'driver_alert'
    );
    playSound('success');

    startSimulation(updated, 'to_pickup');
  };

  /**
   * Test simulated concurrency collision (for verification of race conditions)
   */
  const simulateDriverConcurrencyCollision = async (tripId: string): Promise<SafariLockResult> => {
    const rivalDriver: DriverProfile = {
      ...allDrivers[1],
      id: 'drv-rival-009',
      fullName: 'Juma Ochieng (Concurrent Driver)',
      vehiclePlate: 'KDG 991K'
    };

    const lockResult = await executeAtomicSafariLock(
      tripId,
      rivalDriver,
      pendingRequests,
      activeTrip
    );

    if (lockResult.success && lockResult.lockedTrip) {
      // Mark trip as locked by the concurrent driver
      setPendingRequests(prev => prev.map(t => t.id === tripId ? lockResult.lockedTrip! : t));
      addNotification(
        'Simulated Race Condition: Driver Rival Accepted First!',
        `${rivalDriver.fullName} locked Safari #${tripId.slice(-4)} 18ms before you. If you click Accept now, atomic locking will reject it.`,
        'driver_alert'
      );
      playSound('beep');
    }

    return lockResult;
  };

  const acceptRide = (tripId: string) => {
    driverAcceptPassengerOffer(tripId);
  };

  const declineRide = (tripId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== tripId));
    addNotification('Trip Skipped', 'Request removed from your queue. Ready for next ride.', 'driver_alert');
  };

  // Real-time GPS movement simulation with Distance-Filter Geofencing (>15m) & Adaptive Polling
  const startSimulation = (trip: Trip, phase: 'to_pickup' | 'to_dropoff') => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    let startCoord = phase === 'to_pickup' 
      ? (trip.driver?.currentLocation || trip.currentPosition || trip.pickup)
      : trip.pickup;
    let endCoord = phase === 'to_pickup' ? trip.pickup : trip.dropoff;

    const waypoints = generateRoutePoints(startCoord, endCoord, 25);
    let stepIndex = 0;

    // In-transit navigation polling frequency
    simulationIntervalRef.current = window.setInterval(() => {
      stepIndex++;
      if (stepIndex >= waypoints.length) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
        }

        if (phase === 'to_pickup') {
          // Arrived at pickup
          setActiveTrip(curr => {
            if (!curr) return null;
            const atPickup: Trip = {
              ...curr,
              status: 'arrived',
              currentPosition: { lat: curr.pickup.lat, lng: curr.pickup.lng }
            };
            lastEmittedPosRef.current = { lat: curr.pickup.lat, lng: curr.pickup.lng };
            addNotification(
              'Driver Arrived at Pickup!',
              `${curr.driver?.fullName} is waiting at ${curr.pickup.name}. Please board your ride.`,
              'ride_update'
            );
            playSound('beep');
            return atPickup;
          });
        } else {
          // Reached dropoff
          handleTripArrival();
        }
        return;
      }

      const nextPoint = waypoints[stepIndex];
      const nextPos = { lat: nextPoint[0], lng: nextPoint[1] };

      // Distance-filter geofencing evaluation (>15 meters)
      const evaluation = evaluateGpsFilter(
        nextPos,
        lastEmittedPosRef.current,
        driverIsOnline,
        true
      );

      setGpsTelemetry(prev => ({
        ...prev,
        lastDistanceDeltaMeters: evaluation.distanceDeltaMeters,
        mode: evaluation.mode,
        pollingIntervalMs: evaluation.recommendedPollingIntervalMs,
        filteredUpdatesCount: evaluation.shouldEmit ? prev.filteredUpdatesCount : prev.filteredUpdatesCount + 1,
        emittedUpdatesCount: evaluation.shouldEmit ? prev.emittedUpdatesCount + 1 : prev.emittedUpdatesCount,
        lastEmittedPos: evaluation.shouldEmit ? nextPos : prev.lastEmittedPos
      }));

      // Only update broadcasted GPS position if moved beyond 15m threshold
      if (evaluation.shouldEmit) {
        lastEmittedPosRef.current = nextPos;
        setActiveTrip(curr => {
          if (!curr) return null;
          return {
            ...curr,
            currentPosition: nextPos
          };
        });
      }
    }, POLLING_INTERVAL_IN_TRANSIT_MS);
  };

  const startTrip = () => {
    if (!activeTrip) return;
    const routeToDropoff = generateRoutePoints(activeTrip.pickup, activeTrip.dropoff, 30);
    const updated: Trip = {
      ...activeTrip,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      routePolyline: routeToDropoff,
      currentPosition: activeTrip.pickup
    };
    setActiveTrip(updated);

    addNotification(
      'Safari Imeanza (Trip In Progress)',
      `Heading to ${updated.dropoff.name}. Safety GPS route tracking active.`,
      'safety'
    );
    playSound('beep');

    startSimulation(updated, 'to_dropoff');
  };

  const handleTripArrival = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    setActiveTrip(curr => {
      if (!curr) return null;
      
      const pricing = calculateDynamicEarnings(curr.fare);
      const mpesaReceipt = `QK${Math.floor(10000000 + Math.random() * 90000000)}M`;

      const paymentTx: PaymentTransaction = {
        id: `pay-mpesa-${Date.now().toString().slice(-4)}`,
        tripId: curr.id,
        mpesaReceiptNo: mpesaReceipt,
        amount: curr.fare,
        tip: 0,
        total: curr.fare,
        status: 'paid',
        paymentMethod: 'M-PESA',
        phoneNumber: curr.riderPhone,
        driverPayoutNumber: curr.driver?.phone || '+254722894102',
        date: new Date().toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        breakdown: {
          baseFare: Math.round(curr.fare * 0.4),
          distanceFare: Math.round(curr.fare * 0.6),
          platformUsageFee: pricing.platformUsageFee, // KSh 0.70 per KSh 50 transacted
          platformTreasuryNumber: PLATFORM_TREASURY_PHONE, // +254115540711
          driverNetEarnings: pricing.driverNetEarnings,
          tip: 0
        }
      };

      const completed: Trip = {
        ...curr,
        status: 'completed',
        completedAt: new Date().toISOString(),
        payment: paymentTx,
        currentPosition: curr.dropoff
      };

      // Credit driver wallet with net earnings (fare minus 70 cents per 50 KSh)
      setCurrentDriver(drv => {
        const newBal = Number((drv.walletBalance + pricing.driverNetEarnings).toFixed(2));
        return {
          ...drv,
          walletBalance: newBal,
          totalTrips: drv.totalTrips + 1
        };
      });

      setLastCompletedTrip(completed);
      setRatingModalOpen(true);

      addNotification(
        'Trip Completed • M-PESA Confirmed',
        `${mpesaReceipt} Confirmed. KSh ${curr.fare.toLocaleString()} received for your safari. Thank you for choosing PickMeUp!`,
        'mpesa'
      );
      playSound('mpesa');

      return null;
    });
  };

  const completeTrip = () => {
    handleTripArrival();
  };

  const cancelActiveTrip = (reason?: string) => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    setActiveTrip(null);
    addNotification('Safari Imesitishwa', reason || 'Ride has been cancelled.', 'ride_update');
    playSound('alert');
  };

  const submitRatingAndTip = (rating: number, tags: string[], comment: string, tip: number) => {
    if (!lastCompletedTrip) return;

    const ratingRecord = {
      rating,
      feedbackTags: tags,
      comment,
      tipAmount: tip,
      createdAt: new Date().toISOString(),
      ratedBy: 'rider' as const
    };

    const finalPayment = lastCompletedTrip.payment ? {
      ...lastCompletedTrip.payment,
      tip,
      total: Number((lastCompletedTrip.payment.amount + tip).toFixed(2)),
      breakdown: {
        ...lastCompletedTrip.payment.breakdown,
        tip
      }
    } : undefined;

    const finalizedTrip: Trip = {
      ...lastCompletedTrip,
      rating: ratingRecord,
      payment: finalPayment
    };

    // Credit driver tip 100% directly
    if (tip > 0 && finalizedTrip.driverId) {
      setCurrentDriver(drv => ({
        ...drv,
        walletBalance: Number((drv.walletBalance + tip).toFixed(2))
      }));
    }

    setTripHistory(prev => [finalizedTrip, ...prev]);
    setRatingModalOpen(false);
    setLastCompletedTrip(null);

    addNotification(
      'Asante Sana! Feedback & Tip Sent',
      tip > 0 
        ? `Rated ${rating}★ and sent KSh ${tip.toLocaleString()} tip to ${finalizedTrip.driver?.fullName} (${finalizedTrip.driver?.phone}).` 
        : `Thank you for rating ${finalizedTrip.driver?.fullName} ${rating}★!`,
      'safety'
    );
    playSound('mpesa');
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <RideContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        registerUser,
        paymentDetailsHidden,
        setPaymentDetailsHidden,
        togglePaymentDetailsHidden,
        isLocationSharingEnabled,
        toggleLocationSharing,
        savedRoutes,
        addSavedRoute,
        removeSavedRoute,
        currentDriver,
        driverIsOnline,
        setDriverIsOnline,
        toggleDriverOnline,
        registerDriver,
        requestInstantPayout,
        payoutHistory,
        allDrivers,
        activeTrip,
        pendingRequests,
        tripHistory,
        vehicleTypes: KENYAN_VEHICLE_TYPES,
        requestRide,
        passengerUpdateOfferedPrice,
        passengerAcceptDriverBid,
        passengerCounterDriverBid,
        driverSubmitBid,
        driverAcceptPassengerOffer,
        acceptRide,
        declineRide,
        startTrip,
        completeTrip,
        cancelActiveTrip,
        submitRatingAndTip,
        notifications,
        dismissNotification,
        markAllNotificationsAsRead,
        safetyShareModalOpen,
        setSafetyShareModalOpen,
        ratingModalOpen,
        setRatingModalOpen,
        lastCompletedTrip,
        expoModalOpen,
        setExpoModalOpen,
        playSound,
        gpsTelemetry,
        simulateDriverConcurrencyCollision
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
