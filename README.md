# React Auth Base

A modern authentication and user management system built with Next.js and Supabase. This application provides a complete solution for user authentication, profile management, and dashboard functionality with a clean, dark-themed UI.

## Features

- **User Authentication**
  - Login with email/password
  - Registration with email verification
  - Password reset functionality
  - Protected routes for authenticated users
  - OAuth integrations (Google, GitHub)

- **User Dashboard**
  - Personal profile management
  - Account settings
  - Security settings
  - Subscription management
  - Public profile options

- **Modern UI/UX**
  - Responsive design for all devices
  - Dark zinc theme (zinc-900 based color palette)
  - Interactive cards and buttons
  - Clean, minimalist interface

- **Performance & Accessibility**
  - Server-side rendering with Next.js
  - Optimized for speed and accessibility
  - SEO-friendly page structure

## Tech Stack

- **Frontend**:
  - [Next.js](https://nextjs.org/) - React framework
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

- **Backend & Authentication**:
  - [Supabase](https://supabase.io/) - Open source Firebase alternative
  - PostgreSQL database
  - Row Level Security policies

- **Styling**:
  - Custom dark zinc theme
  - CSS variables for theming
  - Responsive layouts

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account (free tier works fine)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/uidq/react-auth.git
   cd react-auth
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the Supabase database (see "Database Setup" section below)

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Complete Instructions

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Once your project is created, go to the project settings and copy the URL and anon key
3. In the Supabase dashboard, navigate to Authentication → Settings:
   - Enable Email provider
   - Configure site URL to match your development URL (e.g., http://localhost:3000)
   - Configure redirect URLs for post-confirmation (e.g., http://localhost:3000/auth/callback)

### Database Setup

This application uses Supabase for database and authentication. You need to set up the required database schema.

#### Option 1: Using the Supabase Dashboard SQL Editor

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the SQL schema from `lib/schema.ts` (the `createTables` variable)
4. Run this SQL in the SQL Editor

#### Option 2: Using the Supabase CLI

1. Install the Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Copy the SQL from `lib/schema.ts` into a file named `setup.sql`
4. Run: `supabase db execute --project-ref YOUR_PROJECT_ID --file ./setup.sql`

#### Option 3: Using Admin API (Programmatically)

The application includes migration utilities in `lib/migrations.ts` that can be used to set up the database programmatically through an admin page.

### Configuring Authentication

1. After setting up Supabase, configure the authentication redirects:
   - Go to your Supabase project → Authentication → URL Configuration
   - Set Site URL: `http://localhost:3000` (for development)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/verify-email`

2. Configure email templates (optional):
   - Go to Authentication → Email Templates
   - Customize the templates for confirmation, reset password, and magic link

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Navigate to the register page to create an account and test the authentication flow

### Application Routes

- `/` - Home page with features overview
- `/auth/login` - User login
- `/auth/register` - New user registration
- `/auth/verify-email` - Email verification
- `/dashboard` - Main dashboard for authenticated users
- `/dashboard/profile` - User profile management
- `/dashboard/security` - Security settings
- `/dashboard/subscriptions` - Subscription management

### Customizing the Theme

The application uses a dark zinc theme by default. To customize:

1. Edit the CSS variables in `styles/theme.css`
2. The main color variables are:
   - `--background`: Main background color (currently zinc-900)
   - `--card-background`: Card background color (currently zinc-800)
   - `--primary`: Primary accent color (currently blue-500)
   - `--subtle-border`: Border color (currently zinc-700)

### Deployment

1. For production deployment, create a production Supabase project and update environment variables
2. Deploy to Vercel:
   ```bash
   npm run build
   vercel --prod
   ```
   
3. Update the Supabase project settings with your production URL

## Database Schema

The application creates the following tables:

1. `user_settings` - Stores user preferences like dark mode, timezone, etc.
2. `user_stats` - Tracks user activity like login count and profile visits
3. `site_stats` - Stores aggregate site statistics
4. `visit_history` - Records profile visit history

## Theming and Styling

The application uses a dark zinc theme with the following color palette:

- Background: zinc-900 (#18181b)
- Card backgrounds: zinc-800 (#27272a)
- Borders and hover states: zinc-700 (#3f3f46)
- Primary accent: blue-500 (#3b82f6)
- Text: white (#ffffff) and zinc-400 (#a1a1aa)

The theme is defined using CSS variables in `styles/theme.css` and applied throughout the application.

## Security Considerations

- The application implements Row Level Security (RLS) policies in Supabase
- Authentication flows follow best practices for security
- Sensitive operations require reauthentication
- Password policies enforce strong credentials

## Troubleshooting

### Common Issues

1. **Authentication errors**: 
   - Check that your Supabase URL and anon key are correct
   - Verify that site URL and redirect URLs are properly configured in Supabase

2. **Database setup issues**:
   - Ensure your SQL commands are executed properly
   - Check Supabase logs for any errors during schema creation

3. **Styling inconsistencies**:
   - If you see black boxes or styling issues, check for missing background classes
   - Ensure all containers have proper background classes (e.g., `bg-background`)

4. **Subscription functionality**:
   - Verify that the subscription tables are created correctly
   - Check user permissions for accessing subscription data

### Getting Help

If you encounter issues not covered in this guide:
- Check the Supabase documentation
- Inspect browser console for errors
- Review the component code to understand the expected behavior

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## WARNING

This project was made with "Cursor" if you feel bothered about the fact that the project has been made 10% with AI you should leave.