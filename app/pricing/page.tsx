'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function PricingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
const [currentPlan, setCurrentPlan] = useState<string>('free');
const [planLoading, setPlanLoading] = useState(true);

useEffect(() => {
  if (!user) { setPlanLoading(false); return; }
  fetch('/api/user/plan')
    .then(r => r.json())
    .then(data => setCurrentPlan(data.plan || 'free'))
    .finally(() => setPlanLoading(false));
}, [user]);
  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      alert('Musisz być zalogowany aby wykupić plan!');
      return;
    }

    setLoading(planName);

    try {
      // Wywołanie API do utworzenia Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Przekieruj do Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Brak URL do płatności');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Wystąpił błąd podczas inicjowania płatności. Spróbuj ponownie.');
    } finally {
      setLoading(null);
    }
  };
const getPlanButton = (planName: 'standard' | 'premium', priceId: string, color: string) => {
  if (planLoading) return (
    <button disabled className={`w-full py-3 px-6 ${color} text-white rounded-full font-semibold opacity-50 cursor-not-allowed`}>
      Ładowanie...
    </button>
  );
  if (currentPlan === planName) return (
    <button disabled className="w-full py-3 px-6 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed">
      Twój obecny plan
    </button>
  );
  if (currentPlan !== 'free') return (
    <button disabled className="w-full py-3 px-6 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed"
      title="Anuluj obecną subskrypcję aby zmienić plan">
      Niedostępne
    </button>
  );
  return (
    <button
      onClick={() => handleSubscribe(priceId, planName)}
      disabled={loading === planName}
      className={`w-full py-3 px-6 ${color} text-white rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading === planName ? 'Ładowanie...' : `Wybierz ${planName.charAt(0).toUpperCase() + planName.slice(1)}`}
    </button>
  );
};
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wybierz plan dla siebie
          </h1>
          <p className="text-xl text-gray-600">
            Zacznij generować profesjonalne posty AI już dziś
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* FREE PLAN */}
          <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">0</span>
                <span className="text-xl text-gray-600"> zł</span>
              </div>
              <p className="text-gray-600">Wypróbuj za darmo</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">10 postów miesięcznie</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Teksty AI (Claude)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Hashtagi</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Sugestie grafik</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full py-3 px-6 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed"
            >
              Twój obecny plan
            </button>
          </div>

          {/* STANDARD PLAN */}
          <div className="border-2 border-purple-600 rounded-2xl p-8 bg-white hover:shadow-2xl transition-shadow relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Najpopularniejszy
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-purple-600">49</span>
                <span className="text-xl text-gray-600"> zł/msc</span>
              </div>
              <p className="text-gray-600">Dla małych firm</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700"><strong>100 postów</strong> miesięcznie</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Wszystko z Free +</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Historia postów</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Priorytetowe wsparcie</span>
              </li>
            </ul>

            <{getPlanButton('standard', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD!, 'bg-purple-600 hover:bg-purple-700')}
          </div>

          {/* PREMIUM PLAN */}
          <div className="border-2 border-cyan-500 rounded-2xl p-8 bg-white hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-cyan-600">149</span>
                <span className="text-xl text-gray-600"> zł/msc</span>
              </div>
              <p className="text-gray-600">Dla agencji</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700"><strong>500 postów</strong> miesięcznie</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Wszystko ze Standard +</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Generowanie obrazów AI</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Eksport do PDF/CSV</span>
              </li>
            </ul>

            {getPlanButton('premium', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!, 'bg-cyan-500 hover:bg-cyan-600')}
          </div>

        </div>

        {/* FAQ or Info Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            💳 Bezpieczne płatności przez Stripe • 🔄 Anuluj w każdej chwili • 🇵🇱 Ceny w PLN
          </p>
          <p className="text-sm text-gray-500">
            Po wykupieniu planu kredyty odnowią się automatycznie każdego miesiąca.
          </p>
        </div>
      </div>
    </div>
  );
}