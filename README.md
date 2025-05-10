## Project Overview

I built Reponote to solve the issue of managing and organizing projects easily. With a focus on creating README files efficiently using GitHub authentication, users can make professional READMEs in a structured manner. Reponote is perfect for developers who need a user-friendly tool to generate professional README.md files for their GitHub projects seamlessly by using their GitHub account for authentication.

## Tech Stack

Built with Next.js, React, Tailwind CSS, Supabase, and Stripe.

## Installation & Setup

#### Prerequisites

- Node.js
- npm 

#### Quick Start

1. Clone the repository:
   
       $ git clone <repository-url>
       $ cd reponote

2. Install dependencies:
   
       $ npm install

3. Set up environment variables:
    - Create a `.env.local` file at the root of the project.
    - Add necessary environment variables such as `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `STRIPE_SECRET_KEY`.
    
4. Start the development server:

       $ npm run dev

5. For stripe setup, run:
   
       $ stripe listen --forward-to localhost:3000/api/stripe

## Project Structure

`package.json`: Defines project scripts and dependencies.  
`app/page.js`: Main landing page.
`components/sections/hero.jsx`: Hero section handling GitHub authentication through Supabase and mock README preview.  
`lib/stripe.js`: Initializes Stripe with secret key for server-side operations.  

## License

License: Not currently specified