# Claude AI Instructions for CucumbersFrontend

## Project Overview

This is **CucumbersFrontend** - a Next.js 16 dashboard application for managing and monitoring complaints processed by the CucumbersBackend AI agents.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives + shadcn/ui
- **Charts**: Recharts
- **State**: React useState (local state)
- **Forms**: React Hook Form + Zod

## Project Structure

```
CucumbersFrontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main entry (Dashboard)
│   └── globals.css             # Global styles
│
├── components/                 # React components
│   ├── dashboard.tsx           # Main dashboard view
│   ├── complaints-list.tsx     # Complaints list with filters
│   ├── complaint-details.tsx   # Single complaint view
│   ├── analytics.tsx           # Analytics charts
│   ├── bottom-navigation.tsx   # Mobile navigation
│   ├── theme-provider.tsx      # Dark/light mode
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (60+ components)
│
├── lib/                        # Utilities and data
│   ├── types.ts                # TypeScript types
│   ├── mock-data.ts            # Mock complaints data
│   ├── complaint-stats.ts      # Statistics calculations
│   ├── analytics-data.ts       # Analytics mock data
│   └── utils.ts                # Utility functions (cn)
│
├── hooks/                      # Custom hooks
├── public/                     # Static assets
├── styles/                     # Additional styles
│
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.mjs             # Next.js config
├── postcss.config.mjs          # PostCSS config
└── claude.md                   # This file
```

## Key Views

### Dashboard (`components/dashboard.tsx`)
- Robot status banner (online/offline)
- Key metrics: total, critical, negative percentage
- Status overview: new, in_progress, resolved
- Average resolution time
- Click any card to navigate to complaints

### Complaints List (`components/complaints-list.tsx`)
- Search by title/description
- Filter by status: all, new, in_progress, resolved
- Priority indicators (color-coded dots)
- Status badges
- Click to view details

### Complaint Details (`components/complaint-details.tsx`)
- Full complaint information
- Sentiment analysis display
- Action history timeline
- Admin response section
- Status management

### Analytics (`components/analytics.tsx`)
- Charts and graphs
- Category distribution
- Trend analysis

## Navigation

**Desktop**: Tab navigation in header
**Mobile**: Bottom navigation bar with icons

```tsx
type View = 'dashboard' | 'complaints' | 'details' | 'analytics';
```

## Type Definitions

```typescript
// lib/types.ts
export type ComplaintStatus = 'new' | 'in_progress' | 'resolved';
export type ComplaintPriority = 'critical' | 'high' | 'medium' | 'low';
export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  sentiment: SentimentType;
  sentimentScore: number;
  createdAt: string;
  robotLocation: string;
  assignedTo?: string;
  adminResponse?: string;
  resolvedAt?: string;
  actionHistory: ActionHistoryItem[];
}
```

## Design System

Design language: minimal, data-dense, monochromatic. Inspired by Linear/Vercel.

```
Palette (CSS variables, OKLCH):
- Background:   oklch(0.972 0.004 250)  — nearly white
- Card/Surface: oklch(1 0 0)            — pure white
- Foreground:   oklch(0.145 0.01 250)   — near-black
- Muted text:   oklch(0.55 0.012 250)   — gray
- Border:       oklch(0.885 0.008 250)  — subtle

Priority colors:
- Urgent: bg-red-500    (#ef4444)
- High:   bg-amber-500  (#f59e0b)
- Normal: bg-blue-500   (#3b82f6)
- Low:    bg-slate-400  (#94a3b8)

Status badge styles:
- New:        text-blue-700  / bg-blue-50  / border-blue-200
- In progress: text-amber-700 / bg-amber-50 / border-amber-200
- Resolved:   text-green-700 / bg-green-50 / border-green-200
- Rejected:   text-red-700   / bg-red-50   / border-red-200
```

Rules:
- No emoji in UI elements (use lucide-react icons only)
- No gradient text (bg-clip-text)
- No rainbow gradient cards
- No translateY hover effects — only border/shadow transitions
- Default Button = dark (bg-foreground text-background)
- Active sidebar item = bg-foreground text-background

## Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Lint
pnpm lint
```

## Integration with Backend

Currently uses mock data. To integrate with CucumbersBackend:

```typescript
// lib/api.ts
const API_BASE = 'http://localhost:8000/api/v1';

export async function fetchComplaints() {
  const response = await fetch(`${API_BASE}/cases/`);
  return response.json();
}

export async function fetchComplaint(id: string) {
  const response = await fetch(`${API_BASE}/cases/${id}`);
  return response.json();
}

export async function updateComplaint(id: string, data: Partial<Complaint>) {
  const response = await fetch(`${API_BASE}/cases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

## UI Components (shadcn/ui)

All components in `components/ui/` follow shadcn/ui patterns:
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Customizable via CSS variables
- Accessible by default

Common components used:
- `Card`, `CardHeader`, `CardContent`, `CardTitle`
- `Button`, `Badge`
- `Dialog`, `Sheet`
- `Select`, `Input`
- `Tabs`, `Table`

## Adding New Features

### New Component
```typescript
// components/my-component.tsx
'use client';

import { Card } from '@/components/ui/card';

interface MyComponentProps {
  data: SomeType;
}

export function MyComponent({ data }: MyComponentProps) {
  return (
    <Card>
      {/* Content */}
    </Card>
  );
}
```

### New View
1. Create component in `components/`
2. Add to `View` type in `app/page.tsx`
3. Add navigation handler
4. Render in conditional

### New API Integration
1. Create functions in `lib/api.ts`
2. Use with `useState` + `useEffect`
3. Consider React Query for caching

## Responsive Design

- Mobile-first approach
- Bottom navigation for mobile
- Tab navigation for desktop
- Grid layouts adapt: `grid-cols-1 md:grid-cols-3`

## State Management

Currently uses local React state:
```typescript
const [currentView, setCurrentView] = useState<View>('dashboard');
const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
```

For complex state, consider:
- Zustand (lightweight)
- TanStack Query (server state)
- Context API (shared state)

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Backend API Mapping

| Frontend | Backend Endpoint |
|----------|------------------|
| Complaints list | `GET /api/v1/cases/` |
| Complaint details | `GET /api/v1/cases/{id}` |
| Update complaint | `PATCH /api/v1/cases/{id}` |
| Statistics | `GET /api/v1/cases/stats` |
| Health check | `GET /api/v1/health` |

## Performance Tips

- Use `'use client'` only when needed
- Lazy load heavy components
- Optimize images with `next/image`
- Use React.memo for expensive renders

