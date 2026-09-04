# 🪐 TaskPlanet Inspired Social Web Application

A full-stack social feed web application designed and crafted after the reference UI, built with **React.js**, **Node.js + Express**, and **MongoDB**.

---

## 🌟 Key Features

### 1. 🔐 Authentication Flow
- **Sign Up**: Register with Full Name, Username, Email, and Password.
- **Login**: Instant login with Email/Username & Password.
- **Continue with Google**: One-click Google authentication flow.
- **Quick Demo Logins**: Instant switch between demo accounts (`Nitin Pandey`, `Demo User`).
- Stored securely in MongoDB with hashed passwords and JWT tokens.

### 2. 📝 Post Creation
- **Flexible Content**: Post text, image (URL or local upload/preview), or both. Neither is mandatory alone (at least one is required).
- **Post Types**: Switch between **All Posts** and **Promotions** (📢).
- **Polls**: Interactive poll builder matching the reference screenshot.
- **Instant Feed Update**: Newly published posts appear instantly at the top of the feed.

### 3. 📱 Public Feed & UI (Inspired by Reference Screenshot)
- **Top Header**: "Social" branding, Reward Points badge (`300 ⭐`), Wallet balance (`₹0.00`), Theme toggle (Light/Dark mode), and profile badge with 70% level indicator.
- **Search Bar**: "Search promotions, users, posts..." with instant filtering.
- **Filter Tabs**: `All Post`, `For You`, `Most Liked`, `Most Commented`, `Most Shared`.
- **Post Cards**: Author avatar, name, level & badge (`7 👑 Legend`), handle `@username`, relative timestamp, Follow button, and pin indicator.
- **Interactive Polls**: Percentage calculations, radio buttons, total votes counter, and remaining time.
- **Bottom Navigation**: `Home`, `Tasks`, `Social` (active highlight), `Leader Board`, `Chat` + Floating `+` button.

### 4. ❤️ Instant Likes & 💬 Comments
- **Instant Likes**: Heart icon toggle with live counter and "Liked by" popup modal listing user names and avatars.
- **Instant Comments**: Expandable comments section with user avatars, handles, timestamps, and real-time comment submission.
- **Only 2 Collections**: Strictly organized into `users` and `posts` MongoDB collections.

---

## 🚀 How to Run Live Web Application

### Run Single Unified Live Server:
```bash
node start.js
# Or
cd server
node index.js
```

### 🌐 Live Access URLs:
- **Local Live URL**: [http://localhost:5000](http://localhost:5000)
- **Mobile / Network Live URL**: `http://192.168.43.189:5000` *(Access directly from your mobile browser or other devices on your Wi-Fi!)*

---

## 🧪 Automated Testing
Run the automated end-to-end verification suite:
```bash
node test_e2e.js
```

---

## 📁 Project Architecture
```
Assignment 1/
├── server/
│   ├── models/
│   │   ├── User.js          # User schema (Collection 1)
│   │   └── Post.js          # Post schema with likes & comments (Collection 2)
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Signup, Login, Google OAuth routes
│   │   └── posts.js         # Feed, create, like, comment, vote routes
│   ├── services/
│   │   └── db.js            # Smart MongoDB & fallback data layer
│   ├── index.js             # Express app entry point
│   └── .env
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx         # Header with points, balance & avatar
│   │   │   ├── SearchBar.jsx      # Search promotions, users, posts
│   │   │   ├── CreatePost.jsx     # Text, image, promote, poll creation
│   │   │   ├── FeedFilterTabs.jsx # All Post, For You, Most Liked tabs
│   │   │   ├── PostCard.jsx       # Post card with badges, likes, comments, poll
│   │   │   ├── BottomNav.jsx      # Blue footer navigation & '+' floating button
│   │   │   ├── AuthModal.jsx      # Login, Sign up & Google auth modal
│   │   │   └── LikersModal.jsx    # "Liked by" user list popup
│   │   ├── services/
│   │   │   └── api.js             # Client API service
│   │   ├── App.jsx                # Main application component
│   │   ├── index.css              # Custom styling (No TailwindCSS)
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── test_e2e.js              # Complete automated test suite
├── start.js                 # Unified start runner script
└── package.json
```
