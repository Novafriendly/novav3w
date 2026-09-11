# Nova Chat Admin Panel - Complete Overhaul 🔥

## What's New

### ✨ Compact Sidebar Admin Panel
- **Small window** (850x600px) that doesn't cover the whole screen
- **Left sidebar** with animated icons that slide and glow on hover
- **Smooth animations** - panel fades and scales in/out
- **5 sections**: Dashboard, Users, Roles, Moderation, Chat Logs

### 🎨 Custom Role Creator
- **Create your own roles** with any name
- **Gradient color picker** - choose 2 colors for animated gradient
- **Live preview** - see your gradient animate before saving
- **Admin permissions toggle** - decide if role gets admin rights
- Roles saved to Firebase: `customRoles/{roleId}`

### 👑 Role System
- **Default roles**: Owner (red), Admin (purple), Mod (blue), VIP (green), Member (gray)
- **All roles have animated gradients** that move across the text
- **Custom roles** display with their gradient colors in chat
- **Role badges** on messages, profiles, and user lists

### 🔇 Mute System
- **Quick mute button** in moderation panel
- **24-hour mute duration** (auto-expires)
- **Blocks message sending** with countdown timer
- **Mute list** shows all muted users with expiration times
- Saved to Firebase: `mutes/{username}`

### 📋 Chat Logs Viewer
- **Channel selector** - view logs from any channel
- **Last 100 messages** with timestamps
- **User avatars and roles** displayed
- **Refresh button** to reload logs
- **Clean design** with scrollable container

### 👥 User Management
- **Search bar** to filter users instantly
- **Online/offline indicators** (green/red dots)
- **Role badges** on each user card
- **Quick actions**: Assign VIP, Make Mod, Ban
- Shows profile pictures and roles

### 📊 Dashboard Stats
- **Total users count**
- **Online users count** (real-time)
- **Banned users count**
- **Clean stat cards** with icons

## How to Use

### Opening Admin Panel
1. Must be **Owner** role
2. Click the **Admin button** (red gradient) in bottom left sidebar
3. Panel opens centered on screen

### Creating Custom Roles
1. Go to **Roles** tab
2. Click **"Create Custom Role"**
3. Enter role name
4. Pick 2 colors for gradient
5. Toggle admin permission if needed
6. Click **"Create Role"**
7. Role appears in role list and can be assigned to users

### Muting Users
1. Go to **Moderation** tab
2. Enter username in the input
3. Click **"Mute"** button
4. User is muted for 24 hours
5. They can't send messages until unmuted
6. View/unmute in the mute list below

### Viewing Chat Logs
1. Go to **Chat Logs** tab
2. Select channel from dropdown
3. Logs load automatically
4. Click refresh to reload

## Technical Details

### Firebase Paths
- `customRoles/{roleId}` - Custom role data
- `mutes/{username}` - Mute information
- `users/{username}` - User profiles
- `channels/{channel}/messages` - Chat messages
- `presence/{userId}` - Online status

### CSS Variables
Custom role colors loaded as CSS variables:
```css
:root {
  --custom-RoleName-1: #color1;
  --custom-RoleName-2: #color2;
}
```

### Features
- ✅ Animated gradients on all roles
- ✅ Compact sidebar panel (not full-screen)
- ✅ Custom role creation
- ✅ Gradient color picker
- ✅ Mute system with expiration
- ✅ Chat logs viewer
- ✅ User search and filtering
- ✅ Online/offline status
- ✅ Less "AI-looking" design

## Styling
- **Dark theme** (#0d1117 background)
- **Red accent** (#dc2626 → #ef4444 gradients)
- **Smooth transitions** on all interactions
- **Hover effects** that slide and glow
- **Animated gradients** everywhere
- **Clean, modern cards** with borders

This is now a proper admin panel that doesn't look generic or "AI-made" - it has custom styling, smooth animations, and all the features you wanted! 🚀
