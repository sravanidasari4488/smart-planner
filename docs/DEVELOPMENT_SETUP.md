# Development Setup Guide

## Current Status: Web-First Development

Your Smart Planner app is currently optimized for **web development** and works perfectly in the browser with full notification functionality.

## Testing Notifications

### ✅ Web (Recommended for Testing)
```bash
npm run web
```
- **Full notification functionality** works immediately
- Browser notifications with permission requests
- Scheduled task reminders
- Test notifications
- No additional setup required

### 📱 Mobile Development Options

#### Option 1: Continue Web Development (Recommended)
- All features work perfectly on web
- Easy testing and debugging
- No additional setup required
- Perfect for development and demonstration

#### Option 2: Set Up Android Emulator
If you want to test on Android, you'll need to set up an emulator:

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Follow the installation wizard
   - Install Android SDK and emulator

2. **Create Virtual Device**
   - Open Android Studio
   - Go to Tools → AVD Manager
   - Create Virtual Device
   - Choose a device (e.g., Pixel 6)
   - Download and select a system image (API 33+ recommended)
   - Finish setup

3. **Start Emulator**
   - Launch the emulator from AVD Manager
   - Wait for it to fully boot

4. **Run Your App**
   ```bash
   npx expo run:android
   ```

#### Option 3: Use Physical Android Device
1. **Enable Developer Options**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options

2. **Enable USB Debugging**
   - In Developer Options, enable "USB Debugging"
   - Connect device via USB
   - Allow USB debugging when prompted

3. **Run Your App**
   ```bash
   npx expo run:android
   ```

## Notification Development Notes

### Current Implementation
- **Web**: Full notification functionality with browser APIs
- **Mobile (Expo Go)**: Limited functionality with clear messaging
- **Mobile (Dev Build)**: Full functionality (requires setup)

### For Production Mobile Notifications
When ready for full mobile notification support:

1. **Create Development Build**
   ```bash
   npx expo install expo-dev-client
   npx expo run:android  # or expo run:ios
   ```

2. **Add Full Notification Support**
   ```bash
   npx expo install expo-notifications expo-device
   ```

3. **Update notification service** to use full expo-notifications API

## Recommended Development Flow

1. **Start with Web** (current setup is perfect)
   ```bash
   npm run web
   ```

2. **Test all features** in browser
   - Task creation and management
   - AI suggestions and chatbot
   - Notification scheduling and testing
   - User authentication

3. **Mobile testing** when needed
   - Set up emulator or device
   - Create development build for full functionality

## Current Features Working on Web

✅ **Task Management**
- Create, edit, delete tasks
- Task completion tracking
- Priority and category management

✅ **AI Features**
- Intelligent task suggestions
- Interactive chatbot
- Context-aware recommendations

✅ **Notifications**
- Browser notification permissions
- Scheduled task reminders
- Test notifications
- Notification settings

✅ **Authentication**
- User sign up/sign in
- Secure session management
- Profile management

✅ **Data Persistence**
- Local storage for tasks
- Completed task history
- User preferences

## Next Steps

1. **Continue web development** - everything works perfectly
2. **Test notification features** in browser
3. **Set up mobile emulator** only when needed for mobile-specific testing
4. **Create development build** when ready for production mobile features

Your app is production-ready for web deployment right now! 🚀