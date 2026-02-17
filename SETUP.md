# Project Setup Guide

This is a Next.js 16 starter template with Clerk authentication, Drizzle ORM, and Neon PostgreSQL database, fully configured and ready to build upon.

## 🎯 What's Included

- ✅ **Next.js 16** with App Router and Turbopack
- ✅ **Clerk Authentication** - Complete auth system with sign-in/sign-up
- ✅ **Drizzle ORM** - Type-safe database access
- ✅ **Neon PostgreSQL** - Serverless Postgres database
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **shadcn/ui** - Beautiful UI components
- ✅ **Dark Mode** - Enabled by default with Poppins font
- ✅ **Security Rules** - Pre-configured cursor rules for data handling

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- A **Clerk account** ([Sign up free](https://clerk.com/))
- A **Neon database account** ([Sign up free](https://neon.tech/))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
# On Mac/Linux:
cp .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env

# On Windows (Command Prompt):
copy .env.example .env
```

### 3. Configure Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application (or use existing)
3. Navigate to **API Keys** in the sidebar
4. Copy your keys and update `.env`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

> **Note:** Make sure to use the keys that start with `pk_test_` and `sk_test_` for development.

### 4. Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project (or use existing)
3. Copy the connection string
4. Update `.env`:

```env
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> **Tip:** Use the "Pooled connection" string for better performance with serverless functions.

### 5. Initialize Database Schema

Run Drizzle to create your database tables:

```bash
npx drizzle-kit push
```

This will create the initial tables based on `src/db/schema.ts`:
- `decks` - For storing flashcard decks
- `cards` - For storing individual flashcards

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
flashycardycourse/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with Clerk provider
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── db/
│   │   ├── schema.ts           # Database schema (Drizzle)
│   │   └── index.ts            # Database connection
│   └── proxy.ts                # Clerk middleware
├── drizzle/                    # Database migrations
├── .cursor/
│   └── rules/                  # Development rules
│       ├── clerk-auth-security.mdc
│       ├── data-handling.mdc
│       └── database-drizzle.mdc
├── .env                        # Your secrets (not in git)
├── .env.example               # Template for environment variables
├── drizzle.config.ts          # Drizzle ORM configuration
└── package.json
```

## 🗃️ Database Schema

The starter includes a basic flashcard system:

### Decks Table
- `id` - Auto-incrementing primary key
- `userId` - Clerk user ID (ensures data isolation)
- `name` - Deck name
- `description` - Optional description
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Cards Table
- `id` - Auto-incrementing primary key
- `deckId` - Foreign key to decks (cascade delete)
- `front` - Front of the card
- `back` - Back of the card
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

To modify the schema, edit `src/db/schema.ts` and run `npx drizzle-kit push`.

## 🔐 Architecture & Best Practices

This template follows strict architectural patterns enforced by cursor rules:

### Data Retrieval
- ✅ **Always** fetch data in Server Components
- ❌ **Never** fetch data in Client Components
- Use `auth()` from `@clerk/nextjs/server` to get userId

### Data Mutations
- ✅ **Always** use Server Actions with `'use server'` directive
- ❌ **Never** mutate data directly in Client Components
- Create server actions in separate files

### Data Validation
- ✅ **Always** validate with Zod schemas
- ✅ **Always** use TypeScript types (infer from Zod)
- ❌ **Never** use `FormData` as parameter types

### Security
- ✅ **Always** filter database queries by `userId`
- ✅ **Always** verify ownership of resources
- ❌ **Never** trust client-provided userId values

See `.cursor/rules/*.mdc` for complete guidelines.

## 🎨 UI Components

This template uses **shadcn/ui**. To add more components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# ... etc
```

Browse available components at [ui.shadcn.com](https://ui.shadcn.com/)

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Building
npm run build        # Build for production
npm run start        # Start production server

# Database
npx drizzle-kit generate   # Generate migrations from schema
npx drizzle-kit push       # Push schema to database
npx drizzle-kit studio     # Open Drizzle Studio (database GUI)

# Type checking
npm run lint         # Run ESLint
```

## 🔧 Customization Checklist

When starting a new project from this template:

- [ ] Update `package.json` name, version, and description
- [ ] Copy `.env.example` to `.env` and add real keys
- [ ] Create new Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com/)
- [ ] Create new Neon database at [console.neon.tech](https://console.neon.tech/)
- [ ] Run `npx drizzle-kit push` to create database tables
- [ ] Update `src/app/layout.tsx` metadata (title, description)
- [ ] Customize database schema in `src/db/schema.ts` as needed
- [ ] Update this README with your project-specific information
- [ ] Remove or modify example routes/components

## 🐛 Troubleshooting

### "Publishable key not valid" Error

**Problem:** Clerk throws authentication errors.

**Solution:** 
1. Check that `.env` has real Clerk keys (not placeholders)
2. Make sure keys start with `pk_test_` and `sk_test_`
3. Restart dev server after updating `.env`

### Database Connection Errors

**Problem:** Can't connect to Neon database.

**Solution:**
1. Verify `DATABASE_URL` in `.env` is correct
2. Check that your IP is allowed in Neon project settings
3. Try using the pooled connection string
4. Ensure the database exists in your Neon project

### Middleware Errors

**Problem:** "auth() was called but Clerk can't detect middleware"

**Solution:**
1. Ensure `src/proxy.ts` exists (should be included in template)
2. Restart the dev server
3. Clear `.next` folder and rebuild: `rm -rf .next && npm run dev`

### TypeScript Errors After Schema Changes

**Problem:** Type errors after modifying database schema.

**Solution:**
1. Run `npx drizzle-kit push` to sync database
2. Restart TypeScript server in your IDE
3. Check that imports in `src/db/index.ts` are correct

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy!

> **Note:** Remember to use production Clerk keys (`pk_live_` and `sk_live_`) for production deployments.

### Other Platforms

This template works with any platform that supports Next.js:
- **Netlify** - Full support with Netlify adapter
- **Railway** - PostgreSQL and Next.js hosting
- **Fly.io** - Containerized deployment

## 💡 Next Steps

Now that your project is set up, you can:

1. **Explore the codebase** - Check out `src/app/layout.tsx` to see Clerk integration
2. **Add new pages** - Create new routes in `src/app/`
3. **Extend the schema** - Add new tables or columns in `src/db/schema.ts`
4. **Create server actions** - Build CRUD operations following the patterns in `.cursor/rules/`
5. **Add UI components** - Install shadcn components as needed
6. **Build your features** - The foundation is ready!

## 📝 License

This is a starter template - use it however you'd like!

---

**Questions or issues?** Check the troubleshooting section above or refer to the official documentation for each technology.

Happy coding! 🎉
