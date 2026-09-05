# Uğur Hoca Mathematics Platform

[Türkçe](README.md) | English

Uğur Hoca Mathematics Platform is a modern educational application that enables students to practice mathematics, solve tests, track assignments, communicate with their teacher, and attend live classes.

The platform focuses on a clean student experience, powerful teacher management, and secure data access. Students only see their own content, results, and messages; the teacher dashboard manages tracking, evaluation, and feedback processes from a centralized interface.

![Uğur Hoca homepage desktop view](docs/screenshots/homepage-desktop.jpg)

## Highlights

- **2026 Modern Bento Design:** Apple/Linear-inspired soft multi-layered shadows, generous spacing, modern countdown widgets, and bento cards.
- **Mobile Ergonomics:** Floating mobile bottom navigation dock enabling comfortable one-handed navigation and touch gestures.
- **Spaced Repetition & Leitner Formula Cards:** 5-box classical Leitner algorithm (1d, 3d, 7d, 14d, 30d review intervals), self-rated mastery ("Needs Work" / "Mastered"), and due cards filter for long-term formula retention.
- **LGS & YKS Exam Pacing Coach & Time Breakdown:** Real-time dynamic pacing badges during tests (Optimal / Fast / Caution / Critical), "Flag & Skip" cycling tactics, and per-question post-exam time breakdown.
- **3-Tier Socratic Hint Ladder:** Pedagogical hint tiers (1. Core Rule & Formula, 2. First Operation Step, 3. Solution Strategy) paired with a Socratic questioning assistant guiding students to deduce answers independently.
- **Monthly Math Growth Report & Certificate of Achievement:** Monthly study hours, questions solved, topic mastery breakdown, teacher evaluation, and a 1-click printable A4 official Certificate of Achievement.
- **Whiteboard Math Stencils & Digital Scratchpad:** Canvas drawing tools with 1-click geometric stencils: Cartesian coordinate plane, number line, right triangle, circle, and rectangle.
- **Live Class Recordings & Timestamped Archive:** Video replay simulation for missed lessons, 1x–2x variable playback speeds, timestamped chapter navigation, and 1-click PDF export of whiteboard notes.
- **Interactive Function & Graph Laboratory:** Dynamic SVG graphing for linear functions ($y = mx + b$), quadratics ($y = ax^2 + bx + c$), and the unit circle with live sliders, vertex/root calculations, and exam takeaways.
- **Gamification (18 Original Math Games):** Educational games including Pizza Chef, Math Ninja, Mole Whack, Speed Driver, Coordinate Pirate, Number Tower, Multiplication Grid, and Space Rocket with synthetic Web Audio SFX and pseudonymous leaderboards.
- **Personal Discipline & Streak Hub:** Privacy-first daily study streak, 14-day habit heatmap, custom goal setting, and LGS/YKS target countdown timers.
- **Interactive Visual Math Proofs:** Geometric and animated SVG proofs for the Pythagorean theorem, difference of two squares, trigonometric identities ($\sin^2\theta+\cos^2\theta=1$), and Pascal's triangle / binomial expansions.
- **Smart Topic Diagnostic & Learning Prescription:** Diagnostic engine identifying error root causes (rule deficiency, calculation error, misreading, time pressure) and generating personalized 3-step action plans.
- **"Send Question to Live Class" (Student Question Desk):** Students submit difficult questions during homework; teachers project and solve them live on the digital whiteboard with a single click.
- **Progressive Web App (PWA):** Installable on desktop, Android, and iOS home screens as a native app with Web App Manifest and offline-ready service workers.
- **Power-User Keyboard Shortcuts:** Fast keyboard navigation during quizzes (A–E for options, Arrow keys / Enter for navigation, K/S for scratchpad, F/B for flags, ? for shortcut cheat-sheet).
- **Personal Data Backup & Cross-Device Transfer:** One-click encrypted `.json` export and import for streaks, solved questions, error bank, and curriculum checklists.
- **One-Click Printable A4 Worksheet Generator:** Converts any digital quiz into a two-column, formatted A4 printable exam paper with an answer key and student metadata header.

## Tech Stack

- **Application:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS, Framer Motion, Lucide React
- **Backend & Auth:** Supabase Auth, Postgres, Storage, Realtime, RLS Policies
- **Live Classes:** LiveKit
- **Email:** Resend
- **Testing & Quality:** Vitest, Testing Library, ESLint, Prettier, TypeScript
- **Deployment:** Vercel

## Project Structure

```text
ugurhoca/
├── matematik-platform/          # Main Next.js application
│   ├── src/
│   │   ├── app/                 # App Router pages and API routes
│   │   ├── components/          # Shared UI components
│   │   ├── features/            # Feature-based domain modules
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility functions and services
│   │   └── types/               # Common TypeScript definitions
│   ├── public/                  # Static assets and PWA icons
│   ├── scripts/                 # Data migration and seed scripts
│   └── supabase/migrations/     # PostgreSQL schema migrations
├── docs/                        # Project documentation
├── package.json                 # Root npm scripts runner
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Supabase project
- LiveKit account (for live classes)

### Local Development

```bash
git clone https://github.com/kuarezma/ugurhoca.git
cd ugurhoca

npm install --prefix matematik-platform
npm run setup:env
```

Configure `matematik-platform/.env.local` with your service credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
ADMIN_EXTRA_EMAILS=second-admin@ugurhoca.com
RESEND_API_KEY=your_resend_api_key_here

# Live classes
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LESSON_TEACHER_SECRET=strong_teacher_secret
LESSON_PERSIST_SIGNING_SECRET=strong_persist_secret
```

Start the development server:

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

## Commands

Run from the root directory:

```bash
npm run dev            # Development server
npm run build          # Production build
npm run start          # Production server
npm run typecheck      # TypeScript verification
npm run lint           # ESLint verification
npm run lint:fix       # ESLint autofix
npm run format         # Prettier formatting
npm run format:check   # Formatting check
npm run test           # Vitest unit & integration tests
```

## Student Privacy & Security

Database access is strictly governed by Supabase Row Level Security (RLS):

- Students cannot view or access another student's profile, messages, assignment submissions, test results, or study data.
- Teacher and administrator roles have access to administrative management consoles.
- Public leaderboards and community features display anonymized pseudonyms rather than identifying student details.

## Deployment

Recommended deployment platform is Vercel:

1. Import the repository to Vercel.
2. Set `matematik-platform` as the Root Directory.
3. Configure environment variables in Vercel settings.
4. Ensure Supabase migrations and storage buckets are configured.
5. Deploy.

## Quality Assurance

Recommended verification pipeline prior to commit or deployment:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
## Documentation

- [Quality & Excellence Plan](docs/web-kalite-ve-profesyonellik-plan.md) (Turkish)
- [GitHub CI Guide](matematik-platform/docs/GITHUB_CI.md)
- [Performance Baseline](matematik-platform/docs/PERFORMANCE_BASELINE.md)
- [Quiz Bundle Import Guide](matematik-platform/docs/QUIZ_BUNDLE_IMPORT.md)
- [Progress Summary](progress.md) (Turkish)

## Changelog

- **2026-09-05 (Leitner Spaced Repetition, Exam Pacing Coach, Monthly Growth Report, Whiteboard Tools & Replay Archive):**
  - **Spaced Repetition & Leitner Formula Cards (`FormulaFlashcardsModal`):** 5-box Leitner spaced repetition methodology integrated. Cards transition across review intervals (1d, 3d, 7d, 14d, 30d) based on mastery; "Due for Review Today" filter combats the forgetting curve.
  - **LGS & YKS Exam Pacing Coach (`QuizPacingCoach`):** Real-time per-question target time tracking with dynamic pacing badges (Optimal, Fast, Caution, Critical), "Flag & Skip" cycling tactic, and post-quiz time breakdown.
  - **3-Tier Socratic Hint Ladder (`QuestionHintLadder`):** Progressive 3-step hint ladder (Rule, First Step, Strategy) and Socratic questioning assistant guiding students toward independent deduction.
  - **Monthly Math Growth Report & Certificate of Achievement (`MonthlyReportCardModal`):** Comprehensive monthly summary of study time, questions solved, topic mastery distribution, teacher notes, and 1-click printable A4 official Certificate of Achievement.
  - **Whiteboard Geometric Math Stencils (`ScratchpadModal`):** Added Cartesian plane, number line, right triangle, circle, and rectangle geometry stencils to the live class and quiz scratchpad canvas.
  - **Live Class Recordings & Timestamped Archive (`LessonReplayArchiveModal`):** Archive for missed or reviewable live classes with 1x–2x playback controls, timestamped chapters, and downloadable board notes as PDF.
- **2026-09-04 (Digital Scratchpad, Personal Streak Hub, Visual Proofs, Smart Diagnostics & Question Pool):**
  - **In-Quiz Digital Scratchpad (`ScratchpadModal`):** Split-view scratchpad with option elimination, highlighter, ruler, squared/lined backgrounds, and PNG export.
  - **Personal Discipline & Streak Hub (`PersonalStreakHub`):** Private daily streak tracker, 14-day habit heatmap, goal setter, and exam countdowns on `/ilerleme`.
  - **Interactive Visual Math Proofs (`VisualMathProofsModal`):** Animated SVG visual proofs for Pythagorean theorem, difference of squares, trigonometric identities, and binomial expansions.
  - **Personalized Diagnostic Prescription (`SmartTopicDiagnostic`):** Error root-cause analyzer with customized 3-step remedial study recipes.
  - **Student Question Desk (`SubmitQuestionModal` & `TeacherQuestionPoolModal`):** Homework question submission to live class and teacher's 1-click blackboard projection.

## License

This project is proprietary and for private educational use. Unauthorized copying, modification, or distribution is strictly prohibited.

## Contact

- **Website:** [ugurhoca.com](https://ugurhoca.com)
- **Email:** admin@ugurhoca.com

