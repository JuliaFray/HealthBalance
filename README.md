# HealthBalance - Ваш персональный помощник здорового образа жизни

Веб-приложение для управления рецептами, планирования питания, составления списков покупок и многое другое.

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** версии 24+
- **npm** (рекомендуется) или pnpm
- **MongoDb** база данных
- **Git**

### Установка зависимостей

```bash
# Клонирование репозитория
git clone <repository-url>
cd HealthBalance

# Установка зависимостей
npm install
```

### Запуск приложения

#### Вариант 1: Запуск в режиме разработки (рекомендуется)

```bash
# Терминал 1: Запуск backend API сервера
npm dev
```

#### Вариант 2: Запуск production сборки

```bash
# Сборка проекта
npm build

# Запуск production сервера
npm start
```

### Доступ к приложению

- **Backend API:** http://localhost:8000

## 📁 Структура проекта

```

HealthBalance/
├───src
│   ├───constants
│   ├───controllers
│   ├───enums
│   ├───models
│   ├───public
│   │   ├───images
│   │   └───javascripts
│   ├───routes
│   ├───types
│   ├───utils
│   ├── config.js               # Конфиг подключения к MongoDb
│   ├── dbConnection.js         # Подключение к MongoDb
│   ├── server.ts               # Сервер Express
│   ├── webSocketServer.js      # Сервер WebSocket
├── package.json                # Зависимости и скрипты
└── README.md                   # Документация
```

## 🛠️ Доступные команды

```bash
# Разработка
npm dev                # Запуск backend сервера в режиме разработки
npm build              # Сборка проекта
npm start              # Запуск production сервера
```

## 🔧 Технологический стек

### Backend

- **Node.js** - Среда выполнения JavaScript
- **Express.js** -  веб-фреймворк для среды Node.js для работы с API
- **MongoDb** - база данных

## 📱 Функциональность

### Основные возможности

1. **Дневник питания**
    - Запись продуктов питания
    - Учет КБЖУ

2. **План питания**
    - Планирование питания по датам
    - Массовое добавление в корзину
    - Группировка по дням недели

3. **Корзина покупок**
    - Добавление продуктов из плана в корзину
    - Управление количеством
    - Автоматический расчет КБЖУ

4. **Список покупок**
    - Автоматическое формирование списка ингредиентов
    - Учет имеющихся ингредиентов
    - Расчет необходимого количества

5. **Календарь тренировок**
    - Запись тренировок и учет калорий

6. **Запись веса и других измерений**


## 🚀 Деплой

### Production сборка

```bash
# Сборка проекта
npm build

# Запуск production сервера
npm start
```

### Переменные окружения

```bash
# Production переменные
NODE_ENV=production
DB_URI=mongodb+srv://user.mongodb.net/project
DB_USER=user
DB_PASS=password
PORT=8000
WS_PORT=8080
EMAIL_USER=emailUser
EMAIL_PASS=emailPassword
EMAIL_FROM=emailUser@domain
FRONTEND_URL=frontentdUrl
```

## 📄 Лицензия

MIT License
