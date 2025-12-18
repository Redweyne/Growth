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

## Transformation Vision
The app is being transformed into a **guided self-transformation journey** (like Duolingo for personal growth):
- Core loop: Lesson → Micro-Action → Reflection → Reward → Mentor Closure
- Wisdom Worlds with Chapters and Lessons
- Home screen = "Today's Lesson" (not dashboard)
- XP and Streaks tied to lesson completion only
- Tools (Journal, Habits, Goals) become supporting features

## Notes
- MongoDB credentials need to be provided by user
- AI coaching uses Gemini 2.0 Flash model
- See TRANSFORMATION_ROADMAP.md for full implementation plan
