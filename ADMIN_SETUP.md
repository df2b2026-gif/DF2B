# 🔐 Добавление администратора в Supabase DF2B

## 📋 Данные администратора

```
Email: admin@df2b.com
Пароль: Pompadur2026
Роль: admin (единственный с полными правами)
```

---

## 🚀 Пошаговая инструкция (5 минут)

### Шаг 1: Создать админа в Supabase Auth

1. **Откройте Supabase Dashboard**
   - URL: https://app.supabase.com
   - Выберите проект DF2B

2. **Перейдите в Authentication → Users**

3. **Нажмите "Invite user"** (в правом углу)

4. **Заполните форму:**
   - Email: `admin@df2b.com`
   - Password: `Pompadur2026` (сам прописать)
   - Нажмите галочку "Auto confirm user"
   - Нажмите "Send invite" / "Create user"

5. **Скопируйте UUID администратора**
   - В таблице Users найдите admin@df2b.com
   - Скопируйте значение в колонке "UID"
   - Выглядит как: `550e8400-e29b-41d4-a716-446655440000`

---

### Шаг 2: Создать таблицу ролей в БД

1. **Откройте SQL Editor в Supabase Dashboard**
   - SQL Editor (левое меню)
   - "New Query"

2. **Скопируйте содержимое файла:**
   ```
   /workspaces/Try2/DF2B_лэндос/backend/admin-roles-setup.sql
   ```

3. **Вставьте в редактор и выполните**
   - Кнопка "Run" (или Ctrl+Enter)
   - Должно быть сообщение об успехе

---

### Шаг 3: Добавить админа в таблицу roles

1. **В том же SQL Editor создайте новый запрос**

2. **Скопируйте этот SQL** (при замене `YOUR_ADMIN_UUID`):

```sql
-- Замените YOUR_ADMIN_UUID на реальный UUID из Шага 1
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_ADMIN_UUID', 'admin');

-- Проверка - выполните этот запрос чтобы увидеть админов:
SELECT ur.user_id, ur.role, au.email 
FROM public.user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id;
```

3. **Пример (если UUID = `a1b2c3d4-e5f6-7890-abcd-ef1234567890`):**

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin');
```

4. **Выполните запрос → OK!**

---

## 🧪 Тест администратора

### 1. Залогиниться как админ

```bash
# Откройте https://df2b-admin.netlify.app
# Введите:
# Email: admin@df2b.com
# Password: Pompadur2026
# → Должны попасть в Admin Panel
```

### 2. Проверить в БД

```sql
-- Выполните в SQL Editor:
SELECT ur.user_id, ur.role, au.email 
FROM public.user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';

-- Результат:
-- user_id           | role  | email
-- a1b2c3d4-e5f6... | admin | admin@df2b.com
```

---

## 🔒 RLS Policy для админов (опционально)

Если хотите дать админам доступ ко всем данным, добавьте в таблицы:

```sql
-- Пример для таблицы messages:
CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- Пример для таблицы user_profiles:
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );
```

---

## 📝 Интеграция в Admin Panel

Если хотите добавить проверку админства в фронтенде:

```typescript
// app/src/hooks/useAdminCheck.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.role === 'admin') {
        setIsAdmin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}
```

---

## ⚠️ Важно

```
✅ admin@df2b.com - ТОЛЬКО администратор
✅ Пароль: Pompadur2026
✅ Роль: admin
✅ Можно добавить других админов через тот же SQL
❌ Не делите учетные данные!
❌ Никогда не коммитьте пароль в Git!
```

---

## 🆘 Если что-то не работает

| Проблема | Решение |
|----------|---------|
| "User already exists" | Админ уже создан, просто добавьте в roles |
| "Invalid UUID" | Скопируйте UUID еще раз, может быть лишние пробелы |
| "Column doesn't exist" | Запустите admin-roles-setup.sql еще раз |
| Админ не может залогиниться | Проверьте email и пароль в Auth |

---

## 📊 Итого

1. ✅ Создать пользователя admin@df2b.com в Auth (пароль: Pompadur2026)
2. ✅ Запустить SQL для создания таблицы roles
3. ✅ Добавить администратора в user_roles таблицу
4. ✅ Протестировать вход на https://df2b-admin.netlify.app

Готово! Админ готов к использованию. 🎉
