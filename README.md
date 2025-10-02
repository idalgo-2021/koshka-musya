# Secret Guest Service (трек Секретный гость)

*[Подробное описание проекта](details_readme.md)*

Сервис **Secret Guest Service(или SGS)** — система для проведения инспекций отелей, хостелов, апартаментов и других объектов через механизм тайных гостей. 


* Проект выполнен в рамках хакатона "О! Хакатон 2025" в октябре 2025 года командой **"Кошка Муся"**.  
* Формулировка задания: 
  * [См. на сайте организаторов](https://docs.ostrovok.tech/s/ostrovok-hackathon-2025/doc/trek-sekretnyj-gost-xzESCUjgeK)
  * [См. локальная копия](project_documentation/Задание.md)


- ссылка на видео-скринкаст: https://disk.yandex.ru/d/HKB627xbb429LA

## Быстрый старт

```bash
git clone https://github.com/ostrovok-hackathon-2025/koshka-musya
cd koshka-musya

# Перейти в каталог бэкенда(.env требуется только для бэкенда)
cd backend
# Создать .env файл с переменными окружения
cp .env.example .env   # если будете тестить передачу картинок(используется ImageKit), то получить у бота токен, которыя я отправил
#Вернуться в каталог на уровень выше
cd ..

# Сборка и запуск проекта
make build
make up 

# открыть http://localhost:8080 - фронтенд
# открыть http://localhost:8000 - бэкенд
# открыть http://localhost:8000/swagger/index.html - swagger-документация API


# Для остановки проекта и удаления контейнеров
make down
make prune
make clean
```

## Зависимости и переменные окружения

Рекомендованные ресурсы:
- 16 CPU cores
- 16GB RAM

- Postgres 16 (`16.1-alpine3.19`)

Есть зависимость сервиса ImageKit - это облачное хранение картинок и файлов(см. переменные окружения с префиксом `IMAGEKIT_`)

- Необходимые данные будет отправлены через чатбот хакатона организаторам


Переменнные окружения(также см. `.env.example`):

- `POSTGRES_HOST=localhost`
- `POSTGRES_PORT=5432`
- `POSTGRES_USER=your_user`
- `POSTGRES_PASSWORD=your_strong_password`
- `POSTGRES_DB=your_db_name`

- `HTTP_SERVER_ADDRESS=localhost`
- `HTTP_SERVER_PORT=8000`

- `JWT_SECRET_KEY="your-super-secret-key-that-is-long-and-secure"`
- `JWT_ACCESS_TOKEN_LIFETIME_SECONDS=900`
- `JWT_REFRESH_TOKEN_LIFETIME_SECONDS=604800`
- `ASSIGNMENT_DEADLINE_HOURS=12`

- `FRONTEND_URL=http://localhost:3000 # для CORS`

- `IMAGEKIT_PRIVATE_KEY=my_private_key`
- `IMAGEKIT_PUBLIC_KEY=my_public_key`
- `IMAGEKIT_ENDPOINT_URL=my_endpoint_url`
- `IMAGEKIT_UPLOAD_URL=https://upload.imagekit.io/api/v1/files/upload`


## Сидирование

* Специальных действий по заполнению таблиц БД базовым контентом не требуется. 
* При сборке проекта выполняются скрипты `/backend/migrations` - создающий и заполняющий таблицы БД.


## Маршруты/доступ

- `http://localhost:8080` - UI(фронтенд - единая точка входа в приложение ТАйного гостя и в админку)
- `http://localhost:8000` - API(бэкенд)
- `http://localhost:8000/swagger/index.html` - swagger-документация API(бэкенд). Так же см. - [api_endpoints_description.txt](backend/docs/api_endpoints_description.txt)

- Тестовый пользователь(Тайный гость): `alfred / 123`
- Тестовый пользователь(Администратор): `diana / 12345`


## Подробное описание проекта

* [См. подробное описание проекта](details_readme.md)