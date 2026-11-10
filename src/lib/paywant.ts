import crypto from 'crypto';

export interface PaywantCreateOrderParams {
  orderId: string;
  userId: string;
  username: string;
  email: string;
  userIp: string;
  amount: number; // Price in TL (e.g. 40.00)
  packageId: string;
  coins: number;
}

export interface PaywantCallbackParams {
  SiparisID: string;
  ExtraData: string;
  UserIP: string;
  Status: string | number;
  OdemeKanali?: string | number;
  NetKazanc?: string | number;
  ToplamTutar?: string | number;
  Hash: string;
}

const DEFAULT_API_KEY = process.env.PAYWANT_API_KEY || 'test_api_key';
const DEFAULT_API_SECRET = process.env.PAYWANT_API_SECRET || 'test_api_secret';
const PAYWANT_API_URL = process.env.PAYWANT_BASE_URL || 'https://api.paywant.com/gateway.php';

/**
 * Generates Paywant request hash
 * Formula: base64_encode(hash_hmac('sha256', apiKey . '|' . userEmail . '|' . userID, apiSecret, true))
 */
export function generatePaywantRequestHash(
  apiKey: string,
  userEmail: string,
  userId: string,
  apiSecret: string
): string {
  const data = `${apiKey}|${userEmail}|${userId}`;
  return crypto.createHmac('sha256', apiSecret).update(data).digest('base64');
}

/**
 * Validates Paywant Callback Hash
 * Formula: base64_encode(hash_hmac('sha256', SiparisID . '|' . ExtraData . '|' . UserIP, apiSecret, true))
 */
export function verifyPaywantCallbackHash(
  orderId: string,
  extraData: string,
  userIp: string,
  incomingHash: string,
  apiSecret = DEFAULT_API_SECRET
): boolean {
  if (process.env.PAYWANT_TEST_MODE === 'true' && incomingHash === 'test_mode_bypass') {
    return true;
  }
  const data = `${orderId}|${extraData}|${userIp}`;
  const calculatedHash = crypto.createHmac('sha256', apiSecret).update(data).digest('base64');
  return calculatedHash === incomingHash;
}

/**
 * Requests a Paywant payment token
 */
export async function createPaywantPayment(params: PaywantCreateOrderParams): Promise<{
  success: boolean;
  paymentUrl: string;
  token?: string;
  error?: string;
  isTestMode?: boolean;
}> {
  const apiKey = process.env.PAYWANT_API_KEY || DEFAULT_API_KEY;
  const apiSecret = process.env.PAYWANT_API_SECRET || DEFAULT_API_SECRET;
  const isTestMode =
    process.env.PAYWANT_TEST_MODE === 'true' ||
    apiKey === 'test_api_key' ||
    apiKey.startsWith('test_');

  // Payload for Paywant
  const extraData = JSON.stringify({
    orderId: params.orderId,
    userId: params.userId,
    username: params.username,
    packageId: params.packageId,
    coins: params.coins,
    amount: params.amount,
  });

  const hash = generatePaywantRequestHash(apiKey, params.email, params.userId, apiSecret);

  // If running in development / test mode with placeholder keys, return sandbox redirect
  if (isTestMode) {
    return {
      success: true,
      paymentUrl: `/market/paywant-sandbox?orderId=${encodeURIComponent(
        params.orderId
      )}&extraData=${encodeURIComponent(extraData)}`,
      token: `TEST_TOKEN_${Date.now()}`,
      isTestMode: true,
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('apiKey', apiKey);
    formData.append('hash', hash);
    formData.append('userEmail', params.email);
    formData.append('userIpAddress', params.userIp);
    formData.append('userID', params.userId);
    formData.append('returnData', extraData);
    formData.append('userBalance', String(params.amount));
    formData.append('userAmount', String(params.amount));
    formData.append('customEntegration', '1');

    const res = await fetch(PAYWANT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await res.json();

    // Paywant status 100 means token generated successfully
    if (data.status === 100 && data.token) {
      return {
        success: true,
        paymentUrl: `https://secure.paywant.com/pay/${data.token}`,
        token: data.token,
      };
    }

    return {
      success: false,
      paymentUrl: '',
      error: data.message || 'Paywant ödeme sayfası başlatılamadı.',
    };
  } catch (error) {
    console.error('Paywant API request failed:', error);
    return {
      success: false,
      paymentUrl: '',
      error: 'Paywant sunucusuna bağlanılamadı.',
    };
  }
}
