# Uğur Hoca — Mathematics Platform

Türkçe | [English](README.en.md)

Uğur Hoca is a comprehensive mathematics learning platform for students. It combines test solving, assignment submission, progress tracking, gamification, and chat features.

<!-- TODO: Add homepage screenshot -->

## Features

- **Test System:** Timed tests, question analysis, confetti animations
- **Assignment Submission:** File upload, drag & drop, grading system
- **Progress Tracking:** Study sessions, charts, badges, streak system
- **Gamification:** Mini games, leaderboard, badge collection
- **Chat System:** Admin-student communication, notifications
- **PDF Export:** Test reports, progress charts downloadable as PDF
- **PWA Support:** Mobile app experience, offline functionality
- **Program Data:** LGS and YKS school/program information

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** TailwindCSS, Framer Motion
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **Deployment:** Vercel
- **Testing:** Vitest, Testing Library
- **Code Quality:** ESLint, Prettier

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Steps

```bash
# Clone the repository
git clone <repository-url>
cd ugurhoca

# Setup environment variables
cd matematik-platform
./scripts/bootstrap-env.sh   # Creates .env.local

# Edit .env.local file
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

## Deployment

### Vercel

1. Import the repository to Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (optional)
   - `ADMIN_EMAILS`
3. Deploy

### Supabase Setup

1. Create a Supabase project
2. Run migration files: `supabase/migrations/`
3. Create storage buckets
4. Apply RLS policies

## Project Structure

```
ugurhoca/
├── matematik-platform/          # Main application
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # React components
│   │   ├── features/            # Feature-based structure
│   │   ├── lib/                 # Utility functions
│   │   └── types/               # TypeScript types
│   ├── supabase/
│   │   └── migrations/          # DB migrations
│   └── public/                  # Static files
├── docs/                        # Documentation
└── package.json                 # Root package.json
```

## Development

### Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint fix
npm run format       # Prettier format
npm run test         # Run tests
npm run typecheck    # TypeScript check
```

### Code Quality

- ESLint and Prettier for auto-formatting
- TypeScript for type safety
- Vitest for unit tests
- GitHub Actions for CI/CD

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is under a private license. Unauthorized use is prohibited.

## Contact

- **Email:** admin@ugurhoca.com
- **Web:** [ugurhoca.com](https://ugurhoca.com)

## Screenshots

<!-- TODO: Add homepage screenshot -->
<!-- TODO: Add dashboard screenshot -->
<!-- TODO: Add test screen screenshot -->
<!-- TODO: Add assignment page screenshot -->
<!-- TODO: Add progress dashboard screenshot -->

## Documentation

- [Quality Plan](docs/web-kalite-ve-profesyonellik-plan.md) (Turkish)
- [GitHub CI Guide](matematik-platform/docs/GITHUB_CI.md)
- [Progress Summary](progress.md) (Turkish)
