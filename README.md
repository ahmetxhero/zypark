# ZyPark 🚗

**Smart Parking Made Simple**

ZyPark is a modern, cross-platform mobile application built with React Native and Expo that revolutionises the way people find and reserve parking spots. Whether you're looking for a quick spot in the city centre or need long-term parking, ZyPark connects you with verified parking spaces in real-time.

## ✨ Features

### 🔍 **Smart Parking Discovery**
- **Interactive Maps**: Browse available parking spots on an intuitive map interface
- **Real-time Availability**: See which spots are currently available or occupied
- **Advanced Filtering**: Filter by price, amenities, distance, and parking type
- **Location-based Search**: Find parking spots near your destination

### 📱 **Seamless User Experience**
- **Cross-platform**: Works on iOS, Android, and Web
- **Modern UI/UX**: Clean, intuitive design with smooth animations
- **Dark Mode Support**: Toggle between light and dark themes
- **Multi-language Support**: Available in 10+ languages including English, Turkish, Spanish, French, German, and more

### 🚗 **Comprehensive Parking Management**
- **Instant Booking**: Reserve parking spots with just a few taps
- **Flexible Scheduling**: Book for specific time slots
- **Hourly Pricing**: Pay only for the time you need
- **Booking History**: Track all your past and upcoming reservations

### 👤 **User Profile & Settings**
- **Profile Management**: Update personal information and vehicle details
- **Payment Methods**: Secure payment processing with multiple options
- **Notification Preferences**: Customise push notifications and alerts
- **Privacy Controls**: Manage your data and privacy settings

### 🛡️ **Security & Trust**
- **Verified Spots**: All parking spots are verified and secure
- **Secure Payments**: Industry-standard encryption for all transactions
- **User Reviews**: Rate and review parking experiences
- **24/7 Support**: Get help when you need it

## 🛠️ Technology Stack

### **Frontend**
- **React Native** (0.76.5) - Cross-platform mobile development
- **Expo** (~52.0.30) - Development platform and tools
- **Expo Router** (~4.0.17) - File-based routing system
- **TypeScript** (~5.3.3) - Type-safe JavaScript
- **React Native Reanimated** (^3.18.0) - Smooth animations

### **Backend & Database**
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Database-level security
- **Real-time subscriptions** - Live data updates

### **UI/UX Libraries**
- **Lucide React Native** (^0.447.0) - Beautiful icon library
- **Expo Linear Gradient** (^14.1.5) - Gradient backgrounds
- **React Native Safe Area Context** (4.12.0) - Safe area handling
- **React Native Gesture Handler** (^2.27.1) - Touch interactions

### **Development Tools**
- **Metro** - JavaScript bundler
- **Babel** - JavaScript compiler
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## 📱 Supported Platforms

- **iOS** (iPhone & iPad)
- **Android** (Phone & Tablet)
- **Web** (Progressive Web App)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (for iOS development)
- **Android Studio** (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmetxhero/zypark.git
   cd zypark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run on your preferred platform**
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### Building for Production

#### Web Build
```bash
npm run build:web
```

#### Mobile Builds
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## 🗄️ Database Schema

### Core Tables

#### **profiles**
- User profile information
- Preferences (language, dark mode, notifications)
- Vehicle information
- Verification status

#### **parking_spots**
- Parking spot details
- Location coordinates
- Pricing information
- Amenities and features
- Availability status

#### **reservations**
- Booking information
- Time slots
- Pricing details
- Status tracking

#### **payments**
- Payment processing
- Transaction history
- Refund management

#### **reviews**
- User ratings and feedback
- Parking spot reviews

#### **categories**
- Parking spot categories
- Icons and descriptions

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the migration files in order:
   ```bash
   supabase db reset
   ```
3. Enable Row Level Security (RLS) on all tables
4. Set up authentication policies
5. Configure storage buckets for images

### Environment Variables

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics and Monitoring
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 📁 Project Structure

```
zypark/
├── app/                    # App router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
├── supabase/              # Database migrations
└── assets/                # Static assets
```

## 🎨 Design System

### **Colours**
- **Primary**: `#2563EB` (Blue)
- **Success**: `#059669` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#DC2626` (Red)
- **Neutral**: `#1F2937` (Dark Gray)

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Weights**: Regular, Medium, SemiBold, Bold

### **Spacing**
- **Base Unit**: 4px
- **Common Spacing**: 8px, 12px, 16px, 24px, 32px

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** with Supabase Auth
- **Secure payment processing** with encrypted transactions
- **Data validation** on both client and server
- **Privacy controls** for user data management

## 🌍 Internationalisation

ZyPark supports multiple languages:
- 🇺🇸 English
- 🇹🇷 Turkish
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇯🇵 Japanese
- 🇰🇷 Korean

## 📊 Performance Optimisations

- **Lazy loading** for images and components
- **Optimised bundle size** with Metro bundler
- **Efficient state management** with React Context
- **Real-time updates** with Supabase subscriptions
- **Caching strategies** for improved performance

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Run tests (when implemented)
npm test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add TypeScript types for new features
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/ahmetxhero/zypark/wiki)
- **Issues**: [GitHub Issues](https://github.com/ahmetxhero/zypark/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ahmetxhero/zypark/discussions)
- **Email**: support@zypark.app

## 🗺️ Roadmap

### **Version 1.1** (Coming Soon)
- [ ] Push notifications for booking updates
- [ ] Advanced search filters
- [ ] Favourite parking spots
- [ ] Parking spot owner dashboard

### **Version 1.2** (Future)
- [ ] Integration with car navigation apps
- [ ] Electric vehicle charging stations
- [ ] Parking spot sharing economy
- [ ] AI-powered parking recommendations

### **Version 2.0** (Long-term)
- [ ] Augmented reality parking guidance
- [ ] Smart city integration
- [ ] Autonomous vehicle support
- [ ] Blockchain-based payments

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **Supabase** for the powerful backend infrastructure
- **React Native Community** for the excellent ecosystem
- **Contributors** who help make ZyPark better

---

**Made with ❤️ by AhmetXHero**

*Find parking. Save time. Drive happy.* 🚗✨
