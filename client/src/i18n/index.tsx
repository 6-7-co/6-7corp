import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { makeTranslator } from './translate';

export type Lang = 'en' | 'ru';

export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: 'EN' },
  { id: 'ru', label: 'Русский', flag: 'RU' },
];

type Dict = Record<string, string>;

const en: Dict = {
  'nav.services': 'Services',
  'nav.projects': 'Work',
  'nav.team': 'Team',
  'nav.journal': 'Journal',
  'nav.contact': 'Contact',
  'nav.admin': 'Admin',
  'hero.eyebrow': 'Product studio — est. 2019',
  'hero.title1': 'ENGINEERING',
  'hero.title2': 'THE UNBUILDABLE',
  'hero.subtitle':
    'We design and ship bold interfaces, distributed systems and security-first software for teams who refuse to settle.',
  'hero.cta1': 'See our work',
  'hero.cta2': 'Start a project',
  'about.eyebrow': 'About',
  'about.title': 'A small studio with a large appetite for hard problems.',
  'about.body':
    '6-7 Corporation turns ambiguous briefs into shipping software. We keep teams tiny, processes fast, and standards unusually high — then we protect what we build.',
  'services.eyebrow': 'Capabilities',
  'services.title': 'What we do',
  'services.subtitle': 'Full-stack delivery across the product surface.',
  'projects.eyebrow': 'Selected work',
  'projects.title': 'Projects that shipped',
  'projects.subtitle': 'A sample of recent delivery.',
  'team.eyebrow': 'People',
  'team.title': 'The authors',
  'team.subtitle': 'Small team, senior by default.',
  'contact.eyebrow': 'Contact',
  'contact.title': 'Have something unbuildable?',
  'contact.subtitle': 'Send a message — it gets translated automatically.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.message': 'Message',
  'contact.send': 'Send message',
  'contact.sent': 'Message sent — thank you.',
  'contact.translating': 'Translating…',
  'journal.eyebrow': 'Journal',
  'journal.title': 'Notes from the studio',
  'journal.subtitle': 'Field notes on building software.',
  'footer.rights': 'All rights reserved.',
  'footer.built': 'Built with React, Tailwind & z-md.',
  'common.loading': 'Loading…',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.back': 'Back',
  'common.empty': 'Nothing here yet.',
  'common.confirmDelete': 'Delete this item? This cannot be undone.',
  'lang.translate': 'Translate to',
  'lang.auto': 'Auto-translate',
  'admin.login': 'Admin sign in',
  'admin.username': 'Username',
  'admin.password': 'Password',
  'admin.signin': 'Sign in',
  'admin.signout': 'Sign out',
  'admin.dashboard': 'Dashboard',
  'admin.posts': 'Journal',
  'admin.projects': 'Projects',
  'admin.team': 'Team',
  'admin.settings': 'Settings',
  'admin.messages': 'Messages',
  'admin.new': 'New',
  'admin.media': 'Media library',
  'admin.title': 'Title',
  'admin.slug': 'Slug',
  'admin.excerpt': 'Excerpt',
  'admin.body': 'Body (Markdown)',
  'admin.cover': 'Cover image',
  'admin.client': 'Client',
  'admin.year': 'Year',
  'admin.tags': 'Tags',
  'admin.link': 'Link',
  'admin.role': 'Role',
  'admin.bio': 'Bio',
  'admin.photo': 'Photo',
  'admin.order': 'Order',
  'admin.publish': 'Published',
  'admin.draft': 'Draft',
  'admin.preview': 'Preview',
  'admin.saved': 'Saved.',
  'admin.name': 'Name',
  'admin.email': 'Email',
};

const ru: Dict = {
  'nav.services': 'Услуги',
  'nav.projects': 'Работы',
  'nav.team': 'Команда',
  'nav.journal': 'Журнал',
  'nav.contact': 'Контакты',
  'nav.admin': 'Админ',
  'hero.eyebrow': 'Продукт-студия — с 2019',
  'hero.title1': 'ПРОЕКТИРУЕМ',
  'hero.title2': 'НЕВОЗМОЖНОЕ',
  'hero.subtitle':
    'Мы проектируем и запускаем дерзкие интерфейсы, распределённые системы и безопасное ПО для команд, которые не довольствуются обычным.',
  'hero.cta1': 'Смотреть работы',
  'hero.cta2': 'Заказать проект',
  'about.eyebrow': 'О нас',
  'about.title': 'Малая студия с большой любовью к сложным задачам.',
  'about.body':
    '6-7 Corporation превращает размытые задачи в работающее ПО. Команда маленькая, процессы быстрые, стандарты непривычно высокие — и всё, что мы строим, защищено.',
  'services.eyebrow': 'Компетенции',
  'services.title': 'Что мы делаем',
  'services.subtitle': 'Полный цикл разработки по всей поверхности продукта.',
  'projects.eyebrow': 'Избранные работы',
  'projects.title': 'Запущенные проекты',
  'projects.subtitle': 'Небольшой выбор свежих проектов.',
  'team.eyebrow': 'Люди',
  'team.title': 'Авторы',
  'team.subtitle': 'Малая команда, по умолчанию senior.',
  'contact.eyebrow': 'Контакт',
  'contact.title': 'Есть невозможное?',
  'contact.subtitle': 'Напишите — сообщение авто-переведётся.',
  'contact.name': 'Имя',
  'contact.email': 'Email',
  'contact.message': 'Сообщение',
  'contact.send': 'Отправить',
  'contact.sent': 'Сообщение отправлено — спасибо.',
  'contact.translating': 'Переводим…',
  'journal.eyebrow': 'Журнал',
  'journal.title': 'Заметки из студии',
  'journal.subtitle': 'О том, как мы строим ПО.',
  'footer.rights': 'Все права защищены.',
  'footer.built': 'На React, Tailwind и z-md.',
  'common.loading': 'Загрузка…',
  'common.save': 'Сохранить',
  'common.cancel': 'Отмена',
  'common.delete': 'Удалить',
  'common.edit': 'Редактировать',
  'common.add': 'Добавить',
  'common.back': 'Назад',
  'common.empty': 'Здесь пока пусто.',
  'common.confirmDelete': 'Удалить? Действие необратимо.',
  'lang.translate': 'Перевод на',
  'lang.auto': 'Авто-перевод',
  'admin.login': 'Вход для админа',
  'admin.username': 'Имя пользователя',
  'admin.password': 'Пароль',
  'admin.signin': 'Войти',
  'admin.signout': 'Выйти',
  'admin.dashboard': 'Панель',
  'admin.posts': 'Журнал',
  'admin.projects': 'Проекты',
  'admin.team': 'Команда',
  'admin.settings': 'Настройки',
  'admin.messages': 'Сообщения',
  'admin.new': 'Новый',
  'admin.media': 'Галерея',
  'admin.title': 'Заголовок',
  'admin.slug': 'Slug',
  'admin.excerpt': 'Краткое',
  'admin.body': 'Текст (Markdown)',
  'admin.cover': 'Обложка',
  'admin.client': 'Клиент',
  'admin.year': 'Год',
  'admin.tags': 'Теги',
  'admin.link': 'Ссылка',
  'admin.role': 'Роль',
  'admin.bio': 'О себе',
  'admin.photo': 'Фото',
  'admin.order': 'Порядок',
  'admin.publish': 'Опубликовано',
  'admin.draft': 'Черновик',
  'admin.preview': 'Предпросмотр',
  'admin.saved': 'Сохранено.',
  'admin.name': 'Имя',
  'admin.email': 'Email',
};

const DICTS: Record<Lang, Dict> = { en, ru };

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  /** Translate arbitrary text to the current language via Google. */
  translate: (text: string) => Promise<string>;
};

const I18nContext = createContext<I18nValue | null>(null);

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem('corp_lang');
    if (stored === 'en' || stored === 'ru') return stored;
  } catch { /* ignore */ }
  return (navigator.language || 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

const translateCached = makeTranslator('corp');

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('corp_lang', l);
    } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key: string) => DICTS[lang][key] ?? DICTS.en[key] ?? key,
    [lang],
  );

  const translate = useCallback((text: string) => translateCached(text, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, translate }), [lang, setLang, t, translate]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
