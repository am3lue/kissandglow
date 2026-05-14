# Kiss and Glow

A premium beauty and skincare e-commerce platform.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Supabase Configuration**
   - Create a new project at [Supabase](https://supabase.com).
   - Run the SQL scripts found in `docs/supabase.sql` in the Supabase SQL Editor.
   - Copy your Supabase URL and Anon Key.
   - Create a `.env` file in the root directory (use `.env.example` as a template).

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

- `/src`: Frontend source code.
- `/docs`: Documentation and database setup scripts.
- `/public`: Static assets.

## Admin Access

To access the admin dashboard, you need to set the `is_admin` flag to `true` in the `profiles` table for your user account in the Supabase dashboard.
