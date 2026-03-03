// lib/infakt.ts
// Dokumentacja: https://app.infakt.pl/api/v3/docs

const INFAKT_API_URL = 'https://app.infakt.pl/api/v3';
const INFAKT_API_KEY = process.env.INFAKT_API_KEY!;

const PLAN_NAMES: Record<string, string> = {
  standard: 'PostujTo Starter — subskrypcja miesięczna',
  premium: 'PostujTo Pro — subskrypcja miesięczna',
};

const PLAN_PRICES_NET: Record<string, number> = {
  // 79 zł brutto / 1.23 = ~64.23 zł netto (VAT 23%)
  standard: 64.23,
  // 199 zł brutto / 1.23 = ~161.79 zł netto
  premium: 161.79,
};

interface InvoiceData {
  clientEmail: string;
  clientName: string;
  plan: 'standard' | 'premium';
  paidAt: string; // ISO date string
}

export async function createInvoice(data: InvoiceData) {
  const serviceName = PLAN_NAMES[data.plan] || 'PostujTo — subskrypcja';
  const netPrice = PLAN_PRICES_NET[data.plan] || 64.23;

  const payload = {
    invoice: {
      payment_method: 'transfer',
      paid_date: data.paidAt.slice(0, 10),
      status: 'paid',
      invoice_date: data.paidAt.slice(0, 10),
      sale_date: data.paidAt.slice(0, 10),
      currency: 'PLN',
      // Dane klienta — inFakt dopasuje lub stworzy nowego
      client_attributes: {
        email: data.clientEmail,
        name: data.clientName || data.clientEmail,
      },
      services: [
        {
          name: serviceName,
          unit: 'szt.',
          quantity: 1,
          unit_net_price: netPrice,
          tax_symbol: '23',
        },
      ],
    },
  };

  const res = await fetch(`${INFAKT_API_URL}/invoices.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-inFakt-ApiKey': INFAKT_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`inFakt API error ${res.status}: ${error}`);
  }

  const invoice = await res.json();
  console.log('✅ Faktura wystawiona:', invoice?.invoice?.number);
  return invoice;
}

export async function sendInvoiceByEmail(invoiceId: string) {
  const res = await fetch(`${INFAKT_API_URL}/invoices/${invoiceId}/send_by_email.json`, {
    method: 'POST',
    headers: {
      'X-inFakt-ApiKey': INFAKT_API_KEY,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`inFakt send email error ${res.status}: ${error}`);
  }

  console.log('✅ Faktura wysłana emailem do klienta');
}