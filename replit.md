# Overview

This is a wedding/event planning web application designed to help users organize every aspect of their event in one central dashboard. The application allows users to set up event details, track expenses and budgets, manage vendors, organize guest lists, maintain checklists, collect inspiration images, and view event timelines with calendar integration. The interface features an elegant design with calligraphic fonts throughout all text elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management and React hooks for local state
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for wedding-themed colors
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Typography**: Custom Google Fonts (Dancing Script, Great Vibes) for elegant calligraphic styling

## Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **API Design**: RESTful API with CRUD operations for users, expenses, vendors, guests, tasks, and inspirations
- **Middleware**: Custom logging middleware for API requests and error handling
- **Development**: Vite integration for hot module replacement in development mode

## Data Management
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless database provider
- **Schema**: Centralized schema definitions in shared directory with Zod validation
- **Storage Strategy**: In-memory storage interface with future database implementation capability
- **Client Storage**: localStorage for user session persistence

## Data Models
- **Users**: Profile information including event details, partner info, and budget
- **Expenses**: Budget tracking with categories and amounts
- **Vendors**: Service provider contacts and details
- **Guests**: Guest list with counts and relationships
- **Tasks**: Todo items with completion status and priorities
- **Inspirations**: Image collections with descriptions and categories

## Component Architecture
- **Modular Design**: Separate components for each major feature (Budget, Vendors, Guests, Timeline, Checklist, Inspiration)
- **Shared UI**: Comprehensive component library built on Radix UI primitives
- **Form Components**: Reusable form components with consistent validation patterns
- **Modal System**: Dialog-based interactions for data entry and management

# External Dependencies

## Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm & drizzle-kit**: Type-safe ORM and database toolkit
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI primitive components
- **react-hook-form & @hookform/resolvers**: Form management with Zod validation

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

## UI and Styling
- **Google Fonts**: Dancing Script and Great Vibes for elegant typography
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority & clsx**: Conditional CSS class management
- **tailwind-merge**: Tailwind class merging utility

## Form and Validation
- **Zod**: Schema validation for forms and API data
- **drizzle-zod**: Integration between Drizzle ORM and Zod schemas

## Additional Features
- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight React router
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel/slider functionality