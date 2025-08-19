# 🧠 MindMap - The Journal Where Every Thought Maps Its Purpose

<div align="center">

![MindMap Logo](public/assets/logo.png)

**Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling.**

🌐 **Live Application**: [mindmap-journals.vercel.app](https://mindmap-journals.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![Material-UI](https://img.shields.io/badge/MUI-7.0.2-blue?logo=mui)](https://mui.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)

</div>

## 🎯 Overview

MindMap is a comprehensive mental health and journaling platform that transforms traditional journaling into an intelligent, AI-powered experience. Our platform helps users gain deeper insights into their emotional patterns, track personal growth, and develop better mental wellness habits through guided reflection and gamified experiences.

**🚀 Visit the live application at [mindmap-journals.vercel.app](https://mindmap-journals.vercel.app)**

## ✨ Key Features

### 🖊️ **Intelligent Journaling**

- **Guided Journaling**: Structured prompts across multiple themes (Journaling, Productivity, Growth, Self-Reflection, Problem-Solving, Creative Expression)
- **Freeform Writing**: Open-ended journaling for complete creative freedom
- **AI-Powered Analysis**: Automatic emotion detection and sentiment analysis of journal entries
- **Smart Insights**: Personalized recommendations and actionable advice based on your writing patterns

### 📊 **Advanced Analytics & Tracking**

- **Emotion Tracking**: Visual representation of your emotional patterns over time
- **Mood Distribution Charts**: Comprehensive overview of your emotional journey
- **Personal Growth Indicators**: Track your progress and identify areas for improvement
- **Journal Summaries**: AI-generated summaries of your entries and key themes

### 🎮 **Gamification & Engagement**

- **Badge System**: Unlock 15 unique badges for various journaling milestones
- **Streak Tracking**: Maintain consistency with daily journaling streaks
- **Wellness Goals**: Set and achieve personalized mental health objectives
- **Progress Visualization**: See your journey through beautiful, interactive displays

### 🛡️ **Privacy & Security**

- **End-to-End Encryption**: All journal entries are encrypted for maximum privacy
- **Secure Authentication**: Email-based registration with email verification
- **Data Protection**: Your personal thoughts remain completely private and secure

### 🆘 **Mental Health Support**

- **Crisis Resources**: Quick access to mental health hotlines and emergency contacts
- **Personalized Coping Strategies**: Evidence-based recommendations tailored to your needs
- **Mindfulness Exercises**: Built-in guided exercises for stress relief and emotional regulation
- **Professional Resources**: Integration with mental health support networks

### 📱 **User Experience**

- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Material-UI
- **Smooth Animations**: Enhanced with Framer Motion for delightful interactions
- **Profile Management**: Comprehensive user profiles with personalization options

## 🛠️ Technology Stack

### **Frontend**

- **Framework**: Next.js 15.3.1 (React 19.0.0)
- **UI Library**: Material-UI (@mui/material) 7.0.2
- **Animations**: Framer Motion 12.15.0
- **State Management**: React Context API
- **Styling**: CSS-in-JS with Material-UI's styled system

### **Backend & Database**

- **Backend-as-a-Service**: Supabase
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL (via Supabase)
- **File Storage**: Supabase Storage for profile pictures and assets
- **API**: Next.js API Routes

### **AI & Analytics**

- **AI Processing**: NVIDIA AI APIs for journal analysis
- **Emotion Detection**: Custom emotion analysis algorithms
- **Natural Language Processing**: Advanced text analysis for insights generation

### **Security & Privacy**

- **Encryption**: Custom encryption utilities for journal data
- **Session Management**: Secure session handling with Supabase
- **Data Protection**: GDPR-compliant data handling practices

### **Development & Deployment**

- **Development**: Next.js development server
- **Deployment**: Vercel (Production: [mindmap-journals.vercel.app](https://mindmap-journals.vercel.app))
- **Version Control**: Git
- **Package Management**: npm

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn**
- **Supabase Account** (for database and authentication)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/mindmap.git
cd mindmap
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Environment Setup**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Encryption (generate secure random strings)
ENCRYPTION_KEY=your_32_character_encryption_key
ENCRYPTION_IV=your_16_character_encryption_iv

# AI API Configuration
NVIDIA_API_KEY=your_nvidia_api_key
```

4. **Database Setup**

Set up your Supabase database with the required tables:

- `user_table`: User profiles and metadata
- `journal_entries`: Encrypted journal entries
- `user_badges`: Badge tracking and achievements
- `emotions`: Emotion tracking data
- `user_streaks`: Journaling streak information

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
MindMap/
├── components/           # Reusable React components
│   ├── cards/           # Card components (recap, journal)
│   ├── disclaimer/      # Legal and safety components
│   ├── layout/          # Layout components (header, footer, navbar)
│   └── profile/         # Profile-related components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities and configurations
│   ├── auth.js         # Authentication utilities
│   ├── encryption.js   # Data encryption/decryption
│   └── supabase.js     # Supabase client configuration
├── pages/              # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   │   ├── auth/       # Authentication endpoints
│   │   ├── analyze-journal/ # AI analysis endpoints
│   │   ├── badges/     # Badge system endpoints
│   │   └── create-journal/ # Journal creation endpoints
│   ├── auth/           # Authentication pages
│   ├── guided-journaling/ # Guided journaling flows
│   ├── profile/        # User profile pages
│   └── [other pages]   # Dashboard, journals, insights, etc.
├── public/             # Static assets
│   └── assets/         # Images, icons, and media files
├── styles/             # Global CSS styles
└── utils/              # Utility functions and helpers
```

## 🎨 Features Deep Dive

### **Guided Journaling System**

The platform offers structured journaling experiences across six key themes:

- **Journaling**: Build consistent writing habits
- **Productivity**: Optimize focus and time management
- **Growth**: Track personal development milestones
- **Self-Reflection**: Develop deeper self-awareness
- **Problem-Solving**: Work through challenges systematically
- **Creative Expression**: Unleash creativity and innovation

### **AI-Powered Insights**

Our advanced AI system analyzes your journal entries to provide:

- **Emotional Pattern Recognition**: Identify recurring emotional themes
- **Personalized Recommendations**: Tailored advice based on your writing
- **Growth Indicators**: Track your personal development journey
- **Coping Strategy Suggestions**: Evidence-based mental health techniques

### **Gamification Elements**

Stay motivated with our comprehensive badge system:

- **Thought Weaver (Beginner)**: Start your journaling journey
- **Inner Voyager**: Explore deep self-reflection
- **Growth Gardener**: Nurture personal development
- **Mindful Explorer**: Develop mindfulness practices
- **Creative Catalyst**: Unlock creative potential
- **And 10 more unique achievements**

## 🔒 Privacy & Security

Your mental health data deserves the highest level of protection:

- **🔐 Encryption**: All journal entries are encrypted before storage
- **🛡️ Secure Authentication**: Industry-standard authentication practices
- **🔒 Data Isolation**: Each user's data is completely isolated
- **📱 Session Security**: Secure session management across devices
- **🚫 No Data Selling**: We never sell or share your personal data

## 🌐 Live Deployment

**Experience MindMap today at [mindmap-journals.vercel.app](https://mindmap-journals.vercel.app)**

The application is deployed on Vercel's edge network, ensuring:

- ⚡ Lightning-fast global performance
- 🌍 99.9% uptime reliability
- 🔄 Automatic deployments from main branch
- 📊 Real-time analytics and monitoring

## 🤝 Contributing

We welcome contributions to make MindMap even better! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Include tests for new features when applicable
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🌟 Start your journey toward better mental wellness today**

**[Launch MindMap](https://mindmap-journals.vercel.app) •**

_Made with ❤️ for mental health and personal growth_

</div>
