# Kineo - AI-Powered Manim Animation Generator

![Kineo Logo](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Python](https://img.shields.io/badge/Python-3.12%2B-orange) ![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.136%2B-blueviolet)

**Kineo** is an innovative AI-powered platform that enables users to generate and edit mathematical animations using **Manim** through natural language prompts. Powered by Large Language Models and a sophisticated agent pipeline, Kineo automates the entire process from code generation to video rendering.

## 🎯 Features

### ✨ Core Capabilities
- **Natural Language to Animation**: Describe your animation in plain English, and Kineo generates the Manim code
- **AI Agent Pipeline**: Multi-stage agent system with detection, planning, coding, rendering, and error fixing
- **Real-time Streaming**: Watch your animation being created in real-time via Server-Sent Events (SSE)
- **Background Processing**: Start jobs and poll for results asynchronously
- **Code Editing**: Modify existing animations with AI assistance
- **Automatic Error Recovery**: AI automatically detects and fixes code errors

### 🎨 Animation Features
- Generate Manim scenes with complex mathematical visualizations
- Support for 2D and 3D animations
- LaTeX rendering for mathematical expressions
- Custom styling and animation effects
- Multiple iteration refinements

### 📊 Platform Features
- **User Authentication**: Secure login with Google OAuth and email/password
- **Subscription Management**: Integrated with Stripe for premium features
- **Project Management**: Organize your animations into projects
- **Dashboard**: View and manage all your creations
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

Kineo consists of two main components:

```
Kineo
├── Server/          # Python Backend (FastAPI)
│   ├── main.py      # API endpoints and SSE streaming
│   ├── Langraph/    # AI Agent pipeline (LangGraph)
│   │   ├── Agent.py # Graph workflow definition
│   │   ├── State.py # Agent state management
│   │   └── Nodes/   # Pipeline nodes (detect, plan, code, render, fix)
│   ├── Modal/       # Cloud video rendering
│   │   ├── Setup.py # Modal app configuration
│   │   └── function.py # Manim rendering functions
│   ├── LLM/         # Large Language Model integrations
│   │   ├── openai.py # GitHub Models / OpenAI integration
│   │   └── gemini.py # Google Gemini integration
│   └── Utils/       # Helper utilities (Cloudinary upload, etc.)
│
└── euler/           # Next.js Frontend
    ├── app/          # Next.js 16 App Router
    │   ├── dashboard/ # User dashboard
    │   ├── api/      # API routes
    │   └── ...       # Landing pages (pricing, features, etc.)
    ├── components/   # React components (shadcn/ui)
    ├── lib/          # Authentication and database
    ├── db/           # Database schema (Drizzle ORM)
    └── scripts/      # Utility scripts
```

### 🔄 Data Flow

```mermaid
flowchart TD
    A[User Prompt] -->|HTTP Request| B[FastAPI Server]
    B --> C[Detect Mode: New/Edit?]
    C --> D[Plan: Generate strategy]
    D --> E[Code: Generate Manim code]
    E --> F[Render: Create video]
    F -->|Success| G[Upload to Cloudinary]
    F -->|Error| H[Fix: Analyze and correct]
    H --> E
    G --> I[Return Video URL]
    I --> J[Frontend Display]
```

## 🚀 Quick Start

### Prerequisites

#### For Backend (Server)
- Python 3.12 or higher
- UV package manager (recommended) or pip
- Git

#### For Frontend (euler)
- Node.js 18 or higher
- Bun package manager (recommended) or npm/yarn
- PostgreSQL database (Neon, Supabase, or local)

#### External Services
- **GitHub Token** (for GitHub Models API)
- **Cloudinary Account** (for video storage)
- **Stripe Account** (for subscriptions)
- **Google OAuth Credentials** (for authentication)
- **Modal Account** (for cloud rendering)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
cd /home/supprit/Code
# The project is already cloned as Kineo
```

### 2. Backend Setup (Server)

#### Install Dependencies

```bash
cd Server

# Create virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies using UV
uv pip install -r <(echo "fastapi[standard]>=0.136.3")
uv pip install cloudinary>=1.40.0 langchain-openai>=1.2.2 langgraph>=1.2.2 modal>=1.4.3 pathlib>=1.0.1 pydantic>=2.13.4 python-dotenv>=1.2.2

# Or using pip
pip install -r <(cat pyproject.toml | grep -A 10 "dependencies" | grep -v "dependencies" | tr -d '"[] ' | sed 's/,//g')
```

#### Configure Environment Variables

Copy the sample environment file and update with your credentials:

```bash
cp .env.sample .env
```

Edit `.env` with your actual values:

```env
# LLM Configuration
GITHUB_TOKEN=your_github_personal_access_token

# Cloudinary Configuration (for video storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Note**: Get GitHub token from [GitHub Settings > Tokens](https://github.com/settings/tokens)
> Get Cloudinary credentials from [Cloudinary Dashboard](https://console.cloudinary.com/settings/api-keys)

#### Run the Backend Server

```bash
# Development mode
uv run uvicorn main:app --reload --port 8000

# Or with pip
python -m uvicorn main:app --reload --port 8000
```

The server will be available at `http://localhost:8000`

#### API Documentation

Once running, visit `http://localhost:8000/docs` for interactive Swagger UI documentation.

---

### 3. Frontend Setup (euler)

#### Install Dependencies

```bash
cd euler

# Install using Bun (recommended)
bun install

# Or using npm
npm install
```

#### Configure Environment Variables

Create or edit `.env` file:

```bash
cp .env.sample .env 2>/dev/null || touch .env
```

Edit `.env` with your configuration:

```env
# Authentication
BETTER_AUTH_SECRET=your_random_secret_string
BETTER_AUTH_URL=http://localhost:3000

# Database (PostgreSQL)
# Using Neon (serverless PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (for password reset)
GMAIL_EMAIL=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

> **Note**: Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
> Get Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

#### Set Up Database

1. **Create a PostgreSQL database** (recommended: [Neon](https://neon.tech/) for serverless)
2. **Run migrations** (if using Drizzle):

```bash
# Install Drizzle Kit globally
bun add -g drizzle-kit

# Push schema to database
drizzle-kit push:pg
```

Or manually create the tables from `db/schema.ts`

#### Run the Frontend

```bash
# Development mode
bun run dev

# Or with npm
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## 🎬 Using Kineo

### Via API (Direct Usage)

#### Generate a New Animation (Streaming)

```bash
curl -X POST http://localhost:8000/generate/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a circle that moves from left to right", "max_iterations": 5}'
```

This returns a Server-Sent Events stream with real-time updates.

#### Generate a New Animation (Background Job)

```bash
# Start job
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a sine wave animation", "max_iterations": 5}'

# Response: {"job_id": "uuid", "status": "pending"}

# Check status
curl http://localhost:8000/status/JOB_ID_HERE
```

#### Edit an Existing Animation

```bash
curl -X POST http://localhost:8000/edit/stream \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Make the circle red and larger",
    "previous_code": "from manim import *\nclass MyScene(Scene):\n    def construct(self):\n        circle = Circle()\n        self.play(Create(circle))\n        self.wait()",
    "max_iterations": 3
  }'
```

### Via Web Interface

1. Navigate to `http://localhost:3000`
2. Sign up or log in
3. Go to the Dashboard
4. Click "New Project" or select an existing project
5. Enter your animation prompt
6. Watch as Kineo generates and renders your animation
7. Download or share your video

---

## 🔧 Configuration Options

### Backend Configuration

| Environment Variable | Description | Required |
|---------------------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token for Models API | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

### Frontend Configuration

| Environment Variable | Description | Required |
|---------------------|-------------|----------|
| `BETTER_AUTH_SECRET` | Secret for authentication | Yes |
| `BETTER_AUTH_URL` | Auth callback URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | For payments |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | Yes |

---

## 📦 Project Structure

### Server (Backend)

```
Server/
├── main.py              # FastAPI application with all endpoints
├── pyproject.toml       # Python dependencies
├── .env.sample          # Environment variables template
├── Langraph/
│   ├── Agent.py         # Main agent graph definition
│   ├── State.py         # Pydantic state model
│   └── Nodes/           # Graph nodes
│       ├── Code.py      # Code generation node
│       ├── Detect.py    # Request mode detection
│       ├── Fix.py       # Error fixing node
│       ├── Plan.py      # Planning node
│       ├── Router.py    # Conditional routing logic
│       └── Worker.py    # Video rendering node
├── Modal/
│   ├── Setup.py         # Modal app configuration
│   └── function.py      # Manim rendering functions
├── LLM/
│   ├── openai.py        # OpenAI/GitHub Models LLM
│   └── gemini.py        # Google Gemini LLM
├── Utils/
│   └── cloudinary_upload.py  # Cloudinary upload utility
└── renders/             # Local video backups
```

### Euler (Frontend)

```
euler/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Landing page
│   ├── dashboard/
│   │   ├── page.tsx     # Dashboard server component
│   │   └── client.tsx    # Dashboard client component
│   │   └── projects/     # Project management
│   └── api/             # API routes
├── components/
│   ├── landing/         # Landing page components
│   ├── ui/              # shadcn/ui components
│   └── ...
├── lib/
│   ├── auth.ts          # Authentication setup
│   └── utils.ts         # Utility functions
├── db/
│   ├── schema.ts        # Database schema (Drizzle)
│   └── index.ts         # Database connection
├── drizzle.config.ts    # Drizzle ORM configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

---

## 🤖 AI Agent Pipeline

Kineo uses **LangGraph** to orchestrate a multi-agent pipeline for generating animations:

### Pipeline Stages

1. **Detect Mode** (`detect_mode`)
   - Determines if this is a new generation or an edit request
   - Sets `is_edit_request` flag in state

2. **Planning** (`plan`)
   - AI generates a high-level plan for the animation
   - Describes the approach and scene structure

3. **Code Generation** (`code`)
   - AI writes Manim Python code based on the plan
   - Includes scene class, imports, and animation logic

4. **Video Rendering** (`render`)
   - Executes Manim code using Modal's cloud infrastructure
   - Renders video in MP4 format
   - Uploads to Cloudinary for CDN delivery

5. **Error Fixing** (`fix`)
   - If rendering fails, AI analyzes the error
   - Corrects the code and retries
   - Supports up to `max_iterations` attempts

### Conditional Flow

```
Start → Detect Mode → Plan → Code → Render
                            ↓
                     [If Error] → Fix → Render (retry)
                            ↓
                     [If Fixed] → Continue
                            ↓
                     [Max retries] → End (with error)
```

---

## 💾 Database Schema

Kineo uses PostgreSQL with the following tables:

- **user**: User accounts and profiles
- **session**: Authentication sessions
- **account**: OAuth provider accounts (Google, etc.)
- **verification**: Email verification tokens
- **subscription**: User subscription details (Stripe integration)
- **project**: User projects for organizing animations
- **generation**: Individual animation generation records

See `euler/db/schema.ts` for detailed schema definitions.

---

## 🔐 Authentication

Kineo uses **Better Auth** for authentication with:

- Email/Password login
- Google OAuth 2.0
- Secure session management
- Password reset functionality

### OAuth Setup

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID
   - Add `http://localhost:3000/api/auth/callback/google` as authorized redirect URI

2. **Other Providers**: Can be added via Better Auth configuration

---

## 💳 Subscriptions & Payments

Kineo integrates with **Stripe** for subscription management:

- Multiple pricing tiers
- Monthly/Yearly billing
- Trial periods
- Automatic renewals
- Webhook handling for payment events

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test/live keys from the Dashboard
3. Configure webhook endpoint: `/api/webhooks/stripe`
4. Set up pricing plans in Stripe Dashboard

---

## ☁️ Cloud Services

### Modal (Video Rendering)

Kineo uses **Modal** for cloud-based video rendering:

- Containerized Manim execution
- Automatic dependency installation
- Scalable compute resources
- Cost-effective pay-per-use model

#### Modal Setup

1. Sign up at [modal.com](https://modal.com)
2. Install Modal CLI: `pip install modal`
3. Authenticate: `modal login`
4. Deploy your rendering function

The Modal app is pre-configured with:
- Debian slim base image
- Python 3.12
- Manim 0.18.1
- FFmpeg and LaTeX dependencies
- All required system packages

### Cloudinary (Video Storage)

Cloudinary provides:
- Video CDN for fast delivery
- Automatic optimization
- Storage and bandwidth
- Public URLs for embedding

---

## 📝 API Endpoints

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Liveness check |

### Streaming Endpoints (SSE)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate/stream` | Generate animation with real-time streaming |
| POST | `/edit/stream` | Edit animation with real-time streaming |

### Background Job Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Start generation job (returns job_id) |
| POST | `/edit` | Start edit job (returns job_id) |
| GET | `/status/{job_id}` | Check job status and results |

### Request Models

#### GenerateRequest
```json
{
  "prompt": "Create a circle animation",
  "max_iterations": 5
}
```

#### EditRequest
```json
{
  "prompt": "Make it red",
  "previous_code": "from manim import *\nclass Scene...",
  "max_iterations": 5
}
```

### Response Models

#### JobCreatedResponse
```json
{
  "job_id": "uuid-string",
  "status": "pending"
}
```

#### JobStatusResponse
```json
{
  "job_id": "uuid-string",
  "status": "pending|running|done|failed",
  "video_url": "https://res.cloudinary.com/.../video.mp4",
  "video_urls": ["..."],
  "plan": "High-level plan text",
  "code": "Generated Manim code",
  "error": null,
  "iterations": 1
}
```

### SSE Event Types

Each event in the streaming response is a JSON object:

```json
{
  "type": "node|done|error",
  "node": "detect_mode|plan|code|render|fix",
  "message": "Human-readable status",
  "plan": "...",        // For plan node
  "code": "...",        // For code node
  "video_url": "...",   // For render node
  "video_urls": [...],  // All video URLs
  "error": "...",       // For error type
  "iteration": 1       // Current iteration
}
```

---

## 🚨 Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Job not found` | Invalid job_id | Use correct job_id from creation response |
| `No Scene subclass` | Generated code missing Scene class | Increase max_iterations or improve prompt |
| `SyntaxError` | Invalid Python syntax in generated code | AI will auto-fix in next iteration |
| `Render failed` | Manim rendering error | Check error details, try different prompt |
| `Cloudinary upload failed` | Invalid Cloudinary credentials | Verify .env Cloudinary settings |
| `LLM rate limit` | Too many API calls | Add rate limiting or use different LLM |

### Error Types in State

- `syntax`: Python syntax errors
- `runtime`: Runtime errors (AttributeError, TypeError)
- `env`: Environment/missing dependencies
- `logic`: Logical errors in animation code

---

## 📊 Monitoring & Debugging

### Backend Logs

```bash
# Run with verbose logging
uv run uvicorn main:app --reload --port 8000 --log-level debug

# Or with standard logging
python -m uvicorn main:app --reload --port 8000
```

### Frontend Debugging

```bash
# Run with debug mode
bun run dev

# Check TypeScript errors
bun run typecheck

# Format code
bun run format

# Lint code
bun run lint
```

### Local Video Files

Rendered videos are also saved locally in `Server/renders/` for debugging:
- `render_iter_0.mp4` - First iteration
- `render_iter_1.mp4` - Second iteration (if retry)
- etc.

---

## 🔄 Deployment

### Development Deployment (Local)

Run both frontend and backend locally:

**Terminal 1 (Backend)**:
```bash
cd Server
source .venv/bin/activate
uv run uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd euler
bun run dev
```

Access:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Production Deployment

#### Backend (Server)

**Docker (Recommended)**:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Copy requirements
COPY Server/pyproject.toml .

# Install dependencies
RUN pip install --no-cache-dir -r <(cat pyproject.toml | grep -A 10 dependencies | grep -v dependencies | tr -d '"[] ' | sed 's/,//g')

# Copy source code
COPY Server/ .

# Set environment variables
ENV GITHUB_TOKEN=${GITHUB_TOKEN}
ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
ENV CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t kineo-server .
docker run -p 8000:8000 kineo-server
```

**Alternative: Deploy to cloud platforms**
- Fly.io
- Railway
- Render
- AWS ECS
- Google Cloud Run

#### Frontend (euler)

**Vercel (Recommended)**:

1. Install Vercel CLI: `bun add -g vercel`
2. Deploy: `vercel`

**Netlify**:
1. Drag and drop `euler` folder to Netlify
2. Configure environment variables in Netlify dashboard

**Docker**:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="$HOME/.bun/bin:$PATH"

# Copy package files
COPY euler/package.json euler/bun.lock* .

# Install dependencies
RUN bun install --production

# Copy source code
COPY euler/ .

# Build
RUN bun run build

# Set environment variables
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV DATABASE_URL=${DATABASE_URL}
# ... other env vars

EXPOSE 3000

CMD ["bun", "run", "start"]
```

Build and run:
```bash
docker build -t kineo-frontend .
docker run -p 3000:3000 kineo-frontend
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting:
   ```bash
   # Backend
   cd Server
   # Run tests if available
   
   # Frontend
   cd euler
   bun run typecheck
   bun run lint
   bun run format
   ```
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8 guidelines
- **TypeScript**: Use TypeScript strict mode
- **React**: Use functional components with hooks
- **Components**: Use shadcn/ui for consistent styling

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Kineo is built using these amazing technologies:

- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for Python
- **[LangGraph](https://langchain-ai.github.io/langgraph/)** - Agent orchestration framework
- **[LangChain](https://www.langchain.com/)** - LLM application development
- **[Modal](https://modal.com/)** - Cloud computing for Python
- **[Manim](https://www.manim.community/)** - Mathematical animation engine
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible UI components
- **[Better Auth](https://better-auth.com/)** - Authentication library
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL query builder
- **[Stripe](https://stripe.com/)** - Payments and subscriptions
- **[Cloudinary](https://cloudinary.com/)** - Media management and delivery
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

---

## 📞 Support & Contact

- **GitHub Issues**: [Open an issue](https://github.com/your-username/kineo/issues)
- **Documentation**: This README and inline code comments
- **Community**: Join our Discord (if available)

---

## 🔮 Roadmap

### Upcoming Features

- [ ] **Multi-modal inputs**: Upload images for reference
- [ ] **Animation templates**: Pre-built animation styles
- [ ] **Collaboration**: Share projects with team members
- [ ] **Version history**: Track changes to animations
- [ ] **Export options**: Download code, GIF, or individual frames
- [ ] **Advanced editing**: Fine-tune animations with sliders and controls
- [ ] **Voice narration**: Add voiceovers to animations
- [ ] **API rate limiting**: Protect backend from abuse
- [ ] **Caching**: Cache frequent prompts for faster response
- [ ] **Analytics**: Track usage and popular animations

### Long-term Vision

- Mobile app for animation creation on-the-go
- AI-powered tutorial generation for learning Manim
- Community marketplace for sharing animations
- Integration with educational platforms
- Real-time collaborative editing

---

---

**Made with ❤️ and AI by Supprit**

*Last updated: June 2026*
