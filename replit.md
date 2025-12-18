# Growth Mindset App

## Overview
A habit tracking and personal growth application built with React frontend and FastAPI backend. The app helps users transform their habits using principles from "Think and Grow Rich," "Atomic Habits," and "The Obstacle Is The Way."

## Project Structure
```
├── frontend/          # React frontend with CRACO
│   ├── src/
│   │   ├── components/    # UI components (shadcn/ui based)
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and API client
│   └── public/            # Static assets
├── backend/           # FastAPI backend
│   └── server.py      # Main API server
└── tests/             # Test files
```

## Tech Stack
- **Frontend**: React 19, CRACO, TailwindCSS, Radix UI
- **Backend**: FastAPI, Uvicorn, Pydantic
- **Database**: MongoDB (requires external connection)
- **AI**: LiteLLM for AI coaching features

## Environment Variables Required
- `MONGO_URL` - MongoDB connection string (REQUIRED)
- `DB_NAME` - Database name (default: growth_mindset)
- `JWT_SECRET` - JWT signing secret
- `AI_API_KEY` - API key for AI features (Gemini)
- `REACT_APP_BACKEND_URL` - Backend URL for frontend API calls

## Running the App
- **Frontend**: Runs on port 5000 (webview)
- **Backend**: Runs on port 8000 (console)

## Deployment
Configured for autoscale deployment:
- Builds frontend with `npm run build`
- Runs backend with uvicorn on port 5000
- Serves frontend static files

## Recent Changes
- 2024-12-18: Created Transformation Roadmap
  - Pivoting from dashboard-centric to Duolingo-style lesson experience
  - See TRANSFORMATION_ROADMAP.md for complete plan
  - Core focus: Daily lessons with Wisdom → Action → Reflection → Reward loop
- 2024-12-17: Initial Replit setup
  - Replaced emergentintegrations with litellm for AI features
  - Configured frontend for Replit proxy (allowedHosts: 'all')
  - Set up workflows for development
  - Added deployment configuration

## 🎯 TRANSFORMATION VISION (DETAILED PLAN)

### The Core Philosophy
**Goal:** Transform from a dashboard-centric productivity app into a **Duolingo-style guided self-transformation journey**.

**Core Belief:** People don't change through many tools—they change through **consistent, meaningful repetition**.

### The Sacred Loop (Non-Negotiable)
Every user, every day:
```
Lesson (Wisdom) → Micro-Action (Do) → Reflection (Feel) → Reward (Progress) → Mentor (Belong)
```

This is the ONLY primary user action. Everything else serves this loop.

---

## 📚 WISDOM WORLDS STRUCTURE

### What Are Wisdom Worlds?
A Wisdom World is a **complete philosophical framework** expressed as a mastery path. Like Duolingo's Spanish Course, but for personal transformation.

### World 1: Napoleon Hill - "Think and Grow Rich"
**Author:** Napoleon Hill | **Lessons:** 15 | **Duration:** ~15 days

#### Chapter 1: Desire (5 lessons)
- Lesson 1: "The Starting Point of All Achievement" - Define what you truly want
- Lesson 2: "Definiteness of Purpose" - Make it specific and clear
- Lesson 3: "Burning Desire vs Wishful Thinking" - Feel the difference
- Lesson 4: "Writing Your Definite Chief Aim" - Make it real (action: write it)
- Lesson 5: "Daily Visualization Practice" - See your future self (action: 3-min visualization)

#### Chapter 2: Faith (5 lessons)
- Lesson 6: "Faith as a State of Mind" - Belief is a choice
- Lesson 7: "Self-Suggestion and Belief" - Program your mind
- Lesson 8: "Overcoming Doubt" - Face your inner critic
- Lesson 9: "Acting As If" - Confidence comes from action (action: walk/speak/act with confidence)
- Lesson 10: "Building Unshakeable Confidence" - Compound belief daily

#### Chapter 3: Persistence (5 lessons)
- Lesson 11: "The Power of Persistence" - Most people quit at lesson 11
- Lesson 12: "Defeat is Temporary" - Reframe failure
- Lesson 13: "The Four Steps of Persistence" - Strategic persistence
- Lesson 14: "Persistence vs Stubbornness" - Know when to adjust
- Lesson 15: "Your Persistence Test" - Graduate from World 1

### Future Worlds (In Backlog)
- **World 2:** James Clear - "Atomic Habits" (Identity, Systems, Environment)
- **World 3:** Ryan Holiday - "The Obstacle Is The Way" (Stoicism for modern challenges)
- **World 4:** Viktor Frankl - "Man's Search for Meaning" (Purpose & resilience)

---

## 🎮 THE LESSON PAGE EXPERIENCE (New Core UI)

### Component: TodaysLesson.jsx
**Purpose:** Single, focused screen that guides users through the daily transformation practice.

### The 5-Step Flow

#### Step 1: WISDOM DISPLAY
```
Title: "Burning Desire vs Wishful Thinking"
Quote: "A true desire is an idea with a reason attached."
Context: "Chapter 1, Lesson 3"

Aesthetic: Large, calm typography. Dark theme with warm accent (gold/yellow).
Time: User reads (1-2 minutes)
```

#### Step 2: MICRO-ACTION CARD
```
Heading: "Today's Practice"
Action: "Write down ONE specific thing you want. Not a vague dream—specific and achievable."
Constraint: "≤ 2 minutes to complete"
Button: "✓ I Did It"
```

#### Step 3: REFLECTION PROMPT
```
Question: "What feeling came up when you wrote that? Why does it matter?"
Input: Text field (100-200 words encouraged, not required)
Button: "Save Reflection"
```

#### Step 4: REWARD ANIMATION
```
Display XP earned: "+10 XP"
Update streak: "🔥 Day 7 Streak!"
Progress bar: Chapter 3/5 complete (60%)
Celebration: Subtle animation, not overwhelming
```

#### Step 5: MENTOR CLOSING COMMENT
```
AI-Generated Mentor Comment (Napoleon Hill voice):
"You're taking action today while most people merely dream. That's the difference
between wishing and willing. You're becoming someone who DEFINES their future.
Tomorrow, we dive deeper."
```

### Design Principles
- **Calm, serious aesthetic** (not gamified fluff)
- **Minimal distractions** (one thing at a time)
- **Progress indicators** (user always knows where they are)
- **Completion is celebration** (not pushy, dignified)

---

## 🏠 NEW HOME SCREEN STRUCTURE

### Current State
```
Dashboard.jsx
├── Stats overview
├── Active goals list
├── Today's habits
├── Recent journal entries
└── Quick action buttons
```

### Transformed State
```
Home.jsx (Lesson-First)
├── HEADER: Level | XP | 🔥 Streak
│
├── PRIMARY: "TODAY'S LESSON"
│   ├── Lesson title & world
│   └── [START LESSON →] Button
│
├── SECONDARY: Quick Stats (subtle)
│   ├── Habits (if created from lesson)
│   ├── Journal (auto-populated from reflection)
│   └── Goals (contextual reference only)
│
└── FOOTER: Navigation
    ├── Worlds (explore other paths)
    ├── Profile (stats, settings)
    └── Menu (all tools)
```

---

## 💰 XP & PROGRESSION SYSTEM (REFACTORED)

### Current System
XP comes from many sources (goals, habits, journal, exercises, etc.)
**Problem:** Scattered, confusing, no clear path

### New System
**XP comes ONLY from lesson completion**

### XP Rewards
```
- Complete daily lesson: +10 XP
- Perfect streak week (7 days): +50 bonus XP
- Chapter completion: +25 XP
- World completion: +100 XP
- Streak milestones (7, 30, 100 days): Special badges
```

### Level Thresholds (10 Levels)
```
Level 1: 0 XP       → "Seeker" (just starting)
Level 2: 50 XP      → "Apprentice" (learning)
Level 3: 150 XP     → "Student" (committed)
Level 4: 300 XP     → "Practitioner" (consistent)
Level 5: 500 XP     → "Disciple" (dedicated)
Level 6: 750 XP     → "Journeyman" (mastering)
Level 7: 1000 XP    → "Adept" (skilled)
Level 8: 1500 XP    → "Master" (transformed)
Level 9: 2000 XP    → "Sage" (wise)
Level 10: 3000 XP   → "Philosopher" (mastery achieved)
```

### Streak System
```
Streak = consecutive days with 1+ lesson completed
- Reset to 0 if user misses a day
- Premium feature: "Streak Freeze" (1 use per week)
- Milestone celebrations: Day 7, 30, 100
```

---

## 🗺️ DATABASE SCHEMA ADDITIONS

### New Collections

#### wisdom_worlds
```javascript
{
  _id: ObjectId,
  id: string (UUID),
  name: string,              // "Think and Grow Rich"
  description: string,        // "Master the art of desire..."
  author: string,             // "Napoleon Hill"
  philosophy: string,         // "hill" | "clear" | "holiday"
  icon: string,              // icon emoji or path
  color: string,             // accent color (hex)
  total_lessons: number,      // 15
  total_chapters: number,     // 3
  order: number,             // 1 (first world)
  is_premium: boolean,        // false for MVP
  created_at: Date
}
```

#### chapters
```javascript
{
  _id: ObjectId,
  id: string (UUID),
  world_id: string,          // FK to wisdom_worlds
  title: string,             // "Chapter 1: Desire"
  description: string,        // "Define what you truly want"
  order: number,             // 1 (first in world)
  lessons_count: number,      // 5
  unlocked_at_lesson: number, // unlock after world lesson 0
  created_at: Date
}
```

#### lessons
```javascript
{
  _id: ObjectId,
  id: string (UUID),
  world_id: string,          // FK to wisdom_worlds
  chapter_id: string,        // FK to chapters
  order: number,             // 1 (first lesson)
  title: string,             // "Burning Desire vs Wishful Thinking"
  wisdom_text: string,       // ≤ 120 words, the teaching
  micro_action: {
    description: string,     // action to take
    time_estimate: number    // minutes (≤2)
  },
  reflection_prompt: string, // question to ponder
  mentor_comment: string,    // closing wisdom (or AI-generated)
  xp_reward: number,         // default 10
  suggested_habit: string,   // optional habit to create
  created_at: Date
}
```

#### user_progress
```javascript
{
  _id: ObjectId,
  user_id: string,           // FK to users
  current_world_id: string,  // which world user is in
  current_chapter_id: string,// which chapter
  current_lesson_id: string, // which lesson (to show today)
  total_xp: number,          // cumulative XP
  level: number,             // 1-10
  current_streak: number,    // consecutive days
  best_streak: number,       // personal record
  last_lesson_date: Date,    // to check if streak continues
  lessons_completed: number, // total completion count
  updated_at: Date
}
```

#### lesson_completions
```javascript
{
  _id: ObjectId,
  id: string (UUID),
  user_id: string,           // FK to users
  lesson_id: string,         // FK to lessons
  world_id: string,          // denormalized for queries
  chapter_id: string,        // denormalized for queries
  reflection_response: string, // user's reflection answer
  mentor_comment: string,    // mentor's reply to completion
  xp_earned: number,         // 10 (or more for bonuses)
  completed_at: Date
}
```

---

## 📡 NEW API ENDPOINTS

### Worlds & Chapters
```
GET /api/worlds
  Response: [{id, name, description, author, progress%, locked}]

GET /api/worlds/{world_id}
  Response: {world details + all chapters}

GET /api/worlds/{world_id}/chapters
  Response: [{id, title, order, lessons_count, unlocked}]
```

### Lessons
```
GET /api/lessons/today
  Response: {lesson details, world, chapter, user_progress}
  Logic: Get next incomplete lesson for user

GET /api/lessons/{lesson_id}
  Response: {full lesson content}

POST /api/lessons/{lesson_id}/complete
  Body: {reflection_response: string}
  Response: {xp_earned, new_streak, new_level, mentor_comment}
  Side effects:
    - Add to lesson_completions
    - Update user_progress (XP, streak, current_lesson)
    - Generate mentor comment (AI)
    - Auto-save to journal if enabled

GET /api/progress
  Response: {current_xp, level, streak, best_streak, 
             current_world, current_chapter, completion_%}
```

### Analytics (Secondary)
```
GET /api/analytics/transformation
  Response: {total_lessons_completed, worlds_finished, 
             average_streak, xp_chart, consistency_score}
```

---

## 🔄 FEATURE REPURPOSING (Not Removal)

### Habits: From Primary → Supporting Tool
- Users do NOT create habits in Habits page
- Lessons can SUGGEST habits: "Make this a daily practice"
- "Create habit from this lesson" button during completion
- Habits inherit lesson's principle/philosophy

### Journal: From Primary → Auto-Capture + Optional
- Lesson reflections auto-save to journal with lesson tag
- Optional "Deep reflection" mode for users wanting more writing
- Journal entries link back to source lesson
- Mood tracking stays (tracks transformation sentiment)

### Goals: From Primary → Background Context
- Goals shown in profile/analytics only
- Lessons may reference user's goals (if available)
- Don't surface goal creation in main flow
- Use for "why" context (connect lesson to user's ambitions)

### AI Coach: From Open Chat → Mentor Voice
- AI generates personalized closing comment after each lesson
- Optional: Deeper conversation mode (lower priority)
- Personality matches current world's author
- Reacts to user's reflection, not just generic wisdom

---

## 🗑️ FEATURES TO REMOVE/ARCHIVE

| Feature | Why | Action |
|---------|-----|--------|
| InspirationFeed.jsx | Competes with lessons | Archive (hide) |
| WeeklyChallenges.jsx | Replaced by lesson system | Delete |
| Multiple Ritual Modes | Lessons ARE the ritual | Delete |
| Floating Action Menu | Adds clutter | Simplify to essential 2-3 actions |
| JourneyMap.jsx (current) | Replace with World Map | Redesign |
| VisionBoard (primary) | Demote to analytics | Keep but hide |
| Exercises page | Integrate into lessons | Archive |

---

## 6 SPRINTS TO COMPLETION

### Sprint 1: Backend Foundation (3-5 days)
- [ ] Design MongoDB collections (wisdom_worlds, chapters, lessons, user_progress, lesson_completions)
- [ ] Seed Napoleon Hill World 1 with all 15 lessons (write the content)
- [ ] Build lesson CRUD endpoints
- [ ] Build progress tracking endpoints
- [ ] Build today's lesson logic

### Sprint 2: Core Lesson UI (3-5 days)
- [ ] Create TodaysLesson.jsx with 5-step flow
- [ ] Connect to lesson API
- [ ] Add XP/streak animations
- [ ] Add mentor comment display
- [ ] Polish UX/design

### Sprint 3: Home Transformation (2-3 days)
- [ ] Create new Home.jsx (lesson-first)
- [ ] Move old Dashboard to secondary route
- [ ] Update routing hierarchy
- [ ] Update navigation menu

### Sprint 4: Progression System (2-3 days)
- [ ] Refactor LevelSystem for lesson-only XP
- [ ] Create level-up celebrations
- [ ] Build streak milestone notifications
- [ ] Add chapter/world completion badges

### Sprint 5: Worlds & Navigation (2-3 days)
- [ ] Create Worlds.jsx (world selection)
- [ ] Create ChapterView.jsx (lesson list in chapter)
- [ ] Add locked/unlocked states
- [ ] Add progress visualization

### Sprint 6: Mentor & Polish (2-3 days)
- [ ] Integrate AI for dynamic mentor comments
- [ ] Test lesson flow end-to-end
- [ ] Polish animations and transitions
- [ ] Gather feedback and iterate

---

## ✅ SUCCESS CRITERIA

1. **Daily Return:** Users come back to complete their daily lesson
2. **Streak Behavior:** Average streak length > 7 days
3. **World Completion:** First users finish World 1 (15 days)
4. **Session Duration:** Average lesson time = 3-5 minutes
5. **User Sentiment:** Feedback includes "calm," "clear," "transformative"
6. **Completion Rate:** > 70% of started users complete first world

---

## 📝 GUIDING PRINCIPLE

> **This app will feel SMALLER but MORE POWERFUL.**
> 
> Every feature that remains must serve the lesson loop.
> Complexity is removed. Depth is added.
> 
> **The Law:** Lesson → Micro-Action → Reflection → Reward → Mentor
> 
> Everything else is support.

## Notes
- MongoDB credentials need to be provided by user
- AI coaching uses Gemini 2.0 Flash model
- Full roadmap also available in TRANSFORMATION_ROADMAP.md
