# QianTu (钱途) - Project Context for Gemini

## 1. Project Overview

**Name:** 钱途 (QianTu) - *Tentative*
**Tagline:** "Input your income goal, AI maps the path."
**Goal:** A goal-oriented income planning and execution platform. It helps users (freelancers, side-hustlers, entrepreneurs) break down annual income goals into actionable paths, milestones, and daily tasks using AI, backed by a social supervision contract system.

**Key Value Proposition:**
*   **Causal Link:** Connects "Tasks" directly to "Income Goals".
*   **AI-Driven:** Uses LLMs (Zhipu GLM-4) to generate personalized paths and break down projects.
*   **Social Contract:** "Viral" supervision feature where friends sign "contracts" to monitor progress.

## 2. Tech Stack

*   **Framework:** Nuxt 3 (SSR)
*   **UI Library:** Nuxt UI / Tailwind CSS
*   **Language:** TypeScript
*   **State Management:** Pinia
*   **Database:** Turso (LibSQL) - *implied by docs and structure*
*   **Authentication:** Clerk or Custom (SSO)
*   **AI Provider:** Zhipu AI (GLM-4)
*   **Internationalization:** @nuxtjs/i18n (zh-CN / en)

## 3. Building and Running

### Prerequisites
*   Node.js (Latest LTS recommended)
*   Package Manager: npm, pnpm, or yarn

### Commands

```bash
# Install dependencies
npm install

# Start development server (Port 3001)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Note:** The dev server runs on port **3001** (`nuxt.config.ts`).

## 4. Key Features & Requirements

### 4.1 Core Flow (The Wizard)
The user onboarding is a "Wizard" process:
1.  **Goal Setting:** User inputs Annual Income Goal (e.g., ¥300k).
2.  **Profile & Constraints:** User selects background (Tech/Design/etc.), available hours, and "Anti-goals" (no face reveal, no social, etc.).
3.  **Open Interview:** AI asks dynamic questions to clarify intent.
4.  **Path Recommendation:** AI suggests 3-5 paths (e.g., SaaS + Blog + Consulting) that add up to the goal.
5.  **Path Refinement:** User adjusts parameters (revenue target, ramp-up time) for each path.
6.  **Project Breakdown:** AI breaks paths into Milestones/Projects.
7.  **Task Breakdown:** AI breaks projects into atomic Tasks (2-8 hours).
8.  **Feasibility Check:** System validates if the plan fits into the user's available hours.
9.  **Calendar Generation:** Populates the user's calendar.

### 4.2 Execution & Supervision
*   **Dashboard:** Focus on "Today's Tasks".
*   **Supervision:** Users generate a "Contract" (shareable image/page). Friends sign it to become "Supervisors" with read-access to the user's progress and the ability to send "nudges".

## 5. Project Structure

*   `docs/`: PRD, Technical Design, SQL Schemas. **Read these for logic.**
*   `pages/wizard/`: Steps of the onboarding wizard.
*   `stores/wizard.ts`: State management for the wizard flow.
*   `server/utils/zhipu.ts`: AI integration logic.
*   `server/api/`: Backend API routes (Nuxt server routes).
*   `components/`: UI components (Tailwind based).
*   `i18n/locales/`: Localization files.

## 6. Development Conventions

*   **Style:** Follow Nuxt 3 best practices (Composables, Auto-imports).
*   **UI:** Use Tailwind utility classes and Nuxt UI components.
*   **AI:** AI logic resides in `server/` to protect API keys.
*   **Types:** Use TypeScript interfaces for all data models.

## 7. Current Status
*   Project is in the **Prototype/MVP** phase.
*   Basic structure exists.
*   Wizard flow is partially implemented.
*   Database schemas are defined in `docs/` but migration status should be verified.
