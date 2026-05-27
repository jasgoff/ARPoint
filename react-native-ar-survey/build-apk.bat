@echo off
REM AR Survey - APK Build Script for Windows
REM This script automates the EAS build process

echo ======================================
echo 🚀 AR Survey APK Build Script
echo ======================================
echo.

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 EAS CLI not found. Installing...
    call npm install -g eas-cli
    echo ✅ EAS CLI installed
) else (
    echo ✅ EAS CLI found
)

echo.
echo ======================================
echo Step 1: Installing Dependencies
echo ======================================
call npm install
echo ✅ Dependencies installed

echo.
echo ======================================
echo Step 2: Checking EAS Authentication
echo ======================================

REM Check if logged in
eas whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 🔑 Please login to your Expo account
    echo If you don't have an account, create one at: https://expo.dev/signup
    echo.
    call eas login
) else (
    echo ✅ Already logged in to Expo
    call eas whoami
)

echo.
echo ======================================
echo Step 3: Configuring Project
echo ======================================

if not exist "eas.json" (
    echo Configuring EAS for first time...
    call eas build:configure
)
echo ✅ Project configured

echo.
echo ======================================
echo Step 4: Building APK
echo ======================================
echo ⏳ Starting build... This will take ~10-15 minutes
echo.

call eas build --platform android --profile preview

echo.
echo ======================================
echo 🎉 Build Submitted!
echo ======================================
echo.
echo Next steps:
echo 1. Wait for build to complete (~10-15 minutes)
echo 2. Check your email for the download link
echo 3. Or visit: https://expo.dev to see build status
echo.
echo The APK will be ready to download once the build completes.
echo.
pause
