# DevPlan AI — Умный планировщик задач

Веб-приложение для управления задачами с REST API, предназначенное для тестирования внешних AI-агентов.

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
| Линтер | Ruff |

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

- [x] Все CRUD операции работают через Swagger UI
- [x] Все `/tools` эндпоинты возвращают корректный JSON
- [x] Фронтенд отображает задачи и позволяет создавать/удалять их
- [x] Внешний AI-агент может выполнить сценарий: создать → обновить → получить статистику
- [x] Сервер запускается одной командой

---

**Версия:** 1.0  
**Автор:** Руслан Беренёв  
**Дата:** 25.04.2026
