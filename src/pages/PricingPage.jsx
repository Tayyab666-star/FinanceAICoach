import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Star, Zap, Crown, Mail } from 'lucide-react';

const PricingPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for getting started with basic financial tracking",
      icon: Star,
      color: "bg-green-500",
      features: [
        "Basic expense tracking",
        "Simple budget creation",
        "Monthly financial reports",
        "Mobile app access",
        "Email support",
        "Up to 100 transactions/month"
      ],
      limitations: [
        "Limited AI insights",
        "Basic analytics only",
        "No goal tracking"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Advanced features for serious financial management",
      icon: Zap,
      color: "bg-blue-500",
      features: [
        "Everything in Starter",
        "Advanced AI insights",
        "Unlimited transactions",
        "Goal tracking & planning",
        "Investment tracking",
        "Custom categories",
        "Receipt scanning",
        "Priority email support",
        "Advanced analytics",
        "Budget optimization"
      ],
      limitations: [],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "per month",
      description: "Complete financial intelligence for power users",
      icon: Crown,
      color: "bg-purple-500",
      features: [
        "Everything in Pro",
        "Personal AI financial coach",
        "Bank account integration",
        "Tax optimization insights",
        "Investment recommendations",
        "Family account sharing",
        "Custom reports & exports",
        "Phone & chat support",
        "Financial advisor consultation",
        "Advanced security features"
      ],
      limitations: [],
      cta: "Start Premium Trial",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely. We use bank-level encryption and security protocols to protect your data. We never sell your information to third parties."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment in full."
    },
    {
      question: "Can I use Finance AI Coach on multiple devices?",
      answer: "Yes! Your account syncs across all devices - web, mobile, and tablet. Access your financial data anywhere, anytime."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through Stripe."
    },
    {
      question: "Is there a family plan available?",
      answer: "Our Premium plan includes family account sharing for up to 5 family members. Each member gets their own secure access."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <img 
                  src="/WhatsApp Image 2025-06-29 at 13.46.00_d292e4a6.jpg" 
                  alt="Finance AI Coach" 
                  className="h-6 w-6 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="text-white font-bold text-sm hidden">F</span>
              </div>
              <span className="text-xl font-bold text-purple-600">Finance AI Coach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Simple, <span className="text-green-200">Transparent</span> Pricing
          </h1>
          <p className="text-xl lg:text-2xl text-green-100 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your financial goals. Start free and upgrade as you grow.
          </p>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 max-w-md mx-auto">
            <p className="text-lg font-semibold mb-2">🎉 Limited Time Offer</p>
            <p className="text-green-100">Get 2 months free on annual plans!</p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${plan.color} rounded-xl flex items-center justify-center mr-4`}>
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.price !== "Free" && (
                        <span className="text-gray-600 ml-2">/{plan.period}</span>
                      )}
                    </div>
                    {plan.price === "Free" && (
                      <span className="text-gray-600">{plan.period}</span>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-center opacity-60">
                        <div className="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                          <div className="w-3 h-3 border border-gray-400 rounded-full" />
                        </div>
                        <span className="text-gray-500 line-through">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </button>
                  
                  {plan.price !== "Free" && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      14-day free trial • No credit card required
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Compare All Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See exactly what's included in each plan to make the best choice for your needs.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Starter</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 bg-blue-50">Pro</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Transaction Tracking", starter: "100/month", pro: "Unlimited", premium: "Unlimited" },
                    { feature: "Budget Creation", starter: "✓", pro: "✓", premium: "✓" },
                    { feature: "AI Insights", starter: "Basic", pro: "Advanced", premium: "Advanced" },
                    { feature: "Goal Tracking", starter: "✗", pro: "✓", premium: "✓" },
                    { feature: "Receipt Scanning", starter: "✗", pro: "✓", premium: "✓" },
                    { feature: "Investment Tracking", starter: "✗", pro: "✓", premium: "✓" },
                    { feature: "Bank Integration", starter: "✗", pro: "✗", premium: "✓" },
                    { feature: "AI Financial Coach", starter: "✗", pro: "✗", premium: "✓" },
                    { feature: "Family Sharing", starter: "✗", pro: "✗", premium: "✓" },
                    { feature: "Priority Support", starter: "✗", pro: "✓", premium: "✓" }
                  ].map((row, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                      <td className="py-4 px-6 text-center text-gray-600">{row.starter}</td>
                      <td className="py-4 px-6 text-center text-gray-600 bg-blue-50">{row.pro}</td>
                      <td className="py-4 px-6 text-center text-gray-600">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Got questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already transformed their financial lives with Finance AI Coach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/team')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <img 
                  src="/WhatsApp Image 2025-06-29 at 13.46.00_d292e4a6.jpg" 
                  alt="Finance AI Coach" 
                  className="h-5 w-5 object-contain rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="text-white font-bold text-xs hidden">F</span>
              </div>
              <span className="text-lg font-bold">Finance AI Coach</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button>
              <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">hello@financeaicoach.com</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Finance AI Coach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;