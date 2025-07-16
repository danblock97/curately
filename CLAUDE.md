# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "curately" built with:
- TypeScript
- Tailwind CSS v4 with CSS variables
- Supabase for backend services
- shadcn/ui components (configured with New York style)
- Lucide React icons
- Turbopack for fast development

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build the application
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── layout.tsx      # Root layout with font configuration
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles with Tailwind and CSS variables
└── lib/
    └── utils.ts        # Utility functions (cn for class merging)
```

## Key Configuration

### Styling
- Uses Tailwind CSS v4 with CSS variables for theming
- Custom theme defined in `src/app/globals.css` with light/dark mode support
- Geist Sans and Geist Mono fonts configured in layout
- shadcn/ui components configured with:
  - Style: "new-york"
  - Base color: "neutral"
  - Icon library: Lucide React

### Path Aliases
- `@/*` maps to `src/*`
- shadcn/ui component aliases:
  - `@/components` for components
  - `@/lib/utils` for utilities
  - `@/components/ui` for UI components
  - `@/lib` for library code
  - `@/hooks` for custom hooks

### TypeScript
- Strict mode enabled
- Path mapping configured for `@/*` imports
- Next.js plugin integrated

### Supabase Integration
- `@supabase/supabase-js` is available for database operations
- No specific configuration files found - connection details likely in environment variables

## Code Style

- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class names
- Import components using path aliases (`@/components`, `@/lib`, etc.)
- Use Lucide React for icons
- Follow shadcn/ui component patterns when creating new UI elements

## Testing

No test framework is currently configured. Consider adding testing setup if needed.

## Deployment

The application is configured for deployment on Vercel (standard Next.js deployment).