# Collaborative Document Editor

A lightweight Google Docs-style document editor built with Next.js, shadcn/ui, and Neon Postgres.

The project focuses on the core document workflow: creating, editing, saving, formatting, sharing, and importing text files—while intentionally keeping the implementation small enough to complete and validate within the assignment's time constraint.

## Tech Stack

- **Next.js 16** — App Router
- **React**
- **TypeScript**
- **shadcn/ui** — UI components
- **Neon Postgres** — persistent document storage
- **@vercel/postgres** — database access
- **react-markdown** — rendered document preview
- **Vitest** — automated testing
- **Vercel** — deployment

## Features

- Create and open documents
- Rename documents
- Edit document content in the browser
- Debounced autosave
- Persistence across refreshes and reopening
- Markdown-lite formatting:
  - Bold
  - Italic
  - Underline
  - Headings
  - Bulleted lists
  - Numbered lists
  - Links

- Live rendered preview
- Share documents between seeded users
- SQL-level access control for shared documents
- `.txt` and `.md` file import
- Responsive document editor UI
- Automated upload validation tests

## Collaboration Model

The assignment's real-time collaboration feature was treated as an optional stretch goal rather than a core requirement.

This implementation uses **asynchronous collaboration** instead:

1. The document owner shares a document with another seeded user.
2. The recipient can access and edit the document.
3. Changes are persisted through the same document workflow.

Real-time simultaneous editing, cursors, presence, and conflict resolution are intentionally out of scope.

## File Upload

The editor accepts:

- `.txt`
- `.md`

Uploaded text is inserted into the current document content.

Complex document formats such as `.docx` are intentionally unsupported to keep the workflow lightweight and avoid introducing unnecessary parsing or storage infrastructure.

## Authentication

Authentication is mocked using seeded users for demonstration purposes:

- Alice — User ID `1`
- Bob — User ID `2`

This is intentionally not a production authentication system.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

If npm reports a peer-dependency conflict involving Vitest, the repository includes an `.npmrc` configured with:

```text
legacy-peer-deps=true
```

### 2. Configure the database

Create a `.env.local` file containing the Neon/Vercel Postgres connection variable required by the application.

```env
POSTGRES_URL=your_database_connection_string
```

Use your own Neon Postgres connection string when running locally.

### 3. Set up the database

Run the SQL schema/initialization included in the project against your Neon Postgres database.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Testing

Run the automated tests with:

```bash
npm test
```

The repository includes upload validation tests covering supported and unsupported file types.

## Deployment

The application is deployed through Vercel using the repository's GitHub integration.

Pushes to the configured branch automatically trigger a Vercel deployment.

## Scope

This project deliberately prioritizes a complete, usable core workflow over broad Google Docs feature coverage.

### Included

- Document lifecycle
- Editing
- Formatting
- Persistence
- Sharing/access control
- File import
- Basic responsive UI
- Automated testing
- Deployment

### Deprioritized

- Real-time simultaneous editing
- Presence and remote cursors
- Conflict resolution
- Revision history
- Real authentication
- Advanced permissions
- Complex document formats
- Production-scale collaboration infrastructure

The implementation favors depth and reliability in the selected workflows rather than attempting to reproduce Google Docs feature-for-feature.
