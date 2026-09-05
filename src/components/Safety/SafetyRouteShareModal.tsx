import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import {
  Shield,
  Copy,
  Check,
  Share2,
  PhoneCall,
  MapPin,
  Car,
  AlertTriangle,
  ExternalLink,
  Lock
} from 'lucide-react';

export const SafetyRouteShareModal: React.FC = () => {
  const { safetyShareModalOpen, setSafetyShareModalOpen, activeTrip, isLocationSharingEnabled } = useRide();
  const [copied, setCopied] = useState(false);

  if (!safetyShareModalOpen || !activeTrip) return null;

  const shareUrl = `${window.location.origin}/#safety-track=${activeTrip.safetyShareToken}`;
  const driverName = activeTrip.driver?.fullName || 'PickMeUp Driver';
  const vehicle = activeTrip.driver ? `${activeTrip.driver.vehicleMakeModel} (${activeTrip.driver.vehiclePlate})` : 'Assigned Kenyan Fleet';
  
  const shareMessage = `PickMeUp Kenya Live Tracking: Niko kwenye safari na ${driverName} (${vehicle}), kuelekea ${activeTrip.dropoff.name}. Fuatilia live GPS safari yangu hapa: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleSmsShare = () => {
    const url = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm">
                PickMeUp Safety & Route Sharing 🇰🇪
              </h3>
              <p className="text-[11px] text-neutral-500">Live GPS tracking for your family & loved ones</p>
            </div>
          </div>
          <button
            onClick={() => setSafetyShareModalOpen(false)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Live Trip Safety Card */}
        <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Live Protected Safari
            </span>
            <span className="text-xs font-mono font-semibold text-neutral-600">
              #{activeTrip.id}
            </span>
          </div>

          <div className="text-xs space-y-1 text-neutral-700">
            <div>
              <span className="font-semibold">Dropoff:</span> {activeTrip.dropoff.name}
            </div>
            <div className="text-[11px] text-neutral-500 truncate">
              {activeTrip.dropoff.address}
            </div>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-neutral-700">
              <Car className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>{vehicle} • {driverName}</span>
            </div>
          </div>

          {!isLocationSharingEnabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-800 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Location Mask Active: Recipients will only see stage route milestones.</span>
            </div>
          )}
        </div>

        {/* Shareable Link Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Family GPS Live Link
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2 text-xs font-mono text-neutral-700 select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Instant Messaging Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSmsShare}
            className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>WhatsApp Share</span>
          </button>
        </div>

        {/* Kenyan Police & Emergency Helpline */}
        <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            National Emergency Police Helpline:
          </div>
          <a
            href="tel:999"
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 999 / 112</span>
          </a>
        </div>
      </div>
    </div>
  );
};
