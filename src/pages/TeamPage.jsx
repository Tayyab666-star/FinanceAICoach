import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Linkedin, Twitter, Github } from 'lucide-react';
import Navbar from '../components/Navbar';

const TeamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll to section if coming from landing page
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [location]);

  const team = [
    {
      name: "Tayyab",
      role: "CEO & Co-Founder",
      image: "/WhatsApp Image 2024-09-24 at 21.24.53_adfd628d.jpg",
      bio: "Former Goldman Sachs analyst with 15+ years in fintech. Tayyab leads our vision to democratize financial intelligence.",
      education: "MBA from Harvard Business School",
      experience: "Previously VP at JPMorgan Chase",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "tayyab@financeaicoach.com"
      }
    },
    {
      name: "Zeeshan",
      role: "CTO & Co-Founder",
      image: "/zeeshan.jpg",
      bio: "AI researcher from Stanford with expertise in machine learning and financial algorithms. Zeeshan architected our core AI engine.",
      education: "PhD in Computer Science from Stanford",
      experience: "Former Senior Engineer at Google AI",
      social: {
        linkedin: "#",
        github: "#",
        email: "zeeshan@financeaicoach.com"
      }
    },
    {
      name: "Usama",
      role: "Head of Product",
      image: "/usama.jpg",
      bio: "Product leader with expertise in financial UX design. Usama ensures our platform is intuitive and user-friendly.",
      education: "MS in Design from RISD",
      experience: "Former Product Manager at Mint",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "usama@financeaicoach.com"
      }
    },
    {
      name: "Izza",
      role: "Head of Security",
      image: "/izza.jpg",
      bio: "Cybersecurity expert with government and private sector experience. Izza ensures your financial data is always protected.",
      education: "MS in Cybersecurity from MIT",
      experience: "Former Security Analyst at NSA",
      social: {
        linkedin: "#",
        github: "#",
        email: "izza@financeaicoach.com"
      }
    },
    {
      name: "Yousaf",
      role: "Head of Marketing",
      image: "/yousaf.jpg",
      bio: "Marketing strategist with a passion for financial education. Yousaf leads our mission to make financial literacy accessible to all.",
      education: "MBA from Wharton",
      experience: "Former Marketing Director at Robinhood",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "yousaf@financeaicoach.com"
      }
    },
    {
      name: "James Thompson",
      role: "Head of Customer Success",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "Customer success expert dedicated to helping users achieve their financial goals. James leads our support and education initiatives.",
      education: "BA in Business from UC Berkeley",
      experience: "Former Customer Success Manager at Stripe",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "james@financeaicoach.com"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Meet Our <span className="text-blue-200">Team</span>
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Our diverse team of experts combines deep financial knowledge with cutting-edge technology expertise to revolutionize personal finance.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-purple-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-gray-500">
                      <strong>Education:</strong> {member.education}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Experience:</strong> {member.experience}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors">
                        <Linkedin className="w-4 h-4 text-blue-600" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a href={member.social.twitter} className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors">
                        <Twitter className="w-4 h-4 text-sky-600" />
                      </a>
                    )}
                    {member.social.github && (
                      <a href={member.social.github} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Github className="w-4 h-4 text-gray-600" />
                      </a>
                    )}
                    {member.social.email && (
                      <a href={`mailto:${member.social.email}`} className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors">
                        <Mail className="w-4 h-4 text-green-600" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Culture</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe that great products come from great teams. Here's what makes our culture special.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation First",
                description: "We encourage experimentation and aren't afraid to challenge the status quo in financial technology."
              },
              {
                title: "User Obsession",
                description: "Every decision we make starts with asking: 'How does this help our users achieve their financial goals?'"
              },
              {
                title: "Continuous Learning",
                description: "We invest in our team's growth through conferences, courses, and dedicated learning time."
              },
              {
                title: "Work-Life Balance",
                description: "We believe that well-rested, happy employees build better products and serve customers better."
              },
              {
                title: "Diversity & Inclusion",
                description: "Our diverse perspectives make us stronger and help us build products for everyone."
              },
              {
                title: "Transparency",
                description: "We share company metrics, decisions, and challenges openly with the entire team."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-24 bg-purple-600">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Want to Join Our Team?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion for revolutionizing personal finance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              View Open Positions
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Learn About Our Mission
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 mb-4 md:mb-0 hover:opacity-80 transition-opacity"
            >
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
            </button>
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

export default TeamPage;