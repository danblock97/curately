-- Create pages table for multiple public pages per user (Pro feature)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  background_color VARCHAR(7) DEFAULT '#ffffff',
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own pages
CREATE POLICY "Users can view their own pages" ON public.pages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own pages
CREATE POLICY "Users can create their own pages" ON public.pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pages
CREATE POLICY "Users can update their own pages" ON public.pages
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own pages (but not primary page)
CREATE POLICY "Users can delete their non-primary pages" ON public.pages
  FOR DELETE USING (auth.uid() = user_id AND is_primary = FALSE);

-- Public can view active pages for username lookups
CREATE POLICY "Public can view active pages" ON public.pages
  FOR SELECT USING (is_active = TRUE);

-- Add indexes for performance
CREATE INDEX idx_pages_user_id ON public.pages(user_id);
CREATE INDEX idx_pages_username ON public.pages(username);
CREATE INDEX idx_pages_is_active ON public.pages(is_active);

-- Add page_id to links table to associate links with specific pages
ALTER TABLE public.links ADD COLUMN page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE;

-- Create index for page_id on links
CREATE INDEX idx_links_page_id ON public.links(page_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for pages table
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration script to create primary pages for existing users
INSERT INTO public.pages (user_id, username, display_name, bio, avatar_url, background_color, is_primary, is_active)
SELECT 
  p.id as user_id,
  p.username,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.background_color,
  TRUE as is_primary,
  TRUE as is_active
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.pages pg WHERE pg.user_id = p.id AND pg.is_primary = TRUE
);

-- Update existing links to reference the primary page
UPDATE public.links 
SET page_id = (
  SELECT id FROM public.pages 
  WHERE user_id = links.user_id AND is_primary = TRUE
)
WHERE page_id IS NULL;