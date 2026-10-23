import type { Localized } from './i18n';

/**
 * All editorial copy for the public site, in both languages.
 * Kept in one file so wording stays consistent and easy to edit.
 */

export const HERO = {
  line1: { ru: 'Берёмся за всё.', en: 'Complex' } as Localized,
  line2: { ru: 'отвечаем', en: 'made' } as Localized,
  line3: { ru: 'ни за что', en: 'simple' } as Localized,
  eyebrow: {
    ru: 'Студия продуктовой разработки',
    en: 'Product engineering studio',
  } as Localized,
  description: {
    ru: 'Мы делаем вид, что работаем. Вы делаете вид, что довольны',
    en: 'We pretend to work. You pretend to be happy.',
  } as Localized,
  ctaPrimary: { ru: 'Обсудить проект', en: 'Start a project' } as Localized,
  ctaSecondary: { ru: 'Смотреть работы', en: 'See our work' } as Localized,
  trusted: {
    ru: 'С нами запускают продукты команды из',
    en: 'Teams that ship with us',
  } as Localized,
  clients: ['northwind', 'atlas', 'waveform', 'MONO', 'kite', 'STACK'],
  stats: [
    { value: '150+', label: { ru: 'запущенных продуктов', en: 'products shipped' } },
    { value: '12', label: { ru: 'лет в разработке', en: 'years building' } },
    { value: '99,9%', label: { ru: 'аптайм сервисов', en: 'service uptime' } },
  ] as { value: string; label: Localized }[],
};

export const ABOUT = {
  eyebrow: { ru: 'О студии', en: 'About' } as Localized,
  title: {
    ru: 'Ваши ожидания — наши проблемы. Ваши деньги — наши возможности',
    en: 'Your expectations are our problems. Your money is our opportunity.',
  } as Localized,
  body: {
    ru: 'Мы выстраиваем рабочие процессы таким образом, чтобы даже самые простые задачи требовали максимального бюджета. Наша команда умеет превращать небольшие правки в полноценные проекты, а очевидные решения — в многоэтапные согласования. Мы ценим ваше время, поэтому предпочитаем тратить исключительно своё, предварительно включив его в итоговую стоимость.',
    en: 'We set up workflows in such a way that even the simplest tasks require the maximum budget. Our team knows how to turn small edits into full-fledged projects, and obvious solutions into multi-stage approvals. We value your time, so we prefer to spend exclusively our own, after first including it in the final cost.',
  } as Localized,
  principles: [
    {
      n: '01',
      title: { ru: 'Ясность', en: 'Clarity' } as Localized,
      text: {
        ru: 'Мы сразу называем стоимость проекта. За что именно вы платите — выясним в процессе.',
        en: 'We give the project cost upfront. We\'ll figure out exactly what you\'re paying for along the way.',
      } as Localized,
    },
    {
      n: '02',
      title: { ru: 'Устойчивость', en: 'Resilience' } as Localized,
      text: {
        ru: 'Разработка может стоять на месте, сроки могут сдвигаться. Но стоимость наших услуг стабильно растёт.',
        en: 'Development may stall, deadlines may get pushed back. But the cost of our services keeps going up steadily.',
      } as Localized,
    },
    {
      n: '03',
      title: { ru: 'Безопасность', en: 'Security' } as Localized,
      text: {
        ru: 'Ваши деньги находятся под надёжной защитой. Особенно от любых попыток возврата.',
        en: 'Your money is under reliable protection. Especially from any attempts of getting it back.',
      } as Localized,
    },
  ],
};

export const SERVICES = {
  eyebrow: { ru: 'Направления', en: 'Capabilities' } as Localized,
  title: { ru: 'Чем мы можем помочь', en: 'What we do' } as Localized,
  subtitle: {
    ru: 'Полный цикл: от красивых обещаний и уверенного старта до затянутых сроков и убедительных объяснений.',
    en: 'Full-service delivery: from polished promises and a confident kickoff to missed deadlines and convincing explanations.',
  } as Localized,
  items: [
    {
      title: { ru: 'Продуктовый дизайн', en: 'Product design' } as Localized,
      text: {
        ru: 'Проектируем понятные интерфейсы и пользовательские сценарии, которые помогают клиенту быстрее понять, за что именно он заплатил.',
        en: 'We research, discuss, and endlessly rethink interfaces to make even the simplest solution look like expensive strategic work.',
      } as Localized,
    },
    {
      title: { ru: 'Веб-разработка', en: 'Web engineering' } as Localized,
      text: {
        ru: 'Разрабатываем современные веб-продукты на надёжном стеке — с гибкими сроками, гибкими оценками и ещё более гибким итоговым бюджетом.',
        en: 'We build modern web products on a reliable tech stack — with flexible timelines, flexible estimates, and even more flexible final budgets.',
      } as Localized,
    },
    {
      title: { ru: 'Распределённые системы', en: 'Distributed systems' } as Localized,
      text: {
        ru: 'Создаём отказоустойчивые решения, где нагрузку выдерживает не только инфраструктура, но и заказчик.',
        en: 'We build services, queues, and storage systems that scale horizontally — right alongside maintenance costs and unexpected complications.',
      } as Localized,
    },
    {
      title: { ru: 'Безопасность', en: 'Security' } as Localized,
      text: {
        ru: 'Помогаем выстраивать защиту на всех уровнях, чтобы к вашим данным не получили доступ посторонние. К вашим деньгам — уже поздно.',
        en: 'We identify risks, document them in impressive detail, and carefully turn every potential vulnerability into a separate billable phase.',
      } as Localized,
    },
    {
      title: { ru: 'Внутренние инструменты', en: 'Internal tools' } as Localized,
      text: {
        ru: 'Собираем сервисы и платформы для внутренних команд, которые делают процессы сложнее, но зато выглядят очень профессионально.',
        en: 'We build dashboards, admin panels, and CI/CD pipelines that promise to accelerate your team — after a substantial investment and a few months of implementation.',
      } as Localized,
    },
    {
      title: { ru: 'AI-инженерия', en: 'AI engineering' } as Localized,
      text: {
        ru: 'Интегрируем AI в продукты и процессы так, чтобы даже самые обычные задачи можно было продавать как технологический прорыв.',
        en: 'We design LLM pipelines, RAG systems, and automation with plenty of magic, moderate usefulness, and truly innovative invoices.',
      } as Localized,
    },
  ],
};

export const WORK = {
  eyebrow: { ru: 'Избранное', en: 'Selected work' } as Localized,
  title: { ru: 'Проекты, которые уже оплачены', en: 'Projects that shipped' } as Localized,
  subtitle: {
    ru: 'Несколько историй о том, как продукт собирается из идеи и ограничений.',
    en: 'A few stories about turning an idea and its constraints into a product.',
  } as Localized,
};

export const TEAM = {
  eyebrow: { ru: 'Команда', en: 'People' } as Localized,
  title: { ru: 'Те, кто жаждят наживы', en: 'The makers' } as Localized,
  subtitle: {
    ru: 'Маленькая команда, в которой каждый отвечает за результат, но не за слова.',
    en: 'A small team where everyone owns the outcome.',
  } as Localized,
};

export const JOURNAL = {
  eyebrow: { ru: 'Журнал', en: 'Journal' } as Localized,
  title: { ru: 'Заметки из студии', en: 'Notes from the studio' } as Localized,
  subtitle: {
    ru: 'О процессах, инженерных решениях и дизайне.',
    en: 'On process, engineering decisions and design without fluff.',
  } as Localized,
  empty: { ru: 'Первый текст уже готовится.', en: 'The first note is on its way.' } as Localized,
};

export const CONTACT = {
  eyebrow: { ru: 'Контакты', en: 'Contact' } as Localized,
  title: {
    ru: 'Спрашивайте, всё пообещаем.',
    en: 'Tell us what needs to be built',
  } as Localized,
  subtitle: {
    ru: 'Ответим в течение рабочего дня. Сообщение можно писать на русском или английском — мы переведём его автоматически.',
    en: 'We reply within one business day. Write in Russian or English — it is translated automatically.',
  } as Localized,
  emailLabel: 'Email',
  locationLabel: { ru: 'Где мы', en: 'Based in' } as Localized,
  location: { ru: 'Стокгольм · удалённо', en: 'Stockholm · remote' } as Localized,
  responseLabel: { ru: 'Отвечаем', en: 'We reply' } as Localized,
  response: { ru: 'в течение рабочего дня', en: 'within one business day' } as Localized,
};

export const FOOTER = {
  tagline: {
    ru: 'Проектируем и запускаем цифровые продукты, которые приносят деньги. Нам.',
    en: 'We design and ship digital products that hold up under load and attention.',
  } as Localized,
};
