# 🎨 Home Customize Guide

## Overview

The **Home Customize** tab in Nova Settings lets you completely personalize your home screen experience!

---

## 🖼️ Live Preview

At the top of the Home Customize tab, you'll see a **real-time preview** that shows exactly how your home screen will look with your chosen settings. The preview updates instantly as you make changes!

---

## 📍 Dock Position

Choose where you want your dock to appear:

### Bottom (Default)
- macOS-style bottom dock
- Horizontal layout
- Classic look

### Left Sidebar
- Vertical dock on the left edge
- Great for widescreen displays
- More screen space on bottom

### Right Sidebar
- Vertical dock on the right edge
- Alternative to left sidebar
- Keeps traditional bottom area clear

**How it works:**
- Click any position to switch
- Green checkmark shows active position
- Changes apply instantly
- Preview updates in real-time

---

## ⏰ Clock & Date Customization

### Show/Hide Clock
Toggle the clock on or off completely. Perfect if you prefer a minimal home screen.

### Clock Fonts
Choose from 6 professional fonts:
1. **Segoe UI** (Default) - Clean, modern sans-serif
2. **Arial** - Classic, highly readable
3. **Georgia** - Elegant serif font
4. **Courier** - Monospaced, technical look
5. **Impact** - Bold and strong
6. **Trebuchet** - Rounded, friendly

### Date Fonts
Choose from 4 fonts for the date:
1. **Segoe UI** (Default) - Matches clock
2. **Arial** - Classic option
3. **Georgia** - Serif elegance
4. **Verdana** - Wide, clear letters

**Preview:** The live preview shows both clock and date with your chosen fonts updating every second!

---

## 🎨 Dock Colors & Styles

### Preset Colors

**Default (Blur Glass)**
- Frosted glass effect
- White tint with blur
- Classic Nova look

**White**
- Bright, clean appearance
- 95% opacity
- Best for light themes

**Dark**
- Deep black glass
- 80% opacity with blur
- Modern, sleek look

**Transparent**
- Ultra-minimal
- Barely-there appearance
- Focus on content

### Gradient Presets

Choose from 6 beautiful gradient combinations:

1. **Purple Blue**
   - Deep purple → Bright blue
   - Modern, tech-inspired

2. **Pink Orange**
   - Hot pink → Warm orange
   - Vibrant, energetic

3. **Green Blue**
   - Emerald green → Ocean blue
   - Fresh, natural

4. **Red Purple**
   - Bold red → Deep purple
   - Dramatic, eye-catching

5. **Cyan Blue**
   - Light cyan → Rich blue
   - Cool, calming

6. **Yellow Red**
   - Bright yellow → Warm red
   - Warm, sunset-inspired

### Custom Gradient Builder

Create your own unique gradient:

1. **Pick Color 1** - Use the color picker for the first color
2. **Pick Color 2** - Choose the second color
3. **See Preview** - Gradient updates as you pick
4. **Apply** - Click "Apply Custom Gradient" to save

**Tips:**
- Try complementary colors for vibrant look
- Use similar colors for subtle effect
- Preview updates in real-time
- Your custom gradient is saved

---

## 🔄 Reset to Defaults

Changed your mind? Click **"Reset to Default Settings"** to restore everything to original Nova settings:

- Dock position: Bottom
- Clock: Visible
- Clock font: Segoe UI
- Date font: Segoe UI
- Dock color: Default blur glass
- Custom gradients: Cleared

---

## 📊 Where Changes Apply

### Home Screen Only
- Dock position changes
- Dock color/gradient
- Clock visibility
- Clock and date fonts

### Everywhere
- Settings are global
- Saved in browser localStorage
- Persist across sessions
- Sync instantly

### What's NOT Affected
- Game player docks (stay at bottom)
- Browser overlay
- Chat interface
- Settings panel

---

## 💡 Pro Tips

1. **Match Your Wallpaper**
   - Use transparent dock with busy backgrounds
   - Try white dock on dark wallpapers
   - Gradients look great on solid backgrounds

2. **Sidebar for Ultrawide**
   - Left/right sidebars great for 21:9 monitors
   - Keeps center area clear
   - More vertical screen space

3. **Fonts for Readability**
   - Segoe UI: Best all-around
   - Georgia: Elegant for larger displays
   - Courier: Unique, developer-friendly
   - Impact: Bold, high contrast

4. **Clock Visibility**
   - Hide clock for screenshots
   - Show clock for daily use
   - Toggle anytime in settings

5. **Color Coordination**
   - Match dock color to your vibe
   - Gradients add personality
   - White dock = professional
   - Transparent = minimal

---

## 🛠️ Technical Details

### Storage
All settings saved to `localStorage`:
- `nova_dock_position`: 'bottom' | 'left' | 'right'
- `nova_clock_visible`: 'true' | 'false'
- `nova_clock_font`: Font name string
- `nova_date_font`: Font name string
- `nova_dock_color`: Color/gradient ID
- `nova_dock_style`: 'preset' | 'gradient' | 'custom-gradient'
- `nova_custom_gradient`: JSON with color1, color2

### Events
Settings page emits events that home.html listens for:
- `dockPositionChanged`
- `clockVisibilityChanged`
- `clockFontChanged`
- `dateFontChanged`
- `dockColorChanged`
- `homeCustomizationReset`

### Real-Time Updates
Changes apply instantly without page refresh using the event system!

---

## 🎯 How to Access

1. Open **Nova**
2. Click **Settings** (gear icon in dock)
3. Click **"Home Customize"** in sidebar
4. Make your changes
5. See live preview
6. Enjoy your customized home!

---

## 🐛 Troubleshooting

**Changes not applying?**
- Refresh the page (Ctrl+R or F5)
- Check browser console for errors
- Make sure you clicked "Apply" for custom gradients

**Preview not updating?**
- Check if JavaScript is enabled
- Try a different browser
- Clear cache and reload

**Dock position stuck?**
- Click Reset to Default Settings
- Manually clear localStorage
- Restart browser

**Colors look different on home?**
- Some backgrounds affect appearance
- Try different wallpaper
- Adjust gradient colors

---

## 🎨 Example Setups

### Minimal Professional
- Position: Bottom
- Clock: Segoe UI, visible
- Date: Segoe UI
- Dock: White
- **Perfect for:** Work, presentations

### Gamer Setup
- Position: Left Sidebar
- Clock: Impact, visible
- Date: Trebuchet
- Dock: Red Purple gradient
- **Perfect for:** Streaming, gaming

### Developer Mode
- Position: Right Sidebar
- Clock: Courier, visible
- Date: Courier
- Dock: Dark
- **Perfect for:** Coding sessions

### Minimalist
- Position: Bottom
- Clock: Hidden
- Dock: Transparent
- **Perfect for:** Clean screenshots, focus mode

### Colorful Creator
- Position: Bottom
- Clock: Trebuchet, visible
- Date: Georgia
- Dock: Custom gradient (your colors!)
- **Perfect for:** Creative work, personal style

---

**Make Nova truly yours! 🚀✨**
