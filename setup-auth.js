import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load .env.local manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAuth() {
  console.log('🔧 Setting up Supabase Auth...\n');

  try {
    // 1. Actualizar tabla expenses para agregar user_id
    console.log('📝 Updating expenses table schema...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add user_id column to expenses if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='expenses' AND column_name='user_id'
          ) THEN
            ALTER TABLE expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
          END IF;
        END $$;

        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
      `
    });

    if (alterError) {
      console.log('⚠️  Note: Using direct SQL commands instead of RPC...');
      
      // Intentar con comandos directos
      const { error: addColumnError } = await supabase
        .from('expenses')
        .select('user_id')
        .limit(1);
      
      if (addColumnError && addColumnError.message.includes('column "user_id" does not exist')) {
        console.log('❌ Cannot alter table directly. Please run this SQL in Supabase SQL Editor:');
        console.log(`
-- Add user_id to expenses table
ALTER TABLE expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update RLS policies for expenses to filter by user_id
DROP POLICY IF EXISTS "Enable read access for all users" ON expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON expenses;

CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `);
        console.log('\n✅ Copy and paste the SQL above into Supabase SQL Editor');
        console.log('📍 https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new\n');
      } else {
        console.log('✅ user_id column already exists or table structure OK');
      }
    } else {
      console.log('✅ Database schema updated');
    }

    console.log('\n✅ Auth setup instructions ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the SQL commands shown above in Supabase SQL Editor');
    console.log('2. Enable Email Auth in Supabase Dashboard > Authentication > Providers');
    console.log('3. Configure email templates if needed');
    console.log('4. App will use real authentication after this!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAuth();
