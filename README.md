# BlogHub - Modern Blog Platform

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&duration=2500&pause=800&color=22C55E&center=true&vCenter=true&width=600&lines=BlogHub;Modern+Blog+Platform;Next.js+%7C+tRPC+%7C+Drizzle+ORM+%7C+Tailwind" alt="BlogHub typing animation" />
  <br/>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,100:3b82f6&height=120&section=header&text=&fontSize=0" alt="wave banner" />
</p>

A full-stack blog platform built with Next.js App Router, tRPC, Drizzle ORM (Postgres), and a polished UI based on Radix + Tailwind. Write posts with markdown, manage categories, and publish with delightful UX.

## 🙋🙋🙋Assumptions
- Since there is no mention of author information, the dashboard will display all blogs, regardless of who created them, whether they are in draft or published status.

## Features
- **Posts**: Create, edit, publish/draft, view by slug
- **Categories**: Create, edit, delete, filter posts by categories
- **Search**: Client-side search for posts and categories
- **Dashboard**: Manage posts with status filters and actions
- **Animations**: Framer-motion powered transitions
- **Optimistic UX**: Instant UI updates with React Query + tRPC
- **Theming**: Dark mode ready via next-themes
- **Markdown Editor**
 - Assign one or more categories to posts
 - Blog listing page showing all posts
 - Individual post view page
 - Category filtering on listing page
 - Dashboard page for managing posts
 - Draft vs Published post status
 - Loading and error states
 - Mobile-responsive design
 - Full 5-section landing page (Header, Hero, Features, CTA, Footer)
 - Dark mode support
 - SEO meta tags

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4, Radix UI
- **State/Query**: @tanstack/react-query, tRPC, Zustand
- **Backend**: tRPC (Next route handler), Drizzle ORM, PostgreSQL
- **Auth**: tRPC
- **shadcn/ui**: components in `components/ui/*`
- **Misc**: framer-motion, lucide-react icons, zod, react-hook-form

## Getting Started

### Prerequisites
- Node.js 18+ (recommended LTS)
- PostgreSQL database (local, Docker, or hosted)

### Install
```bash
pnpm install # or npm install / yarn
```

### Environment
Create a `.env` file in project root:
```bash
# Database
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB

```

### Database
Using Drizzle ORM with Postgres.
- Generate SQL and migrations:
```bash
npm run db:generate
```
- Push schema to database:
```bash
npm run db:push
```
- Run migrations (programmatic):
```bash
npm run db:migrate
```
- Open Drizzle Studio:
```bash
npm run db:studio
```

### Development
```bash
npm run dev
```
Open `http://localhost:3000`.

### Build & Start
```bash
npm run build
npm run start
```

## tRPC Usage
- Server routers live in `server/routers/*`
- App router bundled in `server/routers/_app.ts`
- Client created in `lib/trpc.ts` and provided via `app/providers.tsx`
- Example query:
```tsx
const { data, isLoading } = trpc.posts.getPublished.useQuery()
```
- Invalidating/optimistic updates:
```tsx
const utils = trpc.useUtils()
utils.posts.getAll.invalidate()
// or
utils.categories.getAll.setData(undefined, (prev) => prev ? [...prev, newCategory] : [newCategory])
```

## Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "tsx server/db/migrate.ts"
}
```

## Project Structure
```text
app/
  api/trpc/[trpc]/route.ts        # tRPC HTTP handler
  blog/
    [slug]/page.tsx               # Post detail
    [slug]/edit/page.tsx          # Post editor
    new/page.tsx                  # Create post
    page.tsx                      # Blog list
  categories/page.tsx             # Category management
  dashboard/page.tsx              # Admin dashboard
  layout.tsx, page.tsx, providers.tsx, globals.css
components/
  navigation.tsx, footer.tsx, markdown-editor.tsx, landing-page.tsx
  ui/…                            # Radix-based UI primitives
lib/
  trpc.ts, store.ts, utils.ts
server/
  db/                             # Drizzle schema & migrations
    schema.ts, index.ts, migrate.ts, migrations/
  routers/                        # tRPC routers
    _app.ts, posts.ts, categories.ts
  trpc.ts                         # tRPC init
styles/
  globals.css
```

## Screenshots
- Home / Blog list
![Home](/public/screenshots/home.png)

- Post detail
![Post](/public/screenshots/post.png)

- Categories
![Categories](/public/screenshots/categories.png)

- Dashboard
![Dashboard](/public/screenshots/dashboard.png)



## Development Notes
- Uses App Router icons via `app/icon.svg` for favicon (BookOpen logo)
- Client-side search uses normalized terms and guards empty strings
- Motion lists may use a changing `key` to reset animations/state when filters change

## Roadmap
- Authentication & roles
- Image uploads for posts
- Server-side search/indexing
- Unit/integration tests

## License
MIT © 2025
