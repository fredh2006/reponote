# Project Overview
Reponote leverages AI to help developers effortlessly generate detailed and professional README files for their projects. The application requires GitHub OAuth for login and once authenticated, users are redirected to a creation page where they can generate READMEs. Perfect for developers who need a reliable AI-powered tool to streamline their project documentation process.

# Tech Stack
Built with Next.js, React, TailwindCSS, Supabase, and Stripe.

# Installation & Setup
## Prerequisites
- Node.js

## Quick Start
1. Clone the repository:
bash
git clone https://github.com/username/reponote.git
cd reponote
npm install
npm run dev
2. For any required environment variables (like `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`):
   - Create a `.env` file in the root directory.
   - Add the required environment variables such as `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`.

# Project Structure
/app/page.js: Main application entry rendering various sections.
/components/sections/hero.jsx: Hero section including GitHub OAuth login via Supabase.

# License
License: Not currently specified.