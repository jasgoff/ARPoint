# 🧭 Compass Orientation Fix - Documentation

## Problem Statement

The compass had orientation issues when the phone was held in landscape mode (back camera forward):

1. **Red triangle (North indicator)** was visible but compass wasn't aligning properly
2. **Cardinal North misalignment** - The marble compass wasn't pointing to true North
3. **Orientation mismatch** - When holding phone with back camera forward (landscape), the compass direction was showing on the right side of screen instead of the top
4. **90-degree rotation needed** - Required counter-clockwise rotation so the top of phone points in the indicated direction

## Root Cause

The device orientation API returns different values based on how the phone is held:

- **Portrait mode**: `alpha` (0-360°) represents device heading directly
- **Landscape mode (back camera forward)**: The sensor readings need a -90° offset because the device's "forward" direction is rotated 90° clockwise from portrait

## Solution Implemented

### 1. Compass Calibration Offset Setting

Added a new setting in `AppContext.js`:

```javascript
compassCalibration: -90  // Default for landscape back-camera-forward mode
```

### 2. Updated Compass Component

Modified `Compass3D.js` to accept and apply calibration offset:

```javascript
const Compass3D = ({ heading, orientation, calibrationOffset = -90 }) => {
  // Apply calibration offset and normalize
  const calibratedHeading = heading + calibrationOffset;
  const normalizedHeading = ((calibratedHeading % 360) + 360) % 360;
  
  // Compass rose rotates opposite to heading so needle points north
  const roseRotation = -normalizedHeading;
}
```

### 3. Settings UI Control

Added an interactive slider in Settings page:

- **Range**: -180° to +180° (adjustable in 15° increments)
- **Default**: -90° for landscape mode
- **Display**: Real-time offset value
- **Hints**: 
  - Landscape mode: -90° (default)
  - Portrait mode: 0°
  - Adjust if compass doesn't align

### 4. Propagated to All Views

Updated all components that use the compass:
- `ARView.js` - Passes `settings.compassCalibration` to Compass3D
- `CompassDemo.js` - Uses -90° offset for consistent behavior

## How It Works

### Compass Components

1. **Fixed Red Triangle (North Indicator)**
   - Always positioned at the top of the compass container
   - Never rotates - this is your reference point
   - When the compass rose's red "N" aligns with this triangle, you're facing North

2. **Rotating Compass Rose**
   - Contains cardinal directions (N, E, S, W)
   - Has a red north needle pointing to "N" on the rose
   - Rotates opposite to device heading (so needle appears to point north)
   - Affected by calibration offset

3. **Glass Marble & Bubble Level**
   - Tilts with device orientation (beta/gamma)
   - Independent of heading rotation
   - Bubble shows level state (green when level, yellow when tilted)

### Calibration Values Guide

| Phone Orientation | Calibration Value | Description |
|------------------|-------------------|-------------|
| **Landscape (back camera forward)** | **-90°** | Default for AR surveying with phone held horizontally |
| **Portrait (top of phone up)** | **0°** | Standard vertical phone orientation |
| **Landscape (front camera forward)** | **+90°** | Opposite of back camera forward |
| **Portrait (upside down)** | **±180°** | Phone held upside down |

### Device Sensor Mapping

```
Portrait Mode (0°):
     [Top]
      ▲ 
      N
◄ W       E ►
      S
      ▼
   [Bottom]

Landscape Mode (need -90° offset):
[Left]              [Right]
  ◄ W      N ▲      E ►
           S ▼
  [Back Camera]  [Front Camera]
```

## Testing the Fix

### Visual Verification

1. Open AR view with compass enabled
2. The **red triangle at top** = North indicator (fixed reference)
3. Rotate your device
4. The compass rose rotates, and when the red "N" aligns with the red triangle, you're facing North

### Calibration Adjustment

If compass doesn't align with actual North:

1. Go to **Settings** → **AR View** → **Compass Calibration**
2. Adjust the slider until compass aligns with actual North
3. Changes apply immediately
4. Values are saved in localStorage

### Testing with Compass Demo

Visit `/compass-demo` to see the compass in isolation:
- Auto-rotate mode to watch full 360° rotation
- Manual controls to test specific headings
- Verify North indicator alignment

## Technical Details

### Code Changes

**Files Modified:**
1. `/app/frontend/src/context/AppContext.js` - Added `compassCalibration` and `screenOrientation` settings
2. `/app/frontend/src/components/ar/Compass3D.js` - Added `calibrationOffset` prop and calibrated heading calculation
3. `/app/frontend/src/pages/ARView.js` - Pass calibration offset to Compass3D
4. `/app/frontend/src/pages/CompassDemo.js` - Added calibration offset
5. `/app/frontend/src/pages/SettingsView.js` - Added Compass Calibration slider control

### Calculation Flow

```javascript
// 1. Get raw device heading from sensor
const rawHeading = event.alpha || event.webkitCompassHeading;

// 2. Apply user's calibration offset
const calibratedHeading = rawHeading + settings.compassCalibration;

// 3. Normalize to 0-360 range
const normalizedHeading = ((calibratedHeading % 360) + 360) % 360;

// 4. Rotate compass rose opposite to heading (so needle points north)
const roseRotation = -normalizedHeading;
```

### Browser API Usage

The compass uses the **Device Orientation API**:

```javascript
window.addEventListener('deviceorientation', (event) => {
  // alpha: 0-360° (rotation around Z-axis, compass heading)
  // beta: -180 to 180° (front-to-back tilt)
  // gamma: -90 to 90° (left-to-right tilt)
});
```

## Future Enhancements

Potential improvements:

1. **Auto-detect orientation** - Automatically set calibration based on device orientation
2. **Magnetic declination** - Account for magnetic vs. true north difference based on GPS location
3. **Calibration wizard** - Step-by-step guide for users to calibrate their compass
4. **Save per-device** - Different calibrations for different devices/orientations

## Troubleshooting

### Compass not rotating
- Check if device has magnetometer sensor
- Ensure browser permissions granted for device orientation
- Try in real device (not simulator)

### Compass not aligned with actual North
- Adjust calibration offset in Settings
- Check for magnetic interference (metal objects, electronic devices)
- Move away from buildings/cars

### Red triangle and N don't align
- This is expected when not facing North
- The triangle shows where North IS
- Rotate device until red N aligns with triangle = you're facing North

## Summary

✅ **Fixed**: Compass now properly oriented for landscape mode (back camera forward)  
✅ **Added**: User-adjustable calibration offset (-180° to +180°)  
✅ **Default**: -90° offset for standard AR surveying orientation  
✅ **Visual**: Red triangle at top always shows North direction  
✅ **Settings**: Easy calibration control with helpful hints

The compass now correctly indicates North regardless of phone orientation, with user-adjustable calibration for different use cases and device sensor variations.
