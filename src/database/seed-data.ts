export interface SeedSkill {
  name: string;
  category: string;
  level: number;
}

export interface SeedExperience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  achievements: string[];
}

export interface SeedProject {
  name: string;
  description: string;
  url: string | null;
  repositoryUrl: string | null;
  technologies: string[];
}

export interface SeedProfile {
  slug: string;
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string | null;
  skills: SeedSkill[];
  experience: SeedExperience[];
  projects: SeedProject[];
}

export const seedData: SeedProfile = {
  slug: 'ksenia-lugovaa',
  name: 'Ксения Луговая',
  title: 'Fullstack-разработчик с фокусом на backend',
  description:
    'Fullstack-разработчик с опытом в финтехе и B2B-продуктах. ' +
    'Проектирую API на Node.js (Express, NestJS) и TypeScript, работаю с GraphQL и REST, ' +
    'интеграциями, ролевой моделью доступа и мониторингом. ' +
    'Веду фичи от требований до продакшена; до разработки была проектным менеджером. Английский C1.',
  email: 'k27873598@gmail.com',
  location: 'Санкт-Петербург · удалённо',
  githubUrl: 'https://github.com/xenialugovaya',
  linkedinUrl: null,
  skills: [
    { name: 'TypeScript', category: 'Languages', level: 5 },
    { name: 'Node.js', category: 'Backend', level: 5 },
    { name: 'NestJS', category: 'Backend', level: 4 },
    { name: 'PostgreSQL', category: 'Databases', level: 4 },
    { name: 'Prisma', category: 'Databases', level: 4 },
    { name: 'GraphQL', category: 'API', level: 4 },
    { name: 'Docker', category: 'DevOps', level: 3 },
    { name: 'Git', category: 'Tools', level: 5 },
  ],
  experience: [
    {
      company: 'Банк ДОМ.РФ',
      position: 'Senior Fullstack Developer (React/Node.js)',
      location: 'Санкт-Петербург · удалённо',
      startDate: '2023-03-01',
      endDate: null,
      description:
        'Отвечаю за backend-часть B2B и B2C банковских продуктов: BFF-сервисы, REST и GraphQL API, ' +
        'интеграции и обновление статусов в реальном времени.',
      achievements: [
        'Спроектировала и поддерживаю BFF-сервисы на Node.js (Express, TypeScript): агрегация микросервисов, оптимизация контрактов и ускорение загрузки интерфейсов (LCP).',
        'Разрабатываю REST и GraphQL API, WebSocket и SSE для обновления статусов заявок и операций в реальном времени.',
        'Настроила интеграции с внешними и внутренними банковскими системами с таймаутами, ретраями и обработкой ошибок.',
        'Реализовала ролевую модель доступа и практики OWASP: валидация входных данных, защита от типовых уязвимостей.',
        'Оптимизирую запросы к БД и кеширование, разбираю инциденты на продакшене по логам и метрикам.',
        'Покрываю критичный backend-код unit-тестами (Jest/Vitest), участвую в кросс-командном код-ревью и технической стратегии.',
      ],
    },
    {
      company: 'СберКорус',
      position: 'Frontend-разработчик middle с full-stack задачами',
      location: 'Санкт-Петербург · удалённо',
      startDate: '2020-07-01',
      endDate: '2023-02-28',
      description:
        'Работала над EDI-проектами электронного документооборота; помимо frontend разрабатывала ' +
        'лёгкие Node.js-сервисы, мок-серверы и контракты API.',
      achievements: [
        'Проектировала взаимодействие frontend с API, описывала контракты и поддерживала интеграции.',
        'Разрабатывала лёгкие Node.js-сервисы и мок-серверы для разработки и тестирования.',
        'Развивала open-source библиотеку React-компонентов Korus-UI, покрывала код unit и e2e-тестами.',
      ],
    },
  ],
  projects: [
    {
      name: 'Business Card API',
      description:
        'Backend цифровой визитки на NestJS, Prisma, PostgreSQL и GraphQL с Apollo Sandbox.',
      url: 'https://business-card-test-xenialugovayas-projects.vercel.app',
      repositoryUrl: 'https://github.com/klugovaya-droid/business-card',
      technologies: ['TypeScript', 'NestJS', 'Prisma', 'GraphQL', 'PostgreSQL', 'Docker'],
    },
    {
      name: 'Price Ninja',
      description: 'Веб-сервис для сравнения цен.',
      url: 'https://priceninja.ru/',
      repositoryUrl: null,
      technologies: [],
    },
    {
      name: 'Korus-UI',
      description: 'Открытая библиотека React-компонентов для электронного документооборота.',
      url: null,
      repositoryUrl: 'https://github.com/kksng/korus-ui',
      technologies: ['React', 'TypeScript', 'Storybook', 'Jest', 'Cypress'],
    },
  ],
};
