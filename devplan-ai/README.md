# DevPlan AI — Умный планировщик задач

Веб-приложение для управления задачами с REST API, предназначенное для тестирования внешних AI-агентов.

**UI/UX 2026:** Тёмная/светлая тема, шрифт Inter, градиентные акценты, glassmorphism, bento grid, микро-анимации.

## 🚀 Быстрый старт

### Требования

- Python 3.11+
- uv (менеджер пакетов)

### Установка

```bash
cd devplan-ai

# Установка зависимостей
uv sync
```

### Запуск сервера

```bash
# Запуск backend-сервера
uv run uvicorn backend.main:app --reload --port 8000
```

Сервер запустится на `http://localhost:8000`

### Открытие фронтенда

Откройте файл `frontend/index.html` в браузере:

```bash
# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Windows
start frontend/index.html
```

Или используйте Live Server в VS Code.

## 📡 API Документация

После запуска сервера документация доступна по адресам:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Основные эндпоинты

#### CRUD задачи

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/tasks` | Список всех задач |
| `GET` | `/tasks/{id}` | Задача по ID |
| `POST` | `/tasks` | Создать задачу |
| `PATCH` | `/tasks/{id}` | Обновить задачу |
| `DELETE` | `/tasks/{id}` | Удалить задачу |

#### Инструменты для AI-агента

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/tools/create_task` | Создать задачу |
| `GET` | `/tools/list_tasks` | Список задач (кратко) |
| `POST` | `/tools/update_task_status` | Изменить статус |
| `POST` | `/tools/delete_task` | Удалить задачу |
| `GET` | `/tools/stats` | Статистика задач |

#### Системные

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/health` | Проверка работоспособности |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc документация |

### Примеры запросов

#### Создать задачу

```bash
curl -X POST "http://localhost:8000/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Реализовать авторизацию",
    "description": "JWT токены, refresh flow",
    "priority": "high",
    "deadline": "2026-05-01"
  }'
```

#### Получить статистику

```bash
curl "http://localhost:8000/tools/stats"
```

Ответ:
```json
{
  "total": 12,
  "by_status": {
    "todo": 5,
    "in_progress": 4,
    "done": 3
  },
  "by_priority": {
    "high": 3,
    "medium": 6,
    "low": 3
  },
  "overdue": 2
}
```

#### Изменить статус задачи (для AI-агента)

```bash
curl -X POST "http://localhost:8000/tools/update_task_status?task_id=1&status=in_progress"
```

## 🗂️ Структура проекта

```
devplan-ai/
├── backend/
│   ├── main.py              # Точка входа FastAPI
│   ├── database.py          # Подключение SQLite
│   ├── models.py            # ORM-модели
│   ├── schemas.py           # Pydantic-схемы
│   ├── routers/
│   │   ├── tasks.py         # CRUD эндпоинты
│   │   └── agent_tools.py   # Tool-friendly эндпоинты
│   └── services/
│       └── task_service.py  # Бизнес-логика
├── frontend/
│   ├── index.html           # Главная страница
│   ├── style.css            # Стили
│   └── app.js               # Логика взаимодействия с API
├── pyproject.toml           # Зависимости
└── README.md                # Этот файл
```

## 🔧 Технологии

| Компонент | Технология |
|-----------|------------|
| Backend | FastAPI 0.115+ |
| ASGI-сервер | Uvicorn |
| ORM | SQLAlchemy 2.x |
| База данных | SQLite (встроенная) |
| Валидация | Pydantic v2 |
| Менеджер пакетов | uv |
| Frontend | Vanilla HTML + CSS + Fetch API |
| Шрифт | Inter (Google Fonts) |
| Линтер | Ruff |

## 🎨 UI/UX особенности 2026

### Темизация
- **Тёмная тема по умолчанию** с приоритетом: localStorage → prefers-color-scheme → dark
- **Светлая тема** с мягкими оттенками (#f8f9fc фон, не чистый белый)
- Плавный переход между темами (transition 0.3s)
- Сохранение выбора пользователя в localStorage

### Визуальные эффекты
- **Glassmorphism** — полупрозрачные карточки с backdrop-filter: blur(10px) в тёмной теме
- **Градиентные акценты** — кнопки с градиентом #4a6cf7 → #7c3aed
- **Bento Grid** — асимметричная сетка статистики с крупными ячейками
- **Цветные индикаторы приоритета** — левая полоска на карточках задач (красный/оранжевый/синий)
- **Badge с точками** — минималистичные бейджи вместо цветных блоков

### Анимации
- **fadeInUp** — плавное появление карточек при загрузке
- **Hover-эффекты** — translateY(-2px) и усиление тени
- **Тактильная кнопка** — scale(0.98) при нажатии
- **Кастомный скроллбар** — тонкий 6px с цветами темы

### Типографика
- Шрифт **Inter** от Google Fonts (weights: 400, 500, 600, 700)
- Off-white текст (#e0e0e0) в тёмной теме для снижения усталости глаз
- Letter-spacing 0.02em на кнопках

---

## 📋 Модель данных

### Task (Задача)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INTEGER | Автоинкремент, первичный ключ |
| `title` | VARCHAR(255) | Название задачи |
| `description` | TEXT | Описание (опционально) |
| `priority` | ENUM | `low` / `medium` / `high` |
| `status` | ENUM | `todo` / `in_progress` / `done` |
| `deadline` | DATE | Срок выполнения (опционально) |
| `created_at` | DATETIME | Дата создания (авто) |
| `updated_at` | DATETIME | Дата обновления (авто) |

## 🤖 Использование с AI-агентом

AI-агент может взаимодействовать с приложением через `/tools/*` эндпоинты:

1. **Создание задачи:** `POST /tools/create_task`
2. **Получение списка:** `GET /tools/list_tasks`
3. **Обновление статуса:** `POST /tools/update_task_status?task_id={id}&status={status}`
4. **Удаление задачи:** `POST /tools/delete_task?task_id={id}`
5. **Получение статистики:** `GET /tools/stats`

Все эндпоинты возвращают JSON в формате, удобном для парсинга агентом.

## ✅ Критерии приёмки

### Backend
- [x] Все CRUD операции работают через Swagger UI
- [x] Все `/tools` эндпоинты возвращают корректный JSON
- [x] Внешний AI-агент может выполнить сценарий: создать → обновить → получить статистику
- [x] Сервер запускается одной командой

### Frontend UI/UX 2026
- [x] Переключатель тем 🌙/☀️ в шапке сайта
- [x] Плавный переход между темами (0.3s animation)
- [x] Сохранение темы в localStorage
- [x] Автоопределение системной темы (prefers-color-scheme)
- [x] Шрифт Inter загружается из Google Fonts
- [x] Кнопка "Создать задачу" с градиентом #4a6cf7 → #7c3aed
- [x] Sticky header с backdrop-blur эффектом
- [x] Карточки задач с цветной полоской приоритета слева
- [x] Анимация fadeInUp при загрузке списка задач
- [x] Тонкий кастомный скроллбар (6px)
- [x] Тактильный отклик кнопок (scale 0.98 при нажатии)
- [x] Bento Grid для виджета статистики
- [x] Glassmorphism карточки в тёмной теме
- [x] Badge с цветными точками вместо фоновых блоков
- [x] Иконки-эмодзи в stat-cards (🗂 📋 ⚙️ ✅ ⚠️)

---

**Версия:** 1.0  
**Автор:** Руслан Беренёв  
**Дата:** 25.04.2026  

## 📸 Скриншоты UI

### Тёмная тема (по умолчанию)
- Слоистые тёмно-серые тона (#0f1117, #1a1d27, #1e2130)
- Glassmorphism карточки с backdrop-filter: blur(10px)
- Градиентные кнопки #4a6cf7 → #7c3aed
- Цветные индикаторы приоритета на карточках задач

### Светлая тема
- Мягкий фон #f8f9fc (не чистый белый)
- Белые карточки #ffffff с мягкой тенью
- Тёмно-серый текст #1a1d27 (не чистый чёрный)
- Те же акцентные цвета для консистивности

### Компоненты
- **Header:** Sticky с градиентным фоном и backdrop-blur
- **Stat-cards:** Bento Grid с эмодзи-иконками
- **Task-cards:** Анимация fadeInUp, hover transform
- **Badge:** Минималистичные с цветной точкой
- **Скроллбар:** Тонкий 6px с цветами темы
