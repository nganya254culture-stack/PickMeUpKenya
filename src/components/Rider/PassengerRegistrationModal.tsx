import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import { User, Phone, CheckCircle2, Shield, Heart } from 'lucide-react';

interface PassengerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PassengerRegistrationModal: React.FC<PassengerRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { registerUser, currentUser } = useRide();
  const [name, setName] = useState(currentUser.name || 'Amani Mwangi');
  const [phone, setPhone] = useState(currentUser.phone || '+254720918273');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser(name.trim() || 'Passenger', phone.trim() || '+254720000000', 'rider');
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Karibu {name}!</h3>
            <p className="text-xs text-neutral-600">
              Directing you to your Passenger Booking Portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-sm">
                    Passenger & Pedestrian Sign Up
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Book Boda Bodas, Matatus, Cabs & Moving Freight across Kenya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-700 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amani Mwangi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  M-Pesa Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="+254712345678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Used for 1-tap M-Pesa STK push and driver coordination.
                </span>
              </div>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                PickMeUp protects your privacy. Your live GPS coordinates can be masked anytime with the Privacy Toggle.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-98"
              >
                Continue to Passenger Portal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
