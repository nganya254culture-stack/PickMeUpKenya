/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RideProvider, useRide } from './context/RideContext';
import { LiveGpsMap } from './components/Map/LiveGpsMap';
import { RiderDashboard } from './components/Rider/RiderDashboard';
import { DriverDashboard } from './components/Driver/DriverDashboard';
import { DriverRegistrationModal } from './components/Driver/DriverRegistrationModal';
import { PassengerRegistrationModal } from './components/Rider/PassengerRegistrationModal';
import { SafetyRouteShareModal } from './components/Safety/SafetyRouteShareModal';
import { RatingAndTipModal } from './components/Rating/RatingAndTipModal';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { ExpoGoModal } from './components/Expo/ExpoGoModal';
import {
  Car,
  User,
  Shield,
  Bell,
  CheckCircle2,
  Smartphone,
  Sparkles,
  MapPin,
  X,
  CreditCard,
  Share2,
  Truck,
  Layers,
  Phone,
  Eye,
  EyeOff,
  Palette,
  Check
} from 'lucide-react';

export type CustomThemeColor = 'emerald' | 'amber' | 'crimson' | 'royal' | 'cyan';

interface ThemeDefinition {
  id: CustomThemeColor;
  label: string;
  badge: string;
  bgClass: string;
  primaryClass: string;
  dotColor: string;
}

const THEME_OPTIONS: ThemeDefinition[] = [
  {
    id: 'emerald',
    label: 'Nairobi Safari',
    badge: 'Emerald',
    bgClass: 'bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-neutral-100',
    primaryClass: 'bg-emerald-600',
    dotColor: '#059669'
  },
  {
    id: 'amber',
    label: 'Savannah Sunset',
    badge: 'Amber',
    bgClass: 'bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-neutral-100',
    primaryClass: 'bg-amber-600',
    dotColor: '#d97706'
  },
  {
    id: 'crimson',
    label: 'Maasai Shuka',
    badge: 'Crimson',
    bgClass: 'bg-gradient-to-br from-rose-50/80 via-red-50/30 to-neutral-100',
    primaryClass: 'bg-rose-600',
    dotColor: '#e11d48'
  },
  {
    id: 'royal',
    label: 'Great Rift Indigo',
    badge: 'Indigo',
    bgClass: 'bg-gradient-to-br from-indigo-50/80 via-purple-50/30 to-neutral-100',
    primaryClass: 'bg-indigo-600',
    dotColor: '#4f46e5'
  },
  {
    id: 'cyan',
    label: 'Turkana Oasis',
    badge: 'Cyan',
    bgClass: 'bg-gradient-to-br from-cyan-50/80 via-sky-50/30 to-neutral-100',
    primaryClass: 'bg-cyan-600',
    dotColor: '#0891b2'
  }
];

const MainAppContent: React.FC = () => {
  const {
    role,
    setRole,
    driverIsOnline,
    notifications,
    activeTrip,
    setSafetyShareModalOpen,
    setExpoModalOpen,
    currentUser,
    paymentDetailsHidden,
    togglePaymentDetailsHidden
  } = useRide();

  const [driverRegisterModalOpen, setDriverRegisterModalOpen] = useState(false);
  const [passengerRegisterModalOpen, setPassengerRegisterModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'panel' | 'map'>('panel');
  const [customTheme, setCustomTheme] = useState<CustomThemeColor>('emerald');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Check if there is an active trip underway
  const hasActiveTrip = Boolean(
    activeTrip && (
      activeTrip.status === 'driver_arriving' ||
      activeTrip.status === 'arrived' ||
      activeTrip.status === 'in_progress' ||
      activeTrip.status === 'requesting'
    )
  );

  const selectedThemeDef = THEME_OPTIONS.find(t => t.id === customTheme) || THEME_OPTIONS[0];

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-all duration-300 ${
        hasActiveTrip
          ? 'bg-[#021f14] text-white border-4 border-[#f43f5e] animate-pink-edge-pulse'
          : `${selectedThemeDef.bgClass} text-neutral-900`
      }`}
    >
      {/* Top Kenyan Navigation Bar */}
      <header
        className={`h-14 px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 shadow-xs transition-colors duration-300 ${
          hasActiveTrip
            ? 'bg-[#042f1d] border-b border-[#0b5435] text-white'
            : 'bg-white border-b border-neutral-200 text-neutral-950'
        }`}
      >
        {/* Brand Logo & Name: PickMeUp */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-xs transition-colors ${
              hasActiveTrip ? 'bg-emerald-500 text-neutral-950' : selectedThemeDef.primaryClass
            }`}
          >
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1
                className={`font-extrabold text-sm sm:text-base tracking-tight leading-tight ${
                  hasActiveTrip ? 'text-white' : 'text-neutral-950'
                }`}
              >
                PickMeUp
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.2 rounded-sm uppercase tracking-wide border border-emerald-500/30">
                Kenya 🇰🇪
              </span>
            </div>
            <div
              className={`text-[10px] hidden sm:flex items-center gap-1 font-medium ${
                hasActiveTrip ? 'text-emerald-300' : 'text-neutral-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Boda • Matatu • Cab • Pick-Up • School Bus • Lorry</span>
            </div>
          </div>
        </div>

        {/* Separate Portal Switcher: Modern Uber/Bolt Style */}
        <div
          className={`flex items-center p-1 rounded-xl border ${
            hasActiveTrip
              ? 'bg-[#022216] border-[#0e5b3a]'
              : 'bg-neutral-100 border-neutral-200'
          }`}
        >
          <button
            id="role-switch-rider"
            onClick={() => {
              setRole('rider');
              setActiveMobileView('panel');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              role === 'rider'
                ? hasActiveTrip
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 shadow-xs'
                : hasActiveTrip
                ? 'text-emerald-300 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Passenger</span>
          </button>

          <button
            id="role-switch-driver"
            onClick={() => {
              setRole('driver');
              setActiveMobileView('panel');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              role === 'driver'
                ? 'bg-neutral-900 text-white shadow-xs'
                : hasActiveTrip
                ? 'text-emerald-300 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Driver Portal</span>
            {driverIsOnline ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-neutral-400" title="Offline" />
            )}
          </button>
        </div>

        {/* Right Actions: Theme Customizer, Payment Shield, Expo Go, Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Custom Theme Palette Picker (when not in active trip) */}
          {!hasActiveTrip && (
            <div className="relative">
              <button
                id="btn-open-theme-picker"
                onClick={() => setThemeDropdownOpen(prev => !prev)}
                title="Customize App Colors"
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-colors shadow-2xs"
              >
                <Palette className="w-3.5 h-3.5 text-emerald-600" />
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: selectedThemeDef.dotColor }}
                />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-neutral-400 px-2 uppercase tracking-wider">
                    Custom Color Palette
                  </div>
                  {THEME_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setCustomTheme(opt.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                        customTheme === opt.id ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: opt.dotColor }}
                        />
                        <span>{opt.label}</span>
                      </div>
                      {customTheme === opt.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Privacy Shield Button */}
          <button
            id="btn-nav-payment-shield"
            onClick={togglePaymentDetailsHidden}
            title={paymentDetailsHidden ? 'Payment details are hidden from sight. Click to reveal.' : 'Payment details are visible. Click to hide.'}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-2xs ${
              paymentDetailsHidden
                ? 'bg-neutral-900 text-emerald-400 border-neutral-800'
                : hasActiveTrip
                ? 'bg-[#022216] text-emerald-200 border-[#0e5b3a]'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            {paymentDetailsHidden ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-neutral-500" />}
            <span className="hidden xl:inline">{paymentDetailsHidden ? 'Payment Shielded' : 'Payment Shown'}</span>
          </button>

          {/* Expo Go Connect Button */}
          <button
            id="btn-open-expogo-modal"
            onClick={() => setExpoModalOpen(true)}
            title="Scan with Expo Go on Mobile & Launch on Vercel"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-2xs ${
              hasActiveTrip
                ? 'bg-emerald-950 text-emerald-200 border-emerald-800 hover:bg-emerald-900'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Expo Go & Vercel</span>
          </button>

          {/* Driver Registration CTAs */}
          {role === 'rider' ? (
            <button
              id="btn-nav-driver-register"
              onClick={() => setDriverRegisterModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Drive & Earn</span>
            </button>
          ) : (
            <button
              id="btn-nav-add-vehicle"
              onClick={() => setDriverRegisterModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Register Vehicle</span>
            </button>
          )}

          {/* Safety Quick Action */}
          {activeTrip && (
            <button
              onClick={() => setSafetyShareModalOpen(true)}
              title="Share Live Safari GPS with Family"
              className="p-2 text-emerald-400 hover:bg-emerald-900/50 rounded-lg border border-emerald-700 transition-colors relative"
            >
              <Shield className="w-4 h-4" />
              <span className="sr-only">Safety Share</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            id="btn-notifications-drawer"
            onClick={() => setNotificationDrawerOpen(true)}
            className={`p-2 rounded-lg transition-colors relative ${
              hasActiveTrip
                ? 'text-emerald-200 hover:bg-emerald-900/50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ACTIVE TRIP DEEP ELEGANT GREEN STATUS BANNER WITH BLINKING DEEP PINK BEACON */}
      {hasActiveTrip && (
        <div className="bg-gradient-to-r from-[#032316] via-[#054026] to-[#032316] border-b border-[#0d5937] px-4 py-2 flex items-center justify-between text-xs text-emerald-200 shrink-0 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-90"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="font-black text-white text-[11px] uppercase tracking-wider">
              Live Safari Active
            </span>
            <span className="text-[11px] text-emerald-300 hidden sm:inline truncate max-w-sm">
              • {activeTrip?.pickup.name} ➔ {activeTrip?.dropoff.name}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black text-emerald-300 font-mono">
              Agreed: KSh {activeTrip?.fare.toLocaleString()}
            </span>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
              {activeTrip?.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Mobile Switch Tabs (Panel vs Map) */}
      <div
        className={`lg:hidden flex border-b shrink-0 ${
          hasActiveTrip ? 'bg-[#042f1d] border-[#0b5435]' : 'bg-white border-neutral-200'
        }`}
      >
        <button
          onClick={() => setActiveMobileView('panel')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
            activeMobileView === 'panel'
              ? 'border-emerald-500 text-emerald-400 font-extrabold'
              : hasActiveTrip ? 'border-transparent text-emerald-200/60' : 'border-transparent text-neutral-500'
          }`}
        >
          {role === 'rider' ? 'Book Boda, Cab & Cargo' : 'Driver Dispatch & M-PESA'}
        </button>
        <button
          onClick={() => setActiveMobileView('map')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
            activeMobileView === 'map'
              ? 'border-emerald-500 text-emerald-400 font-extrabold'
              : hasActiveTrip ? 'border-transparent text-emerald-200/60' : 'border-transparent text-neutral-500'
          }`}
        >
          Nairobi Live GPS Map
        </button>
      </div>

      {/* Main Split Layout */}
      <main className="flex-1 flex overflow-hidden p-2 sm:p-3 gap-3">
        {/* Left Side: Dedicated Portal (Passenger or Driver) */}
        <section
          className={`w-full lg:w-[430px] xl:w-[470px] h-full shrink-0 flex flex-col ${
            activeMobileView === 'panel' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {role === 'rider' ? (
            <RiderDashboard />
          ) : (
            <DriverDashboard onOpenRegisterModal={() => setDriverRegisterModalOpen(true)} />
          )}
        </section>

        {/* Right Side: Interactive Leaflet Live GPS Map */}
        <section
          className={`flex-1 h-full rounded-xl overflow-hidden shadow-xs border ${
            hasActiveTrip
              ? 'border-[#0e5b3a] bg-[#032316]'
              : 'border-neutral-200 bg-white'
          } ${activeMobileView === 'map' ? 'flex' : 'hidden lg:flex'}`}
        >
          <LiveGpsMap />
        </section>
      </main>

      {/* Modals & Dialogs */}
      <DriverRegistrationModal
        isOpen={driverRegisterModalOpen}
        onClose={() => setDriverRegisterModalOpen(false)}
      />

      <PassengerRegistrationModal
        isOpen={passengerRegisterModalOpen}
        onClose={() => setPassengerRegisterModalOpen(false)}
      />

      <SafetyRouteShareModal />

      <RatingAndTipModal />

      <ExpoGoModal />

      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <RideProvider>
      <MainAppContent />
    </RideProvider>
  );
}
