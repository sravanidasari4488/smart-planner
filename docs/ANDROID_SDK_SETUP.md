# Android SDK Setup Guide

## Prerequisites

Before setting up the Android SDK, ensure you have:
- Windows 10/11 (64-bit)
- At least 8GB RAM (16GB recommended)
- 20GB+ free disk space
- Stable internet connection

## Step 1: Install Android Studio

### Download and Install
1. **Download Android Studio**
   - Go to: https://developer.android.com/studio
   - Click "Download Android Studio"
   - Accept the terms and conditions

2. **Run the Installer**
   - Run the downloaded `.exe` file as Administrator
   - Follow the setup wizard:
     - Choose "Standard" installation type
     - Accept all license agreements
     - Let it download additional components (this may take 15-30 minutes)

3. **Complete Initial Setup**
   - Launch Android Studio
   - Complete the setup wizard
   - Choose "Standard" setup
   - Select your UI theme
   - Let it download the Android SDK

## Step 2: Configure Android SDK

### SDK Manager Setup
1. **Open SDK Manager**
   - In Android Studio: Tools → SDK Manager
   - Or click the SDK Manager icon in the toolbar

2. **Install Required SDK Platforms**
   - Go to "SDK Platforms" tab
   - Check these versions:
     - ✅ Android 14.0 (API 34) - Latest
     - ✅ Android 13.0 (API 33) - Recommended for Expo
     - ✅ Android 12.0 (API 31) - Good compatibility
   - Click "Apply" and "OK"

3. **Install SDK Tools**
   - Go to "SDK Tools" tab
   - Ensure these are checked:
     - ✅ Android SDK Build-Tools (latest version)
     - ✅ Android Emulator
     - ✅ Android SDK Platform-Tools
     - ✅ Intel x86 Emulator Accelerator (HAXM installer)
     - ✅ Google Play services
   - Click "Apply" and "OK"

### Note SDK Path
- Copy the "Android SDK Location" path (usually: `C:\Users\YourName\AppData\Local\Android\Sdk`)
- You'll need this for environment variables

## Step 3: Set Up Environment Variables

### Add to System PATH
1. **Open Environment Variables**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables" button
   - Or: Settings → System → About → Advanced system settings → Environment Variables

2. **Add ANDROID_HOME**
   - In "System Variables" section, click "New"
   - Variable name: `ANDROID_HOME`
   - Variable value: Your SDK path (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
   - Click "OK"

3. **Update PATH Variable**
   - Find "Path" in System Variables, select it, click "Edit"
   - Click "New" and add these paths:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`
     - `%ANDROID_HOME%\emulator`
   - Click "OK" on all dialogs

4. **Verify Installation**
   - Open new Command Prompt (important: new window)
   - Run: `adb version`
   - Should show ADB version info
   - Run: `emulator -list-avds` (may be empty initially)

## Step 4: Create Android Virtual Device (AVD)

### AVD Manager Setup
1. **Open AVD Manager**
   - In Android Studio: Tools → AVD Manager
   - Or click the AVD Manager icon

2. **Create Virtual Device**
   - Click "Create Virtual Device"
   - Choose device: **Pixel 6** (recommended)
   - Click "Next"

3. **Select System Image**
   - Choose **API 33** (Android 13.0)
   - If not downloaded, click "Download" next to it
   - Wait for download to complete
   - Click "Next"

4. **Configure AVD**
   - AVD Name: `Pixel_6_API_33`
   - Startup orientation: Portrait
   - Click "Advanced Settings" for more options:
     - RAM: 4096 MB (if you have 16GB+ system RAM)
     - VM heap: 512 MB
     - Internal Storage: 6000 MB
   - Click "Finish"

## Step 5: Test Your Setup

### Start Emulator
1. **Launch Emulator**
   - In AVD Manager, click ▶️ (Play) button next to your AVD
   - Wait for emulator to boot (first time takes 2-5 minutes)
   - You should see Android home screen

2. **Verify ADB Connection**
   - Open Command Prompt
   - Run: `adb devices`
   - Should show your emulator listed

### Test with Expo
1. **Navigate to Your Project**
   ```bash
   cd "C:\Users\SRAVANI\Desktop\AI smart planner\smart-planner"
   ```

2. **Build Development Build**
   ```bash
   npx expo run:android
   ```

3. **What to Expect**
   - First build takes 10-15 minutes
   - Expo will compile your app
   - App will install and launch on emulator
   - You'll have full notification functionality!

## Step 6: Using Physical Android Device (Alternative)

### Enable Developer Mode
1. **Enable Developer Options**
   - Go to Settings → About Phone
   - Find "Build Number"
   - Tap it 7 times rapidly
   - You'll see "You are now a developer!"

2. **Enable USB Debugging**
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
   - Enable "Install via USB" (if available)

3. **Connect Device**
   - Connect via USB cable
   - Allow USB debugging when prompted
   - Run: `adb devices` to verify connection

## Troubleshooting Common Issues

### Issue: "adb not found"
**Solution:**
- Restart Command Prompt after setting environment variables
- Verify ANDROID_HOME path is correct
- Check PATH variables include platform-tools

### Issue: Emulator won't start
**Solution:**
- Enable Hyper-V in Windows Features
- Or disable Hyper-V and enable Intel HAXM
- Increase RAM allocation in AVD settings
- Try creating new AVD with different API level

### Issue: "SDK location not found"
**Solution:**
- Verify Android Studio installation
- Check SDK path in Android Studio settings
- Reinstall Android Studio if necessary

### Issue: Build fails
**Solution:**
- Clear Expo cache: `npx expo start --clear`
- Delete node_modules: `rm -rf node_modules && npm install`
- Update Expo CLI: `npm install -g @expo/cli@latest`

## Performance Tips

### Optimize Emulator Performance
1. **Enable Hardware Acceleration**
   - Use Intel HAXM or Hyper-V
   - Allocate sufficient RAM (4GB+)

2. **Close Unnecessary Apps**
   - Close other heavy applications
   - Monitor system resources

3. **Use Physical Device**
   - Often faster than emulator
   - Better for testing real-world performance

## Next Steps After Setup

1. **Test Notification Features**
   - Create tasks with specific times
   - Verify notifications appear
   - Test notification permissions

2. **Test All App Features**
   - User authentication
   - Task management
   - AI suggestions
   - Data persistence

3. **Prepare for Production**
   - Test on multiple devices/API levels
   - Optimize performance
   - Configure app signing

## Quick Reference Commands

```bash
# Check ADB connection
adb devices

# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_6_API_33

# Build and run on Android
npx expo run:android

# Clear Expo cache
npx expo start --clear

# Check Android SDK path
echo %ANDROID_HOME%
```

## Support Resources

- **Android Studio Documentation**: https://developer.android.com/studio/intro
- **Expo Development Builds**: https://docs.expo.dev/develop/development-builds/introduction/
- **Android SDK Setup**: https://developer.android.com/studio/install
- **Troubleshooting**: https://docs.expo.dev/troubleshooting/

---

**Estimated Setup Time**: 1-2 hours (including downloads)
**Disk Space Required**: ~15-20 GB
**Internet Required**: Yes (for downloads)

Once setup is complete, you'll have full mobile notification functionality! 🚀