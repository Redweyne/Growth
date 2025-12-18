# Growth Mindset App

## Overview
A habit tracking and personal growth application designed to guide users through a structured self-transformation journey. Inspired by "Think and Grow Rich," "Atomic Habits," and "The Obstacle Is The Way," the app aims to help users cultivate a growth mindset through a daily "Sacred Loop": Lesson (Wisdom) → Micro-Action (Do) → Reflection (Feel) → Reward (Progress) → Mentor (Belong). The vision is to transform from a dashboard-centric productivity app into a Duolingo-style guided experience for personal growth.

## User Preferences
- **Guiding Principle:** This app will feel SMALLER but MORE POWERFUL. Every feature that remains must serve the lesson loop. Complexity is removed. Depth is added.
- **The Law:** Lesson → Micro-Action → Reflection → Reward → Mentor. Everything else is support.
- I want iterative development following the 6 defined sprints.
- Focus on high-level features only.
- Do not make changes to existing features that are slated for removal or repurposing, unless explicitly instructed for their integration into the new lesson-centric system.

## System Architecture

### UI/UX Decisions
The application's core UI/UX is centered around a "TodaysLesson.jsx" component, providing a single, focused screen for daily transformation practice.
- **Aesthetic:** Calm, serious, dark theme with warm accent colors (e.g., gold/yellow). Minimal distractions, focusing on one task at a time.
- **Progress Indicators:** Clear visual cues for user's progress within chapters, worlds, and overall XP/streak.
- **Celebration:** Subtle animations for rewards and milestones, maintaining a dignified user experience.
- **New Home Screen:** Lesson-first, featuring prominent "Today's Lesson" access, subtle quick stats, and streamlined navigation.

### Technical Implementations
- **Frontend:** React 19, CRACO, TailwindCSS for styling, and Radix UI for UI components.
- **Backend:** FastAPI for robust API services, Uvicorn as the ASGI server, and Pydantic for data validation.
- **Database:** PostgreSQL managed via SQLAlchemy ORM, with a new schema designed for wisdom worlds, chapters, lessons, and user progress tracking.

### Feature Specifications
- **Sacred Loop:** The central user interaction, guiding users through daily wisdom, micro-actions, reflection, reward, and AI-mentorship.
- **Wisdom Worlds:** Complete philosophical frameworks (e.g., Napoleon Hill's "Think and Grow Rich") structured into chapters and daily lessons.
- **XP & Progression System:** XP is exclusively earned through lesson completion, contributing to leveling up and streak maintenance.
- **AI Coach:** LiteLLM is used for generating personalized mentor comments in the voice of the current world's author after each lesson completion.
- **Repurposed Features:**
    - **Habits:** Shifted from primary creation to lesson-suggested, allowing users to create habits directly from lesson micro-actions.
    - **Journal:** Lesson reflections auto-save to the journal, tagged with the lesson, offering deep reflection options.
    - **Goals:** Moved to background context, referenced by lessons but not a primary creation point in the main flow.
- **Removed Features:** Inspiration Feed, Weekly Challenges, Multiple Ritual Modes, Floating Action Menu (simplified), current Journey Map (to be redesigned as World Map), primary Vision Board (demoted), Exercises page (integrated into lessons).

### System Design Choices
- **Database Schema:** New collections for `wisdom_worlds`, `chapters`, `lessons`, `user_progress`, and `lesson_completions` to support the Duolingo-style journey.
- **API Endpoints:** Dedicated endpoints for fetching today's lesson, completing lessons, managing user progress, and accessing world/chapter information.
- **Deployment:** Configured for autoscale deployment, building the frontend and running the backend with Uvicorn.

## External Dependencies
- **React 19:** Frontend library.
- **CRACO:** Configuration layer for Create React App.
- **TailwindCSS:** Utility-first CSS framework.
- **Radix UI:** Headless UI components.
- **FastAPI:** Python web framework for backend.
- **Uvicorn:** ASGI server.
- **Pydantic:** Data validation library.
- **SQLAlchemy:** SQL toolkit and ORM for Python.
- **PostgreSQL:** Relational database (Replit built-in).
- **LiteLLM:** For AI coaching features, utilizing the Gemini 2.0 Flash model.