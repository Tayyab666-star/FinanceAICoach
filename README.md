# Finance AI Coach - Intelligent Financial Companion

A comprehensive personal finance management application with AI-powered financial coaching, built with modern web technologies.

## 🚀 Features

### Core Financial Management
- **Transaction Tracking**: Record and categorize income and expenses
- **Smart Receipt Scanner**: AI-powered OCR for automatic transaction extraction
- **Budget Management**: Set and track spending limits by category
- **Financial Goals**: Create and monitor progress toward financial objectives
- **Analytics Dashboard**: Comprehensive financial insights and visualizations

### AI-Powered Features
- **Real-time AI Financial Coach**: Get personalized advice powered by Google Gemini AI
- **Smart Categorization**: Automatic transaction categorization using AI
- **Financial Insights**: AI-generated recommendations based on spending patterns
- **Contextual Advice**: Personalized suggestions based on your financial profile

### Advanced Features
- **Connected Accounts**: Link bank accounts and credit cards (simulation)
- **Report Generation**: Export financial data in PDF and CSV formats
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Real-time Notifications**: Stay updated on financial activities

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Responsive charts and data visualization
- **React Router DOM** - Client-side routing

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Row Level Security (RLS)** - Secure data access policies
- **Real-time subscriptions** - Live data updates
- **File storage** - Secure receipt image storage

### AI Integration
- **Google Gemini AI** - Advanced language model for financial advice
- **Tesseract.js** - Client-side OCR for receipt processing
- **Smart categorization** - AI-powered expense categorization

### Additional Libraries
- **jsPDF** - PDF generation for reports
- **React Context** - State management for auth, notifications, and themes

## 🏗 Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Customizable button component
│   ├── Card.jsx        # Container component
│   ├── Input.jsx       # Form input component
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── Header.jsx      # Top navigation
│   └── ...
├── contexts/           # React Context providers
│   ├── AuthContext.jsx # Authentication state
│   ├── NotificationContext.jsx # Notification system
│   └── DarkModeContext.jsx # Theme management
├── hooks/              # Custom React hooks
│   ├── useSupabaseData.js # Database operations
│   ├── useConnectedAccounts.js # Account management
│   └── useReports.js   # Report generation
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Financial overview
│   ├── Transactions.jsx # Transaction management
│   ├── AICoach.jsx     # AI-powered financial advice
│   ├── Analytics.jsx   # Financial analytics
│   ├── Budget.jsx      # Budget management
│   ├── Goals.jsx       # Financial goals
│   ├── Reports.jsx     # Report generation
│   └── Settings.jsx    # User settings
├── utils/              # Utility functions
│   ├── calculations.js # Financial calculations
│   ├── pdfGenerator.js # PDF report generation
│   └── aiService.js    # AI service integration
└── lib/
    └── supabase.js     # Supabase client configuration
```

### Database Schema
- **user_profiles** - User account information and preferences
- **transactions** - Financial transactions (income/expenses)
- **budgets** - Budget categories and limits
- **goals** - Financial goals and progress tracking
- **receipts** - Receipt images and OCR data
- **connected_accounts** - Linked bank accounts and cards
- **notifications** - User notifications
- **reports** - Generated financial reports

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key (for AI features)

### Environment Variables
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations in Supabase
5. Start development server: `npm run dev`

### Supabase Setup
1. Create a new Supabase project
2. Run the provided SQL migrations
3. Configure authentication (Email OTP recommended)
4. Set up storage bucket for receipts
5. Configure RLS policies

### AI Setup
1. Get a Google Gemini API key from Google AI Studio
2. Add the API key to your environment variables
3. The AI coach will automatically use real-time responses

## 🎨 Design Features

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for all screen sizes
- Touch-friendly interface elements
- Optimized navigation for mobile devices

### Dark Mode
- System preference detection
- Manual theme switching
- Consistent styling across all components
- Smooth transitions between themes

### User Experience
- Intuitive navigation with clear visual hierarchy
- Loading states and error handling
- Real-time feedback and notifications
- Accessibility considerations

## 🔒 Security Features

### Authentication
- Email-based OTP authentication
- Secure session management
- Automatic profile creation
- Password-less login system

### Data Security
- Row Level Security (RLS) policies
- Encrypted data transmission
- Secure file storage
- User data isolation

### Privacy
- No third-party tracking
- Local data processing where possible
- Secure API key management
- GDPR-compliant data handling

## 📱 Key Features Breakdown

### Smart Receipt Scanner
- AI-powered OCR using Tesseract.js
- Automatic merchant detection
- Smart category prediction
- Confidence scoring
- Manual editing capabilities

### AI Financial Coach
- Real-time responses using Google Gemini
- Personalized advice based on user data
- Context-aware recommendations
- Fallback responses for offline use
- Natural language processing

### Analytics Dashboard
- Interactive charts and visualizations
- Spending pattern analysis
- Budget performance tracking
- Goal progress monitoring
- Trend identification

### Report Generation
- PDF and CSV export options
- Multiple report templates
- Date range selection
- Customizable data inclusion
- Professional formatting

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Netlify** (recommended) - Automatic deployments from Git
- **Vercel** - Optimized for React applications
- **Traditional hosting** - Static file hosting

### Performance Optimizations
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies
- CDN integration

## 🔮 Future Enhancements

### Planned Features
- Bank account integration (Plaid API)
- Investment tracking
- Tax preparation assistance
- Multi-currency support
- Family account sharing
- Advanced AI insights
- Mobile app (React Native)

### Technical Improvements
- Offline functionality
- Progressive Web App (PWA)
- Advanced caching
- Real-time collaboration
- API rate limiting
- Enhanced security measures

## 📄 License

This project is built for demonstration purposes. Please ensure you have proper licenses for all APIs and services used in production.

## 🤝 Contributing
Ahmad Raza
This is a demonstration project showcasing modern web development practices and AI integration in financial applications.


---

**Finance AI Coach** - Your Intelligent Financial Companion 🤖💰