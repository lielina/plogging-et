# Plogging Ethiopia - React Vite App

This project has been converted from a Next.js application to a React Vite application.

## 🚀 Features

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Radix UI** components for accessible UI
- **Lucide React** for icons
- **Custom Theme Provider** for dark/light mode support

## 📁 Project Structure

```
plogging-ethiopia/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Radix UI components
│   │   ├── navigation.tsx  # Navigation component
│   │   └── theme-provider.tsx # Custom theme provider
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx # Main landing page
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── Events.tsx      # Events page
│   │   ├── Leaderboard.tsx # Leaderboard page
│   │   ├── Profile.tsx     # User profile
│   │   ├── Login.tsx       # Login page
│   │   ├── Welcome.tsx     # Welcome page
│   │   └── admin/          # Admin pages
│   ├── lib/                # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🛠️ Development

### Prerequisites

- **Node.js 18+** (required for Vite)
- **npm** or **yarn** or **pnpm**

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔧 Key Changes from Next.js

### 1. Routing
- **Next.js**: File-based routing with `app/` directory
- **Vite React**: Client-side routing with React Router

### 2. Navigation
- **Next.js**: `next/link` and `next/navigation`
- **Vite React**: `react-router-dom` Link and useLocation

### 3. Theme Management
- **Next.js**: `next-themes` package
- **Vite React**: Custom theme provider implementation

### 4. File Structure
- **Next.js**: `app/` directory with page components
- **Vite React**: `src/pages/` directory with React components

### 5. Configuration
- **Next.js**: `next.config.mjs`
- **Vite React**: `vite.config.ts`

## 🎨 Styling

The app uses Tailwind CSS with a custom design system:

- **Primary Color**: Green (#16a34a)
- **Secondary Colors**: Various shades of green
- **Dark Mode**: Supported via custom theme provider
- **Components**: Radix UI components with custom styling

## 📱 Pages

### Public Pages
- **Landing Page** (`/`) - Main marketing page
- **Events** (`/events`) - Upcoming plogging events
- **Leaderboard** (`/leaderboard`) - Top volunteers
- **Login** (`/login`) - User authentication

### User Pages
- **Dashboard** (`/dashboard`) - User overview
- **Profile** (`/profile`) - User settings
- **Welcome** (`/welcome`) - Onboarding

### Admin Pages
- **Admin Dashboard** (`/admin`) - Admin overview
- **Admin Events** (`/admin/events`) - Event management
- **Admin Volunteers** (`/admin/volunteers`) - Volunteer management
- **Admin Certificates** (`/admin/certificates`) - Certificate management

## 🔄 Migration Notes

### Completed
- ✅ Converted Next.js pages to React components
- ✅ Updated routing to use React Router
- ✅ Migrated navigation component
- ✅ Created custom theme provider
- ✅ Updated all imports and dependencies
- ✅ Configured Vite and TypeScript
- ✅ Set up Tailwind CSS configuration

### Known Issues
- ⚠️ Node.js version compatibility (requires Node.js 18+)
- ⚠️ Some components may need additional styling adjustments
- ⚠️ Admin pages are placeholder components

## 🚀 Next Steps

1. **Update Node.js** to version 18+ to resolve crypto issues
2. **Implement missing page content** for admin and user pages
3. **Add authentication** and user management
4. **Connect to backend API** for data management
5. **Add form handling** with react-hook-form
6. **Implement certificate generation** functionality
7. **Add proper error handling** and loading states

## 📦 Dependencies

### Core
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-router-dom` ^6.22.3
- `vite` ^5.2.0

### UI & Styling
- `tailwindcss` ^3.4.17
- `@radix-ui/*` - Various Radix UI components
- `lucide-react` ^0.454.0
- `class-variance-authority` ^0.7.1
- `clsx` ^2.1.1
- `tailwind-merge` ^2.5.5

### Forms & Validation
- `react-hook-form` ^7.54.1
- `@hookform/resolvers` ^3.9.1
- `zod` ^3.24.1

### Utilities
- `date-fns` 4.1.0
- `sonner` ^1.7.1
- `jspdf` latest

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. # plogging-et
# weyraye_landing
