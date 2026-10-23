import type { Localized } from './i18n';

/**
 * All editorial copy for the public site, in both languages.
 * Kept in one file so wording stays consistent and easy to edit.
 */

export const HERO = {
  line1: { ru: 'Сложное', en: 'Complex' } as Localized,
  line2: { ru: 'делаем', en: 'made' } as Localized,
  line3: { ru: 'простым', en: 'simple' } as Localized,
  eyebrow: {
    ru: 'Студия продуктовой разработки',
    en: 'Product engineering studio',
  } as Localized,
  description: {
    ru: 'Проектируем и запускаем цифровые продукты: дизайн, веб-платформы, распределённые системы и безопасность. Без лишнего шума — только работающий результат.',
    en: 'We design and ship digital products: interfaces, web platforms, distributed systems and security. No noise — just work that holds up.',
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
    ru: 'Небольшая команда, которая берётся за сложные задачи и доводит их до результата.',
    en: 'A small team that takes on hard problems and carries them to the finish.',
  } as Localized,
  body: {
    ru: 'Мы работаем короткими циклами, показываем промежуточные результаты каждую неделю и не прячемся за презентациями. Дизайн, разработка и безопасность живут в одной команде — поэтому продукт получается цельным.',
    en: 'We work in short cycles, show progress every week and stay close to the details. Design, engineering and security sit in one team, so the product stays coherent.',
  } as Localized,
  principles: [
    {
      n: '01',
      title: { ru: 'Ясность', en: 'Clarity' } as Localized,
      text: {
        ru: 'Один очевидный путь вместо тысячи возможных.',
        en: 'One obvious path through a thousand possible ones.',
      } as Localized,
    },
    {
      n: '02',
      title: { ru: 'Устойчивость', en: 'Resilience' } as Localized,
      text: {
        ru: 'Системы, которые деградируют мягко, а не громко.',
        en: 'Systems that degrade gracefully, not loudly.',
      } as Localized,
    },
    {
      n: '03',
      title: { ru: 'Безопасность', en: 'Security' } as Localized,
      text: {
        ru: 'Модель угроз пишется до первой строки кода.',
        en: 'Threat models written before the first line of code.',
      } as Localized,
    },
  ],
};

export const SERVICES = {
  eyebrow: { ru: 'Направления', en: 'Capabilities' } as Localized,
  title: { ru: 'Чем мы можем помочь', en: 'What we do' } as Localized,
  subtitle: {
    ru: 'Полный цикл: от исследования и дизайна до запуска и поддержки.',
    en: 'Full cycle: from research and design to launch and care.',
  } as Localized,
  items: [
    {
      title: { ru: 'Продуктовый дизайн', en: 'Product design' } as Localized,
      text: {
        ru: 'Исследования, интерфейсы и дизайн-системы, которые превращают сложные сценарии в спокойные экраны.',
        en: 'Research, interfaces and design systems that turn dense flows into calm screens.',
      } as Localized,
    },
    {
      title: { ru: 'Веб-разработка', en: 'Web engineering' } as Localized,
      text: {
        ru: 'React, TypeScript и понятные бюджеты производительности с первого коммита.',
        en: 'React, TypeScript and clear performance budgets from the first commit.',
      } as Localized,
    },
    {
      title: { ru: 'Распределённые системы', en: 'Distributed systems' } as Localized,
      text: {
        ru: 'Сервисы, очереди и данные, которые растут горизонтально и не разваливаются.',
        en: 'Services, queues and data platforms built to scale horizontally.',
      } as Localized,
    },
    {
      title: { ru: 'Безопасность', en: 'Security' } as Localized,
      text: {
        ru: 'Моделирование угроз, аудит, укрепление инфраструктуры и zero-trust.',
        en: 'Threat modelling, audits, hardening and zero-trust architecture.',
      } as Localized,
    },
    {
      title: { ru: 'Внутренние инструменты', en: 'Internal tools' } as Localized,
      text: {
        ru: 'CI/CD, платформы сборки и админки, которые ускоряют команду.',
        en: 'CI/CD, build platforms and admin panels that speed teams up.',
      } as Localized,
    },
    {
      title: { ru: 'AI-инженерия', en: 'AI engineering' } as Localized,
      text: {
        ru: 'LLM-пайплайны, RAG и оценка качества — с понятными ограничениями.',
        en: 'LLM pipelines, RAG and evaluation — shipped with guardrails.',
      } as Localized,
    },
  ],
};

export const WORK = {
  eyebrow: { ru: 'Избранное', en: 'Selected work' } as Localized,
  title: { ru: 'Проекты, которые уже в проде', en: 'Projects that shipped' } as Localized,
  subtitle: {
    ru: 'Несколько историй о том, как продукт собирается из идеи и ограничений.',
    en: 'A few stories about turning an idea and its constraints into a product.',
  } as Localized,
};

export const TEAM = {
  eyebrow: { ru: 'Команда', en: 'People' } as Localized,
  title: { ru: 'Те, кто делает', en: 'The makers' } as Localized,
  subtitle: {
    ru: 'Маленькая команда, в которой каждый отвечает за результат.',
    en: 'A small team where everyone owns the outcome.',
  } as Localized,
};

export const JOURNAL = {
  eyebrow: { ru: 'Журнал', en: 'Journal' } as Localized,
  title: { ru: 'Заметки из студии', en: 'Notes from the studio' } as Localized,
  subtitle: {
    ru: 'О процессах, инженерных решениях и дизайне без воды.',
    en: 'On process, engineering decisions and design without fluff.',
  } as Localized,
  empty: { ru: 'Первый текст уже готовится.', en: 'The first note is on its way.' } as Localized,
};

export const CONTACT = {
  eyebrow: { ru: 'Контакты', en: 'Contact' } as Localized,
  title: {
    ru: 'Расскажите, что нужно сделать',
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
    ru: 'Проектируем и запускаем цифровые продукты, которые держат нагрузку и внимание.',
    en: 'We design and ship digital products that hold up under load and attention.',
  } as Localized,
};
