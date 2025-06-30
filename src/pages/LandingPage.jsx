import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  Star, 
  Shield, 
  Zap, 
  TrendingUp, 
  PieChart, 
  Target, 
  Brain, 
  CheckCircle, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Award,
  Globe,
  Smartphone,
  BarChart3,
  DollarSign
} from 'lucide-react';

// Hero Slider Component
const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "AI-Powered Financial Intelligence",
      subtitle: "Transform your financial future with intelligent insights and personalized recommendations",
      image: "/WhatsApp Image 2025-06-29 at 13.46.00_d292e4a6.jpg",
      gradient: "from-purple-600 via-blue-600 to-cyan-500"
    },
    {
      title: "Smart Budget Management",
      subtitle: "Take control of your spending with AI-driven budget optimization and real-time tracking",
      image: "/WhatsApp Image 2025-06-29 at 14.00.10_f73cb93b.jpg",
      gradient: "from-emerald-500 via-teal-600 to-blue-600"
    },
    {
      title: "Achieve Your Financial Goals",
      subtitle: "Set, track, and achieve your financial milestones with personalized coaching and insights",
      image: "/Finance AI coach.png",
      gradient: "from-orange-500 via-pink-500 to-purple-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`} />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-white space-y-8">
                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                      Start Your Journey
                      <ArrowRight className="inline ml-2 w-5 h-5" />
                    </button>
                    <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="relative z-10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img 
                      src={slide.image} 
                      alt="Finance AI Coach"
                      className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIyMC45MTEgMTUwIDIzOCAxMzIuOTExIDIzOCAxMTJDMjM4IDkxLjA4OTYgMjIwLjkxMSA3NCAyMDAgNzRDMTc5LjA4OSA3NCAxNjIgOTEuMDg5NiAxNjIgMTEyQzE2MiAxMzIuOTExIDE3OS4wODkgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+CjxwYXRoIGQ9Ik0yMDAgMjI2QzI0NC4xODMgMjI2IDI4MCAyMDAuNzM0IDI4MCAxNzBIMTIwQzEyMCAyMDAuNzM0IDE1NS44MTcgMjI2IDIwMCAyMjZaIiBmaWxsPSIjOUI5QkEzIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  <div className="absolute -top-4 -right-4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation */}
      <button 
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About Us', href: '#about' },
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Team', href: '#team' }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Finance AI Coach
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-300"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-200">
            <div className="space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="block w-full text-left text-purple-600 font-semibold"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get personalized financial advice powered by advanced AI algorithms that learn from your spending patterns.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade encryption and security protocols.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Visualize your financial health with interactive charts and predictive analytics.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and achieve your financial goals with intelligent milestone tracking and recommendations.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications and updates on your financial activities and budget status.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: PieChart,
      title: "Budget Optimization",
      description: "Automatically optimize your budget allocation based on your spending habits and goals.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Smart Finance</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our AI-powered platform transforms the way you manage money with cutting-edge features designed for modern financial needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Solutions Section
const SolutionsSection = () => {
  const solutions = [
    {
      icon: Users,
      title: "Personal Finance Management",
      description: "Take complete control of your personal finances with AI-driven insights and automated tracking.",
      features: ["Expense Tracking", "Budget Planning", "Goal Setting", "Investment Advice"]
    },
    {
      icon: BarChart3,
      title: "Business Financial Analytics",
      description: "Comprehensive financial analytics for small businesses and entrepreneurs.",
      features: ["Cash Flow Analysis", "Profit Tracking", "Tax Optimization", "Growth Forecasting"]
    },
    {
      icon: Smartphone,
      title: "Mobile-First Experience",
      description: "Manage your finances on-the-go with our intuitive mobile application.",
      features: ["Real-time Sync", "Offline Access", "Push Notifications", "Biometric Security"]
    }
  ];

  return (
    <section id="solutions" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Solutions for
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"> Every Need</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're managing personal finances or running a business, our platform adapts to your unique requirements.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <solution.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{solution.description}</p>
              <ul className="space-y-3">
                {solution.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for getting started with personal finance management",
      features: [
        "Basic expense tracking",
        "Simple budgeting tools",
        "Monthly reports",
        "Mobile app access",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Advanced features for serious financial planning",
      features: [
        "AI-powered insights",
        "Advanced analytics",
        "Goal tracking",
        "Investment advice",
        "Priority support",
        "Custom categories",
        "Export capabilities"
      ],
      popular: true
    },
    {
      name: "Business",
      price: "$29.99",
      period: "per month",
      description: "Comprehensive solution for businesses and teams",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Advanced reporting",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "White-label options"
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-purple-600 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-full font-semibold transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection = () => {
  const stats = [
    { number: "100K+", label: "Active Users", icon: Users },
    { number: "$50M+", label: "Money Managed", icon: DollarSign },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "4.9/5", label: "User Rating", icon: Star }
  ];

  return (
    <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2">{stat.number}</div>
              <div className="text-white/80 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gray-900">
      <div className="container mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Financial Future?</span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Join thousands of users who have already taken control of their finances with our AI-powered platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Start Free Today
            <ArrowRight className="inline ml-2 w-5 h-5" />
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300">
            Schedule Demo
          </button>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Finance AI Coach</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your intelligent financial companion for smart money management and wealth building.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Solutions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#team" className="hover:text-white transition-colors">Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Finance AI Coach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSlider />
      <FeaturesSection />
      <SolutionsSection />
      <StatsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;