# Navis Docs 

**Enterprise Process Documentation & Knowledge Management Platform**

A full-stack SaaS application that centralises organisational process documentation with AI-powered search, real-time collaboration, and comprehensive audit trails.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Deployed](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

[Live Demo](https://navisdocs.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Business Problem](#business-problem)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Core Functionality](#core-functionality)
- [Installation & Setup](#installation--setup)
- [Database Schema](#database-schema)
- [AI Integration](#ai-integration)
- [Security & Compliance](#security--compliance)
- [Roadmap](#roadmap)
- [Developer](#developer)

---

## Overview

Navis Docs is a modern enterprise SaaS platform designed to solve the critical challenge of process documentation management in organisations. Built with a focus on scalability, user experience, and AI-powered intelligence, it serves as a centralised knowledge repository where teams can create, manage, version, and search their standard operating procedures (SOPs).

**Core Value Proposition:**
- Eliminates scattered documentation across multiple platforms
- Provides instant access to procedures through AI semantic search
- Ensures compliance with immutable audit trails
- Enables data-driven process improvements through analytics

---

## 🔍 Business Problem

### The Challenge

Modern enterprises face critical challenges with process documentation:

1. **Information Silos**: Documentation scattered across Google Docs, SharePoint, wikis, and email
2. **Version Control Issues**: Multiple outdated versions causing operational errors
3. **Discovery Problems**: Employees waste hours searching for the right process
4. **Compliance Risks**: Lack of audit trails for regulatory requirements
5. **Knowledge Loss**: Critical institutional knowledge leaves when employees depart
6. **Onboarding Delays**: New hires struggle to find relevant procedures

### The Solution

Navis Docs addresses these challenges through:

- **Centralized Repository**: Single source of truth for all organizational processes
- **AI-Powered Search**: Semantic search using vector embeddings (OpenAI) enables natural language queries
- **Built-in Version Control**: Track every change with automatic versioning
- **Complete Audit Trail**: Immutable logs of all actions for compliance and accountability
- **Smart Organization**: Hierarchical structure (Org → Department → Team → Process) mirrors company structure
- **Collaborative Features**: Error reporting, idea submission, and team announcements
- **Multiple Process Formats**: RAW text, sequential steps, flowcharts, and decision trees

**Target Users**: Medium to large enterprises in regulated industries (finance, healthcare, insurance, legal) requiring documented processes and compliance oversight.

---

## Key Features

### **Multi-Format Process Editor**
- **RAW**: Rich text editor powered by TipTap for flexible documentation
- **STEPS**: Linear step-by-step procedures with expandable sections
- **FLOW**: Visual flowchart builder using ReactFlow for complex workflows
- **YES/NO**: Interactive decision trees for guided troubleshooting

### **AI Chat Assistant**
- Semantic search using OpenAI embeddings (text-embedding-3-small)
- PostgreSQL pgvector for similarity matching
- Claude 3.5 Haiku for conversational responses
- Source citation with direct links to relevant processes
- Context-aware answers based on published documentation

### **Error Tracking & Management**
- In-context error reporting directly from process pages
- Status tracking (Open → Resolved → Archived)
- Analytics dashboard for identifying problematic processes
- Priority assignment and resolution workflow

### **Idea & Improvement System**
- Crowdsource improvements from team members
- Status pipeline (New → In Progress → Completed → Archived)
- Integration with process updates
- Prioritization based on frequency and impact

### **Comprehensive Audit Logging**
- Immutable record of all system actions
- Track who, what, when, and where for compliance
- Filterable by user, action type, entity, and date range
- Export capabilities for compliance reporting

### **Multi-Tenant Organization Structure**
- Role-based access control (Owner, Admin, Member)
- Hierarchical organization (Departments → Teams)
- Invitation system with email verification
- Team-specific news and announcements

### **Favorites & Personalization**
- Bookmark frequently-used processes
- Customizable dashboard
- Quick access sidebar

### **Subscription Management**
- Stripe integration for payments
- Business ($49/mo) and Enterprise ($299/mo) tiers
- Customer portal for subscription management
- Usage-based entitlements (processes, departments, teams)

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 15.5 (App Router, Server Components, Server Actions)
- **Language**: TypeScript 5
- **UI Library**: React 19.1
- **Styling**: Tailwind CSS 4, Radix UI primitives
- **State Management**: React Query (TanStack Query)
- **Rich Text Editor**: TipTap 3
- **Flow Diagrams**: ReactFlow (xyflow) with Dagre layout
- **Drag & Drop**: dnd-kit

### **Backend**
- **Runtime**: Node.js
- **Framework**: Next.js API Routes & Server Actions
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Prisma 6.16
- **Authentication**: NextAuth.js 5 (OAuth, Email OTP)
- **Background Jobs**: Inngest (for async processing)
- **Email**: Resend (transactional emails)

### **AI & Machine Learning**
- **LLM**: Claude 3.5 Haiku (Anthropic)
- **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
- **Vector Database**: PostgreSQL pgvector
- **Semantic Search**: Cosine similarity with threshold filtering

### **Infrastructure & DevOps**
- **Hosting**: Vercel (Edge Functions, ISR, SSR)
- **Database**: Supabase (managed PostgreSQL)
- **Rate Limiting**: Upstash Redis
- **Payments**: Stripe
- **CDN**: Vercel Edge Network

### **Developer Tools**
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier
- **Type Safety**: TypeScript strict mode
- **Schema Validation**: Zod
- **Version Control**: Git

---

## System Architecture

### **Application Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                    │
│  Next.js 15 App Router, React 19, TanStack Query        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  Vercel Edge Network                    │
│         Static Generation, ISR, Edge Functions          │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│               Next.js Server (Node.js)                  │
│  ┌────────────────────┐    ┌──────────────────────┐     │
│  │  Server Components │    │   API Routes & RSC   │     │
│  └────────────────────┘    └──────────────────────┘     │
│  ┌────────────────────┐    ┌──────────────────────┐     │
│  │  Server Actions    │    │   Auth Middleware    │     │
│  └────────────────────┘    └──────────────────────┘     │
└─────────────────┬───────────────────────────────────────┘
                  │
         ┌────────┴─────────┐
         │                  │
┌────────▼─────┐   ┌────────▼─────────┐
│   Supabase   │   │  External APIs   │
│  PostgreSQL  │   │ ┌──────────────┐ │
│  + pgvector  │   │ │ OpenAI       │ │
│              │   │ │ Anthropic    │ │
│  ┌────────┐  │   │ │ Stripe       │ │
│  │ Prisma │  │   │ │ Resend       │ │
│  └────────┘  │   │ │ Upstash      │ │
└──────────────┘   │ └──────────────┘ │
                   └──────────────────┘
```

### **Data Flow: AI Chat Feature**

```
User Query 
    ↓
Embedding Generation (OpenAI)
    ↓
Vector Search (pgvector)
    ↓
Retrieve Relevant Chunks
    ↓
Context Assembly
    ↓
LLM Request (Claude)
    ↓
Response with Sources
    ↓
User Interface
```

---

## ⚙️ Core Functionality

### **1. Process Management**

**Publishing Workflow:**
```
Create Process (Draft) 
    ↓
Edit Content
    ↓
Auto-save (30s debounce)
    ↓
Publish
    ↓
Generate Embeddings
    ↓
Update Audit Log
```

**Technical Implementation:**
- Server Actions for mutations
- Optimistic UI updates with React Query
- Automatic plain text extraction from TipTap JSON
- Chunking algorithm (600 char chunks with overlap)
- Batch embedding generation

### **2. AI Search Pipeline**

**Vector Similarity Search:**
```sql
SELECT * FROM match_process_chunks(
  query_embedding::vector(1536),
  similarity_threshold::float,
  match_count::int,
  team_id::text
)
```

**Implementation Details:**
- Cosine similarity threshold: 0.5
- Returns top 5 most relevant chunks
- Includes process metadata (title, teamId, processId)
- Calculates similarity score: `1 - (embedding <=> query_embedding)`

---

## 🚀 Installation & Setup

### **Prerequisites**

- Node.js 20+
- pnpm 10+
- PostgreSQL 14+ with pgvector extension
- Supabase account (or local Postgres with pgvector)
- OpenAI API key
- Anthropic API key
- Stripe account (optional, for payments)

### **1. Clone Repository**

```bash
git clone https://github.com/yourusername/navis-docs.git
cd navis-docs
```

### **2. Install Dependencies**

```bash
pnpm install
```

### **3. Environment Variables**

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/navis_docs?pgbouncer=true"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Sentry (optional)
SENTRY_DSN="https://..."
```

### **4. Database Setup**

```bash
# Enable pgvector extension in PostgreSQL
# In Supabase: Database → Extensions → Enable "vector"

# Run migrations
pnpm prisma migrate deploy

# Seed demo data
pnpm seed
```

### **5. Run Development Server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### **6. Stripe Setup (Optional)**

```bash
# Seed Stripe products
pnpm tsx src/lib/stripe/seed.ts
```

---

## 🗄️ Database Schema

### **Core Entities**

```prisma
// Simplified schema overview

Organization {
  id, name, slug, plan, ownerUserId
  departments[]
  members[]
}

Department {
  id, name, orgId
  teams[]
}

Team {
  id, name, departmentId
  processes[]
  categories[]
}

Process {
  id, title, slug, status, style
  pendingVersion, publishedVersion
  chunks[]  // For AI search
}

ProcessVersion {
  id, contentJSON, contentText
  createdBy, createdAt
}

ProcessChunk {
  id, processId, teamId, chunkText
  embedding vector(1536)  // pgvector
  chunkIndex
}

User {
  id, email, name
  memberships[]
  favorites[]
}

AuditLog {
  id, action, entityType, entityId
  actorId, orgId, beforeJSON, afterJSON
}
```

**Key Relationships:**
- Organization → Departments → Teams → Processes
- Process → ProcessVersions (1:many)
- Process → ProcessChunks (1:many, for AI search)
- User → OrgMembership → Organization (many:many)

---

## 🧠 AI Integration

### **Embedding Generation**

**Process:**
1. Extract plain text from TipTap JSON on publish
2. Chunk content (600 chars, preserving sentence boundaries)
3. Generate embeddings via OpenAI API
4. Store in PostgreSQL with pgvector

**Code:**
```typescript
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: chunkText.substring(0, 8000),
});

await prisma.$executeRaw`
  INSERT INTO "ProcessChunk" (embedding, ...)
  VALUES (${embeddingString}::vector, ...)
`;
```

### **Search Implementation**

**PostgreSQL Function:**
```sql
CREATE FUNCTION match_process_chunks(
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int,
  team_id text
) RETURNS TABLE (...)
AS $$
  SELECT *, (1 - (embedding <=> query_embedding)) as similarity
  FROM "ProcessChunk"
  WHERE "teamId" = team_id
    AND (1 - (embedding <=> query_embedding)) > similarity_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$
```

### **LLM Integration (Claude)**

```typescript
const response = await anthropic.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 1024,
  system: `Answer using ONLY the provided context...`,
  messages: [{ role: "user", content: userQuery }],
});
```

---

## 🔒 Security & Compliance

### **Authentication & Authorization**

- **Multi-factor**: Email OTP + OAuth (GitHub, Google)
- **Session Management**: JWT with HTTP-only cookies
- **RBAC**: Owner, Admin, Member roles with granular permissions
- **Row-level security**: All queries filtered by organization membership

### **Data Protection**

- **Encryption at Rest**: Supabase default (AES-256)
- **Encryption in Transit**: TLS 1.3
- **API Security**: Rate limiting (Upstash Redis)
- **Input Validation**: Zod schemas on all forms
- **XSS Protection**: React auto-escaping + DOMPurify for rich text

### **Audit & Compliance**

- **Immutable Audit Logs**: Every action logged with before/after state
- **Data Retention**: Configurable per organization
- **Export Capabilities**: CSV/JSON export for compliance reporting
- **Version History**: Complete process change history

### **Infrastructure Security**

- **HTTPS Only**: Enforced via Vercel
- **Environment Variables**: Secure storage in Vercel/Supabase
- **Database**: Connection pooling via PgBouncer
- **Error Tracking**: Sentry (no PII in logs)

---

## Developer

**Eliot Herbert-Byrnes**

Designer turned Full-Stack Software Engineer with expertise in building scalable SaaS applications using modern web technologies.

**Email**: eliott.c.h.byrnes@googlemail.com 
**GitHub**: [@eliott-herbert-byrnes](https://github.com/eliott-herbert-byrnes)

### **About This Project**

NavisDocs was built to demonstrate:

- **Full-stack proficiency**: Next.js 15 with App Router, Server Components, Server Actions
- **AI/ML integration**: Vector embeddings, semantic search, LLM integration
- **Database expertise**: Complex Prisma schemas, PostgreSQL with pgvector, query optimization
- **System design**: Multi-tenant SaaS architecture, RBAC, audit logging
- **Modern tooling**: TypeScript, TanStack Query, Tailwind CSS, Radix UI
- **DevOps**: Vercel deployment, CI/CD, environment management
- **Payment integration**: Stripe subscriptions and customer portal
- **Security**: Authentication, authorization, rate limiting, data protection

---

## License

This project is private and proprietary. All rights reserved.

---

## Acknowledgments

- Next.js team for the incredible framework
- The open-source community



