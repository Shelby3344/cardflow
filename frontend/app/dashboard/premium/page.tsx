'use client';

import { Check, Crown, Zap, Star } from 'lucide-react';

export default function PremiumPage() {
  const features = {
    free: [
      'Criar até 5 decks',
      'Estudar 50 cartas por dia',
      'Estatísticas básicas',
      'Acesso ao app mobile',
    ],
    pro: [
      'Decks ilimitados',
      'Cartas ilimitadas',
      'Estatísticas e análises avançadas',
      'Acesso ao app mobile',
      'Sugestões de estudo com IA',
      'Gravações de voz',
      'Importar de Excel/CSV',
      'Exportar decks',
      'Suporte prioritário',
      'Sem anúncios',
      'Temas personalizados',
      'Lembretes de estudo',
    ],
  };

  const plans = [
    { id: 1, name: 'Mensal', price: 9.99, period: 'mês', popular: false },
    { id: 2, name: 'Anual', price: 79.99, period: 'ano', save: '33%', popular: true },
    { id: 3, name: 'Vitalício', price: 199.99, period: 'único', save: 'Melhor Custo', popular: false },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold mb-4">
            <Crown className="w-5 h-5" />
            CARDFLOW PRO
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Atualize para Pro
          </h1>
          <p className="text-xl text-gray-600">
            Libere potencial de aprendizado ilimitado com recursos premium
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-8 border-2 transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
                  : 'border-gray-200 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-1 rounded-full text-sm font-bold">
                  MAIS POPULAR
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                {plan.save && (
                  <div className="mt-2 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Economize {plan.save}
                  </div>
                )}
              </div>

              <button
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Começar
              </button>

              <div className="space-y-3">
                {features.pro.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Comparação Completa de Recursos
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Recurso</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Grátis</th>
                  <th className="text-center py-4 px-4 font-semibold text-purple-600">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-5 h-5" />
                      Pro
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Número de decks</td>
                  <td className="py-4 px-4 text-center text-gray-600">Até 5</td>
                  <td className="py-4 px-4 text-center text-purple-600 font-semibold">Ilimitado</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Cartas por dia</td>
                  <td className="py-4 px-4 text-center text-gray-600">50</td>
                  <td className="py-4 px-4 text-center text-purple-600 font-semibold">Ilimitado</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Análises avançadas</td>
                  <td className="py-4 px-4 text-center">❌</td>
                  <td className="py-4 px-4 text-center">✅</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Sugestões de estudo com IA</td>
                  <td className="py-4 px-4 text-center">❌</td>
                  <td className="py-4 px-4 text-center">✅</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Gravações de voz</td>
                  <td className="py-4 px-4 text-center">❌</td>
                  <td className="py-4 px-4 text-center">✅</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Importar/Exportar</td>
                  <td className="py-4 px-4 text-center">❌</td>
                  <td className="py-4 px-4 text-center">✅</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Suporte prioritário</td>
                  <td className="py-4 px-4 text-center">❌</td>
                  <td className="py-4 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Anúncios</td>
                  <td className="py-4 px-4 text-center text-gray-600">Sim</td>
                  <td className="py-4 px-4 text-center text-purple-600 font-semibold">Sem anúncios</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'João Silva', role: 'Estudante de Medicina', text: 'CardFlow Pro me ajudou a passar nas provas! As sugestões de IA são incríveis.' },
            { name: 'Maria Santos', role: 'Aprendiz de Idiomas', text: 'Melhor investimento que fiz este ano. Decks ilimitados mudou tudo!' },
            { name: 'Pedro Costa', role: 'Engenheiro de Software', text: 'As análises me ajudam a acompanhar meu progresso perfeitamente. Vale cada centavo!' },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
