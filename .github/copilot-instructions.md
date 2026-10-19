# Party & Gift App - Copilot Instructions

## Project Overview
Full-stack web application built with Next.js, PostgreSQL, and Stripe. Features party venue rental marketplace, gift splitting system, and club ticket integration.

## Architecture
- **Frontend**: Next.js 15+ with React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT sessions
- **Payments**: Stripe API integration
- **Styling**: Tailwind CSS for responsive UI

## Key Features Implemented
1. ✅ **Party Venue Rental** - Browse and book venues with add-ons
2. ✅ **Gift Splitting** - Create gifts, split costs, share via unique codes
3. ✅ **Guest Management** - Track contributors and their payment status
4. ✅ **Club Tickets** - Add club ticket options during gift creation
5. ✅ **User Authentication** - Email/password registration and login
6. ✅ **Payment Integration** - Stripe payment intents for contributions

## Project Structure
```
src/
├── app/
│   ├── api/                  # Backend API routes
│   │   ├── auth/             # Authentication & registration
│   │   ├── venues/           # Venue management
│   │   ├── gifts/            # Gift creation & retrieval
│   │   ├── payments/         # Stripe payment processing
│   │   └── tickets/          # Club ticket management
│   ├── (auth)/               # Auth pages (login, signup)
│   ├── (main)/               # Main app pages
│   │   ├── venues/           # Venue listing
│   │   └── gifts/            # Gift listing
│   └── page.tsx              # Home page
├── components/
│   └── ui/                   # Reusable components (Button, etc)
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   └── prisma.ts             # Prisma client
├── types/
│   └── index.ts              # TypeScript interfaces
└── prisma/
    └── schema.prisma         # Database schema
```

## Database Schema
**Key Tables:**
- `users` - User accounts
- `gifts` - Shared gift items with unique codes
- `gift_contributions` - Payments from friends toward gifts
- `venues` - Party venues for rent
- `add_ons` - Venue add-on services
- `bookings` - Venue reservations
- `club_ticket_options` - Club ticket details
- `payments` - Payment records from Stripe

## Setup Instructions

### 1. Environment Setup
```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### 2. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

## API Endpoints

### Venues
- `GET /api/venues` - Get all venues
- `POST /api/venues` - Create venue (authenticated)

### Gifts
- `GET /api/gifts?code=CODE` - Get specific gift
- `GET /api/gifts` - List all gifts
- `POST /api/gifts` - Create new gift (authenticated)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent (authenticated)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

## Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with React hooks
- Tailwind CSS for styling
- ESLint for code quality

### Adding Features
1. Update Prisma schema if needed
2. Run `npx prisma db push`
3. Create API routes in `src/app/api/`
4. Create UI components in `src/components/`
5. Create pages in `src/app/` with routing groups

### Authentication
- All protected routes check session with `getServerSession(authOptions)`
- NextAuth.js handles JWT and session management
- Passwords hashed with bcryptjs

## Next Steps & Future Features
- [ ] Implement venue detail pages with booking
- [ ] Add gift contribution/payment UI
- [ ] Build user dashboard
- [ ] Email notifications for contributions
- [ ] Real-time updates for guest lists
- [ ] Club ticket API integration
- [ ] Payment webhook handling
- [ ] Admin panel for venue management
- [ ] Analytics and reporting

## Common Tasks

### Add a New API Route
1. Create file in `src/app/api/[feature]/route.ts`
2. Import Prisma and NextAuth utilities
3. Implement GET/POST handlers
4. Add authentication checks if needed

### Add a New Database Model
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Update types in `src/types/index.ts`
4. Create API routes for CRUD operations

### Run Database Migrations
```bash
npx prisma db push
```

### View Database in Studio
```bash
npx prisma studio
```

## Troubleshooting

**NextAuth not working:**
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your environment
- Verify session strategy is set to JWT

**Prisma errors:**
- Run `npx prisma generate` if models are out of sync
- Check `DATABASE_URL` connection string
- Run `npx prisma db push` for migrations

**Stripe errors:**
- Verify API keys in `.env.local`
- Check Stripe dashboard for API key validity
- Ensure keys match your Stripe account region

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
