# 🚌 SSTU Chaka - Real-Time Bus Tracking System

A modern, responsive real-time web application for tracking the SSTU campus bus along its route from Panshi Restaurant to Sunamganj Science & Technology University Main Gate.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Firebase](https://img.shields.io/badge/firebase-realtime-orange.svg)

## ✨ Features

### For Students
- 📍 **Real-time Bus Tracking** - View live bus location on interactive map
- ⏱️ **Accurate ETA Calculations** - Route-aware arrival time estimates for all stops
- 🚏 **Interactive Stop Timeline** - Visual progress indicator with stop-by-stop ETAs
- 🌓 **Dark/Light Theme** - Comfortable viewing in any lighting condition
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 📢 **Live Notices** - Important announcements from drivers
- 🔄 **Multi-Bus Support** - Track multiple buses simultaneously
- 🌐 **PWA Support** - Install as native app on your device

### For Drivers/Admin
- 🎯 **GPS Tracking Controls** - Start, pause, and end trips with one click
- 📊 **Trip Statistics Dashboard** - View daily trips, hours, and distances
- 📍 **Live Location Preview** - See your current position on map
- ✉️ **Notice Management** - Publish announcements to students
- ⏰ **Schedule Configuration** - Set start and end times
- 📖 **Trip History** - Review past trips and performance
- 🔐 **Secure Authentication** - Email/password login with Firebase Auth

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/sstu-chaka.git
cd sstu-chaka
```

### 2. Configure Firebase

Follow the comprehensive **[Firebase Setup Guide](./firebase-setup.md)** to:
- Create Firebase project
- Enable Realtime Database
- Enable Authentication
- Configure security rules
- Get your Firebase credentials

### 3. Update Configuration

Edit `js/config.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};
```

### 4. Run Locally

Choose one method:

**Python:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server -p 8000
```

**VS Code Live Server:**
- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"

Access at: `http://localhost:8000`

### 5. Deploy to GitHub Pages

```bash
git add .
git commit -m "Configure Firebase"
git push origin main
```

Enable GitHub Pages in repository settings → Pages → Deploy from `main` branch

## 📱 Usage

### Student View
1. Open `https://YOUR-USERNAME.github.io/sstu-chaka/`
2. View live bus locations and ETAs
3. Select different buses from the sidebar
4. Check notices and schedule

### Driver Panel
1. Open `https://YOUR-USERNAME.github.io/sstu-chaka/login.html`
2. Register or login with your credentials
3. Click "Start Trip" to begin GPS tracking
4. Publish notices and manage schedule
5. Click "End Trip" when route is complete

## 🏗️ Project Structure

```
sstu_chaka/
├── index.html              # Student tracking page
├── admin.html              # Driver admin panel
├── login.html              # Authentication page
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
│
├── css/
│   ├── main.css           # Design system & components
│   ├── animations.css     # Micro-animations
│   └── toast.css          # Notification styles
│
 ├── js/
│   ├── config.js          # Firebase configuration
│   ├── auth.js            # Authentication module
│   ├── utils.js           # Utility functions
│   └── eta-calculator.js  # ETA calculation engine
│
├── data/
│   └── route.js           # Route coordinates & stops
│
└── assets/
    └── icons/             # App icons (add your own)
```

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **Modern CSS** - Custom design system with CSS variables
- **Vanilla JavaScript** - ES6+ modules
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Icon library

### Backend
- **Firebase Realtime Database** - Real-time data sync
- **Firebase Authentication** - User management

### Features
- **PWA** - Offline support & installability
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - System preference aware

## 🔧 Configuration

### Customize Bus Stops

Edit `data/route.js`:

```javascript
export const busStops = [
  {
    id: 'stop_1',
    name: 'Your Stop Name',
    lat: 25.069036,
    lng: 91.396317,
    icon: 'map-marker-alt',
    description: 'Description'
  },
  // Add more stops...
];
```

### Add Multiple Buses

In Firebase Console → Realtime Database:

```json
{
  "buses": {
    "bus_001": {
      "name": "SSTU Bus 1",
      "number": "101",
      "capacity": 40,
      "active": true
    },
    "bus_002": {
      "name": "SSTU Bus 2",
      "number": "102",
      "capacity": 40,
      "active": true
    }
  }
}
```

## 🔒 Security

The app uses Firebase Security Rules to protect data:

- **Public Read**: Students can view buses, tracking, and notices
- **Authenticated Write**: Only logged-in drivers can update data
- **Profile Privacy**: Drivers can only edit their own profiles
- **Admin Controls**: Admins have elevated permissions

See **[Firebase Setup Guide](./firebase-setup.md)** for complete security rules.

## 📖 Documentation

- **[Firebase Setup Guide](./firebase-setup.md)** - Complete Firebase configuration
- **[Implementation Plan](./implementation_plan.md)** - Technical architecture
- **[Task List](./task.md)** - Development checklist

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### GPS not working on mobile
- Ensure HTTPS is enabled (GitHub Pages provides this)
- Grant location permissions when prompted
- Check browser console for errors

### Firebase connection issues
- Verify `js/config.js` has correct credentials
- Check internet connection
- Review Firebase Console for service status

### Authentication failures
- Ensure Email/Password auth is enabled in Firebase
- Add your domain to Authorized domains
- Check browser console for specific error codes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Neamul09](https://github.com/Neamul09)
- Repository: [sstu_chaka](https://github.com/Neamul09/sstu_chaka)

## 🙏 Acknowledgments

- SSTU students and staff
- Firebase for backend infrastructure
- Leaflet.js for mapping capabilities
- OpenStreetMap contributors

---

**Made with ❤️ for SSTU Community**

*Last Updated: December 2023*
