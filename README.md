# Project Overview
I built Reponote to solve the issue whereby developers need to spend excessive time creating and maintaining README files for their projects. By using AI to automatically generate professional README files, Reponote streamlines this process, allowing developers to focus more on coding and less on documentation. This project is perfect for developers and project managers who need a quick, reliable way to create well-organized and professional README files for their GitHub repositories.

# Tech Stack
Built with Next.js, React, TailwindCSS, Supabase, and Stripe.

# Installation & Setup
### Prerequisites
- Node.js (version specified in `package.json` if any)
- npm (version specified in `package.json` if any)
- Supabase account
- Stripe account

### Quick Start
1. Clone the repository and navigate to the project directory:
   $ git clone [repository_url] && cd [repository_directory]

2. Install dependencies using npm:
   $ npm install

3. Set up your environment variables (create a `.env` file in the root directory with the following variables):
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Start the development server:
   $ npm start

# Project Structure
`package.json`: Manages project dependencies and scripts for building and running the Next.js app.
`app/page.js`: Serves as the main page layout where `Navbar`, `Hero`, `Features`, `Steps`, and `Pricing` components are rendered.
`components/sections/hero.jsx`: Handles the hero section introducing Reponote and includes GitHub authentication via Supabase.
`lib/stripe.js`: Contains server-side Stripe API configuration and initialization.

# License
License: Not currently specified