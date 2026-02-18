'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Symulujemy sprawdzenie sesji (w przyszłości możesz dodać weryfikację)
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Przetwarzamy Twoją płatność...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
        
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-12 h-12 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Płatność zakończona sukcesem! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            Dziękujemy za subskrypcję!
          </p>
          
          {user && (
            <p className="text-gray-500">
              Potwierdzenie zostało wysłane na: <strong>{user.primaryEmailAddress?.emailAddress}</strong>
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Co dalej?
          </h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Twoje kredyty zostały zaktualizowane</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Możesz już generować posty AI</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Kredyty odnawiają się automatycznie co miesiąc</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Anuluj w każdej chwili bez dodatkowych opłat</span>
            </li>
          </ul>
        </div>

        {/* Session ID (dla debugowania) */}
        {sessionId && (
          <div className="mb-6">
            <p className="text-xs text-gray-400">
              ID sesji: {sessionId.substring(0, 30)}...
            </p>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Zacznij generować posty 🚀
          </Link>
          
          <Link
            href="/pricing"
            className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-full font-semibold transition-all"
          >
            Zobacz plany
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Potrzebujesz pomocy? <a href="mailto:support@postujto.pl" className="text-purple-600 hover:underline">Skontaktuj się z nami</a>
          </p>
        </div>

      </div>
    </div>
  );
}