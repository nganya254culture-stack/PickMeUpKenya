import { PLATFORM_FEE_RATE_PER_50_KSH, PLATFORM_TREASURY_PHONE } from '../data/mockData';

/**
 * Mask Kenyan phone numbers to hide them from sight (shoulder-surfing protection)
 * e.g. +254722894102 -> +254 7•• ••• •02
 */
export function maskPhoneNumber(phone: string, isHidden: boolean = true): string {
  if (!isHidden || !phone) return phone;
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length >= 10) {
    const prefix = cleaned.slice(0, 6);
    const suffix = cleaned.slice(-2);
    return `${prefix.slice(0, 4)} ${prefix.slice(4, 5)}•• ••• •${suffix}`;
  }
  return '•••• ••• •••';
}

/**
 * Mask M-Pesa transaction reference numbers
 * e.g. QKH781290M -> QK•••••••M
 */
export function maskMpesaCode(code: string, isHidden: boolean = true): string {
  if (!isHidden || !code) return code;
  if (code.length >= 8) {
    return `${code.slice(0, 2)}•••••••${code.slice(-1)}`;
  }
  return 'QK••••••••';
}

/**
 * Mask platform treasury phone (+254115540711)
 */
export function maskTreasuryPhone(phone: string = PLATFORM_TREASURY_PHONE, isHidden: boolean = true): string {
  if (!isHidden) return phone;
  return '+254 •• ••• •11';
}

/**
 * Calculate fee and driver net for any dynamic, negotiated price in PickMeUp Kenya
 * Rule: usage fee of KSh 0.70 for every KSh 50 transacted, routed to +254115540711.
 * Uses exact integer cents accounting (70 cents per 5,000 cents / Math.round((fare / 50) * 70) / 100)
 * to prevent rounding discrepancies with bank, M-PESA, and SACCO reconciliation ledgers.
 */
export function calculateDynamicEarnings(fare: number) {
  const safeFare = Math.max(10, Math.round(fare));
  
  // Exact integer cents accounting: 1 KSh = 100 Kenyan cents
  // Platform fee: 70 cents per 5,000 cents (KSh 50) transacted
  const fareInCents = safeFare * 100;
  const platformUsageFeeInCents = Math.round((fareInCents * 70) / 5000);
  const platformUsageFee = platformUsageFeeInCents / 100;
  
  // Exact remaining cents allocated to driver net earnings
  const driverNetEarningsInCents = fareInCents - platformUsageFeeInCents;
  const driverNetEarnings = driverNetEarningsInCents / 100;

  return {
    fare: safeFare,
    fareInCents,
    platformUsageFeeInCents,
    platformUsageFee,
    driverNetEarningsInCents,
    driverNetEarnings,
    treasuryPhone: PLATFORM_TREASURY_PHONE
  };
}
