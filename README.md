## 1. Project Overview
This project is an AI-powered tool that generates professional, comprehensive README files for your projects in seconds. It leverages advanced AI to analyze your repository and produce detailed documentation tailored to your codebase. Perfect for developers, teams, and open-source contributors who want high-quality project documentation without manual effort.

## 2. Tech Stack
Built with Next.js, JavaScript, Supabase, OpenAI, Stripe

## 3. Installation & Setup

**Prerequisites**
- Node.js
- npm

**Quick Start**
1. Clone the repository
   $ git clone [repository-url]
2. Install dependencies
   $ npm install
3. Set the following environment variables:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   STRIPE_SECRET_KEY
4. Start the development server
   $ npm run dev

## 4. Project Structure
`/lib/stripe.js`: Handles Stripe integration and requires a secret key from environment variables for secure server-side payment processing  
`/lib/supabase/client.js`: Creates and exports a Supabase client using environment variables for authentication and database access  
`/components/sections/hero.jsx`: Renders the main hero section, manages user authentication with Supabase, and provides entry points to create or view documentation  

## 5. License
No license in use.