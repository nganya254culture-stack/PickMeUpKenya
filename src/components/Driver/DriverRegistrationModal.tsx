import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import { KenyanVehicleCategory } from '../../types';
import {
  Car,
  Camera,
  CheckCircle2,
  Phone,
  CreditCard,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Truck,
  Sparkles,
  Info
} from 'lucide-react';
import { PLATFORM_TREASURY_PHONE } from '../../data/mockData';

interface DriverRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VEHICLE_PHOTO_PRESETS: { category: KenyanVehicleCategory; label: string; url: string }[] = [
  {
    category: 'bodaboda',
    label: 'Boxer / TVS Boda Boda',
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80'
  },
  {
    category: 'matatu',
    label: 'Nganya Matatu 33-Seater',
    url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80'
  },
  {
    category: 'taxi',
    label: 'Toyota Axio / Demio Cab',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
  },
  {
    category: 'pickup',
    label: 'Toyota Hilux Pick-Up (1T)',
    url: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=600&auto=format&fit=crop&q=80'
  },
  {
    category: 'school_bus',
    label: 'School Bus Transit (26 Seats)',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'
  },
  {
    category: 'lorry',
    label: 'Isuzu Canter Lorry (3-10T)',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80'
  }
];

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { registerDriver } = useRide();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+2547');
  const [nationalId, setNationalId] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<KenyanVehicleCategory>('bodaboda');
  const [vehicleMakeModel, setVehicleMakeModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('KDM ');
  const [vehicleColor, setVehicleColor] = useState('');
  const [saccoOrFleet, setSaccoOrFleet] = useState('');
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState(VEHICLE_PHOTO_PRESETS[0].url);
  const [customPhotoSelected, setCustomPhotoSelected] = useState(false);
  const [step, setStep] = useState<'details' | 'success'>('details');

  if (!isOpen) return null;

  const handleCategoryChange = (cat: KenyanVehicleCategory) => {
    setVehicleCategory(cat);
    const preset = VEHICLE_PHOTO_PRESETS.find(p => p.category === cat);
    if (preset && !customPhotoSelected) {
      setVehiclePhotoUrl(preset.url);
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVehiclePhotoUrl(url);
      setCustomPhotoSelected(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    registerDriver({
      fullName: fullName.trim() || 'Kenyan Fleet Driver',
      phone: phone.trim() || '+254711000000',
      nationalId: nationalId.trim() || 'ID-32984102',
      vehicleCategory,
      vehicleMakeModel: vehicleMakeModel.trim() || (vehicleCategory === 'bodaboda' ? 'Bajaj Boxer 150' : vehicleCategory === 'matatu' ? 'Isuzu Matatu' : 'Toyota Axio Cab'),
      vehiclePlate: vehiclePlate.trim().toUpperCase() || 'KDM 482B',
      vehicleColor: vehicleColor.trim() || 'Black / Multi-color',
      saccoOrFleet: saccoOrFleet.trim() || 'PickMeUp Nairobi SACCO',
      vehiclePhotoUrl,
      driverPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    });

    setStep('success');
    setTimeout(() => {
      onClose();
      setStep('details');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {step === 'success' ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">Registration Approved! 🇰🇪</h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                Vehicle and M-Pesa account verified. Directing you to your individual <strong>Driver Portal</strong>...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-sm">
                    PickMeUp Kenya • Driver & Hauler Registration
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Boda Boda, Matatu, Taxi, Pick-Up, School Bus, and Heavy Lorries
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-700 text-xs font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Platform Usage Fee & M-Pesa Payout Terms */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Transparent Kenyan Payout Structure</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                A platform fee of <strong>KSh 0.70 (70 cents)</strong> for every <strong>KSh 50</strong> transacted is automatically deducted and routed to the platform account (<strong>{PLATFORM_TREASURY_PHONE}</strong>). Your remaining net earnings are sent directly to the M-Pesa phone number you register with below!
              </p>
            </div>

            {/* Vehicle Category Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Select Your Vehicle Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'bodaboda', label: 'Boda Boda', sub: 'Motorbike / Rider', icon: '🏍️' },
                  { id: 'matatu', label: 'Matatu / Nganya', sub: '14/33S Minibus', icon: '🚐' },
                  { id: 'taxi', label: 'PickMeUp Taxi', sub: '4-Door Sedan Cab', icon: '🚕' },
                  { id: 'pickup', label: 'Pick-Up Cargo', sub: 'Hilux / D-Max (1T)', icon: '🛻' },
                  { id: 'school_bus', label: 'School Bus', sub: 'Child Safe Transit', icon: '🚌' },
                  { id: 'lorry', label: 'Heavy Lorry', sub: 'Canter / FSR (3-10T)', icon: '🚛' },
                ].map(v => {
                  const selected = vehicleCategory === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleCategoryChange(v.id as KenyanVehicleCategory)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="text-base">{v.icon}</div>
                      <div className="text-xs font-bold text-neutral-900 mt-1">{v.label}</div>
                      <div className="text-[10px] text-neutral-500 truncate">{v.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Driver Identity & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Driver Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dennis Kiprop Mwangi"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  M-Pesa Payout Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+254712345678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-emerald-700 font-medium">
                  Instant M-Pesa earnings sent to this number
                </span>
              </div>
            </div>

            {/* National ID & SACCO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  National ID / Passport Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ID-32948102"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  SACCO or Fleet Affiliation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Super Metro, 2NK, Nairobi Boda SACCO"
                  value={saccoOrFleet}
                  onChange={e => setSaccoOrFleet(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Vehicle Make/Model & Number Plate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Vehicle Make & Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boxer 150 / Isuzu NPR / Toyota Axio"
                  value={vehicleMakeModel}
                  onChange={e => setVehicleMakeModel(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Registration Plate *
                </label>
                <input
                  type="text"
                  required
                  placeholder="KDM 482B"
                  value={vehiclePlate}
                  onChange={e => setVehiclePlate(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 font-mono uppercase focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Vehicle Photo Upload & Preview */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Picture of the Vehicle (Required by NTSA & Passengers) *
              </label>
              <div className="flex items-center gap-3">
                <div className="w-24 h-16 rounded-lg overflow-hidden border border-neutral-300 bg-neutral-100 shrink-0">
                  <img
                    src={vehiclePhotoUrl}
                    alt="Vehicle preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback image in case of broken link
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-300 transition-colors">
                    <UploadCloud className="w-4 h-4 text-neutral-600" />
                    <span>Upload Vehicle Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Clear photo of vehicle exterior with plate visible.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Complete Registration & Go to Driver Portal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
