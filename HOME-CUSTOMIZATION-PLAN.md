# 🏠 Nova Home Customization System - Implementation Plan

## ✅ Phase 1: Settings Tab Additions
### Location: `settings.html`
- [ ] Add "Customize Home" navigation item
- [ ] Create new settings section
- [ ] **Dock Position Setting:**
  - Radio buttons: Left / Right (default bottom removed)
  - Live preview showing position
  - Save to `localStorage.getItem('nova_dock_position')` → 'left', 'right', 'bottom' (default)
- [ ] **Toggle: Home Shortcuts Feature**
  - On/Off switch
  - Save to `localStorage.getItem('nova_home_shortcuts_enabled')`
  - When ON: enables right-click context menu

## 📝 Phase 2: Right-Click Context Menu
### Location: `home.html`
- [ ] Listen for `contextmenu` event on home page
- [ ] Show glassmorphism menu with:
  - "Add Game" option
  - "Add App" option
  - Smooth fade-in animation
- [ ] Position menu at cursor location
- [ ] Close on click outside

## 🎮 Phase 3: Game/App Picker Panel
### Location: `home.html`
- [ ] Create sliding panel from right
- [ ] Fetch games from zones.json
- [ ] Fetch apps from APPS array
- [ ] Show grid with icons + plus buttons
- [ ] Search bar functionality
- [ ] Track added shortcuts (max 40)
- [ ] Save to `localStorage.getItem('nova_home_shortcuts')` as JSON array

## 🏡 Phase 4: Home Shortcuts System
### Location: `home.html`
- [ ] Render shortcuts as floating icons on home page
- [ ] Grid system (5x8 = 40 max)
- [ ] Click shortcut → launch game/app
- [ ] Drag & drop to reorder
- [ ] Right-click shortcut → delete option
- [ ] Hover detection for folder creation

## 📁 Phase 5: Folder System
### Location: `home.html`
- [ ] Detect when item dragged over another
- [ ] Create folder modal
- [ ] Show folder contents in grid
- [ ] Search within folder
- [ ] Navigation (back/next if multiple pages)
- [ ] Save folder structure to localStorage

## 🎨 Design Specs
- **Glassmorphism:** `backdrop-filter: blur(40px)`, `rgba(255,255,255,0.08)`
- **Animations:** `cubic-bezier(0.4, 0, 0.2, 1)`, 0.3s
- **Colors:** White text, subtle borders
- **Max Shortcuts:** 40 total
- **Shortcuts per folder:** Unlimited

## 📦 LocalStorage Keys
```javascript
'nova_dock_position'         // 'left' | 'right' | 'bottom'
'nova_home_shortcuts_enabled' // 'true' | 'false'
'nova_home_shortcuts'        // JSON: [{ id, name, icon, url, type, position }]
'nova_home_folders'          // JSON: [{ id, name, items: [] }]
```

## ⚠️ Known Challenges
1. Drag & drop with overlays is complex
2. Folder system needs collision detection
3. Mobile touch events need separate handling
4. Performance with 40 shortcuts + animations
5. Context menu positioning near edges

## 🚀 Estimated Time
- Phase 1: 30 min
- Phase 2: 45 min  
- Phase 3: 1 hour
- Phase 4: 2 hours
- Phase 5: 1 hour
**Total: ~5 hours of coding**
