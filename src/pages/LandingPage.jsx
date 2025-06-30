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
  DollarSign,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

// Hero Slider Component with solid colors and sharp edges
const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const slides = [
    {
      title: "AI-Powered Financial Intelligence",
      subtitle: "Transform your financial future with intelligent insights and personalized recommendations",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      bgColor: "bg-purple-600"
    },
    {
      title: "Smart Budget Management",
      subtitle: "Take control of your spending with AI-driven budget optimization and real-time tracking",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80",
      bgColor: "bg-emerald-600"
    },
    {
      title: "Achieve Your Financial Goals",
      subtitle: "Set, track, and achieve your financial milestones with personalized coaching and insights",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      bgColor: "bg-blue-600"
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
          <div className={`absolute inset-0 ${slide.bgColor}`} />
          
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
                    <button 
                      onClick={() => navigate('/login')}
                      className="bg-white text-gray-900 px-8 py-4 font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                      Start Your Journey
                      <ArrowRight className="inline ml-2 w-5 h-5" />
                    </button>
                    <button className="border-2 border-white text-white px-8 py-4 font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="relative z-10">
                    <img 
                      src={slide.image} 
                      alt="Finance AI Coach"
                      className="w-full max-w-md mx-auto shadow-2xl"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIyMC45MTEgMTUwIDIzOCAxMzIuOTExIDIzOCAxMTJDMjM4IDkxLjA4OTYgMjIwLjkxMSA3NCAyMDAgNzRDMTc5LjA4OSA3NCAxNjIgOTEuMDg5NiAxNjIgMTEyQzE2MiAxMzIuOTExIDE3OS4wODkgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+CjxwYXRoIGQ9Ik0yMDAgMjI2QzI0NC4xODMgMjI2IDI4MCAyMDAuNzM0IDI4MCAxNzBIMTIwQzEyMCAyMDAuNzM0IDE1NS44MTcgMjI2IDIwMCAyMjZaIiBmaWxsPSIjOUI5QkEzIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  <div className="absolute -top-4 -right-4 w-72 h-72 bg-white/10 blur-3xl" />
                  <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-white/10 blur-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation */}
      <button 
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Navigation Component with actual logo
const Navigation = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Features', href: 'features' },
    { label: 'Solutions', href: 'solutions' },
    { label: 'Pricing', href: 'pricing' },
    { label: 'About Us', href: 'about' },
    { label: 'Privacy Policy', href: 'privacy' },
    { label: 'Team', href: 'team' }
  ];

  const handleNavClick = (section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/WhatsApp Image 2025-06-29 at 13.46.00_d292e4a6.jpg" 
              alt="Finance AI Coach" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="w-12 h-12 bg-purple-600 flex items-center justify-center hidden"
            >
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              Finance AI Coach
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`font-medium transition-colors duration-300 ${
                  activeSection === item.href ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {item.label}
              </button>
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
              className="bg-purple-600 text-white px-6 py-3 font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
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
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="block text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300"
                >
                  {item.label}
                </button>
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
                  className="block w-full bg-purple-600 text-white px-6 py-3 font-semibold text-center"
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

// Features Section with sharp edges
const FeaturesSection = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "AI-Powered Insights",
      description: "Get personalized financial advice powered by advanced AI algorithms that learn from your spending patterns.",
      color: "bg-purple-500",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade encryption and security protocols.",
      color: "bg-blue-500",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Visualize your financial health with interactive charts and predictive analytics.",
      color: "bg-emerald-500",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and achieve your financial goals with intelligent milestone tracking and recommendations.",
      color: "bg-orange-500",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications and updates on your financial activities and budget status.",
      color: "bg-yellow-500",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      icon: PieChart,
      title: "Budget Optimization",
      description: "Automatically optimize your budget allocation based on your spending habits and goals.",
      color: "bg-indigo-500",
      image: "https://images.unsplash.com/photo-1554224154-26032fced8bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="text-purple-600"> Smart Finance</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our AI-powered platform transforms the way you manage money with cutting-edge features designed for modern financial needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="relative mb-6">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-48 object-cover mb-4"
                />
                <div className={`w-16 h-16 ${feature.color} flex items-center justify-center absolute -bottom-2 left-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
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
      features: ["Expense Tracking", "Budget Planning", "Goal Setting", "Investment Advice"],
      color: "bg-purple-600"
    },
    {
      icon: BarChart3,
      title: "Business Financial Analytics",
      description: "Comprehensive financial analytics for small businesses and entrepreneurs.",
      features: ["Cash Flow Analysis", "Profit Tracking", "Tax Optimization", "Growth Forecasting"],
      color: "bg-blue-600"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Experience",
      description: "Manage your finances on-the-go with our intuitive mobile application.",
      features: ["Real-time Sync", "Offline Access", "Push Notifications", "Biometric Security"],
      color: "bg-emerald-600"
    }
  ];

  return (
    <section id="solutions" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Solutions for
            <span className="text-emerald-600"> Every Need</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're managing personal finances or running a business, our platform adapts to your unique requirements.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 border border-gray-200 hover:border-purple-300 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 ${solution.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
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
  const navigate = useNavigate();
  
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
    <section id="pricing" className="py-24 bg-purple-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="text-purple-600"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-purple-600 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-6 py-2 text-sm font-semibold">
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

              <button 
                onClick={() => navigate('/login')}
                className={`w-full py-4 font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Us Section
const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-purple-600">Finance AI Coach</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to democratize financial intelligence and make smart money management accessible to everyone.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Finance AI Coach was founded with the belief that everyone deserves access to intelligent financial guidance. 
              We combine cutting-edge artificial intelligence with proven financial principles to help individuals and 
              businesses make smarter money decisions.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our platform learns from your financial behavior and provides personalized insights that adapt to your 
              unique situation, helping you build wealth and achieve your financial goals faster than ever before.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">100K+</div>
                <div className="text-gray-600">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">$50M+</div>
                <div className="text-gray-600">Money Managed</div>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Team collaboration"
              className="w-full shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Team Section
const TeamSection = () => {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "Former Goldman Sachs analyst with 15+ years in fintech"
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "AI researcher from Stanford, former Google engineer"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "Product leader with expertise in financial UX design"
    },
    {
      name: "David Kim",
      role: "Head of Security",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "Cybersecurity expert, former NSA security analyst"
    }
  ];

  return (
    <section id="team" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Meet Our <span className="text-purple-600">Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our diverse team of experts combines deep financial knowledge with cutting-edge technology expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-center">
              <img 
                src={member.image} 
                alt={member.name}
                className="w-32 h-32 object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Privacy Policy Section
const PrivacySection = () => {
  return (
    <section id="privacy" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Privacy <span className="text-purple-600">Policy</span>
          </h2>
          <p className="text-xl text-gray-600">
            Your privacy and data security are our top priorities. Here's how we protect your information.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How We Work</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Finance AI Coach uses advanced artificial intelligence to analyze your financial data and provide 
              personalized insights. Our AI algorithms process your transaction history, spending patterns, and 
              financial goals to generate tailored recommendations.
            </p>
            <p className="text-gray-600 leading-relaxed">
              All data processing happens securely in the cloud with bank-level encryption. We never sell your 
              personal information to third parties, and you maintain full control over your data at all times.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Collection</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                Financial transaction data (with your explicit consent)
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                Account information and preferences
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                Usage analytics to improve our service
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                Communication preferences and support interactions
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Protection</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6">
                <Shield className="w-8 h-8 text-purple-600 mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Encryption</h4>
                <p className="text-gray-600 text-sm">256-bit SSL encryption for all data transmission and storage</p>
              </div>
              <div className="bg-gray-50 p-6">
                <Globe className="w-8 h-8 text-purple-600 mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Compliance</h4>
                <p className="text-gray-600 text-sm">GDPR, CCPA, and SOC 2 Type II compliant</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h3>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time. 
              You can also opt out of data collection or request a copy of all data we have about you. 
              Contact our privacy team at privacy@financeaicoach.com for any privacy-related requests.
            </p>
          </div>
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
    <section className="py-24 bg-purple-600">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
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
          <span className="text-purple-400"> Financial Future?</span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Join thousands of users who have already taken control of their finances with our AI-powered platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/login')}
            className="bg-purple-600 text-white px-8 py-4 font-semibold text-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Start Free Today
            <ArrowRight className="inline ml-2 w-5 h-5" />
          </button>
          <button className="border-2 border-white text-white px-8 py-4 font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300">
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
              <img 
                src="/WhatsApp Image 2025-06-29 at 13.46.00_d292e4a6.jpg" 
                alt="Finance AI Coach" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="w-10 h-10 bg-purple-600 flex items-center justify-center hidden"
              >
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold">Finance AI Coach</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your intelligent financial companion for smart money management and wealth building.
            </p>
            <div className="flex space-x-4 mt-6">
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">hello@financeaicoach.com</span>
              </div>
            </div>
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
  const [activeSection, setActiveSection] = useState('features');

  const renderSection = () => {
    switch (activeSection) {
      case 'features':
        return <FeaturesSection />;
      case 'solutions':
        return <SolutionsSection />;
      case 'pricing':
        return <PricingSection />;
      case 'about':
        return <AboutSection />;
      case 'privacy':
        return <PrivacySection />;
      case 'team':
        return <TeamSection />;
      default:
        return <FeaturesSection />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <HeroSlider />
      {renderSection()}
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;