# Angel One Trading Dashboard & GTT Automation Tool

A secure, responsive, and feature-rich personal web dashboard for managing Angel One trading accounts with advanced GTT (Good Till Triggered) order automation capabilities.

## 🚀 Features

### Core Functionality
- **Real-time Angel One API Integration** - Direct connection to SmartAPI
- **Secure Authentication** - 2FA with TOTP support
- **Portfolio Management** - Holdings, P&L tracking, and portfolio summary
- **GTT Order Management** - Create, monitor, and automate GTT orders
- **Multi-User Support** - Multiple user profiles and account configurations
- **Responsive Design** - Works seamlessly on desktop and mobile

### Advanced Features
- **Dark/Light Mode** - Persistent theme switching
- **Personalized Watchlist** - Custom stock lists with default presets
- **Historical Data Viewer** - Past GTT activity and portfolio snapshots
- **Real-time Updates** - Live portfolio and order status
- **Security First** - Unified server architecture with credential isolation

## 🏗️ Architecture

This application uses a **unified server model** where a single Node.js server:
- Serves the React frontend
- Acts as a secure API proxy for Angel One
- Handles all sensitive credentials server-side
- Eliminates CORS issues completely

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Angel One SmartAPI** credentials:
  - API Key
  - Client Code
  - PIN
  - TOTP Secret

## 🛠️ Installation

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd angel-one-trading-dashboard

# Install dependencies
npm install
```

### Step 2: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your Angel One credentials
nano .env
```

Fill in your `.env` file:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Angel One API Configuration
ANGEL_ONE_API_KEY=your_actual_api_key
ANGEL_ONE_CLIENT_CODE=your_actual_client_code
ANGEL_ONE_PIN=your_actual_pin
ANGEL_ONE_TOTP_SECRET=your_actual_totp_secret

# Security Configuration
SESSION_SECRET=your_random_session_secret
ENCRYPTION_KEY=your_random_encryption_key
```

### Step 3: Start the Application
```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### Step 4: Access the Dashboard
- Open your browser and navigate to `http://localhost:3000`
- Enter your Angel One credentials to login
- Start managing your portfolio and GTT orders!

## 🎯 Quick Start Guide

1. **Login**: Enter your Angel One API credentials
2. **Dashboard**: View portfolio overview and key metrics
3. **GTT Manager**: Create and monitor Good Till Triggered orders
4. **Holdings**: Detailed view of your current holdings
5. **Settings**: Configure your personalized watchlist
6. **History**: View historical trading activity

## 🔧 Available Scripts

```bash
# Start the application
npm start

# Development mode with auto-restart
npm run dev

# Install all dependencies
npm run install:all

# Build frontend (if needed)
npm run build
```

## 📱 Features Overview

### Dashboard
- **Portfolio Summary**: Current value, total investment, P&L
- **Stat Cards**: Visual representation of key metrics
- **Recent Holdings**: Quick view of top holdings
- **Real-time Updates**: Live data from Angel One API

### GTT Manager
- **Order Creation**: Easy GTT order setup
- **Order Monitoring**: Track all active GTT orders
- **Status Tracking**: Real-time order status updates
- **Bulk Operations**: Manage multiple orders efficiently

### Holdings
- **Detailed View**: Complete holdings information
- **P&L Analysis**: Profit/loss calculations
- **Performance Metrics**: Individual stock performance
- **Export Capabilities**: Download holdings data

### Settings
- **Watchlist Management**: Add/remove stocks
- **Default Watchlist**: Quick setup with popular stocks
- **Theme Preferences**: Dark/light mode settings
- **Account Configuration**: Multi-account support

## 🔒 Security Features

- **Credential Isolation**: API credentials never leave the server
- **Session Management**: Secure session handling
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Sanitized user inputs
- **HTTPS Ready**: Production-ready security

## 🚨 Troubleshooting

### Common Issues

**Login Problems**
- Verify your Angel One credentials are correct
- Ensure your TOTP secret is properly configured
- Check that your API key has the necessary permissions

**API Errors**
- Check server logs for detailed error messages
- Verify network connectivity to Angel One API
- Ensure your session hasn't expired

**Frontend Issues**
- Clear browser cache and reload
- Check browser console for JavaScript errors
- Verify all CDN resources are loading properly

### Getting Help

1. **Check Logs**: Server console and browser console
2. **Verify Credentials**: Double-check Angel One API credentials
3. **Network Issues**: Ensure server can reach Angel One API
4. **Browser Issues**: Try different browser or incognito mode

## 📈 Performance

- **Fast Loading**: Optimized bundle size and CDN resources
- **Responsive Design**: Mobile-first approach
- **Efficient API Calls**: Minimized network requests
- **Caching**: Smart caching strategies

## 🔮 Future Roadmap

### Planned Features
- [ ] Real-time price streaming
- [ ] Advanced charting and analytics
- [ ] Mobile app (React Native)
- [ ] Price alerts and notifications
- [ ] Portfolio backtesting
- [ ] Multi-exchange support

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for personal use only. Trading involves risk, and you should always do your own research before making investment decisions. The developers are not responsible for any financial losses incurred through the use of this application.

## 📞 Support

For support and questions:
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation
- Review the troubleshooting section above
- Open an issue on GitHub for bugs or feature requests

---

**Happy Trading! 📈**