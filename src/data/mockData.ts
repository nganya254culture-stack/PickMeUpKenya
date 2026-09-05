import { DriverProfile, LocationPoint, SavedRoute, Trip, VehicleType } from '../types';

export const PLATFORM_TREASURY_PHONE = '+254115540711';
export const PLATFORM_FEE_RATE_PER_50_KSH = 0.70; // KSh 0.70 for every KSh 50 transacted

export const KENYAN_LOCATIONS: LocationPoint[] = [
  {
    name: 'Nairobi CBD (Kencom / Archives)',
    address: 'Moi Avenue & City Hall Way, Nairobi Central',
    landmark: 'Opposite Ambassadeur & Kencom Stage',
    lat: -1.2864,
    lng: 36.8250,
  },
  {
    name: 'Westlands (Sarit Centre)',
    address: 'Karuna Road, Westlands, Nairobi',
    landmark: 'Sarit Centre Main Entrance',
    lat: -1.2612,
    lng: 36.8044,
  },
  {
    name: 'Upper Hill (Britam Tower)',
    address: 'Hospital Road, Upper Hill, Nairobi',
    landmark: 'Near KNH & Equity Centre',
    lat: -1.2988,
    lng: 36.8152,
  },
  {
    name: 'Kilimani (Yaya Centre)',
    address: 'Argwings Kodhek Road, Kilimani',
    landmark: 'Yaya Centre Roundabout',
    lat: -1.2926,
    lng: 36.7877,
  },
  {
    name: 'Eastleigh (BBS Mall / 1st Ave)',
    address: 'General Waruinge St, Eastleigh, Nairobi',
    landmark: 'Business Bay Square (BBS)',
    lat: -1.2774,
    lng: 36.8522,
  },
  {
    name: 'JKIA Airport (Terminal 1A)',
    address: 'Airport North Rd, Embakasi, Nairobi',
    landmark: 'Jomo Kenyatta International Departures',
    lat: -1.3323,
    lng: 36.9272,
  },
  {
    name: 'Thika Road (TRM Mall / Roysambu)',
    address: 'Thika Superhighway, Roysambu',
    landmark: 'Thika Road Mall Entrance',
    lat: -1.2185,
    lng: 36.8885,
  },
  {
    name: 'Karen (The Hub Karen)',
    address: 'Dagoretti Road, Karen, Nairobi',
    landmark: 'The Hub Main Clocktower',
    lat: -1.3204,
    lng: 36.7062,
  },
  {
    name: 'Syokimau (SGR Nairobi Terminus)',
    address: 'Mombasa Road, Syokimau',
    landmark: 'Madaraka Express Terminus',
    lat: -1.3802,
    lng: 36.9388,
  },
  {
    name: 'Ongata Rongai (Maasai Mall)',
    address: 'Magadi Road, Ongata Rongai',
    landmark: 'Near Tuskys / Quickmart Rongai',
    lat: -1.3965,
    lng: 36.7594,
  }
];

export const KENYAN_VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'bodaboda',
    name: 'Boda Boda',
    swahiliName: 'Pikipiki Ya Haraka',
    category: 'Boda Boda',
    capacity: '1 Passenger / Light Parcels',
    seats: 1,
    baseFare: 60, // KSh
    perKmRate: 35, // KSh/km
    perMinRate: 5,
    etaMinutes: 2,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=80',
    description: 'Beat Nairobi traffic fast. Helmets provided, verified SACCO rider.',
    badge: 'Fastest in Traffic',
    popularFor: 'Quick errands, rush hour, document delivery'
  },
  {
    id: 'matatu',
    name: 'Matatu / Nganya Express',
    swahiliName: 'Matatu Ya Mtaa',
    category: 'Matatu Nganya',
    capacity: '14 - 33 Seats (Shared or Charter)',
    seats: 14,
    baseFare: 80, // KSh
    perKmRate: 25, // KSh/km
    perMinRate: 3,
    etaMinutes: 4,
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
    description: 'The heartbeat of Kenyan transit. High bass, vibrant art, express stages.',
    badge: 'Affordable & Vibrant',
    popularFor: 'Daily commute, group outings, events'
  },
  {
    id: 'taxi',
    name: 'PickMeUp Taxi Cab',
    swahiliName: 'Gari La Abiria',
    category: 'Taxi Cab',
    capacity: '4 Passengers (Sedan / Hatchback)',
    seats: 4,
    baseFare: 180, // KSh
    perKmRate: 45, // KSh/km
    perMinRate: 6,
    etaMinutes: 3,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80',
    description: 'Comfortable air-conditioned private saloon (Demio, Axio, Fielder, Vitz).',
    badge: 'Everyday Comfort',
    popularFor: 'Airport runs, corporate meetings, family rides'
  },
  {
    id: 'pickup',
    name: 'Pick-Up Cargo (1-Tonne)',
    swahiliName: 'Beba Mizigo',
    category: 'Pick-Up Cargo',
    capacity: '1,000 KG Payload',
    seats: 2,
    baseFare: 850, // KSh
    perKmRate: 90, // KSh/km
    perMinRate: 10,
    etaMinutes: 6,
    image: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=500&auto=format&fit=crop&q=80',
    description: 'Sturdy Toyota Hilux & Isuzu D-Max with tie-down straps for goods & supplies.',
    badge: 'Cargo & Farm Produce',
    popularFor: 'Hardware shopping, shop restocking, market produce'
  },
  {
    id: 'school_bus',
    name: 'School Transit Bus',
    swahiliName: 'Basi La Wanafunzi',
    category: 'School Transit',
    capacity: '26 Seats with Seatbelts & Escort',
    seats: 26,
    baseFare: 450, // KSh
    perKmRate: 50, // KSh/km
    perMinRate: 8,
    etaMinutes: 8,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    description: 'Vetted child safety transit with certified driver, teacher escort & parent SMS alerts.',
    badge: 'Safe Children Transit',
    popularFor: 'Daily school pickup/dropoff, educational tours'
  },
  {
    id: 'lorry',
    name: 'Heavy Lorry / Canter (3-10T)',
    swahiliName: 'Lori La Mizigo Mizito',
    category: 'Heavy Lorry',
    capacity: '3,000 - 10,000 KG Bulky Freight',
    seats: 3,
    baseFare: 2800, // KSh
    perKmRate: 160, // KSh/km
    perMinRate: 15,
    etaMinutes: 12,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
    description: 'Isuzu FRR & Canters for home moving, construction sand, timber, and heavy cargo.',
    badge: 'Heavy Bulky Goods',
    popularFor: 'House relocation, timber, construction stones, wholesale'
  }
];

export const INITIAL_KENYAN_DRIVERS: DriverProfile[] = [
  {
    id: 'drv-ke-001',
    fullName: 'Juma Kamau',
    phone: '+254722894102', // Driver receives M-Pesa payout on this number
    nationalId: 'ID-29834102',
    vehicleCategory: 'bodaboda',
    vehicleMakeModel: 'Bajaj Boxer 150 (Red)',
    vehiclePlate: 'KMD 842X',
    vehicleColor: 'Flame Red',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=80',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    saccoOrFleet: 'Nairobi Central Boda SACCO',
    rating: 4.96,
    totalTrips: 1840,
    isOnline: true,
    walletBalance: 3450, // KSh
    verified: true,
    currentLocation: { lat: -1.2870, lng: 36.8260 },
    heading: 45
  },
  {
    id: 'drv-ke-002',
    fullName: 'Brian Omondi (Nganya Master)',
    phone: '+254711394801',
    nationalId: 'ID-31049281',
    vehicleCategory: 'matatu',
    vehicleMakeModel: 'Isuzu NQR Matatu (33-Seater)',
    vehiclePlate: 'KDG 719M',
    vehicleColor: 'Custom Grafitti & Neon',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    saccoOrFleet: 'Super Metro SACCO',
    rating: 4.91,
    totalTrips: 3420,
    isOnline: true,
    walletBalance: 14800,
    verified: true,
    currentLocation: { lat: -1.2640, lng: 36.8060 },
    heading: 180
  },
  {
    id: 'drv-ke-003',
    fullName: 'Grace Wanjiku',
    phone: '+254798401923',
    nationalId: 'ID-28491029',
    vehicleCategory: 'taxi',
    vehicleMakeModel: 'Toyota Axio Hybrid (2022)',
    vehiclePlate: 'KDF 320L',
    vehicleColor: 'Pearl Silver',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    saccoOrFleet: 'PickMeUp Executive Fleet',
    rating: 4.98,
    totalTrips: 920,
    isOnline: true,
    walletBalance: 8650,
    verified: true,
    currentLocation: { lat: -1.2940, lng: 36.7890 },
    heading: 90
  },
  {
    id: 'drv-ke-004',
    fullName: 'Peter Kiprop (Heavy Movers)',
    phone: '+254740192834',
    nationalId: 'ID-22849104',
    vehicleCategory: 'lorry',
    vehicleMakeModel: 'Isuzu FRR 10-Tonne Truck',
    vehiclePlate: 'KCY 884P',
    vehicleColor: 'White & Blue Stripes',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    saccoOrFleet: 'Kenya Transporters Association',
    rating: 4.92,
    totalTrips: 640,
    isOnline: true,
    walletBalance: 24500,
    verified: true,
    currentLocation: { lat: -1.3300, lng: 36.9200 },
    heading: 270
  }
];

export const INITIAL_KENYAN_SAVED_ROUTES: SavedRoute[] = [
  {
    id: 'ke-route-1',
    title: 'Daily Commute: Rongai to CBD Kencom',
    iconName: 'briefcase',
    pickup: {
      name: 'Ongata Rongai (Maasai Mall)',
      address: 'Magadi Road, Ongata Rongai',
      lat: -1.3965,
      lng: 36.7594
    },
    dropoff: {
      name: 'Nairobi CBD (Kencom / Archives)',
      address: 'Moi Avenue, Nairobi Central',
      lat: -1.2864,
      lng: 36.8250
    },
    frequency: 24
  },
  {
    id: 'ke-route-2',
    title: 'Airport Express: Westlands to JKIA Terminal 1A',
    iconName: 'plane',
    pickup: {
      name: 'Westlands (Sarit Centre)',
      address: 'Karuna Road, Westlands',
      lat: -1.2612,
      lng: 36.8044
    },
    dropoff: {
      name: 'JKIA Airport (Terminal 1A)',
      address: 'Airport North Rd, Embakasi',
      lat: -1.3323,
      lng: 36.9272
    },
    frequency: 6
  },
  {
    id: 'ke-route-3',
    title: 'Kids School Transit: Kilimani to Karen',
    iconName: 'school',
    pickup: {
      name: 'Kilimani (Yaya Centre)',
      address: 'Argwings Kodhek Road',
      lat: -1.2926,
      lng: 36.7877
    },
    dropoff: {
      name: 'Karen (The Hub Karen)',
      address: 'Dagoretti Road, Karen',
      lat: -1.3204,
      lng: 36.7062
    },
    frequency: 15
  }
];

export const INITIAL_KENYAN_TRIP_LOGS: Trip[] = [
  {
    id: 'trip-ke-7821',
    riderId: 'rider-kenya-01',
    riderName: 'Amani Mwangi',
    riderPhone: '+254720918273',
    driverId: 'drv-ke-001',
    driver: INITIAL_KENYAN_DRIVERS[0],
    pickup: {
      name: 'Nairobi CBD (Kencom / Archives)',
      address: 'Moi Avenue, Nairobi Central',
      lat: -1.2864,
      lng: 36.8250
    },
    dropoff: {
      name: 'Westlands (Sarit Centre)',
      address: 'Karuna Road, Westlands',
      lat: -1.2612,
      lng: 36.8044
    },
    vehicleCategory: 'bodaboda',
    vehicleTypeName: 'Boda Boda',
    passengerOfferedPrice: 250,
    bids: [],
    fare: 250, // KSh
    driverEarnings: 246.50, // fare - platform fee (3.50)
    platformUsageFee: 3.50, // 50 KSh * 5 = 250 => 5 * 0.70 = 3.50 KES sent to +254115540711
    distanceKm: 4.2,
    durationMinutes: 12,
    status: 'completed',
    requestedAt: '2026-09-04T18:45:00.000Z',
    acceptedAt: '2026-09-04T18:46:00.000Z',
    startedAt: '2026-09-04T18:48:00.000Z',
    completedAt: '2026-09-04T19:00:00.000Z',
    safetyShareToken: 'safe-ke-7821',
    isLocationSharingEnabled: true,
    rating: {
      rating: 5,
      feedbackTags: ['Clean Helmet', 'Safe Navigator', 'Beat The Jam'],
      comment: 'Juma got me through University Way jam swiftly. Very polite!',
      tipAmount: 50,
      createdAt: '2026-09-04T19:02:00.000Z',
      ratedBy: 'rider'
    },
    payment: {
      id: 'pay-mpesa-9912',
      tripId: 'trip-ke-7821',
      mpesaReceiptNo: 'QKJ982149M',
      amount: 250,
      tip: 50,
      total: 300,
      status: 'paid',
      paymentMethod: 'M-PESA',
      phoneNumber: '+254720918273',
      driverPayoutNumber: '+254722894102',
      date: '04 Sep 2026 • 7:02 PM',
      breakdown: {
        baseFare: 60,
        distanceFare: 190,
        platformUsageFee: 3.50,
        platformTreasuryNumber: '+254115540711',
        driverNetEarnings: 246.50,
        tip: 50
      }
    }
  }
];

/**
 * Deducts a usage fee of KSh 0.70 (70 cents) for every KSh 50 transacted
 * in the PickMeUp app. The money is routed to +254115540711.
 * The driver receives net earnings directly on their registered phone number.
 */
export function calculateKenyanFare(
  distanceKm: number,
  durationMin: number,
  vehicle: VehicleType
) {
  const base = vehicle.baseFare;
  const dist = distanceKm * vehicle.perKmRate;
  const time = durationMin * vehicle.perMinRate;
  
  // Total calculated fare rounded to nearest KSh
  const total = Math.max(vehicle.baseFare, Math.round(base + dist + time));
  
  // Platform Usage Fee: 70 cents (0.70 KES) for every 50 KES transacted
  const blocksOf50 = total / 50;
  const platformUsageFee = Number((blocksOf50 * PLATFORM_FEE_RATE_PER_50_KSH).toFixed(2));
  
  // Driver receives remainder on their registered phone number
  const driverNetEarnings = Number((total - platformUsageFee).toFixed(2));

  return {
    total,
    platformUsageFee,
    platformTreasuryNumber: PLATFORM_TREASURY_PHONE,
    driverNetEarnings,
    breakdown: {
      baseFare: base,
      distanceFare: Math.round(dist + time),
      platformUsageFee,
      platformTreasuryNumber: PLATFORM_TREASURY_PHONE,
      driverNetEarnings,
      tip: 0
    }
  };
}

export function generateRoutePoints(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  steps: number = 24
): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const perpLat = -(end.lng - start.lng) * 0.15;
  const perpLng = (end.lat - start.lat) * 0.15;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const oneMinusT = 1 - t;
    const lat = oneMinusT * oneMinusT * start.lat + 2 * oneMinusT * t * (midLat + perpLat) + t * t * end.lat;
    const lng = oneMinusT * oneMinusT * start.lng + 2 * oneMinusT * t * (midLng + perpLng) + t * t * end.lng;
    points.push([lat, lng]);
  }
  return points;
}
