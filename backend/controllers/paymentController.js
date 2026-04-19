const axios = require('axios');

function getMpesaCredentials() {
  const key =
    process.env.MPESA_CONSUMER_KEY ||
    process.env.DARAJA_CONSUMER_KEY ||
    '';
  const secret =
    process.env.MPESA_CONSUMER_SECRET ||
    process.env.DARAJA_CONSUMER_SECRET ||
    '';
  const trimmedKey = String(key).trim();
  const trimmedSecret = String(secret).trim();
  const placeholder =
    !trimmedKey ||
    !trimmedSecret ||
    /^your[_-]/i.test(trimmedKey) ||
    /^your[_-]/i.test(trimmedSecret);
  return { consumerKey: trimmedKey, consumerSecret: trimmedSecret, placeholder };
}

function allowDevMpesaMock() {
  return process.env.NODE_ENV !== 'production' || process.env.MPESA_USE_MOCK === '1';
}

const mockStkResponse = () => ({
  MerchantRequestID: 'mock-merchant-id',
  CheckoutRequestID: 'mock-checkout-id',
  ResponseCode: '0',
  ResponseDescription: 'Success. Request accepted for processing (mock)',
  CustomerMessage: 'Success. Request accepted for processing (mock)'
});

// Middleware to get access token
exports.generateAccessToken = async (req, res, next) => {
  const { consumerKey, consumerSecret, placeholder } = getMpesaCredentials();

  if (placeholder) {
    console.log('[mpesa] No valid consumer key/secret — using mock M-Pesa.');
    req.mockMpesa = true;
    return next();
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const { data } = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` }
    });
    req.safaricom_access_token = data.access_token;
    return next();
  } catch (err) {
    console.error('[mpesa] OAuth error:', err.response?.data || err.message);
    if (allowDevMpesaMock()) {
      console.warn('[mpesa] Falling back to mock STK (dev / MPESA_USE_MOCK).');
      req.mockMpesa = true;
      return next();
    }
    return res.status(500).json({ error: 'Failed to authenticate with M-Pesa. Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET.' });
  }
};

function normalizeKenyaMsisdn(phone) {
  if (!phone) return '';
  let p = String(phone).replace(/\D/g, '');
  if (p.startsWith('254')) return p;
  if (p.startsWith('0')) return `254${p.slice(1)}`;
  if (p.length === 9) return `254${p}`;
  return p;
}

exports.stkPush = async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;

    if (req.mockMpesa) {
      console.log(`[mpesa] Mock STK → ${phone}, KES ${amount}, order ${orderId}`);
      return res.json(mockStkResponse());
    }

    const formattedPhone = normalizeKenyaMsisdn(phone);
    if (!formattedPhone || formattedPhone.length < 12) {
      return res.status(400).json({ error: 'Use a valid Kenya number, e.g. 254712345678 or 0712345678' });
    }

    const shortcode =
      process.env.MPESA_SHORTCODE || process.env.DARAJA_SHORTCODE || '174379';
    const passkey =
      process.env.MPESA_PASSKEY ||
      process.env.DARAJA_PASSKEY ||
      'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(Number(amount) || 0),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL:
        process.env.MPESA_CALLBACK_URL ||
        process.env.DARAJA_CALLBACK_URL ||
        'https://your-domain.com/api/payments/callback',
      AccountReference: `Order ${orderId}`,
      TransactionDesc: 'Payment for Crystal Drops Water'
    };

    const { data } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${req.safaricom_access_token}` } }
    );

    return res.json(data);
  } catch (err) {
    console.error('[mpesa] STK error:', err.response?.data || err.message);
    if (allowDevMpesaMock()) {
      console.warn('[mpesa] STK failed — returning mock success in dev.');
      return res.json(mockStkResponse());
    }
    return res.status(500).json({
      error: 'M-Pesa STK push failed. Try again or choose pay on delivery, or set MPESA_USE_MOCK=1 for local testing.'
    });
  }
};

exports.callback = async (req, res) => {
  try {
    const response = req.body.Body.stkCallback;
    console.log('M-Pesa Callback Response:', JSON.stringify(response, null, 2));

    res.json({ message: 'Callback received successfully' });
  } catch (err) {
    console.error('Callback error', err);
    res.status(500).json({ error: 'Callback handler error' });
  }
};
