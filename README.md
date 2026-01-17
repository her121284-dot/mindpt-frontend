# MINDPT Frontend

Next.js web application for MINDPT AI conversation assistant.

## Features

- 🔐 JWT Authentication (Login/Register)
- 💬 ChatGPT-style UI
- 📝 Session-based conversations
- ⚡ Real-time message updates
- 🌙 Dark mode support
- 📱 Responsive design

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MINDPT Backend running at `http://localhost:8000`

## Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

## Environment Setup

The `.env.local` file is already configured:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Development

```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing Flow

### 1. Start Backend
Ensure the MINDPT Backend is running:
```bash
cd ../mindpt-backend
docker compose up -d
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Test User Flow

**A. Register & Login:**
1. Visit http://localhost:3000
2. Click "Don't have an account? Sign up"
3. Enter username, email, password
4. Click "Sign up" (auto-login after registration)

**B. Create New Chat:**
1. Click "New Chat" button in sidebar
2. A new session is created

**C. Send Messages:**
1. Type message in input box
2. Press Enter to send (Shift+Enter for new line)
3. AI response appears automatically
4. Messages are saved to the session

**D. Switch Sessions:**
1. Click any session in the sidebar
2. Previous messages load automatically

**E. Logout:**
1. Click "Logout" button at bottom of sidebar
2. Redirected to login page

## Project Structure

```
mindpt-frontend/
├── app/
│   ├── chat/
│   │   └── page.tsx          # Main chat interface
│   ├── login/
│   │   └── page.tsx          # Login/Register page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home (redirects to /chat)
├── components/
│   ├── ChatWindow.tsx        # Chat messages + input
│   ├── MessageBubble.tsx     # Individual message display
│   └── Sidebar.tsx           # Sessions list + navigation
├── lib/
│   ├── api.ts                # API client (fetch wrapper)
│   └── auth.ts               # Token management
├── .env.local                # Environment variables
└── package.json
```

## Key Features Implementation

### Authentication
- Tokens stored in `localStorage`
- Auto-redirect to `/login` if unauthenticated
- Auto-redirect to `/login` on 401 errors
- Logout clears token and redirects

### Chat Interface
- **Sidebar**: New Chat button + session list
- **Chat Window**: Message history + input
- **Message Bubbles**: User (right/blue) vs AI (left/gray)
- **Loading States**: Typing indicator during AI response
- **Optimistic UI**: User message appears immediately

### Session Management
- Create new session: `POST /sessions`
- Load sessions: `GET /sessions`
- Load messages: `GET /sessions/{id}/messages`
- Send message: `POST /ai/reply`

### Error Handling
- Network errors show bottom-right notification
- 401 errors trigger auto-logout
- Form validation on login/register
- Disabled states during loading

## API Integration

All API calls in `lib/api.ts`:
- Automatic `Authorization: Bearer <token>` header
- JSON request/response handling
- Error handling with custom `ApiError` class
- OAuth2 form data for login endpoint

## Build for Production

```bash
npm run build
npm run start
```

## Technologies

- **Framework**: Next.js 15.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **State**: React hooks (useState, useEffect)
- **Routing**: Next.js navigation
- **API**: Native fetch with custom wrapper
