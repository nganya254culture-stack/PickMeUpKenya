import React, { useState } from 'react';
import { Smartphone, QrCode, Copy, Check, ExternalLink, Compass, Zap, ShieldCheck, Globe, Rocket, AlertTriangle, Terminal } from 'lucide-react';
import { useRide } from '../../context/RideContext';

export const ExpoGoModal: React.FC = () => {
  const { expoModalOpen, setExpoModalOpen } = useRide();
  const [activeTab, setActiveTab] = useState<'expo_no_qr' | 'git' | 'vercel' | 'future_risks'>('expo_no_qr');
  const [copied, setCopied] = useState(false);

  if (!expoModalOpen) return null;

  const currentUrl = window.location.href;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(currentUrl)}&bgcolor=ffffff&color=059669&margin=1`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Rocket className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm">
                PickMeUp Deployment & Engineering Hub
              </h3>
              <p className="text-[11px] text-neutral-500">
                Expo Go without QR Code • Git Setup • Vercel • Future Risks Analysis
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpoModalOpen(false)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-100 p-1 rounded-xl shrink-0 gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('expo_no_qr')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'expo_no_qr' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Expo Go (No QR)</span>
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'git' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Push to Git</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'vercel' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Vercel Deploy</span>
          </button>
          <button
            onClick={() => setActiveTab('future_risks')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'future_risks' ? 'bg-white text-amber-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Future Risks & Bugs</span>
          </button>
        </div>

        {/* Tab 1: Expo Go Without QR Code */}
        {activeTab === 'expo_no_qr' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-950 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>3 Ways to Connect to Expo Go WITHOUT a QR Code</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                You do NOT need a camera or QR scanner to open PickMeUp on your phone via Expo Go. Choose any of these 3 reliable methods:
              </p>
            </div>

            {/* Method A */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span>Method 1: Expo Account Cloud Sync (Recommended)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">100% Automatic</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-600">
                <li>Create a free account at <strong>expo.dev</strong>.</li>
                <li>In your project terminal, log in: <code className="bg-neutral-200 px-1 rounded font-mono">npx expo login</code></li>
                <li>Open the <strong>Expo Go</strong> app on your Android or iPhone and log in with the <em>exact same account</em>.</li>
                <li>Under the <strong>"Projects"</strong> tab on your phone, PickMeUp will automatically appear! Just tap it to launch.</li>
              </ol>
            </div>

            {/* Method B */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span>Method 2: Direct URL Entry in Expo Go</span>
                <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-mono">Manual exp://</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-600">
                <li>Ensure phone and computer are on the same Wi-Fi, or run <code className="bg-neutral-200 px-1 rounded font-mono">npx expo start --tunnel</code>.</li>
                <li>Open <strong>Expo Go</strong> on your phone.</li>
                <li>Tap <strong>"Enter URL manually"</strong> (or the Search icon on Android / Projects tab).</li>
                <li>Type <code className="bg-neutral-200 px-1 rounded font-mono text-emerald-700">exp://&lt;your-local-ip&gt;:8081</code> (e.g. <code className="font-mono text-emerald-700">exp://192.168.1.105:8081</code>) and tap <strong>Connect</strong>.</li>
              </ol>
            </div>

            {/* Method C */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span>Method 3: USB Cable with ADB Debugging (Android)</span>
                <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-mono">Fastest & Offline</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-600">
                <li>Enable <strong>USB Debugging</strong> in Developer Options on your phone.</li>
                <li>Plug phone into computer via USB cable.</li>
                <li>Run <code className="bg-neutral-200 px-1 rounded font-mono">npx expo run:android -d</code> or press <kbd className="bg-neutral-200 px-1 rounded font-mono">a</kbd> in your terminal.</li>
                <li>Expo pushes the app directly into your phone via ADB cable without any network or QR code.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Push to Git */}
        {activeTab === 'git' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs">
            <div className="bg-neutral-900 text-white p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Step-by-Step Git Push Commands</span>
                </span>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
                  main branch
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Run these commands in your project root to push your code to GitHub:
              </p>
            </div>

            <div className="space-y-2 font-mono text-[11px] bg-neutral-950 text-neutral-100 p-3 rounded-xl border border-neutral-800">
              <div className="text-neutral-400"># 1. Initialize local Git repository</div>
              <div className="text-emerald-400 select-all">git init</div>

              <div className="text-neutral-400 pt-1"># 2. Stage all project files</div>
              <div className="text-emerald-400 select-all">git add .</div>

              <div className="text-neutral-400 pt-1"># 3. Create initial commit</div>
              <div className="text-emerald-400 select-all">git commit -m "feat: PickMeUp Kenya atomic locking, integer cent fees & GPS geofencing"</div>

              <div className="text-neutral-400 pt-1"># 4. Set main branch</div>
              <div className="text-emerald-400 select-all">git branch -M main</div>

              <div className="text-neutral-400 pt-1"># 5. Link to your GitHub repository (replace with your repo URL)</div>
              <div className="text-amber-300 select-all">git remote add origin https://github.com/&lt;your-username&gt;/pickmeup-kenya.git</div>

              <div className="text-neutral-400 pt-1"># 6. Push code to GitHub</div>
              <div className="text-emerald-400 select-all">git push -u origin main</div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-700 text-[11px] space-y-1">
              <div className="font-bold text-neutral-900">Tips for smooth pushing:</div>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-600">
                <li>Create an empty repository on GitHub first (do not initialize with README or license).</li>
                <li>If asked for credentials, use a <strong>GitHub Personal Access Token (classic)</strong> with <code className="bg-neutral-200 px-1 rounded font-mono">repo</code> permissions instead of your account password.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Vercel Deploy */}
        {activeTab === 'vercel' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs">
            <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Vercel Production Deployment</span>
                </span>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded">
                  vercel.json configured
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                The repository is fully ready for Vercel with automatic SPA routing and asset caching.
              </p>
            </div>

            <div className="space-y-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-neutral-800">
              <div className="font-bold text-neutral-900">Launch in 4 Steps:</div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-neutral-600">
                <li>Push this repository to GitHub using the <strong>Push to Git</strong> tab.</li>
                <li>Go to <strong>vercel.com</strong> and sign in with your GitHub account.</li>
                <li>Click <strong>"Add New" &gt; "Project"</strong> and select your PickMeUp repository.</li>
                <li>Click <strong>Deploy</strong>. Vercel automatically detects Vite, runs build, and gives you a free live HTTPS URL (e.g. <code className="font-mono text-emerald-700">pickmeup-kenya.vercel.app</code>).</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 4: Future Risks, Bugs & Bottlenecks Analysis */}
        {activeTab === 'future_risks' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>6 Critical Future Problems & Bottlenecks PickMeUp Will Face</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Real-world transport operations in Kenya encounter unique infrastructure and scaling hurdles. Here is what to anticipate and how to engineer around them:
              </p>
            </div>

            {/* Risk 1: Daraja M-PESA Callbacks & IPN Latency */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span>1. Safaricom Daraja STK Push Timeouts & Unreliable Callbacks</span>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">High Severity</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                <strong>The Problem:</strong> When passengers enter their M-PESA PIN, Daraja HTTP callbacks can be delayed by 15–45 seconds during peak traffic hours (5–8 PM Nairobi time). If your server treats this as an immediate failure, the driver might leave the passenger even though money was deducted.
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                <strong>Solution:</strong> Implement idempotent callback deduplication with a 90-second polling fallback check endpoint (<code className="font-mono text-[10px]">/api/mpesa/query-transaction</code>) so the app queries Safaricom status before declaring a payment failure.
              </p>
            </div>

            {/* Risk 2: Driver Float Depletion */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span>2. Driver Float Depletion & Disputed Cash Trips</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Medium Severity</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                <strong>The Problem:</strong> If passengers pay cash for rides, the platform cannot automatically deduct the KSh 0.70 per KSh 50 fee at the moment of payment. Over time, driver account balances turn negative. If drivers run out of float, they stop accepting rides.
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                <strong>Solution:</strong> Enforce a minimum wallet float threshold (e.g. KSh 200) for cash dispatches, or provide an instant M-PESA Paybill top-up prompt when the driver's wallet dips below zero.
              </p>
            </div>

            {/* Risk 3: Cellular Tunnel Deadzones & Stale GPS */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span>3. Cellular Deadzones on Highway Routes (e.g., Waiyaki Way, Thika Rd)</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Medium Severity</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                <strong>The Problem:</strong> Passing through network deadzones causes WebSocket disconnections. If the app assumes disconnection means trip abandonment, the driver loses their ride state.
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                <strong>Solution:</strong> Store trip states locally in IndexedDB / SQLite with optimistic timestamps. Cache GPS breadcrumbs offline and flush them to the server when the network reconnects.
              </p>
            </div>

            {/* Risk 4: Stage & Sacco Territorial Clashes */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span>4. Boda Boda & Matatu Sacco Territorial Staging Conflicts</span>
                <span className="text-[10px] bg-neutral-100 text-neutral-800 px-1.5 py-0.2 rounded font-bold">Operational</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                <strong>The Problem:</strong> Certain stages in Nairobi (e.g., Commercial, OTC, Roysambu Roundabout) have strict Sacco seniority rules where riders cannot pick up passengers without stage clearance.
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                <strong>Solution:</strong> Incorporate "Sacco / Stage Geofences" where dispatch routes pickup points 50 meters outside contested stages to prevent driver harassment.
              </p>
            </div>

            {/* Risk 5: Ghost Bidding & Phantom Drivers */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span>5. Ghost Bidding by Inactive Drivers</span>
                <span className="text-[10px] bg-neutral-100 text-neutral-800 px-1.5 py-0.2 rounded font-bold">User Experience</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                <strong>Solution:</strong> Auto-expire driver bids after 45 seconds if the passenger hasn't accepted, and drop offline drivers from the dispatch radar if no GPS heartbeat was received within 60 seconds.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
