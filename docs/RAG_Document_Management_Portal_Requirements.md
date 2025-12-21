# RAG Document Management Portal

**Requirements & Technical Specification Document**

*Version 1.0 — December 2024*

---

## 1. Executive Summary

### 1.1 Project Context

This document outlines the requirements for the RAG Document Management Portal, which is one component of a larger multi-tenant Retrieval-Augmented Generation (RAG) system. The complete system architecture consists of three major components:

1. **RAG Engine**: A self-hosted Ollama instance with a Python FastAPI server that handles LLM inference and retrieval operations.

2. **Ingestion Pipeline**: A background service that processes uploaded documents (including OCR for image-based PDFs), transforms them, and stores embeddings in client-specific vector stores.

3. **Document Management Portal (This Project)**: A web application where client application maintainers upload documents, configure system prompts, and generate access tokens.

### 1.2 Scope of This Document

This specification covers only **Component 3: the Document Management Portal**. The portal serves as the administrative interface for client application maintainers to manage their RAG workspaces.

---

## 2. Developer Quick Start Guide

This section provides step-by-step instructions for developers to set up and build the project.

### 2.1 Prerequisites

Ensure the following are installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Runtime environment |
| pnpm | 8+ | Package manager |
| PostgreSQL | 15+ | Database |
| Redis | 7+ | Job queue (optional for Phase 1) |
| MinIO | Latest | S3-compatible storage (optional for Phase 1) |

### 2.2 Project Setup

**Step 1: Initialize Next.js Project**

```bash
pnpm create next-app@latest rag-portal --typescript --tailwind --eslint --app --src-dir

cd rag-portal
```

**Step 2: Install Dependencies**

```bash
# Core dependencies
pnpm add iron-session zod bcrypt typeorm reflect-metadata pg

# Type definitions
pnpm add -D @types/bcrypt

# UI Components (choose one)
pnpm add @mantine/core @mantine/hooks
# OR
pnpm add tailwindcss-animate class-variance-authority clsx tailwind-merge
```

**Step 3: Configure TypeScript for TypeORM**

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  }
}
```

**Step 4: Environment Setup**

Create `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ragportal

# Iron Session (generate with: openssl rand -hex 16)
SESSION_SECRET=your-32-character-minimum-secret-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# S3 Storage (Phase 3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=rag-documents

# Redis (Phase 3)
REDIS_URL=redis://localhost:6379
```

**Step 5: Create Database**

```bash
# Connect to PostgreSQL and create database
psql -U postgres
CREATE DATABASE ragportal;
\q
```

### 2.3 Project Structure

Create the following folder structure:

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx              # Auth check wrapper
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── maintainers/
│   │   │   │   └── page.tsx
│   │   │   └── applications/
│   │   │       └── page.tsx
│   │   └── app/
│   │       └── [applicationId]/
│   │           ├── page.tsx
│   │           ├── documents/
│   │           │   └── page.tsx
│   │           ├── config/
│   │           │   └── page.tsx
│   │           └── tokens/
│   │               └── page.tsx
│   ├── layout.tsx
│   └── page.tsx                    # Redirect to /login or /dashboard
├── actions/
│   ├── auth.ts
│   ├── admin.ts
│   ├── documents.ts
│   ├── config.ts
│   └── tokens.ts
├── components/
│   ├── ui/                         # Reusable UI components
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   ├── MaintainerForm.tsx
│   │   └── ApplicationForm.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── ApplicationSwitcher.tsx
├── entities/
│   ├── index.ts
│   ├── enums.ts
│   ├── User.ts
│   ├── ClientApplication.ts
│   ├── UserApplicationAccess.ts
│   ├── AccessToken.ts
│   ├── Document.ts
│   └── JobQueue.ts
├── lib/
│   ├── session.ts                  # Iron Session config
│   ├── auth.ts                     # Auth utilities
│   ├── routeProtection.ts          # Route protection
│   ├── db.ts                       # TypeORM connection
│   └── utils.ts                    # Helper functions
└── types/
    └── index.ts                    # Shared TypeScript types
```

### 2.4 Development Phases - Detailed Tasks

#### Phase 1: Foundation (Week 1-2)

Complete these tasks in order:

**Week 1: Core Setup**

| # | Task | Files to Create/Modify | Reference Section |
|---|------|----------------------|-------------------|
| 1 | Set up project structure | Create folders as shown above | 2.3 |
| 2 | Create TypeORM entities | `src/entities/*.ts` | 5.2.2 |
| 3 | Set up database connection | `src/lib/db.ts` | 5.2.2 (data-source.ts) |
| 4 | Run initial migration | TypeORM CLI | - |
| 5 | Create session config | `src/lib/session.ts` | 5.3.1 |
| 6 | Create auth utilities | `src/lib/auth.ts` | 5.3.1 |
| 7 | Create route protection | `src/lib/routeProtection.ts` | 5.3.1 |

**Week 2: Authentication**

| # | Task | Files to Create/Modify | Reference Section |
|---|------|----------------------|-------------------|
| 8 | Create auth server actions | `src/actions/auth.ts` | 5.3.1 |
| 9 | Create login page | `src/app/(auth)/login/page.tsx` | 5.3.1 |
| 10 | Create login form component | `src/components/forms/LoginForm.tsx` | 5.3.1 |
| 11 | Create protected layout | `src/app/(protected)/layout.tsx` | - |
| 12 | Create dashboard page | `src/app/(protected)/dashboard/page.tsx` | 5.3.1 |
| 13 | Create seed script for admin user | `scripts/seed.ts` | - |
| 14 | Test login/logout flow | Manual testing | - |

**Seed Script Example:**

```typescript
// scripts/seed.ts
import bcrypt from 'bcrypt';
import { AppDataSource } from '../src/lib/db';
import { User } from '../src/entities';
import { UserRole, Status } from '../src/entities/enums';

async function seed() {
  await AppDataSource.initialize();
  
  const userRepo = AppDataSource.getRepository(User);
  
  // Create admin user
  const adminExists = await userRepo.findOne({ 
    where: { email: 'admin@example.com' } 
  });
  
  if (!adminExists) {
    const admin = userRepo.create({
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: UserRole.ADMIN,
      status: Status.ACTIVE,
    });
    await userRepo.save(admin);
    console.log('Admin user created: admin@example.com / admin123');
  }
  
  await AppDataSource.destroy();
}

seed().catch(console.error);
```

#### Phase 2: Admin Functions (Week 2-3)

| # | Task | Files to Create/Modify | Reference Section |
|---|------|----------------------|-------------------|
| 1 | Create admin server actions | `src/actions/admin.ts` | 5.3.2 |
| 2 | Create admin dashboard | `src/app/(protected)/admin/page.tsx` | 6.1 |
| 3 | Create maintainer list page | `src/app/(protected)/admin/maintainers/page.tsx` | - |
| 4 | Create maintainer form | `src/components/forms/MaintainerForm.tsx` | - |
| 5 | Create applications list page | `src/app/(protected)/admin/applications/page.tsx` | - |
| 6 | Create application form | `src/components/forms/ApplicationForm.tsx` | - |
| 7 | Create assignment UI | Component for assigning maintainers | - |
| 8 | Test all admin CRUD operations | Manual testing | - |

#### Phase 3: Document Management (Week 3-4)

| # | Task | Files to Create/Modify | Reference Section |
|---|------|----------------------|-------------------|
| 1 | Set up MinIO/S3 client | `src/lib/storage.ts` | 5.5 |
| 2 | Create document server actions | `src/actions/documents.ts` | 5.3.3 |
| 3 | Create upload API route | `src/app/api/upload/route.ts` | 5.4 |
| 4 | Create document workspace page | `src/app/(protected)/app/[applicationId]/documents/page.tsx` | - |
| 5 | Create upload zone component | `src/components/UploadZone.tsx` | 6.2.2 |
| 6 | Create document list component | `src/components/DocumentList.tsx` | 6.2.3 |
| 7 | Set up job queue | `src/lib/queue.ts` | 5.6 |
| 8 | Test upload and queue flow | Manual testing | - |

#### Phase 4: Configuration & Tokens (Week 4-5)

| # | Task | Files to Create/Modify | Reference Section |
|---|------|----------------------|-------------------|
| 1 | Create config server actions | `src/actions/config.ts` | 5.3.4 |
| 2 | Create config editor page | `src/app/(protected)/app/[applicationId]/config/page.tsx` | - |
| 3 | Create config editor component | `src/components/ConfigEditor.tsx` | 6.2.5 |
| 4 | Create token server actions | `src/actions/tokens.ts` | 5.3.5 |
| 5 | Create tokens page | `src/app/(protected)/app/[applicationId]/tokens/page.tsx` | - |
| 6 | Create token generation UI | `src/components/TokenManager.tsx` | 6.2.4 |
| 7 | Create application switcher | `src/components/layout/ApplicationSwitcher.tsx` | 6.2.1 |
| 8 | Test all token operations | Manual testing | - |

#### Phase 5: Polish & Testing (Week 5-6)

| # | Task | Description |
|---|------|-------------|
| 1 | Add loading states | Add suspense boundaries and loading UI |
| 2 | Add error boundaries | Create error.tsx files |
| 3 | Add form validation feedback | Inline error messages |
| 4 | Responsive design | Test and fix mobile layouts |
| 5 | Add toast notifications | Success/error feedback |
| 6 | Write integration tests | Test critical flows |
| 7 | Security audit | Review auth, validate inputs |
| 8 | Documentation | Update README, add comments |

### 2.5 Testing Checklist

Before marking each phase complete, verify:

**Phase 1 - Authentication:**
- [ ] Can create admin user via seed script
- [ ] Can log in with valid credentials
- [ ] Cannot log in with invalid credentials
- [ ] Cannot log in with deactivated account
- [ ] Session expires after 30 minutes of inactivity
- [ ] Logout clears session and redirects to login
- [ ] Protected routes redirect to login when not authenticated
- [ ] Admin routes redirect to dashboard for non-admin users

**Phase 2 - Admin Functions:**
- [ ] Admin can create new maintainer accounts
- [ ] Admin can deactivate maintainer accounts
- [ ] Admin can reset maintainer passwords
- [ ] Admin can create new client applications
- [ ] Admin can assign maintainers to applications
- [ ] Admin can remove maintainer assignments
- [ ] Maintainer can only see assigned applications

**Phase 3 - Documents:**
- [ ] Can upload single document
- [ ] Can upload multiple documents
- [ ] Upload rejects files over 20MB
- [ ] Upload rejects unsupported file types
- [ ] Document appears in list after upload
- [ ] Job is created in queue after upload

**Phase 4 - Config & Tokens:**
- [ ] Can view current configuration
- [ ] Can update system prompt
- [ ] Can generate new access token
- [ ] Token is displayed only once
- [ ] Can revoke active token
- [ ] Revoked token shows as revoked in list

### 2.6 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| TypeORM decorators not working | Missing tsconfig options | Add `experimentalDecorators` and `emitDecoratorMetadata` |
| Session not persisting | Cookie not being set | Check `SESSION_SECRET` is at least 32 chars |
| "Entity not found" errors | TypeORM not initialized | Ensure `AppDataSource.initialize()` is called |
| CORS errors on upload | API route misconfigured | Check Next.js API route configuration |

### 2.7 Key Code References

When implementing each feature, refer to these sections:

| Feature | Section | What to Copy |
|---------|---------|--------------|
| Session config | 5.3.1 | `src/lib/session.ts` code block |
| Auth utilities | 5.3.1 | `src/lib/auth.ts` code block |
| Login action | 5.3.1 | `signIn` function in `src/actions/auth.ts` |
| Route protection | 5.3.1 | `src/lib/routeProtection.ts` code block |
| Login form | 5.3.1 | `LoginForm.tsx` code block |
| TypeORM entities | 5.2.2 | All entity code blocks |
| Data source | 5.2.2 | `src/data-source.ts` code block |

---

## 3. System Architecture Overview

### 3.1 High-Level Architecture

The RAG system follows a multi-tenant architecture where each client application has isolated resources:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        RAG SYSTEM ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐     ┌──────────────────┐     ┌────────────────┐  │
│  │  Client App 1    │     │  Client App 2    │     │  Client App N  │  │
│  │  (uses Token A)  │     │  (uses Token B)  │     │  (uses Token N)│  │
│  └────────┬─────────┘     └────────┬─────────┘     └───────┬────────┘  │
│           │                        │                       │           │
│           └────────────────────────┼───────────────────────┘           │
│                                    │                                   │
│                                    ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    FastAPI RAG Server                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │ Token Auth  │  │ Ollama LLM  │  │ Vector Store Router     │  │  │
│  │  │ Middleware  │  │ Interface   │  │ (routes to client store)│  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│           ┌────────────────────────┼────────────────────────┐          │
│           │                        │                        │          │
│           ▼                        ▼                        ▼          │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     │
│  │ Vector Store 1 │     │ Vector Store 2 │     │ Vector Store N │     │
│  │ (Client App 1) │     │ (Client App 2) │     │ (Client App N) │     │
│  └────────────────┘     └────────────────┘     └────────────────┘     │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘

                    DOCUMENT MANAGEMENT PORTAL (THIS PROJECT)

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────────┐     ┌──────────────────────────────────────────────┐ │
│  │    Admin     │────▶│  Creates Maintainer Accounts                 │ │
│  │              │     │  Creates Client Applications                 │ │
│  │              │     │  Assigns Maintainers to Applications         │ │
│  └──────────────┘     └──────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────┐     ┌──────────────────────────────────────────────┐ │
│  │  Maintainer  │────▶│  Uploads Documents to Workspace              │ │
│  │              │     │  Configures System Prompt & Settings         │ │
│  │              │     │  Generates/Revokes Access Tokens             │ │
│  └──────────────┘     └──────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Job Queue (Redis/DB)                         │   │
│  │         Ingestion Pipeline subscribes to process docs           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Multi-Tenancy Model

Each client application operates in complete isolation with:

- Its own dedicated vector store for document embeddings
- Dedicated workspace for document uploads
- Unique system prompt and configuration
- Independent access tokens

A single maintainer may be assigned to manage multiple client applications, switching between them via the portal interface.

---

## 4. Functional Requirements

### 4.1 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Create and manage maintainer accounts, Create client applications with unique identifiers, Assign maintainers to client applications, View all applications and their status, Revoke any access token system-wide |
| **Maintainer** | Access assigned client application workspaces, Upload and manage documents within workspace, Configure system prompt and application settings, Generate and revoke access tokens, View document processing status |

### 4.2 Authentication System

#### 4.2.1 Authentication Method

The portal uses email/password authentication with credentials stored in the application database.

#### 4.2.2 Technical Implementation

- **Library**: Iron Session (encrypted cookie-based sessions)
- **Session Storage**: Cookie-only (stateless, encrypted cookie contains session data)
- **Password Storage**: bcrypt hashing with salt rounds ≥ 12
- **Session Duration**: Fixed 30 minutes from login, no refresh on activity
- **User Status Check**: On login only

#### 4.2.3 Session Lifecycle

**Login Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│  User submits credentials                                       │
│         ↓                                                       │
│  Server validates email/password against DB                     │
│         ↓                                                       │
│  Check: Is user.status === ACTIVE?                             │
│         ↓                                                       │
│  NO  → Return error "Account deactivated"                       │
│  YES → Create Iron Session cookie                               │
│        - Contains: { userId, role, expiresAt }                 │
│        - Cookie maxAge: 30 minutes                              │
│        - expiresAt: timestamp (Date.now() + 30 min)            │
│         ↓                                                       │
│  Redirect to dashboard                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Request Validation (on every protected request):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Read session from cookie                                       │
│         ↓                                                       │
│  Check: Does session exist?                                     │
│         ↓                                                       │
│  NO  → Redirect to login                                        │
│  YES → Check: Is session.expiresAt > Date.now()?               │
│         ↓                                                       │
│  NO  → Destroy session, redirect to login                       │
│  YES → Allow request (NO refresh, no sliding window)            │
└─────────────────────────────────────────────────────────────────┘
```

**Logout Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│  User clicks logout                                             │
│         ↓                                                       │
│  Destroy session (clear cookie)                                 │
│         ↓                                                       │
│  Redirect to login                                              │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.2.4 Session Data Structure

```typescript
interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'maintainer';
  expiresAt: number; // Unix timestamp
}
```

#### 4.2.5 Security Considerations

- **Encrypted cookies**: Iron Session encrypts all session data with a 32-character secret
- **No session refresh**: Fixed expiry prevents session fixation attacks
- **HttpOnly cookies**: Session cookie not accessible via JavaScript
- **Secure flag**: Cookie only sent over HTTPS in production
- **SameSite=Lax**: Prevents CSRF attacks from third-party sites

> **[TODO]** Server-side session invalidation ("logout everywhere" feature) to be implemented in a future version. Would require storing session IDs in database and validating on each request.

### 4.3 Admin Functions

#### 4.3.1 Maintainer Account Management

- Create new maintainer accounts with email and temporary password
- View list of all maintainer accounts
- Deactivate maintainer accounts (soft delete)
- Reset maintainer passwords

#### 4.3.2 Client Application Management

- Create new client applications with a unique application identifier
- Application ID format: alphanumeric, lowercase, hyphens allowed (e.g., `finance-app-prod`)
- View list of all client applications with status
- Assign one or more maintainers to a client application
- Remove maintainer assignments

### 4.4 Document Workspace

#### 4.4.1 Workspace Structure

Each client application has a flat-structure workspace. Documents are stored at the root level without folder hierarchies. The workspace contains two types of content:

1. **Documents**: PDFs and other supported files for RAG ingestion
2. **Configuration**: A single `_config.json` file containing system prompt and other settings

#### 4.4.2 Document Upload

- Drag-and-drop interface for uploading documents
- Multi-file upload support
- File size limit: 20 MB per file
- Supported formats: PDF (including image-based PDFs requiring OCR), TXT, MD, DOCX
- Upload progress indication
- Duplicate filename handling: Overwrite existing file (no versioning)

#### 4.4.3 Document List View

- Display all documents in workspace
- Show filename, file size, upload date, and processing status
- Sorting by name, date, or status
- Search/filter functionality

#### 4.4.4 Document Deletion

> **[TODO]** Document deletion functionality to be implemented in a future version. Design the data model to support soft deletes and cascade deletion to the vector store.

### 4.5 Configuration Management

#### 4.5.1 Configuration File Structure

Each workspace contains a `_config.json` file with the following schema:

```json
{
  "systemPrompt": "You are a helpful assistant...",
  "modelPreferences": {
    "temperature": 0.7,
    "maxTokens": 2048
  },
  "ragParameters": {
    "topK": 5,
    "similarityThreshold": 0.7
  }
}
```

#### 4.5.2 Configuration Editor

- Text area for system prompt with syntax highlighting
- Form fields for model preferences (temperature, max tokens)
- Form fields for RAG parameters (topK, similarity threshold)
- Validation before save
- Save action triggers config update in the job queue

> **[TODO]** Model preferences and RAG parameters are for future implementation. Initial version requires only system prompt.

### 4.6 Access Token Management

#### 4.6.1 Token Generation

- Maintainers can generate multiple access tokens per client application
- Token format: Secure random string (minimum 32 characters, URL-safe)
- Token is displayed only once upon creation (not stored in plaintext)
- Token storage: SHA-256 hash of token stored in database
- Token metadata: name/label, creation date, last used date, status

#### 4.6.2 Token Properties

| Property | Description |
|----------|-------------|
| Name/Label | User-defined identifier (e.g., 'Production Server', 'Dev Environment') |
| Expiration | Optional expiration date; null means no expiration |
| Status | Active or Revoked |
| Permissions | Standard access (v1); extensible for future granular permissions |

#### 4.6.3 Token Revocation

- Maintainers can revoke tokens for their assigned applications
- Admins can revoke any token system-wide
- Revocation is immediate and permanent
- Revoked tokens cannot be reactivated

> **[TODO]** Rate limiting per token to be implemented in a future version. Design schema to support rate limit configuration per token.

### 4.7 Processing Status

> **[TODO]** Document processing status display to be implemented in a future version. Design the job queue schema to support status tracking and webhook callbacks from the ingestion pipeline.

Future implementation should display: Queued, Processing, Indexed, Failed statuses with timestamp and error messages for failed documents.

---

## 5. Technical Specification

### 5.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Runtime | Node.js 20+ |
| Authentication | Iron Session |
| Database | PostgreSQL 15+ |
| ORM | TypeORM |
| File Storage | S3-compatible storage (MinIO for self-hosted) |
| Job Queue | Redis or PostgreSQL-based queue (pg-boss) |
| UI Components | Mantine 8 |
| Validation | Zod |

### 5.2 Data Model

#### 5.2.1 Entity Relationship

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    User         │       │ ClientApplication│       │   AccessToken   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id              │       │ id               │       │ id              │
│ email           │       │ application_id   │◄──────│ application_id  │
│ password_hash   │       │ name             │       │ token_hash      │
│ role            │       │ created_at       │       │ name            │
│ created_at      │       │ updated_at       │       │ expires_at      │
│ updated_at      │       │ status           │       │ status          │
│ status          │       └──────────────────┘       │ created_at      │
└─────────────────┘              │                   │ last_used_at    │
      │                          │                   └─────────────────┘
      │                          │
      │    ┌─────────────────────┴────────────────┐
      │    │      user_application_access         │
      │    ├──────────────────────────────────────┤
      └────│ user_id                              │
           │ application_id                       │
           │ assigned_at                          │
           └──────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    Document     │       │    JobQueue     │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ application_id  │       │ application_id  │
│ filename        │       │ document_id     │
│ storage_path    │       │ job_type        │
│ file_size       │       │ status          │
│ mime_type       │       │ payload         │
│ uploaded_at     │       │ created_at      │
│ uploaded_by     │       │ processed_at    │
│ status          │       │ error_message   │
│ deleted_at      │       └─────────────────┘
└─────────────────┘
```

#### 5.2.2 Schema Definitions (TypeORM)

```typescript
// src/entities/enums.ts

export enum UserRole {
  ADMIN = 'admin',
  MAINTAINER = 'maintainer',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TokenStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  INDEXED = 'indexed',
  FAILED = 'failed',
  DELETED = 'deleted',
}

export enum JobType {
  DOCUMENT_INGEST = 'document_ingest',
  DOCUMENT_DELETE = 'document_delete',
  CONFIG_UPDATE = 'config_update',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

```typescript
// src/entities/User.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole, Status } from './enums';
import { UserApplicationAccess } from './UserApplicationAccess';
import { Document } from './Document';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.MAINTAINER })
  role: UserRole;

  @Column({ name: 'status', type: 'enum', enum: Status, default: Status.ACTIVE })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserApplicationAccess, (access) => access.user)
  applications: UserApplicationAccess[];

  @OneToMany(() => Document, (doc) => doc.uploader)
  documents: Document[];
}
```

```typescript
// src/entities/ClientApplication.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Status } from './enums';
import { UserApplicationAccess } from './UserApplicationAccess';
import { Document } from './Document';
import { AccessToken } from './AccessToken';
import { JobQueue } from './JobQueue';

@Entity('client_applications')
export class ClientApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', unique: true })
  applicationId: string;

  @Column()
  name: string;

  @Column({ name: 'status', type: 'enum', enum: Status, default: Status.ACTIVE })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserApplicationAccess, (access) => access.application)
  maintainers: UserApplicationAccess[];

  @OneToMany(() => Document, (doc) => doc.application)
  documents: Document[];

  @OneToMany(() => AccessToken, (token) => token.application)
  tokens: AccessToken[];

  @OneToMany(() => JobQueue, (job) => job.application)
  jobs: JobQueue[];
}
```

```typescript
// src/entities/UserApplicationAccess.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User';
import { ClientApplication } from './ClientApplication';

@Entity('user_application_access')
@Unique(['user_id', 'application_id'])
export class UserApplicationAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ClientApplication, (app) => app.maintainers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: ClientApplication;
}
```

```typescript
// src/entities/AccessToken.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TokenStatus } from './enums';
import { ClientApplication } from './ClientApplication';

@Entity('access_tokens')
export class AccessToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @Column({ name: 'token_hash', unique: true })
  tokenHash: string;

  @Column()
  name: string;

  @Column({ name: 'status', type: 'enum', enum: TokenStatus, default: TokenStatus.ACTIVE })
  status: TokenStatus;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @ManyToOne(() => ClientApplication, (app) => app.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: ClientApplication;
}
```

```typescript
// src/entities/Document.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { DocumentStatus } from './enums';
import { ClientApplication } from './ClientApplication';
import { User } from './User';
import { JobQueue } from './JobQueue';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @Column()
  filename: string;

  @Column({ name: 'storage_path' })
  storagePath: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'status', type: 'enum', enum: DocumentStatus, default: DocumentStatus.UPLOADED })
  status: DocumentStatus;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => ClientApplication, (app) => app.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: ClientApplication;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @OneToMany(() => JobQueue, (job) => job.document)
  jobs: JobQueue[];
}
```

```typescript
// src/entities/JobQueue.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobType, JobStatus } from './enums';
import { ClientApplication } from './ClientApplication';
import { Document } from './Document';

@Entity('job_queue')
export class JobQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @Column({ name: 'document_id', nullable: true })
  documentId: string | null;

  @Column({ name: 'job_type', type: 'enum', enum: JobType })
  jobType: JobType;

  @Column({ name: 'status', type: 'enum', enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @ManyToOne(() => ClientApplication, (app) => app.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: ClientApplication;

  @ManyToOne(() => Document, (doc) => doc.jobs, { nullable: true })
  @JoinColumn({ name: 'document_id' })
  document: Document | null;
}
```

```typescript
// src/entities/index.ts

export * from './enums';
export * from './User';
export * from './ClientApplication';
export * from './UserApplicationAccess';
export * from './AccessToken';
export * from './Document';
export * from './JobQueue';
```

```typescript
// src/data-source.ts

import { DataSource } from 'typeorm';
import {
  User,
  ClientApplication,
  UserApplicationAccess,
  AccessToken,
  Document,
  JobQueue,
} from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    ClientApplication,
    UserApplicationAccess,
    AccessToken,
    Document,
    JobQueue,
  ],
  synchronize: process.env.NODE_ENV === 'development', // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
});
```

### 5.3 Server Actions

Following the requirement to maximize use of Next.js Server Actions and minimize API route creation, below are the primary server actions organized by domain.

#### 4.3.1 Authentication Implementation

**Session Configuration:**

```typescript
// src/lib/session.ts

import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'maintainer';
  expiresAt: number;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!, // Must be at least 32 characters
  cookieName: 'rag-portal-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 30, // 30 minutes in seconds
  },
};

// Default empty session
export const defaultSession: SessionData = {
  userId: '',
  email: '',
  role: 'maintainer',
  expiresAt: 0,
};
```

**Session Utilities:**

```typescript
// src/lib/auth.ts

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SessionData, sessionOptions, defaultSession } from './session';

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Get the current session (for use in Server Components and Server Actions)
 */
export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  
  // Return default session if no data exists
  if (!session.userId) {
    return defaultSession;
  }
  
  return session;
}

/**
 * Check if session is valid (exists and not expired)
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getSession();
  
  if (!session.userId) {
    return false;
  }
  
  // Check if session has expired
  if (session.expiresAt < Date.now()) {
    // Session expired, destroy it
    await destroySession();
    return false;
  }
  
  return true;
}

/**
 * Create a new session after successful login
 */
export async function createSession(user: {
  id: string;
  email: string;
  role: 'admin' | 'maintainer';
}): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.expiresAt = Date.now() + SESSION_TTL;
  
  await session.save();
}

/**
 * Destroy the current session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.destroy();
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in Server Components and Server Actions that require auth
 */
export async function requireAuth(): Promise<SessionData> {
  const isValid = await isSessionValid();
  
  if (!isValid) {
    redirect('/login');
  }
  
  return await getSession();
}

/**
 * Require admin role - redirects to dashboard if not admin
 */
export async function requireAdmin(): Promise<SessionData> {
  const session = await requireAuth();
  
  if (session.role !== 'admin') {
    redirect('/dashboard');
  }
  
  return session;
}

/**
 * Check if user has access to a specific application
 */
export async function requireApplicationAccess(
  applicationId: string
): Promise<SessionData> {
  const session = await requireAuth();
  
  // Admins have access to all applications
  if (session.role === 'admin') {
    return session;
  }
  
  // Check if maintainer has access to this application
  // This requires a database lookup
  const hasAccess = await checkUserApplicationAccess(session.userId, applicationId);
  
  if (!hasAccess) {
    redirect('/dashboard');
  }
  
  return session;
}

// Helper function - implement with your TypeORM repository
async function checkUserApplicationAccess(
  userId: string,
  applicationId: string
): Promise<boolean> {
  // TODO: Implement with TypeORM
  // const access = await AppDataSource.getRepository(UserApplicationAccess)
  //   .findOne({ where: { userId, applicationId } });
  // return !!access;
  return false;
}
```

**Authentication Server Actions:**

```typescript
// src/actions/auth.ts

'use server'

import { redirect } from 'next/navigation';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { createSession, destroySession, requireAuth } from '@/lib/auth';
import { AppDataSource } from '@/data-source';
import { User } from '@/entities';
import { Status } from '@/entities/enums';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Types
export type ActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData): Promise<ActionResult> {
  // Parse and validate input
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };
  
  const parsed = loginSchema.safeParse(rawData);
  
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Invalid input',
    };
  }
  
  const { email, password } = parsed.data;
  
  try {
    // Find user by email
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    
    // Check if user exists
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }
    
    // Check if user is active
    if (user.status !== Status.ACTIVE) {
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact an administrator.',
      };
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }
    
    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Sign in and redirect (for use with form action)
 */
export async function signInAndRedirect(formData: FormData): Promise<void> {
  const result = await signIn(formData);
  
  if (result.success) {
    redirect('/dashboard');
  }
  
  // If failed, the error will be handled by the calling component
  // using useActionState or similar
}

/**
 * Sign out and redirect to login
 */
export async function signOut(): Promise<void> {
  await destroySession();
  redirect('/login');
}

/**
 * Change password for authenticated user
 */
export async function changePassword(formData: FormData): Promise<ActionResult> {
  // Require authentication
  const session = await requireAuth();
  
  // Parse and validate input
  const rawData = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  };
  
  const parsed = changePasswordSchema.safeParse(rawData);
  
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Invalid input',
    };
  }
  
  const { currentPassword, newPassword } = parsed.data;
  
  try {
    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: session.userId },
    });
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Current password is incorrect',
      };
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await userRepository.update(user.id, {
      passwordHash: newPasswordHash,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
```

**Route Protection:**

```typescript
// src/lib/routeProtection.ts

import { redirect } from 'next/navigation';
import { isSessionValid, getSession } from './auth';

type RouteConfig = {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectIfAuthenticated?: string; // For login page
};

const routeConfigs: Record<string, RouteConfig> = {
  '/login': { redirectIfAuthenticated: '/dashboard' },
  '/dashboard': { requireAuth: true },
  '/admin': { requireAuth: true, requireAdmin: true },
  '/admin/maintainers': { requireAuth: true, requireAdmin: true },
  '/admin/applications': { requireAuth: true, requireAdmin: true },
  '/app': { requireAuth: true },
};

/**
 * Check route access - call this at the top of page.tsx files
 */
export async function checkRouteAccess(pathname: string): Promise<void> {
  // Find matching config (check exact match first, then prefix match)
  let config = routeConfigs[pathname];
  
  if (!config) {
    // Check for prefix matches (e.g., /app/[id]/documents matches /app)
    const prefixMatch = Object.keys(routeConfigs)
      .filter((route) => pathname.startsWith(route))
      .sort((a, b) => b.length - a.length)[0];
    
    if (prefixMatch) {
      config = routeConfigs[prefixMatch];
    }
  }
  
  if (!config) return; // No protection for this route
  
  const isValid = await isSessionValid();
  const session = isValid ? await getSession() : null;
  
  // Redirect authenticated users away from login page
  if (config.redirectIfAuthenticated && isValid) {
    redirect(config.redirectIfAuthenticated);
  }
  
  // Require authentication
  if (config.requireAuth && !isValid) {
    redirect('/login');
  }
  
  // Require admin role
  if (config.requireAdmin && session?.role !== 'admin') {
    redirect('/dashboard');
  }
}
```

**Example Usage in Page Components:**

```typescript
// src/app/dashboard/page.tsx

import { checkRouteAccess } from '@/lib/routeProtection';
import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
  await checkRouteAccess('/dashboard');
  
  const session = await getSession();
  
  return (
    <div>
      <h1>Welcome, {session.email}</h1>
      {session.role === 'admin' && (
        <p>You have admin privileges</p>
      )}
    </div>
  );
}
```

```typescript
// src/app/login/page.tsx

import { checkRouteAccess } from '@/lib/routeProtection';
import { LoginForm } from '@/components/LoginForm';

export default async function LoginPage() {
  await checkRouteAccess('/login');
  
  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
}
```

**Login Form Component:**

```typescript
// src/components/LoginForm.tsx

'use client'

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, ActionResult } from '@/actions/auth';

const initialState: ActionResult = { success: false };

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionResult, formData: FormData) => {
      const result = await signIn(formData);
      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      }
      return result;
    },
    initialState
  );

  return (
    <form action={formAction}>
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </div>
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

#### 4.3.2 Admin Actions

```typescript
// src/actions/admin.ts

'use server'

// Maintainer Management
export async function createMaintainer(formData: FormData): Promise<ActionResult>
export async function deactivateMaintainer(userId: string): Promise<ActionResult>
export async function resetMaintainerPassword(userId: string): Promise<ActionResult>

// Application Management
export async function createApplication(formData: FormData): Promise<ActionResult>
export async function assignMaintainer(
  applicationId: string,
  userId: string
): Promise<ActionResult>
export async function removeMaintainerAssignment(
  applicationId: string,
  userId: string
): Promise<ActionResult>
```

#### 4.3.3 Document Actions

```typescript
// src/actions/documents.ts

'use server'

export async function uploadDocument(
  applicationId: string,
  formData: FormData
): Promise<ActionResult>

export async function getDocuments(
  applicationId: string
): Promise<Document[]>

// TODO: Implement in future version
export async function deleteDocument(
  documentId: string
): Promise<ActionResult>
```

#### 4.3.4 Configuration Actions

```typescript
// src/actions/config.ts

'use server'

export async function getConfig(
  applicationId: string
): Promise<ApplicationConfig>

export async function updateConfig(
  applicationId: string,
  config: ApplicationConfig
): Promise<ActionResult>
```

#### 5.3.5 Token Actions

```typescript
// src/actions/tokens.ts

'use server'

import { randomBytes, createHash } from 'crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireApplicationAccess } from '@/lib/auth';
import { AppDataSource } from '@/lib/db';
import { AccessToken } from '@/entities';
import { TokenStatus } from '@/entities/enums';

// Validation schemas
const generateTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required').max(100),
  expiresAt: z.string().optional().transform((val) => {
    if (!val) return null;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  }),
});

// Types
export type ActionResult = {
  success: boolean;
  error?: string;
};

export type TokenInfo = {
  id: string;
  name: string;
  status: TokenStatus;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  tokenPreview: string;
};

export type GenerateTokenResult = ActionResult & {
  token?: string;
  tokenInfo?: TokenInfo;
};

/**
 * Generate a new access token for a client application
 */
export async function generateToken(
  applicationId: string,
  formData: FormData
): Promise<GenerateTokenResult> {
  await requireApplicationAccess(applicationId);
  
  const rawData = {
    name: formData.get('name'),
    expiresAt: formData.get('expiresAt'),
  };
  
  const parsed = generateTokenSchema.safeParse(rawData);
  
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Invalid input',
    };
  }
  
  const { name, expiresAt } = parsed.data;
  
  try {
    // Generate secure random token (32 bytes = 64 hex characters)
    const tokenBytes = randomBytes(32);
    const plaintextToken = tokenBytes.toString('hex');
    
    // Create SHA-256 hash for storage
    const tokenHash = createHash('sha256')
      .update(plaintextToken)
      .digest('hex');
    
    const tokenRepository = AppDataSource.getRepository(AccessToken);
    
    const accessToken = tokenRepository.create({
      applicationId,
      tokenHash,
      name,
      status: TokenStatus.ACTIVE,
      expiresAt,
    });
    
    await tokenRepository.save(accessToken);
    
    revalidatePath(`/app/${applicationId}/tokens`);
    
    return {
      success: true,
      token: plaintextToken,
      tokenInfo: {
        id: accessToken.id,
        name: accessToken.name,
        status: accessToken.status,
        createdAt: accessToken.createdAt,
        expiresAt: accessToken.expiresAt,
        lastUsedAt: accessToken.lastUsedAt,
        tokenPreview: plaintextToken.substring(0, 8),
      },
    };
  } catch (error) {
    console.error('Generate token error:', error);
    return {
      success: false,
      error: 'Failed to generate token. Please try again.',
    };
  }
}

/**
 * Get all tokens for an application
 */
export async function getTokens(applicationId: string): Promise<TokenInfo[]> {
  await requireApplicationAccess(applicationId);
  
  const tokenRepository = AppDataSource.getRepository(AccessToken);
  
  const tokens = await tokenRepository.find({
    where: { applicationId },
    order: { createdAt: 'DESC' },
  });
  
  return tokens.map((token) => ({
    id: token.id,
    name: token.name,
    status: token.status,
    createdAt: token.createdAt,
    expiresAt: token.expiresAt,
    lastUsedAt: token.lastUsedAt,
    tokenPreview: '••••••••',
  }));
}

/**
 * Revoke an access token
 */
export async function revokeToken(
  tokenId: string,
  applicationId: string
): Promise<ActionResult> {
  await requireApplicationAccess(applicationId);
  
  try {
    const tokenRepository = AppDataSource.getRepository(AccessToken);
    
    const token = await tokenRepository.findOne({
      where: { id: tokenId, applicationId },
    });
    
    if (!token) {
      return { success: false, error: 'Token not found' };
    }
    
    if (token.status === TokenStatus.REVOKED) {
      return { success: false, error: 'Token is already revoked' };
    }
    
    await tokenRepository.update(tokenId, {
      status: TokenStatus.REVOKED,
    });
    
    revalidatePath(`/app/${applicationId}/tokens`);
    
    return { success: true };
  } catch (error) {
    console.error('Revoke token error:', error);
    return { success: false, error: 'Failed to revoke token. Please try again.' };
  }
}

/**
 * Validate an access token (called by FastAPI RAG server)
 */
export async function validateToken(plaintextToken: string): Promise<{
  valid: boolean;
  applicationId?: string;
  error?: string;
}> {
  if (!plaintextToken || plaintextToken.length !== 64) {
    return { valid: false, error: 'Invalid token format' };
  }
  
  try {
    const tokenHash = createHash('sha256')
      .update(plaintextToken)
      .digest('hex');
    
    const tokenRepository = AppDataSource.getRepository(AccessToken);
    
    const token = await tokenRepository.findOne({
      where: { tokenHash },
    });
    
    if (!token) {
      return { valid: false, error: 'Token not found' };
    }
    
    if (token.status === TokenStatus.REVOKED) {
      return { valid: false, error: 'Token has been revoked' };
    }
    
    if (token.expiresAt && token.expiresAt < new Date()) {
      return { valid: false, error: 'Token has expired' };
    }
    
    await tokenRepository.update(token.id, {
      lastUsedAt: new Date(),
    });
    
    return { valid: true, applicationId: token.applicationId };
  } catch (error) {
    console.error('Validate token error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}
```

**Token Validation API Route (for FastAPI server):**

```typescript
// src/app/api/tokens/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/actions/tokens';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }
    
    const result = await validateToken(token);
    
    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      applicationId: result.applicationId,
    });
  } catch (error) {
    console.error('Token validation API error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Token Management UI Component:**

```typescript
// src/components/TokenManager.tsx

'use client'

import { useState } from 'react';
import { useActionState } from 'react';
import { generateToken, revokeToken, GenerateTokenResult, TokenInfo } from '@/actions/tokens';

interface TokenManagerProps {
  applicationId: string;
  tokens: TokenInfo[];
}

export function TokenManager({ applicationId, tokens }: TokenManagerProps) {
  const [newToken, setNewToken] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  
  const [generateState, generateAction, isGenerating] = useActionState(
    async (prevState: GenerateTokenResult, formData: FormData) => {
      const result = await generateToken(applicationId, formData);
      if (result.success && result.token) {
        setNewToken(result.token);
        setShowTokenModal(true);
      }
      return result;
    },
    { success: false }
  );
  
  const handleRevoke = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this token? This action cannot be undone.')) {
      return;
    }
    await revokeToken(tokenId, applicationId);
  };
  
  const copyToClipboard = async () => {
    if (newToken) {
      await navigator.clipboard.writeText(newToken);
      alert('Token copied to clipboard');
    }
  };
  
  const closeModal = () => {
    setShowTokenModal(false);
    setNewToken(null);
  };
  
  return (
    <div>
      {/* Generate Token Form */}
      <form action={generateAction}>
        <h3>Generate New Token</h3>
        
        {generateState.error && (
          <div className="error">{generateState.error}</div>
        )}
        
        <div>
          <label htmlFor="name">Token Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="e.g., Production Server"
            required
          />
        </div>
        
        <div>
          <label htmlFor="expiresAt">Expiration (optional)</label>
          <input
            type="datetime-local"
            id="expiresAt"
            name="expiresAt"
          />
        </div>
        
        <button type="submit" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Token'}
        </button>
      </form>
      
      {/* Token List */}
      <h3>Active Tokens</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Last Used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.id}>
              <td>{token.name}</td>
              <td>{token.status}</td>
              <td>{new Date(token.createdAt).toLocaleDateString()}</td>
              <td>{token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'Never'}</td>
              <td>{token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : 'Never'}</td>
              <td>
                {token.status === 'active' && (
                  <button onClick={() => handleRevoke(token.id)}>
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* New Token Modal */}
      {showTokenModal && newToken && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Token Generated Successfully</h3>
            <p><strong>Warning:</strong> This token will only be shown once. Copy it now.</p>
            
            <div className="token-display">
              <code>{newToken}</code>
            </div>
            
            <div className="modal-actions">
              <button onClick={copyToClipboard}>Copy to Clipboard</button>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 5.4 API Routes (Minimal)

Only create API routes where Server Actions are not suitable:

1. **File Upload Endpoint**: For handling multipart form data with progress tracking
   ```
   POST /api/upload
   - Handles chunked uploads for large files
   - Returns upload progress via streaming response
   ```

2. **Webhook Endpoint**: For ingestion pipeline callbacks
   ```
   POST /api/webhooks/ingestion
   - Receives job completion/failure notifications
   - Updates document and job status
   ```

### 4.6 File Storage Strategy

#### 4.5.1 Storage Structure

```
bucket: rag-documents
├── {applicationId}/
│   ├── documents/
│   │   ├── {documentId}_{filename}
│   │   └── ...
│   └── _config.json
```

#### 4.5.2 Upload Flow

1. Client initiates upload via form submission
2. Server validates file type and size
3. Server generates unique storage path
4. File uploaded to S3-compatible storage
5. Document record created in database
6. Job queued for ingestion pipeline

### 4.7 Job Queue Integration

#### 4.6.1 Queue Message Format

```json
{
  "jobId": "clx1234567890",
  "jobType": "DOCUMENT_INGEST",
  "applicationId": "finance-app-prod",
  "payload": {
    "documentId": "clx0987654321",
    "storagePath": "finance-app-prod/documents/clx0987654321_report.pdf",
    "mimeType": "application/pdf"
  },
  "createdAt": "2024-12-01T10:30:00Z"
}
```

#### 4.6.2 Queue Operations

- On document upload: Enqueue `DOCUMENT_INGEST` job
- On document delete: Enqueue `DOCUMENT_DELETE` job (future)
- On config update: Enqueue `CONFIG_UPDATE` job

The ingestion pipeline (separate service) subscribes to the queue and processes jobs.

---

## 6. UI/UX Specification

### 6.1 Page Structure

```
/ (root)
├── /login                    # Login page
├── /dashboard                # Main dashboard (role-based)
│
├── /admin                    # Admin section
│   ├── /admin/maintainers    # Maintainer management
│   ├── /admin/applications   # Application management
│   └── /admin/tokens         # System-wide token view
│
└── /app/[applicationId]      # Application workspace
    ├── /app/[id]/documents   # Document management
    ├── /app/[id]/config      # Configuration editor
    └── /app/[id]/tokens      # Token management
```

### 6.2 Key UI Components

#### 5.2.1 Application Switcher

For maintainers with access to multiple applications, provide a dropdown or sidebar selector to switch between application workspaces.

#### 5.2.2 Document Upload Zone

- Drag-and-drop area with visual feedback
- Click-to-browse fallback
- File type validation with clear error messages
- Upload progress bar per file
- Cancel upload capability

#### 5.2.3 Document List

- Table view with columns: Name, Size, Uploaded, Status
- Status badge with color coding (Uploaded, Processing, Indexed, Failed)
- Row actions: View details, Delete (future)
- Bulk selection (future)

#### 5.2.4 Token Display Modal

When a new token is generated, display in a modal with clear copy button and warning that the token won't be shown again.

#### 5.2.5 Configuration Editor

- Large text area for system prompt
- Character count display
- Save button with loading state
- Unsaved changes warning on navigation

---

## 7. Security Requirements

### 7.1 Authentication Security

- Passwords hashed with bcrypt (minimum 12 salt rounds)
- Sessions stored in encrypted cookies (Iron Session)
- 32-character minimum secret for session encryption
- Fixed 30-minute session expiry (no sliding window)
- HttpOnly, Secure, SameSite=Lax cookies
- Rate limiting on login attempts (5 attempts per 15 minutes)

### 7.2 Authorization

- Role-based access control (Admin, Maintainer)
- Application-level access validation on every request
- Server Actions verify session and permissions before execution
- No client-side authorization logic

### 7.3 API Token Security

- Tokens generated with cryptographically secure random bytes
- Only SHA-256 hash stored in database
- Plaintext token shown only once at creation
- Token validation: hash comparison, expiration check, status check

### 7.4 File Upload Security

- File type validation (MIME type and extension)
- File size limits enforced server-side
- Files stored with generated names (not user-provided)
- No direct public access to stored files

---

## 8. Deployment & Environment

### 8.1 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/ragportal

# Iron Session
SESSION_SECRET=<32-character-random-string-minimum>

# S3 Storage
S3_ENDPOINT=https://minio.example.com
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
S3_BUCKET=rag-documents

# Redis (for job queue)
REDIS_URL=redis://localhost:6379

# Application
NEXT_PUBLIC_APP_URL=https://portal.example.com
```

### 8.2 Docker Configuration (Optional)

> **Note:** Docker configuration is optional and provided as a reference for teams who prefer containerized development environments. The application can be run directly on the host machine with Node.js, PostgreSQL, MinIO, and Redis installed locally.

```yaml
# docker-compose.yml (development)
version: '3.8'
services:
  portal:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ragportal
    depends_on:
      - db
      - minio
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ragportal
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    command: server /data --console-address ':9001'
    ports:
      - '9000:9000'
      - '9001:9001'
    volumes:
      - minio_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
  minio_data:
```

---

## 9. Development Milestones

### 9.1 Phase 1: Foundation (Week 1-2)

- Project setup with Next.js, TypeScript, TypeORM
- Database schema implementation and migrations
- Iron Session integration (session config, auth utilities)
- Login/logout functionality with Server Actions
- Route protection middleware
- Role-based access control (Admin, Maintainer)

### 9.2 Phase 2: Admin Functions (Week 2-3)

- Admin dashboard
- Maintainer CRUD operations
- Application creation and management
- Maintainer-application assignment

### 9.3 Phase 3: Document Management (Week 3-4)

- S3 integration for file storage
- Document upload interface
- Document list view
- Job queue integration

### 9.4 Phase 4: Configuration & Tokens (Week 4-5)

- Configuration editor (system prompt)
- Token generation and display
- Token revocation
- Application switcher for multi-app maintainers

### 9.5 Phase 5: Polish & Testing (Week 5-6)

- UI polish and responsive design
- Error handling and validation
- Integration testing
- Documentation

---

## 10. Future Enhancements (TODO)

The following features are out of scope for v1:

| Feature | Notes |
|---------|-------|
| Document Deletion | With cascade to vector store; soft delete implemented in schema |
| Processing Status Display | Real-time status updates from ingestion pipeline |
| Token Rate Limiting | Configurable rate limits per token |
| Granular Token Permissions | Model selection, service restrictions per token |
| Advanced RAG Parameters | Temperature, topK, similarity threshold in config |
| Folder Hierarchies | Nested folder structure |
| Document Versioning | Keep history of document versions |
| Audit Logging | Track all admin and maintainer actions |
| SSO Integration | SAML/OIDC for enterprise customers |

---

## 11. Appendix

### 11.1 Glossary

| Term | Definition |
|------|------------|
| RAG | Retrieval-Augmented Generation - technique combining LLMs with external knowledge retrieval |
| Vector Store | Database optimized for storing and querying vector embeddings |
| Client Application | An end-user application that queries the RAG system using access tokens |
| Maintainer | User responsible for managing documents and configuration for a client application |
| Ingestion Pipeline | Background service that processes documents and stores embeddings in vector stores |
| System Prompt | Initial instruction text sent to the LLM to define its behavior for a client application |
| OCR | Optical Character Recognition - extracting text from image-based documents |

### 11.2 References

- Next.js Documentation: https://nextjs.org/docs
- Iron Session: https://github.com/vvo/iron-session
- TypeORM: https://typeorm.io
- Mantine UI: https://mantine.dev
- MinIO Object Storage: https://min.io/docs
- Zod Validation: https://zod.dev
- bcrypt: https://www.npmjs.com/package/bcrypt

---

*— End of Document —*
