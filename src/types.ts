export type UserRole = 'rider' | 'driver' | 'onboarding';

export type KenyanVehicleCategory = 
  | 'bodaboda' 
  | 'matatu' 
  | 'taxi' 
  | 'pickup' 
  | 'school_bus' 
  | 'lorry';

export type RideStatus = 
  | 'idle' 
  | 'requesting' 
  | 'driver_arriving' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
  name: string;
  landmark?: string;
}

export interface VehicleType {
  id: KenyanVehicleCategory;
  name: string;
  swahiliName?: string;
  category: 'Boda Boda' | 'Matatu Nganya' | 'Taxi Cab' | 'Pick-Up Cargo' | 'School Transit' | 'Heavy Lorry';
  capacity: string;
  seats: number;
  baseFare: number; // in KES
  perKmRate: number; // in KES
  perMinRate: number; // in KES
  etaMinutes: number;
  image: string;
  description: string;
  badge?: string;
  popularFor: string;
}

export interface DriverProfile {
  id: string;
  fullName: string;
  phone: string; // Registered Kenyan phone e.g. +254712345678 (receives M-Pesa payouts)
  nationalId: string; // Kenyan National ID
  vehicleCategory: KenyanVehicleCategory;
  vehicleMakeModel: string;
  vehiclePlate: string; // e.g. KDG 429Z
  vehicleColor: string;
  vehiclePhotoUrl: string;
  driverPhotoUrl: string;
  saccoOrFleet?: string; // e.g. Super Metro, Forward Travellers, Boda Riders SACCO
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  walletBalance: number; // in KES
  verified: boolean;
  currentLocation: { lat: number; lng: number };
  heading?: number;
}

export interface SavedRoute {
  id: string;
  title: string;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  iconName: 'home' | 'briefcase' | 'heart' | 'plane' | 'dumbbell' | 'map-pin' | 'school';
  frequency?: number;
}

export interface TripRating {
  rating: number; // 1 to 5
  feedbackTags: string[];
  comment?: string;
  tipAmount: number; // in KES
  createdAt: string;
  ratedBy: 'rider' | 'driver';
}

export interface PaymentTransaction {
  id: string;
  tripId: string;
  mpesaReceiptNo: string; // e.g. QKG891278M
  amount: number; // in KES
  tip: number; // in KES
  total: number; // in KES
  status: 'paid' | 'pending' | 'refunded';
  paymentMethod: 'M-PESA' | 'Airtel Money' | 'Card' | 'PickMeUp Cash';
  phoneNumber: string; // Customer paying number
  driverPayoutNumber: string; // Driver registered number
  date: string;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    platformUsageFee: number; // 70 cents per 50 KES transacted
    platformTreasuryNumber: string; // +254115540711
    driverNetEarnings: number;
    tip: number;
  };
}

export interface InstantPayout {
  id: string;
  driverId: string;
  driverPhone: string; // Dispatched to this registered number
  amount: number; // in KES
  platformFee: number; // in KES
  netPayout: number; // in KES
  mpesaRef: string;
  date: string;
  status: 'completed' | 'processing';
}

export interface DriverBidOffer {
  id: string;
  driverId: string;
  driver: DriverProfile;
  offeredPrice: number; // Driver's proposed price in KES
  driverEarnings: number; // Net earnings after 70 cents per 50 KSh
  platformUsageFee: number; // KSh 0.70 per 50 KSh
  etaMinutes: number;
  offeredAt: string;
  note?: string;
  isAcceptanceOfPassengerPrice?: boolean;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
}

export interface Trip {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  driverId?: string;
  driver?: DriverProfile;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  vehicleCategory: KenyanVehicleCategory;
  vehicleTypeName: string;
  passengerOfferedPrice: number; // Passenger's initial or updated offered price (no fixed price)
  bids: DriverBidOffer[]; // Real-time driver bids & price proposals
  fare: number; // Current agreed or negotiating fare in KES
  driverEarnings: number; // in KES
  platformUsageFee: number; // 70 cents per 50 KES sent to +254115540711
  distanceKm: number;
  durationMinutes: number;
  status: RideStatus;
  requestedAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  routePolyline?: [number, number][];
  currentPosition?: { lat: number; lng: number };
  safetyShareToken: string;
  isLocationSharingEnabled: boolean;
  specialInstructions?: string; // e.g. "School child handover" or "Fragile moving crates"
  rating?: TripRating;
  payment?: PaymentTransaction;
  // Atomic Concurrency & Mutex Locking Fields
  lockVersion?: number;
  lockedByDriverId?: string;
  lockedAt?: string;
}

export interface GpsTrackingTelemetry {
  lastEmittedPos: { lat: number; lng: number } | null;
  lastDistanceDeltaMeters: number;
  mode: 'in_transit' | 'stationary' | 'offline';
  pollingIntervalMs: number;
  filteredUpdatesCount: number;
  emittedUpdatesCount: number;
  distanceFilterMeters: number;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'ride_update' | 'payment' | 'safety' | 'driver_alert' | 'mpesa';
  read: boolean;
}
