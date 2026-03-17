-- Supabase SQL: Добавить таблицу ролей и администратора
-- Запустите это в Supabase Dashboard → SQL Editor → New Query

-- 1. Создать таблицу для ролей пользователей (если не существует)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Политики для user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Создать индекс для поиска админов (если нужен)
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 3. Функция для проверки, admin ли пользователь
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- 4. После того как вы создали пользователя admin@df2b.com в Auth,
--    выполните этот SQL (замените admin_user_id на реальный UUID)
--    Как получить UUID? В Authentication → Users найдите admin@df2b.com и скопируйте UUID

-- ВАЖНО: Выполните это ПОСЛЕ создания пользователя в Auth:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR_ADMIN_USER_ID_HERE', 'admin');

-- Или проверить существующих админов:
-- SELECT ur.user_id, ur.role, au.email 
-- FROM public.user_roles ur
-- LEFT JOIN auth.users au ON ur.user_id = au.id;
