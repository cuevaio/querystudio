
# QueryStudio

**AI-Powered Market Analysis & Competitor Research Platform**

QueryStudio is a comprehensive tool that helps companies onboard into AI-driven market research. It enables organizations to create structured projects, define research topics, and generate intelligent queries for competitor analysis and market insights using advanced AI models.

## ✨ Features

- **🏢 Company Onboarding**: Automated company profile creation from website URLs
- **📊 Topic Management**: Organize research into structured topics and subtopics
- **🤖 AI-Powered Queries**: Generate intelligent research queries using Claude and ChatGPT
- **⚡ Background Processing**: Handle long-running tasks with Trigger.dev
- **🔐 Authentication**: Better Auth framework (GitHub OAuth coming soon)
- **📱 Modern UI**: Responsive design with Tailwind CSS and Radix UI components
- **🗄️ Robust Database**: PostgreSQL with Drizzle ORM for type-safe database operations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL (Supabase), Drizzle ORM
- **Authentication**: Better Auth (GitHub OAuth - coming soon)
- **AI**: Anthropic Claude, OpenAI GPT models
- **Background Jobs**: Trigger.dev
- **Package Manager**: Bun
- **Code Quality**: Biome (linting & formatting)

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- PostgreSQL database (we recommend [Supabase](https://supabase.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd querystudio
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file based on the environment variables below:

   ```env
   # Database (Supabase)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].pooler.supabase.com:6543/postgres"
   
   # AI Providers
   ANTHROPIC_API_KEY="your_claude_api_key"
   OPENAI_API_KEY="your_openai_api_key"
   
   # Background Jobs
   TRIGGER_PROJECT_ID="your_trigger_project_id"
   TRIGGER_SECRET_KEY="your_trigger_secret_key"
   ```

4. **Database Setup**
   ```bash
   # Generate and run database migrations
   bun run db:generate
   bun run db:migrate
   
   # For development, you can also use:
   bun run db:push
   ```

5. **Trigger.dev Configuration**
   - Go to [trigger.dev](https://trigger.dev/) and sign in with GitHub
   - Create a new project
   - Copy the project ID and development secret key to your `.env.local`
   - Start the Trigger.dev development server:
     ```bash
     npx trigger.dev@latest dev
     ```
   - This connects your local development to Trigger.dev for testing background jobs

6. **Start Development Server**
   ```bash
   bun dev
   ```

   The application will be available at `http://localhost:3000`

## 📖 Usage

### Creating a Company Project

1. **Access the application** (signin with email and password)
2. **Create a new project** by providing a company website URL
3. **AI Analysis**: The system will automatically analyze the website and generate a company profile
4. **Topic Selection**: Choose or customize research topics relevant to your industry
5. **Query Generation**: AI will generate intelligent research queries for each topic

### Managing Research Topics

- **View Topics**: Browse all research topics in an organized accordion layout
- **Add Queries**: Create custom queries or let AI generate them
- **Execute Research**: Run queries to gather competitor insights
- **Chat Interface**: Interact with AI assistants for deeper analysis

## 🔧 Development

### Available Scripts

```bash
# Development
bun dev                    # Start development server
bun build                  # Build for production
bun start                  # Start production server

# Database
bun run db:generate        # Generate database migrations
bun run db:migrate         # Run migrations
bun run db:push           # Push schema changes (development)
bun run db:pull           # Pull schema from database

# Code Quality
bun run lint              # Next.js linting
bun run biome:check       # Biome linting and formatting
```

### Project Structure

```
src/
├── app/                  # Next.js app router pages
├── components/           # Reusable UI components
├── db/                   # Database schema and configuration
├── lib/                  # Utility functions and configurations
├── prompts/              # AI prompt templates
├── schemas/              # Zod validation schemas
├── actions/              # Server actions
├── hooks/                # Custom React hooks
└── trigger/              # Background job definitions
```

## 🔐 Authentication

Authentication is currently in development. The application uses Better Auth framework with GitHub OAuth integration planned for future release.

## 🤖 AI Integration

QueryStudio supports multiple AI providers:

- **Claude (Anthropic)**: Primary AI for analysis and query generation
- **ChatGPT (OpenAI)**: Alternative AI provider for diverse perspectives

Configure your API keys in the environment variables to enable AI features.

## 📦 Deployment

QueryStudio is deployed using [Vercel](https://vercel.com/) for seamless integration with the Next.js framework.

### Vercel Deployment

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect it's a Next.js project

2. **Trigger.dev Production Deployment**
   First, deploy your background jobs to Trigger.dev production:
   
   ```bash
   # Add environment variables to your Trigger.dev project
   # Configure these in your Trigger.dev dashboard:
   # - DATABASE_URL
   # - ANTHROPIC_API_KEY  
   # - OPENAI_API_KEY
   
   # Deploy to Trigger.dev production
   npx trigger.dev@latest deploy
   ```

3. **Environment Variables**
   Configure the following environment variables in your Vercel project settings:
   ```env
   # Database (Supabase)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].pooler.supabase.com:6543/postgres"
   
   # AI Providers
   ANTHROPIC_API_KEY="your_claude_api_key"
   OPENAI_API_KEY="your_openai_api_key"
   
   # Background Jobs (Use PRODUCTION API key from Trigger.dev)
   TRIGGER_PROJECT_ID="your_trigger_project_id"
   TRIGGER_SECRET_KEY="your_trigger_production_secret_key"
   ```

4. **Build Settings**
   - **Framework Preset**: Next.js
   - **Node.js Version**: 18.x or later
   - **Package Manager**: Bun (configure in Vercel settings)
   - **Build Command**: `bun run build`
   - **Output Directory**: `.next` (default)

5. **Deploy**
   - Push to your main branch to trigger automatic deployments
   - Vercel will handle the build and deployment process

### Manual Build Commands

For local testing of production builds:
```bash
bun run build
bun start
```

### Production Considerations

- **Environment Variables**: Configure all required variables in both Vercel and Trigger.dev dashboard
- **API Keys**: Use production Trigger.dev API key in Vercel (different from development key)
- **Database**: SSL connection is enabled by default with Supabase
- **Webhooks**: Ensure Trigger.dev webhooks are configured for your production domain
- **Deployment Order**: Deploy to Trigger.dev production first, then deploy to Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and run quality checks: `bun run biome:check`
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**QueryStudio** - Transform your market research with AI-powered insights