/**
 * One-shot seed for local development. Idempotent — safe to re-run.
 * Creates the admin account, default settings and sample content.
 */
import { db, get, run } from './lib/db.js';
import { hashPassword } from './lib/security.js';

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? 'admin12345';

function ensureAdmin() {
  const row = get('SELECT id FROM admins WHERE username = ?', ADMIN_USER);
  if (row) {
    run('UPDATE admins SET password_hash = ? WHERE username = ?', hashPassword(ADMIN_PASS), ADMIN_USER);
    console.log(`Admin "${ADMIN_USER}" password refreshed.`);
  } else {
    run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ADMIN_USER, hashPassword(ADMIN_PASS));
    console.log(`Admin "${ADMIN_USER}" created.`);
  }
}

function ensureSettings() {
  const settings: Record<string, string> = {
    company_name: '6-7 Corporation',
    tagline: 'Цифровые продукты, которые работают.',
    description:
      '6-7 Corporation — студия продуктовой разработки: интерфейсы, ' +
      'распределённые системы и безопасность для команд, которым важно качество.',
    email: 'hello@6-7corp.com',
    established: '2019',
    locale_default: 'ru',
  };
  for (const [k, v] of Object.entries(settings)) {
    run(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING`, k, v);
  }
}

function ensureContent() {
  if (get('SELECT id FROM posts')) return;

  run(
    `INSERT INTO posts (title, slug, excerpt, body_md, cover, published) VALUES (?, ?, ?, ?, ?, 1)`,
    'Почему мы берёмся за сложное',
    'why-we-take-hard-problems',
    'Короткая заметка о скоупе, скорости и безопасности на масштабе.',
    `## С чего начинается бриф

Каждый продукт начинается с вопроса, который звучит *слишком сложно*.

Мы считаем это не предупреждением, а точкой входа. Задача — снять с проблемы
всё лишнее, оставить основу и сделать эту основу хорошо.

### На что мы смотрим

- **Ясность** — один очевидный путь вместо тысячи возможных.
- **Устойчивость** — системы деградируют мягко, а не падают громко.
- **Безопасность** — модель угроз пишется до первой строки кода.

> Мы не отдаём ничего, что не поставили бы перед своими пользователями.`,
    null,
  );

  run(
    `INSERT INTO projects (title, slug, client, year, tags, excerpt, body_md, cover, link, order_idx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'Helio Pay',
    'helio-pay',
    'Helio',
    '2024',
    'Payments, Fraud, Rust',
    'Платёжный шлюз с откликом 12 мс и адаптивным антифродом.',
    `## Что сделали

Переписали авторизационный пайплайн на Rust и снизили p99 с
**480 мс до 12 мс**, добавив адаптивный скоринг мошенничества.

### Стек

- Rust · Tokio
- PostgreSQL · Redis
- Собственный runtime для скоринга`,
    null, 'https://example.com/helio', 1,
  );

  run(
    `INSERT INTO projects (title, slug, client, year, tags, excerpt, body_md, cover, link, order_idx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'Northwind OS',
    'northwind-os',
    'Northwind',
    '2023',
    'Platform, DevTools, TS',
    'Платформа для разработчиков: 40 000 сборок в сутки.',
    `## Что сделали

Спроектировали платформу оркестрации сборок, которая держит
**40 000 сборок в сутки** за счёт детерминированного кеша.

### Стек

- TypeScript · React
- Go-оркестратор
- Объектное хранилище`,
    null, 'https://example.com/northwind', 2,
  );

  run(
    `INSERT INTO team (name, role, bio, photo, socials, order_idx) VALUES (?, ?, ?, ?, ?, ?)`,
    'Ada Voss', 'Основатель и CTO', 'Отвечает за техническое направление. 15 лет разработки на масштабе.', null, JSON.stringify({ website: 'https://example.com', github: 'https://github.com/ada' }), 1,
  );
  run(
    `INSERT INTO team (name, role, bio, photo, socials, order_idx) VALUES (?, ?, ?, ?, ?, ?)`,
    'Kenji Mori', 'Руководитель безопасности', 'Прогоняет red team всё до релиза. Чемпион CTF.', null, JSON.stringify({ github: 'https://github.com/kenji', telegram: 'https://t.me/kenji' }), 2,
  );
  run(
    `INSERT INTO team (name, role, bio, photo, socials, order_idx) VALUES (?, ?, ?, ?, ?, ?)`,
    'Lena Ortiz', 'Директор по дизайну', 'Превращает сложные системы в спокойные интерфейсы.', null, JSON.stringify({ x: 'https://x.com/lena', website: 'https://example.com/lena' }), 3,
  );
}

function main() {
  ensureAdmin();
  ensureSettings();
  ensureContent();
  const counts = {
    admins: get<{ c: number }>('SELECT COUNT(*) c FROM admins')!.c,
    posts: get<{ c: number }>('SELECT COUNT(*) c FROM posts')!.c,
    projects: get<{ c: number }>('SELECT COUNT(*) c FROM projects')!.c,
    team: get<{ c: number }>('SELECT COUNT(*) c FROM team')!.c,
  };
  console.log('Seed complete:', counts);
  console.log(`\nAdmin login -> username: ${ADMIN_USER}  password: ${ADMIN_PASS}`);
  db.close();
}

main();
