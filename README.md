# Real Estate Property Platform

A comprehensive real estate platform built with React, TypeScript, Tailwind CSS, and Supabase. Features property listings, broker management, document verification, AI recommendations, and integrated payment processing.

## 🏠 Features

### 🔐 Authentication & User Management
- **Multi-role Authentication**: Buyer, Seller, Broker, Admin roles
- **Secure Login/Signup**: Email/password and Google OAuth
- **Profile Management**: KYC verification, document uploads
- **Role-based Access Control**: Different dashboards per user type

### 🏡 Property Management
- **Property Listings**: Add, edit, view properties with rich media
- **Advanced Search & Filters**: Location, price, type, amenities
- **Property Verification**: Admin approval workflow
- **Virtual Tours**: 360° property views
- **Property Analytics**: Views, enquiries tracking

### 🤝 Broker System
- **Broker Registration**: Verification and licensing
- **Commission Management**: Automated commission calculation
- **Lead Routing**: Intelligent broker assignment
- **Performance Tracking**: Deals, ratings, reviews

### 📋 Document Verification
- **Secure Document Upload**: Property papers, identity verification
- **Payment Integration**: Stripe/Razorpay for verification fees
- **Admin Review System**: Document approval workflow
- **Digital Signatures**: Secure document signing

### 💬 Communication
- **Real-time Chat**: In-app messaging system
- **Enquiry Management**: Property interest tracking
- **Notifications**: Email/SMS alerts for important events
- **Broker Notifications**: Real-time lead alerts

### 🤖 AI-Powered Features
- **Smart Recommendations**: Property suggestions based on user preferences
- **Document Search**: AI-powered document analysis
- **Market Insights**: Price predictions and market trends
- **Chatbot Assistant**: 24/7 property guidance

### 💳 Payment Integration
- **Multiple Payment Gateways**: Stripe, Razorpay support
- **Subscription Management**: Premium features for brokers
- **Commission Processing**: Automated broker payments
- **Transaction History**: Complete payment tracking

### 📊 Admin Dashboard
- **Property Verification**: Approve/reject listings
- **User Management**: View and manage all users
- **Analytics**: Platform statistics and insights
- **Broker Management**: Verify and manage brokers
- **Payment Monitoring**: Transaction oversight

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **React Query** - Server state management

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Database-level security
- **Edge Functions** - Serverless functions
- **Real-time Subscriptions** - Live data updates

### AI & Machine Learning
- **Hugging Face Transformers** - Document analysis
- **WebGPU Support** - Browser-based AI processing
- **Embeddings** - Semantic search capabilities

### Payment Processing
- **Stripe** - International payments
- **Razorpay** - Indian market payments
- **Webhook Processing** - Secure payment verification

### Development Tools
- **Vite** - Fast development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe/Razorpay accounts (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd real-estate-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations in `supabase/migrations/`
   - Update your project configuration

4. **Configure environment variables**
   Set up the following secrets in Supabase:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   RESEND_API_KEY=your_resend_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_FROM_NUMBER=your_twilio_number
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open http://localhost:5173 in your browser

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   ├── brokers/         # Broker management
│   ├── chat/           # Messaging system
│   ├── notifications/   # Alert system
│   ├── properties/     # Property components
│   ├── ui/             # Reusable UI components
│   └── verification/   # Document verification
├── contexts/           # React contexts
├── hooks/             # Custom hooks
├── integrations/      # External service integrations
├── lib/              # Utility functions
├── pages/            # Application pages
└── main.tsx          # Application entry point

supabase/
├── functions/        # Edge functions
├── migrations/       # Database schema
└── config.toml      # Supabase configuration
```

## 🗄️ Database Schema

### Core Tables
- **profiles** - User profiles and KYC data
- **properties** - Property listings and details
- **brokers** - Broker information and verification
- **enquiries** - Property interest and leads
- **messages** - Chat and communication
- **documents** - File storage and verification
- **payments** - Transaction records

### Security Features
- Row Level Security (RLS) on all tables
- Role-based access policies
- Secure document storage
- Encrypted sensitive data

## 🔒 Security Measures

### Authentication Security
- JWT-based authentication
- Multi-factor authentication support
- Session management
- Password security requirements

### Data Protection
- Row Level Security (RLS)
- Role-based access control
- Encrypted file storage
- PII data protection

### API Security
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention

### Payment Security
- PCI DSS compliance
- Secure payment processing
- Webhook validation
- Transaction encryption

## 📱 User Roles & Permissions

### 👤 Buyer
- Browse properties
- Contact brokers
- Save searches
- View property details
- Submit enquiries

### 🏠 Seller/Owner
- List properties
- Manage listings
- View analytics
- Respond to enquiries
- Upload documents

### 🤝 Broker
- Manage assigned properties
- View leads and enquiries
- Commission tracking
- Client communication
- Performance dashboard

### 👑 Admin
- Verify properties and users
- Manage all platform content
- View analytics and reports
- Configure system settings
- Handle disputes

## 🔌 API Documentation

### Edge Functions

#### Property Management
- `POST /properties` - Create property listing
- `GET /properties/:id` - Get property details
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Remove property

#### Document Verification
- `POST /verify-documents` - Submit documents for verification
- `GET /verification-status/:id` - Check verification status
- `POST /approve-documents` - Admin approval

#### Payment Processing
- `POST /create-payment` - Process payments
- `POST /verify-payment` - Verify transactions
- `GET /payment-history` - Transaction history

#### AI Features
- `POST /ai-recommendations` - Get property recommendations
- `POST /document-analysis` - Analyze uploaded documents
- `POST /market-insights` - Market data analysis

## 🚀 Deployment

### Supabase Deployment
1. **Database Migration**
   ```bash
   supabase db push
   ```

2. **Edge Functions Deployment**
   ```bash
   supabase functions deploy
   ```

### Frontend Deployment

#### Lovable (Recommended)
1. Connect your GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy to production

#### Vercel
1. Connect GitHub repository
2. Configure build command: `npm run build`
3. Set environment variables
4. Deploy

#### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

### Environment Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key

## 📊 Analytics & Monitoring

### Built-in Analytics
- Property view tracking
- User engagement metrics
- Conversion analytics
- Revenue tracking

### Performance Monitoring
- Real-time error tracking
- Performance metrics
- User session recording
- API response times

## 🛡️ Backup & Recovery

### Database Backups
- Automated daily backups
- Point-in-time recovery
- Cross-region replication

### File Storage Backups
- Document versioning
- Secure cloud storage
- Disaster recovery plan

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic commit messages
- Maintain test coverage
- Update documentation

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core property management
- Broker system
- Document verification
- Payment integration
- AI recommendations

### Planned Features
- Mobile app (React Native)
- Advanced analytics dashboard
- Integration with more payment gateways
- Enhanced AI features
- Multi-language support

---

Built with ❤️ using React, TypeScript, Supabase, and modern web technologies.