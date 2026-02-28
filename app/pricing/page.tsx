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
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Brak URL do płatności');
      }
    } catch (error) {
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
        {loading === planName ? 'Ładowanie...' : `Zacznij teraz`}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Zaoszczędź 10 godzin tygodniowo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Profesjonalne posty na social media w sekundę. Bez stresu, bez pustej kartki, bez przepłacania.
          </p>
        </div>

        {/* Gwarancja */}
        <div className="text-center mb-12">
          <span className="inline-block px-6 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            7 dni gwarancji zwrotu — bez pytań
          </span>
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
              <p className="text-gray-600">Przetestuj bez karty kredytowej</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700"><strong>5 generacji</strong> jednorazowo</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Facebook, Instagram, TikTok</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Wszystkie branże</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Bez watermarku</span>
              </li>
            </ul>
            <button disabled className="w-full py-3 px-6 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed">
              {currentPlan === 'free' ? 'Twój obecny plan' : 'Plan Free'}
            </button>
          </div>

          {/* STARTER PLAN */}
          <div className="border-2 border-purple-600 rounded-2xl p-8 bg-white hover:shadow-2xl transition-shadow relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Najpopularniejszy
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold text-purple-600">79</span>
                <span className="text-xl text-gray-600"> zł/msc</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">= 2,60 zł dziennie</p>
              <p className="text-gray-600">Dla właścicieli małych firm</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700"><strong>Unlimited</strong> generacji postów</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Facebook, Instagram, TikTok</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Wszystkie branże + kalendarz okazji</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Historia postów + ulubione</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">7 dni gwarancji zwrotu</span>
              </li>
            </ul>
            {getPlanButton('standard', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD!, 'bg-purple-600 hover:bg-purple-700')}
          </div>

          {/* PRO PLAN */}
          <div className="border-2 border-cyan-500 rounded-2xl p-8 bg-white hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold text-cyan-600">199</span>
                <span className="text-xl text-gray-600"> zł/msc</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">= 6,60 zł dziennie</p>
              <p className="text-gray-600">Dla agencji i marketerów</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700"><strong>Unlimited</strong> generacji postów</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Wszystko ze Starter +</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700"><strong>Generowanie obrazów AI</strong></span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Priorytetowe wsparcie</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">7 dni gwarancji zwrotu</span>
              </li>
            </ul>
            {getPlanButton('premium', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!, 'bg-cyan-500 hover:bg-cyan-600')}
          </div>

        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Bezpieczne płatności przez Stripe • Anuluj w każdej chwili • Ceny w PLN z VAT
          </p>
          <p className="text-sm text-gray-500">
            Nie jesteś zadowolony? Zwrócimy pieniądze w ciągu 7 dni — bez pytań i bez problemów.
          </p>
        </div>
      </div>
    </div>
  );
}