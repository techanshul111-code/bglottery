# Replit.md

## Overview

This is a full-stack lottery application called "Bhagya Laxmi" built with React (frontend) and Express.js (backend). The application provides a lottery system where users can place bets on various lottery categories and times throughout the day. The system includes user authentication via Replit Auth, token-based betting, and administrative features for managing results and users.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom lottery-themed design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: Express sessions stored in PostgreSQL
- **API Design**: RESTful API with role-based access control
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Session Storage**: PostgreSQL table for session persistence
- **Schema**: Normalized design with users, results, bets, and transactions tables

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OIDC
- **Sessions**: PostgreSQL-backed session storage
- **Authorization**: Role-based access (admin/user roles)
- **Security**: HTTP-only cookies, secure session handling

### Lottery System
- **Categories**: XA through XJ lottery categories
- **Time Slots**: 41 daily time slots from 9:00 AM to 9:40 PM
- **Betting**: Token-based betting system with win/loss tracking
- **Results**: Admin-managed lottery results with automatic bet resolution

### User Management
- **Token System**: Virtual token balance for betting
- **Transaction History**: Complete audit trail of token transactions
- **User Dashboard**: Betting interface, history, and balance management
- **Admin Dashboard**: User management, result entry, and system analytics

### UI/UX Design
- **Design System**: Custom lottery-themed color scheme (gold/orange gradient)
- **Responsive**: Mobile-first responsive design
- **Components**: Reusable UI components with consistent styling
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Data Flow

### User Registration/Login
1. User clicks login → Redirects to Replit Auth
2. Successful auth → Creates/updates user record
3. Session established → User redirected to appropriate dashboard

### Betting Process
1. User selects date, time, category, and bet amount
2. System validates sufficient token balance
3. Bet recorded with pending status
4. Token balance updated (deducted)
5. Transaction recorded for audit

### Result Management
1. Admin enters results for specific date/time/category
2. System identifies all pending bets for that result
3. Winning bets calculated and marked as wins
4. Winner token balances updated with winnings
5. All transactions recorded

### Data Synchronization
- Real-time updates via TanStack Query
- Optimistic updates for better UX
- Error handling with rollback mechanisms
- Cache invalidation on mutations

## External Dependencies

### Core Technologies
- **Node.js**: Runtime environment
- **PostgreSQL**: Primary database
- **Neon**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication provider

### Key Libraries
- **Frontend**: React, TanStack Query, Wouter, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js, Drizzle ORM, Passport.js, OpenID Client
- **Development**: Vite, TypeScript, ESBuild

### Third-party Services
- **Authentication**: Replit's OIDC provider
- **Database**: Neon serverless PostgreSQL
- **Deployment**: Replit hosting platform

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000 (configured in .replit)
- **Hot Reload**: Vite HMR for frontend changes
- **Database**: Environment-based DATABASE_URL

### Production Build
- **Build Process**: 
  1. Frontend: Vite builds to `dist/public`
  2. Backend: ESBuild bundles server to `dist/index.js`
- **Start Command**: `npm start`
- **Environment**: Production environment variables required

### Configuration Requirements
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Allowed domains for auth
- **ISSUER_URL**: OIDC issuer URL (defaults to Replit)

### Scaling Considerations
- **Database**: Neon serverless auto-scales
- **Sessions**: PostgreSQL-backed for horizontal scaling
- **Static Assets**: Served via Express in production
- **API Rate Limiting**: Not implemented (could be added)

## Changelog

- June 25, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.