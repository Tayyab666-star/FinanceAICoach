import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail } from 'lucide-react';

const PrivacyPage = () => {
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
      <section className="py-24 bg-gradient-to-br from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Privacy <span className="text-green-200">Policy</span>
          </h1>
          <p className="text-xl lg:text-2xl text-green-100 max-w-3xl mx-auto">
            Your privacy and data security are our top priorities. Learn how we protect and handle your information.
          </p>
          <div className="mt-8 text-green-100">
            <p>Last updated: December 30, 2024</p>
          </div>
        </div>
      </section>

      {/* Privacy Overview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "We use the same encryption standards as major financial institutions."
              },
              {
                icon: Lock,
                title: "Data Protection",
                description: "Your personal and financial data is encrypted and securely stored."
              },
              {
                icon: Eye,
                title: "Transparency",
                description: "We're clear about what data we collect and how we use it."
              },
              {
                icon: Database,
                title: "No Data Selling",
                description: "We never sell your personal information to third parties."
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How Finance AI Coach Works</h2>
                <p className="text-gray-600 mb-8">
                  Finance AI Coach is an intelligent financial management platform that helps you track expenses, 
                  manage budgets, set financial goals, and receive personalized AI-powered financial advice. 
                  Here's how we handle your data throughout this process:
                </p>

                <div className="space-y-12">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h3>
                    <div className="bg-blue-50 p-6 rounded-xl mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Account Information</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Email address for account creation and communication</li>
                        <li>• Name and profile information you provide</li>
                        <li>• Account preferences and settings</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-6 rounded-xl mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Financial Data</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Transaction data you manually enter or import</li>
                        <li>• Budget categories and spending limits</li>
                        <li>• Financial goals and progress tracking</li>
                        <li>• Receipt images and extracted data (when using our scanner)</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3">Usage Information</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• How you interact with our platform</li>
                        <li>• Features you use most frequently</li>
                        <li>• Device and browser information</li>
                        <li>• IP address and general location data</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-3">Core Services</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Provide financial tracking and budgeting tools</li>
                          <li>• Generate personalized AI insights</li>
                          <li>• Track progress toward your financial goals</li>
                          <li>• Process receipt data through OCR technology</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-3">Platform Improvement</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Improve our AI algorithms and recommendations</li>
                          <li>• Enhance user experience and interface design</li>
                          <li>• Develop new features based on usage patterns</li>
                          <li>• Provide customer support and troubleshooting</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security & Protection</h3>
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3">🔒 Security Measures</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• <strong>Encryption:</strong> All data is encrypted in transit and at rest using AES-256 encryption</li>
                        <li>• <strong>Access Control:</strong> Strict access controls and authentication requirements</li>
                        <li>• <strong>Regular Audits:</strong> Regular security audits and penetration testing</li>
                        <li>• <strong>Compliance:</strong> SOC 2 Type II certified and GDPR compliant</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing & Third Parties</h3>
                    <div className="bg-yellow-50 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3">⚠️ Important: We Never Sell Your Data</h4>
                      <p className="text-gray-600 mb-4">
                        We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                      </p>
                      <h4 className="font-semibold text-gray-900 mb-3">Limited Sharing Scenarios:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• <strong>Service Providers:</strong> Trusted partners who help us operate our platform (hosting, analytics)</li>
                        <li>• <strong>Legal Requirements:</strong> When required by law or to protect our users' safety</li>
                        <li>• <strong>Business Transfers:</strong> In the event of a merger or acquisition (with user notification)</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights & Controls</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-3">Data Access & Control</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• View all data we have about you</li>
                          <li>• Export your data in standard formats</li>
                          <li>• Correct inaccurate information</li>
                          <li>• Delete your account and data</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-3">Privacy Settings</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Control what data is collected</li>
                          <li>• Manage communication preferences</li>
                          <li>• Opt out of analytics tracking</li>
                          <li>• Set data retention preferences</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">6. AI & Machine Learning</h3>
                    <div className="bg-purple-50 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3">🤖 How Our AI Works</h4>
                      <p className="text-gray-600 mb-4">
                        Our AI analyzes your financial patterns to provide personalized insights and recommendations. 
                        Here's what you should know:
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• AI processing happens on secure, encrypted servers</li>
                        <li>• Your data is never used to train models for other users</li>
                        <li>• You can opt out of AI features while keeping other functionality</li>
                        <li>• AI recommendations are suggestions, not financial advice</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h3>
                    <p className="text-gray-600 mb-4">
                      We retain your data only as long as necessary to provide our services and comply with legal obligations:
                    </p>
                    <ul className="space-y-2 text-gray-600 mb-6">
                      <li>• <strong>Active Accounts:</strong> Data is retained while your account is active</li>
                      <li>• <strong>Inactive Accounts:</strong> Data is deleted after 3 years of inactivity</li>
                      <li>• <strong>Account Deletion:</strong> Most data is deleted within 30 days of account deletion</li>
                      <li>• <strong>Legal Requirements:</strong> Some data may be retained longer for legal compliance</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h3>
                    <p className="text-gray-600 mb-4">
                      Finance AI Coach operates globally, and your data may be transferred to and processed in countries 
                      other than your own. We ensure appropriate safeguards are in place:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li>• All transfers comply with applicable data protection laws</li>
                      <li>• We use Standard Contractual Clauses for EU data transfers</li>
                      <li>• Data centers meet international security standards</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h3>
                    <div className="bg-orange-50 p-6 rounded-xl">
                      <p className="text-gray-600">
                        Finance AI Coach is not intended for children under 13 years of age. We do not knowingly 
                        collect personal information from children under 13. If you believe we have collected 
                        information from a child under 13, please contact us immediately.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h3>
                    <p className="text-gray-600 mb-4">
                      We may update this privacy policy from time to time. When we do:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li>• We'll notify you via email and in-app notifications</li>
                      <li>• We'll post the updated policy on our website</li>
                      <li>• Material changes will include a 30-day notice period</li>
                      <li>• Continued use constitutes acceptance of the new policy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions About Your Privacy?</h2>
            <p className="text-xl text-gray-600 mb-8">
              We're here to help. If you have any questions about this privacy policy or how we handle your data, 
              please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:privacy@financeaicoach.com"
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Privacy Team
              </a>
              <button 
                onClick={() => navigate('/about')}
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                Learn More About Us
              </button>
            </div>
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
              <button onClick={() => navigate('/team')} className="hover:text-white transition-colors">Team</button>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">privacy@financeaicoach.com</span>
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

export default PrivacyPage;