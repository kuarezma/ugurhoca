# Uğur Hoca Mathematics Platform

[Türkçe](README.md) | English

Uğur Hoca Mathematics Platform is a modern educational application that enables students to practice mathematics, solve tests, track assignments, communicate with their teacher, and attend live classes.

The platform centers on a clean, modern student experience, powerful pedagogical tools, and high-standard data privacy.

![Uğur Hoca homepage desktop view](docs/screenshots/homepage-desktop.jpg)

## Key Features

- **2026 Modern Bento UI:** Apple/Linear-inspired interface, responsive bento grid, and a floating mobile bottom navigation dock.
- **Live Classes & Collaboration:** LiveKit-powered interactive classrooms, screen sharing, digital whiteboard with geometric stencils, real-time polling, and timestamped replay archive.
- **Intelligent Learning & Retention:** 5-box Leitner spaced repetition formula cards, 3-tier Socratic hint ladder, and animated visual math proofs.
- **Evaluation & Exam Coaching:** Real-time per-question pacing coach for LGS and YKS, "Flag & Skip" cycling strategy, personalized diagnostic prescriptions, and 1-click printable A4 official Certificate of Achievement / monthly report card.
- **Gamification & Engagement:** 18 original educational math games, synthetic Web Audio effects, privacy-first pseudonymous leaderboards, and achievement badges.
- **Teacher Control Center:** Centralized management for quizzes, assignments, curriculum documents, announcements, and student progress tracking.
- **Cross-Platform:** Progressive Web App (PWA) support, in-exam keyboard shortcuts, and encrypted 1-click personal data backup.

## Tech Stack

- **Application:** Next.js 16 (App Router), React 19, TypeScript
- **Styling & Animation:** Tailwind CSS, Framer Motion, Lucide React
- **Data & Security:** Supabase Auth, PostgreSQL, Storage, Realtime, RLS Policies
- **Live Classes:** LiveKit WebRTC
- **Email & Notifications:** Resend
- **Testing & Quality:** Vitest, Testing Library, ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/kuarezma/ugurhoca.git
cd ugurhoca

npm install --prefix matematik-platform
npm run setup:env
```

Configure `matematik-platform/.env.local` (refer to `.env.example` for details):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Live classes
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LESSON_TEACHER_SECRET=your_teacher_secret
LESSON_PERSIST_SIGNING_SECRET=your_signing_secret
```

Start the development server:

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

## Key Commands

```bash
npm run dev            # Development server
npm run build          # Production build
npm run typecheck      # TypeScript verification
npm run lint           # ESLint verification
npm run test           # Vitest tests
```

## Privacy & Security

- **Student Data Privacy:** Enforced by Supabase Row Level Security (RLS). No student can view or access another student's profile, messages, submissions, or test results.
- **Anonymity:** Leaderboards and community spaces display pseudonyms rather than identifying personal information.
- **Administrative Isolation:** Administrative controls are guarded by strict role-based access control (RBAC).

## Release Notes

- **2026-09-05:** Leitner spaced repetition flashcards, LGS/YKS exam pacing coach, Socratic hint ladder, monthly report card and official Certificate of Achievement, whiteboard geometry stencils, live class replay archive.
- **2026-09-04:** Modern bento design, 18 educational math games, mobile ergonomics, interactive function laboratory, and visual mathematical proofs.

## License & Contact

This project is proprietary and for private educational use. Unauthorized reproduction or distribution is strictly prohibited.

- **Website:** [ugurhoca.com](https://ugurhoca.com)
