# TRANSFORMATION ROADMAP
**From Growth App to Transformation Hub**

---

## EXECUTIVE SUMMARY

**Current State:** Dashboard-centric productivity app with 20+ scattered features
**Target State:** Duolingo-style guided transformation journey centered on daily lessons

**Core Shift:** From "do everything yourself" → "guided daily transformation"

---

## PHASE 1: CORE LOOP FOUNDATION (Priority: CRITICAL)

### 1.1 Create Lesson System (Backend)

**New Database Collections:**
```
wisdom_worlds:
  - id, name, description, author, icon, color
  - total_lessons, order, is_premium
  
chapters:
  - id, world_id, title, description, order
  - lessons_count, unlocked_at_lesson
  
lessons:
  - id, chapter_id, world_id, order
  - wisdom_text (≤120 words)
  - micro_action (concrete, ≤2 min)
  - reflection_prompt
  - mentor_comment
  - xp_reward (default: 10)
  
user_progress:
  - user_id, current_world_id, current_chapter_id
  - current_lesson_id, total_xp, level
  - current_streak, best_streak, last_lesson_date
  
lesson_completions:
  - id, user_id, lesson_id
  - reflection_response, completed_at
```

**New API Endpoints:**
- GET /api/worlds - Get all wisdom worlds
- GET /api/worlds/{world_id}/chapters - Get chapters in world
- GET /api/lessons/today - Get today's lesson
- POST /api/lessons/{lesson_id}/complete - Complete lesson with reflection
- GET /api/progress - Get user's XP, streak, level

### 1.2 Build Today's Lesson Page (Frontend)

**New Component: TodaysLesson.jsx**
- Full-screen, focused experience
- 5-step flow:
  1. Wisdom Display (quote/principle)
  2. Micro-Action Card (with "I did it" button)
  3. Reflection Input (single text field)
  4. Reward Animation (XP earned, streak update)
  5. Mentor Closing Comment

**Design:**
- Dark, calm, serious aesthetic (keep current theme)
- Minimal distractions
- Progress indicator for 5 steps
- Celebration animation on completion

### 1.3 Create First Wisdom World Content

**World 1: Napoleon Hill - Think and Grow Rich**

```
Chapter 1: Desire (5 lessons)
  - Lesson 1: "The Starting Point of All Achievement"
  - Lesson 2: "Definiteness of Purpose"
  - Lesson 3: "Burning Desire vs Wishful Thinking"
  - Lesson 4: "Writing Your Definite Chief Aim"
  - Lesson 5: "Daily Visualization Practice"

Chapter 2: Faith (5 lessons)
  - Lesson 6: "Faith as a State of Mind"
  - Lesson 7: "Self-Suggestion and Belief"
  - Lesson 8: "Overcoming Doubt"
  - Lesson 9: "Acting As If"
  - Lesson 10: "Building Unshakeable Confidence"

Chapter 3: Persistence (5 lessons)
  - Lesson 11: "The Power of Persistence"
  - Lesson 12: "Defeat is Temporary"
  - Lesson 13: "The Four Steps of Persistence"
  - Lesson 14: "Persistence vs Stubbornness"
  - Lesson 15: "Your Persistence Test"
```

---

## PHASE 2: HOME SCREEN TRANSFORMATION (Priority: HIGH)

### 2.1 Replace Dashboard with Lesson-First Home

**Current:** Dashboard.jsx (stats, goals, habits overview)
**New:** Home.jsx centered on "Today's Lesson"

**Layout:**
```
┌─────────────────────────────────────┐
│  [User Level] [XP] [🔥 Streak: 7]  │
├─────────────────────────────────────┤
│                                     │
│      TODAY'S LESSON                 │
│      ─────────────────              │
│      "Desire" - Lesson 3            │
│      Napoleon Hill World            │
│                                     │
│      [START LESSON →]               │
│                                     │
├─────────────────────────────────────┤
│  Quick Stats (subtle, not primary)  │
│  [Habits] [Journal] [Goals]         │
└─────────────────────────────────────┘
```

### 2.2 Demote Secondary Features

**Keep but deprioritize:**
- Habits → Accessible from menu, can be created FROM lessons
- Journal → Stores reflections automatically, optional deeper entries
- Goals → Background context, not daily focus
- AI Coach → Mentor voice, reacts AFTER lessons

**Remove or Archive:**
- Inspiration Feed (competes with lessons)
- Weekly Challenges (lesson system replaces this)
- Multiple ritual modes (lessons ARE the ritual)

---

## PHASE 3: XP AND PROGRESSION SYSTEM (Priority: HIGH)

### 3.1 Refactor Level System

**Current:** XP from various activities
**New:** XP ONLY from lesson completion

**XP Rules:**
- Complete lesson: +10 XP
- Perfect streak week (7 days): +50 bonus XP
- Chapter completion: +25 XP
- World completion: +100 XP

**Level Thresholds:**
```
Level 1: 0 XP (Seeker)
Level 2: 50 XP (Apprentice)
Level 3: 150 XP (Student)
Level 4: 300 XP (Practitioner)
Level 5: 500 XP (Disciple)
Level 6: 750 XP (Journeyman)
Level 7: 1000 XP (Adept)
Level 8: 1500 XP (Master)
Level 9: 2000 XP (Sage)
Level 10: 3000 XP (Philosopher)
```

### 3.2 Streak System

**Rules:**
- Streak = consecutive days with lesson completion
- One lesson per day required
- Streak freeze: Premium feature (1 per week)

---

## PHASE 4: WISDOM WORLDS MAP (Priority: MEDIUM)

### 4.1 Create World Selection Screen

**Worlds.jsx**
- Visual map of available wisdom worlds
- Clear locked/unlocked states
- Progress percentage per world
- Preview of what each world teaches

### 4.2 Create Chapter View

**ChapterView.jsx**
- Linear lesson progression within chapter
- Visual indicators: completed, current, locked
- Chapter summary and completion badge

---

## PHASE 5: MENTOR INTEGRATION (Priority: MEDIUM)

### 5.1 Refactor AI Coach

**Current:** Open conversation anytime
**New:** Mentor comments AFTER each lesson

**Implementation:**
- Auto-generate mentor comment when lesson completes
- Store comment with lesson completion
- Optional: "Talk to Mentor" for deeper questions
- Mentor personality matches current world author

### 5.2 Mentor Comment Templates

```
Lesson Complete:
"{reflection insight}. {encouragement}. {identity reinforcement}."

Example:
"You've taken the first step by defining your desire. Most people never do this.
You are becoming someone who acts with purpose. Tomorrow, we go deeper."
```

---

## PHASE 6: SUPPORTING TOOLS INTEGRATION (Priority: LOW)

### 6.1 Journal Integration

- Auto-save lesson reflections to journal
- Tag journal entries with lesson source
- "Deep reflection" mode for optional journaling

### 6.2 Habits Integration

- Lessons can SUGGEST habits
- "Create habit from this lesson" button
- Link habits back to source lesson/principle

### 6.3 Goals as Context

- Goals shown as "background motivation"
- Reference user's burning desire in lessons
- Don't surface goals as primary action

---

## IMPLEMENTATION ORDER (Actionable Steps)

### Sprint 1: Backend Foundation (3-5 days)
1. [ ] Create MongoDB schemas for worlds, chapters, lessons, progress
2. [ ] Seed Napoleon Hill World 1 with 15 lessons
3. [ ] Build lesson CRUD endpoints
4. [ ] Build progress/XP endpoints
5. [ ] Build today's lesson endpoint

### Sprint 2: Core Lesson UI (3-5 days)
1. [ ] Create TodaysLesson.jsx component
2. [ ] Build 5-step lesson flow
3. [ ] Add XP reward animation
4. [ ] Add streak display
5. [ ] Connect to backend APIs

### Sprint 3: Home Transformation (2-3 days)
1. [ ] Create new Home.jsx (lesson-first)
2. [ ] Move dashboard to secondary route
3. [ ] Update navigation hierarchy
4. [ ] Add quick stats bar (XP, streak, level)

### Sprint 4: Progression Polish (2-3 days)
1. [ ] Refactor LevelSystem.jsx for new XP rules
2. [ ] Create level-up celebration modal
3. [ ] Build streak milestone celebrations
4. [ ] Add chapter/world completion badges

### Sprint 5: Worlds & Navigation (2-3 days)
1. [ ] Create Worlds.jsx (world selection)
2. [ ] Create ChapterView.jsx (lesson list)
3. [ ] Add locked/unlocked visual states
4. [ ] Connect world progression

### Sprint 6: Mentor & Polish (2-3 days)
1. [ ] Integrate AI for mentor comments
2. [ ] Auto-generate closing comments
3. [ ] Polish animations and transitions
4. [ ] User testing and refinement

---

## WHAT TO KEEP

- Authentication system (works well)
- MongoDB setup (just add new collections)
- UI component library (Radix + Tailwind)
- Dark theme aesthetic
- Basic habits/journal/goals APIs (for supporting roles)
- AI integration (repurpose for mentor)

## WHAT TO REMOVE/ARCHIVE

- InspirationFeed.jsx (competes with lessons)
- WeeklyChallenges.jsx (replaced by lessons)
- Multiple ritual modes (lessons ARE rituals)
- Dashboard as home (demote to analytics)
- Floating action menu (simplify)
- Most of JourneyMap (replace with world map)

## WHAT TO BUILD NEW

- Lesson data model and content
- TodaysLesson experience
- Wisdom Worlds map
- Chapter navigation
- Lesson-based XP system
- Mentor closing comments
- New lesson-first home screen

---

## SUCCESS METRICS

1. **Daily Return Rate:** Users complete 1 lesson/day
2. **Streak Length:** Average streak > 7 days
3. **World Completion:** Users finish entire worlds
4. **Time per Session:** 3-5 minutes (focused)
5. **User Feedback:** "Calm, clear, transformative"

---

## FINAL NOTES

This transformation is about REMOVING complexity, not adding features.
The app will feel smaller but MORE powerful.
Every feature that survives must serve the lesson loop.

**The law:** Lesson → Micro-Action → Reflection → Reward → Mentor

Everything else is support.
