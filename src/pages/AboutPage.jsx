import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Award, Globe, Target, CheckCircle, Mail } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

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
      <section className="py-24 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            About <span className="text-purple-200">Finance AI Coach</span>
          </h1>
          <p className="text-xl lg:text-2xl text-purple-100 max-w-3xl mx-auto">
            We're on a mission to democratize financial intelligence and make smart money management accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Finance AI Coach was founded with the belief that everyone deserves access to intelligent financial guidance. 
                We combine cutting-edge artificial intelligence with proven financial principles to help individuals and 
                businesses make smarter money decisions.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Our platform learns from your financial behavior and provides personalized insights that adapt to your 
                unique situation, helping you build wealth and achieve your financial goals faster than ever before.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">100K+</div>
                  <div className="text-gray-600">Happy Users</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">$50M+</div>
                  <div className="text-gray-600">Money Managed</div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Team collaboration"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape how we build products for our users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "User-Centric",
                description: "Every feature we build starts with understanding our users' real financial challenges and needs."
              },
              {
                icon: Shield,
                title: "Security First",
                description: "We prioritize the security and privacy of your financial data above all else."
              },
              {
                icon: Globe,
                title: "Accessibility",
                description: "Financial intelligence should be available to everyone, regardless of their background or income level."
              },
              {
                icon: Award,
                title: "Excellence",
                description: "We strive for excellence in everything we do, from our AI algorithms to customer support."
              },
              {
                icon: Users,
                title: "Transparency",
                description: "We believe in clear, honest communication about how our platform works and what it costs."
              },
              {
                icon: CheckCircle,
                title: "Innovation",
                description: "We continuously innovate to stay ahead of the curve in financial technology."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-xl text-gray-600">
                How we started and where we're going
              </p>
            </div>

            <div className="space-y-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">The Beginning</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Founded in 2023 by a team of financial experts and AI researchers, Finance AI Coach was born 
                    from the frustration of seeing too many people struggle with basic financial management. 
                    Traditional financial advice was either too expensive, too generic, or too complicated for 
                    the average person.
                  </p>
                </div>
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="Startup office"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="lg:order-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">The Innovation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We realized that artificial intelligence could bridge this gap by providing personalized, 
                    intelligent financial guidance at scale. Our AI doesn't just track your spending – it 
                    understands your patterns, predicts your needs, and provides actionable insights that 
                    adapt to your unique financial situation.
                  </p>
                </div>
                <div className="lg:order-1">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="AI technology"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">The Future</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Today, we're proud to serve over 100,000 users who have collectively improved their 
                    financial health and saved millions of dollars. But we're just getting started. Our 
                    vision is to become the world's most trusted AI financial advisor, helping millions 
                    of people achieve financial freedom.
                  </p>
                </div>
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="Future vision"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-purple-600">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Be part of the financial revolution. Start your journey to financial freedom today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => navigate('/team')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Meet Our Team
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
              <button onClick={() => navigate('/team')} className="hover:text-white transition-colors">Team</button>
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

export default AboutPage;