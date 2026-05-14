# Supabase Integration Guide

Follow these steps to set up your backend for Kiss and Glow.

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click on **New Project** and select an organization.
3. Give your project a name (e.g., `kiss-and-glow`), set a secure database password, and choose a region close to you.
4. Wait for the project to be provisioned.

## 2. Initialize the Database
1. In your Supabase dashboard, go to the **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `docs/supabase.sql` from this project.
4. Copy the entire contents of `docs/supabase.sql` and paste it into the Supabase SQL editor.
5. Click **Run**. This will create the necessary tables (`profiles`, `products`, `orders`, `order_items`) and set up Row Level Security (RLS).

## 3. Configure Environment Variables
1. Go to **Project Settings** -> **API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the root of your project, rename `.env.example` to `.env` (if you haven't already).
4. Update the `.env` file with your credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 4. Set Up Storage
1. Go to **Storage** in the left sidebar.
2. Create a new bucket named `product-images`.
3. Set the bucket to **Public**.
4. (Optional) Under **Policies**, ensure that authenticated users have permission to upload files if you want to use the Admin dashboard for image uploads.

## 5. Becoming an Admin
1. Sign up for an account through the app's interface.
2. Go to the **Table Editor** in Supabase.
3. Select the `profiles` table.
4. Find your user (look for your email) and check the `is_admin` checkbox.
5. Refresh the app, and you should now have access to the `/admin` routes.
