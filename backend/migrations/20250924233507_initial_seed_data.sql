
INSERT INTO roles (id, name, description) VALUES
    (1, 'admin', 'System administrator'),
    (2, 'moderator', 'Content moderator'),
    (3, 'secret_guest', 'Secret guest');

INSERT INTO listing_types (slug, name) VALUES
    ('hotel', 'Отель'),
    ('apartment', 'Апартаменты'),
    ('hostel', 'Хостел'),
    ('guest_house', 'Гостевой дом');

INSERT INTO assignment_statuses (id, slug, name) VALUES
    (1, 'offered', 'Предложено'),
    (2, 'accepted', 'Принято'),
    (3, 'cancelled', 'Отменено'),
    (4, 'declined', 'Отклонено'),
    (5, 'expired', 'Просрочено');

INSERT INTO report_statuses (id, slug, name) VALUES
    (1, 'generating', 'Генерация'),
    (2, 'draft', 'Черновик'),
    (3, 'submitted', 'Сдан на проверку клиентом'),
    (4, 'refused', 'Отказ клиента'),
    (5, 'approved', 'Одобрен'),
    (6, 'rejected', 'Отклонен'),
    (7, 'failed_generation', 'Ошибка генерации');

INSERT INTO answer_types (slug, name, meta) VALUES
    ('text', 'Текстовый ответ', null),
    ('boolean', 'Да/Нет', null),
    ('rating_5', 'Оценка от 1 до 5', '{"min": 1, "max": 5}'),
    ('rating_10', 'Оценка от 1 до 10', '{"min": 1, "max": 10}');

INSERT INTO media_requirements (slug, name) VALUES
    ('none', 'Не требуется'),
    ('optional', 'Необязательно'),
    ('required', 'Обязательно');


INSERT INTO ota_sg_reservation_statuses (id, slug, name) VALUES
    (1, 'new', 'Новое'),
    (2, 'hold', 'Захолдировано'),
    (3, 'booked', 'Забронировано'),
    (4, 'no-show', 'Не обрабатывать');


--- =========== СОЗДАНИЕ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ ===========

INSERT INTO users (username, email, password_hash, role_id) VALUES
    (
        'alfred',
        'alfred@example.com',
        '$2a$10$fUXpHWTa5OSy8aMDWBs2A.uxoZfVKUkNXD2bFk2KJ.i9OR2QHbDuu', -- bcrypt hash для '123'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'boris',
        'boris@example.com',
        '$2a$10$m0heb7ILz5mVpxlQZI1ZPO2pBsYlGXHnwui8aOuidByxa3a0vxfGG', -- bcrypt hash для '1234'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'celine',
        'celine@example.com',
        '$2a$10$m0heb7ILz5mVpxlQZI1ZPO2pBsYlGXHnwui8aOuidByxa3a0vxfGG', -- bcrypt hash для '1234'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'diana',
        'diana@example.com',
        '$2a$10$l1rgthxmp3Hs/CD1p7wxSu2CuF7IIZxGcJbtWjaeYI1tWpnXP8vhy', -- bcrypt hash для '12345'
        (SELECT id FROM roles WHERE name = 'admin') -- <-- Сразу присваиваем роль админа
    ),
    (
        'alpha',
        'alpha@example.com',
        '$2a$10$65BxYKs8Cj.5Y09lscXlr.a25RCU3Z5FExfVyAd6eWMpdf2e1S/GS', -- bcrypt hash для '123'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'beta',
        'beta@example.com',
        '$2a$10$F/Y57OBm8Z/11dkrzdqDIeFqVCFxNC9oIRG1nDUpx9FjxzAT2BlVq', -- bcrypt hash для '123'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'gamma',
        'gamma@example.com',
        '$2a$10$2kgJY2718BL0Xr/EVQ2mGOhFm9D06HJZH/sulnOsY0TVPruqmxM2K', -- bcrypt hash для '123'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'delta',
        'delta@example.com',
        '$2a$10$HP0CMyNm4UooUewDTCKC6OPLChD2mSYSr8HlvoqO1rvlxLCPSrWnC', -- bcrypt hash для '123'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'epsilon',
        'epsilon@example.com',
        '$2a$10$FbKYPwhuWTjw5NB3vXDDyukjXx/pTMVARSDuL56Touxd3vChmGEG.', -- bcrypt hash для '123'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'zetta',
        'zetta@example.com',
        '$2a$10$9RW5PiR/EfwNimvp7dUA6uH25pgfT.6CleYg9LAgxs8AnO4XJjqSO', -- bcrypt hash для '123'
        (SELECT id FROM roles WHERE name = 'secret_guest')
    ),
    (
        'hetta',
        'hetta@example.com',
        '$2a$10$J1gEYAaWWh5xICKoUndns.9W08vjlj.JVFbPS5uWS2sSqxpNDiia.', -- bcrypt hash для '12345'
        (SELECT id FROM roles WHERE name = 'moderator')
    )
ON CONFLICT (username) DO NOTHING;



-- =========== ЗАПОЛНЕНИЕ ТАБЛИЦЫ user_profiles (ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ) ===========

INSERT INTO user_profiles (user_id, accepted_offers_count, submitted_reports_count, correct_reports_count, registered_at)
VALUES
  ((SELECT id FROM users WHERE username = 'alfred'),   10, 10, 5, '2025-09-01 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'boris'),    2, 3, 2, '2025-09-02 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'celine'),   2, 1, 1, '2025-09-03 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'diana'),    0, 0, 0, '2025-09-04 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'alpha'),    5, 5, 4, '2025-09-05 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'beta'),     10, 9, 8, '2025-09-10 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'gamma'),    22, 10, 1, '2025-09-11 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'delta'),    7, 6, 5, '2025-09-12 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'epsilon'),  2, 1, 0, '2025-09-13 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'zetta'),    7, 0, 0, '2025-09-20 06:46:45.268'),
  ((SELECT id FROM users WHERE username = 'hetta'),    0, 0, 0, '2025-09-21 06:46:45.268')
ON CONFLICT (user_id) DO NOTHING;


-- =========== ЗАПОЛНЕНИЕ ТАБЛИЦЫ listings (ОБЪЕКТЫ РАЗМЕЩЕНИЯ) ===========

-- INSERT INTO listings (
--     title, description, main_picture, listing_type_id, address, city, country, latitude, longitude, code
-- ) VALUES
-- -- --- Отели (listing_type_id = 1) ---
-- ('Гранд Отель "Центральный"', 'Роскошный отель в самом сердце города с видом на главную площадь.', 'https://cdn.worldota.net/t/1200x616/extranet/c5/b7/c5b726bddddc50f063af1577614fdb9ce026812e.jpeg', 1, 'ул. Тверская, д. 1', 'Москва', 'Россия', 55.7558, 37.6176, 'b9ec4c3d-5db2-47bc-9fb4-f0d67d33f1d0'),
-- ('Приморская Жемчужина', 'Современный отель на первой береговой линии с собственным пляжем и бассейном.', 'https://cdn.worldota.net/t/1200x616/extranet/da/58/da58a1d236fea6479dd4eb4570ebb8b7f1e1ce88.jpeg', 1, 'ул. Набережная, д. 15', 'Сочи', 'Россия', 43.5855, 39.7231, gen_random_uuid()),
-- ('Бутик-отель "Старый Город"', 'Уютный отель в историческом здании, каждый номер с уникальным дизайном.', 'https://cdn.worldota.net/t/1200x616/extranet/e4/f4/e4f479e73bb426260123ed7ad9f472ac3f8954bb.jpeg', 1, 'ул. Невский проспект, д. 45', 'Санкт-Петербург', 'Россия', 59.9343, 30.3351, gen_random_uuid()),
-- -- --- Апартаменты (listing_type_id = 2) ---
-- ('Лофт на Красном Октябре', 'Стильные апартаменты с панорамными окнами в модном районе.', 'https://cdn.worldota.net/t/1200x616/extranet/1f/e9/1fe9eba4d88422e089f15920d90be7ed660aaba9.jpeg', 2, 'Берсеневская наб., д. 6, стр. 3', 'Москва', 'Россия', 55.7408, 37.6114, gen_random_uuid()),
-- ('Квартира у моря', 'Светлая двухкомнатная квартира с балконом и видом на море, в 5 минутах от пляжа.', 'https://cdn.worldota.net/t/1200x616/extranet/c6/81/c681b19c8d17548d22f3800e7266ecc361f258f1.jpeg', 2, 'ул. Ленина, д. 112', 'Адлер', 'Россия', 43.4299, 39.9234, gen_random_uuid()),
-- -- --- Хостелы (listing_type_id = 3) ---
-- ('Хостел "Друзья"', 'Веселый и современный хостел с общей кухней и игровой зоной.', 'https://cdn.worldota.net/t/1200x616/extranet/2e/8c/2e8cfffa97a4f7a39db1f4e57491f60f7a804a35.JPEG', 3, 'ул. Лиговский проспект, д. 50', 'Санкт-Петербург', 'Россия', 59.9256, 30.3587, gen_random_uuid()),
-- ('Горный Приют', 'Хостел для любителей активного отдыха у подножия гор.', 'https://cdn.worldota.net/t/1200x616/extranet/63/d2/63d241586793115d87818109ac43123d002fa4d8.JPEG', 3, 'пос. Красная Поляна, ул. Защитников Кавказа, д. 77', 'Красная Поляна', 'Россия', 43.6834, 40.2045, gen_random_uuid()),
-- -- --- Гостевые дома (listing_type_id = 4) ---
-- ('Уютный дворик', 'Семейный гостевой дом с садом и зоной для барбекю.', 'https://cdn.worldota.net/t/1200x616/extranet/b4/5e/b45efcf3cfcb1c6ef47cae6c3427a97e18a39d5c.jpeg', 4, 'ул. Виноградная, д. 25', 'Суздаль', 'Россия', 56.4168, 40.4499, gen_random_uuid()),
-- ('Дом у озера', 'Гостевой дом на берегу живописного озера с возможностью рыбалки и проката лодок.', 'https://cdn.worldota.net/t/1200x616/extranet/7c/16/7c16d355fc7c18098445cb227620b1ff29ac1d37.jpeg', 4, 'д. Селигер, ул. Озерная, д. 1', 'Осташков', 'Россия', 57.1481, 33.1039, gen_random_uuid()),
-- ('Альпийская Вилла', 'Шале в альпийском стиле с сауной и каминным залом.', 'https://cdn.worldota.net/t/1200x616/extranet/2c/f1/2cf13650103ed67ba82ebbbf4953ba30ceac6b70.JPEG', 4, 'ул. Горная, д. 5', 'Красная Поляна', 'Россия', 43.6800, 40.2050, gen_random_uuid());

INSERT INTO listings (
    title, description, main_picture, listing_type_id, address, city, country, latitude, longitude, code
) VALUES
-- --- Отели (listing_type_id = 1) ---
('Гранд Отель "Центральный"', 'Роскошный отель в самом сердце города с видом на главную площадь.', 'https://cdn.worldota.net/t/1200x616/extranet/c5/b7/c5b726bddddc50f063af1577614fdb9ce026812e.jpeg', 1, 'ул. Тверская, д. 1', 'Москва', 'Россия', 55.7558, 37.6176, 'b9ec4c3d-5db2-47bc-9fb4-f0d67d33f1d0'),
('Приморская Жемчужина', 'Современный отель на первой береговой линии с собственным пляжем и бассейном.', 'https://cdn.worldota.net/t/1200x616/extranet/da/58/da58a1d236fea6479dd4eb4570ebb8b7f1e1ce88.jpeg', 1, 'ул. Набережная, д. 15', 'Сочи', 'Россия', 43.5855, 39.7231, 'da5811d2-36e4-4d19-9b23-1234567890ab'),
('Бутик-отель "Старый Город"', 'Уютный отель в историческом здании, каждый номер с уникальным дизайном.', 'https://cdn.worldota.net/t/1200x616/extranet/e4/f4/e4f479e73bb426260123ed7ad9f472ac3f8954bb.jpeg', 1, 'ул. Невский проспект, д. 45', 'Санкт-Петербург', 'Россия', 59.9343, 30.3351, 'e4f479e7-3bb4-4262-6012-3ed7ad9f472a'),
-- --- Апартаменты (listing_type_id = 2) ---
('Лофт на Красном Октябре', 'Стильные апартаменты с панорамными окнами в модном районе.', 'https://cdn.worldota.net/t/1200x616/extranet/1f/e9/1fe9eba4d88422e089f15920d90be7ed660aaba9.jpeg', 2, 'Берсеневская наб., д. 6, стр. 3', 'Москва', 'Россия', 55.7408, 37.6114, '1fe9eba4-d884-22e0-891f-15920d90be7e'),
('Квартира у моря', 'Светлая двухкомнатная квартира с балконом и видом на море, в 5 минутах от пляжа.', 'https://cdn.worldota.net/t/1200x616/extranet/c6/81/c681b19c8d17548d22f3800e7266ecc361f258f1.jpeg', 2, 'ул. Ленина, д. 112', 'Адлер', 'Россия', 43.4299, 39.9234, 'c681b19c-8d17-548d-22f3-80e7266ecc36'),
-- --- Хостелы (listing_type_id = 3) ---
('Хостел "Друзья"', 'Веселый и современный хостел с общей кухней и игровой зоной.', 'https://cdn.worldota.net/t/1200x616/extranet/2e/8c/2e8cfffa97a4f7a39db1f4e57491f60f7a804a35.JPEG', 3, 'ул. Лиговский проспект, д. 50', 'Санкт-Петербург', 'Россия', 59.9256, 30.3587, '2e8cfffa-97a4-7a39-db1f-4e57491f60f7'),
('Горный Приют', 'Хостел для любителей активного отдыха у подножия гор.', 'https://cdn.worldota.net/t/1200x616/extranet/63/d2/63d241586793115d87818109ac43123d002fa4d8.JPEG', 3, 'пос. Красная Поляна, ул. Защитников Кавказа, д. 77', 'Красная Поляна', 'Россия', 43.6834, 40.2045, '63d24158-6793-115d-8781-8109ac43123d'),
-- --- Гостевые дома (listing_type_id = 4) ---
('Уютный дворик', 'Семейный гостевой дом с садом и зоной для барбекю.', 'https://cdn.worldota.net/t/1200x616/extranet/b4/5e/b45efcf3cfcb1c6ef47cae6c3427a97e18a39d5c.jpeg', 4, 'ул. Виноградная, д. 25', 'Суздаль', 'Россия', 56.4168, 40.4499, 'b45efcf3-cfcb-1c6e-f47c-ae6c3427a97e'),
('Дом у озера', 'Гостевой дом на берегу живописного озера с возможностью рыбалки и проката лодок.', 'https://cdn.worldota.net/t/1200x616/extranet/7c/16/7c16d355fc7c18098445cb227620b1ff29ac1d37.jpeg', 4, 'д. Селигер, ул. Озерная, д. 1', 'Осташков', 'Россия', 57.1481, 33.1039, '7c16d355-fc18-0984-45cb-227620b1ff29'),
('Альпийская Вилла', 'Шале в альпийском стиле с сауной и каминным залом.', 'https://cdn.worldota.net/t/1200x616/extranet/2c/f1/2cf13650103ed67ba82ebbbf4953ba30ceac6b70.JPEG', 4, 'ул. Горная, д. 5', 'Красная Поляна', 'Россия', 43.6800, 40.2050, '2cf13650-103e-d67b-a82e-bfd4953ba30c');

-- =========== ЗАПОЛНЕНИЕ ТАБЛИЦЫ checklist_sections (СЕКЦИИ ЧЕК-ЛИСТОВ) ===========

INSERT INTO checklist_sections (listing_type_id, slug, title, sort_order) VALUES
-- --- Секции для ОТЕЛЯ (listing_type_id = 1) ---
(1, 'general', 'Общие впечатления', 10),
(1, 'room', 'Номер', 20),
(1, 'staff', 'Персонал', 30),
(1, 'services', 'Услуги', 40),
-- --- Секции для АПАРТАМЕНТОВ (listing_type_id = 2) ---
(2, 'general', 'Общие впечатления', 10),
(2, 'kitchen', 'Кухня', 20),
(2, 'amenities', 'Удобства', 30),
(2, 'bedroom', 'Спальное место', 40),
-- --- Секции для ХОСТЕЛА (listing_type_id = 3) ---
(3, 'common_areas', 'Общие зоны', 10),
(3, 'bedroom', 'Спальное место', 20),
(3, 'staff', 'Персонал', 30),
-- --- Секции для ГОСТЕВОГО ДОМА (listing_type_id = 4) ---
(4, 'general', 'Общее', 10),
(4, 'food', 'Питание', 20),
(4, 'room', 'Комната', 30);


-- =========== ЗАПОЛНЕНИЕ ТАБЛИЦЫ checklist_items (ПУНКТЫ ЧЕК-ЛИСТОВ) ===========

INSERT INTO checklist_items (listing_type_id, section_id, answer_type_id, media_requirement_id, media_allowed_types, media_max_files, slug, title, description, sort_order) VALUES
-- === ЧЕК-ЛИСТ ДЛЯ ОТЕЛЯ (listing_type_id = 1) ===
-- Секция "Общие впечатления"
(1, (SELECT id FROM checklist_sections WHERE listing_type_id = 1 AND slug = 'general'), 2, 1, ARRAY['image'], 1, 'hotel_overall_impression_ok', 'Общее впечатление от отеля положительное?', 'Соответствует ли отель заявленному уровню и фотографиям на сайте?', 10),
(1, (SELECT id FROM checklist_sections WHERE listing_type_id = 1 AND slug = 'general'), 3, 2, ARRAY['image'], 3, 'hotel_cleanliness_rating', 'Оцените общую чистоту отеля (лобби, коридоры)', 'Оцените от 1 до 5', 20),
(1, (SELECT id FROM checklist_sections WHERE listing_type_id = 1 AND slug = 'general'), 1, 1, ARRAY['image'], 1, 'hotel_location_comment', 'Удобство расположения', 'Опишите, насколько удобно добираться до отеля и основных достопримечательностей.', 30),
-- Секция "Номер"
(1, (SELECT id FROM checklist_sections WHERE listing_type_id = 1 AND slug = 'room'), 3, 3, ARRAY['image'], 5, 'hotel_room_cleanliness_rating', 'Чистота в номере', 'Оцените чистоту номера, включая ванную комнату. Требуется фото.', 10),
(1, (SELECT id FROM checklist_sections WHERE listing_type_id = 1 AND slug = 'room'), 2, 2, ARRAY['image'], 2, 'hotel_bed_comfort_ok', 'Кровать и постельное белье удобные?', 'Соответствует ли белье стандартам чистоты и комфорта?', 20),
-- Секция "Персонал"
(1, (SELECT id FROM checklist_sections WHERE listing_type_id = 1 AND slug = 'staff'), 3, 1, ARRAY['image'], 1, 'hotel_staff_friendliness_rating', 'Приветливость персонала', 'Оцените вежливость и отзывчивость сотрудников.', 10),
-- Секция "Услуги"
(1, (SELECT id FROM checklist_sections WHERE listing_type_id = 1 AND slug = 'services'), 4, 2, ARRAY['image', 'video'], 2, 'hotel_wifi_speed_rating', 'Оцените качество Wi-Fi', 'Оцените от 1 до 10. Приложите скриншот Speedtest, если возможно.', 10),
-- === ЧЕК-ЛИСТ ДЛЯ АПАРТАМЕНТОВ (listing_type_id = 2) ===
-- Секция "Общие впечатления"
(2, (SELECT id FROM checklist_sections WHERE listing_type_id = 2 AND slug = 'general'), 3, 2, ARRAY['image'], 3, 'apt_cleanliness_rating', 'Оцените чистоту апартаментов', 'Насколько чистыми были помещения при заезде?', 10),
(2, (SELECT id FROM checklist_sections WHERE listing_type_id = 2 AND slug = 'general'), 2, 3, ARRAY['image'], 3, 'apt_photo_match_ok', 'Соответствие фотографиям', 'Соответствует ли реальное состояние жилья фотографиям в объявлении? Требуется фото.', 20),
-- Секция "Кухня"
(2, (SELECT id FROM checklist_sections WHERE listing_type_id = 2 AND slug = 'kitchen'), 2, 2, ARRAY['image'], 5, 'apt_kitchen_utensils_ok', 'Наличие необходимой посуды', 'Хватает ли посуды для приготовления и приема пищи?', 10),
-- Секция "Удобства"
(2, (SELECT id FROM checklist_sections WHERE listing_type_id = 2 AND slug = 'amenities'), 4, 3, ARRAY['image'], 2, 'apt_wifi_speed_rating', 'Оцените качество Wi-Fi', 'Оцените от 1 до 10. Требуется скриншот Speedtest.', 10),
-- Секция "Спальное место"
(2, (SELECT id FROM checklist_sections WHERE listing_type_id = 2 AND slug = 'bedroom'), 3, 2, ARRAY['image'], 2, 'apt_bed_comfort_rating', 'Удобство кровати/дивана', 'Оцените комфорт спального места и качество постельного белья.', 10),
-- === ЧЕК-ЛИСТ ДЛЯ ХОСТЕЛА (listing_type_id = 3) ===
(3, (SELECT id FROM checklist_sections WHERE listing_type_id = 3 AND slug = 'common_areas'), 3, 3, ARRAY['image'], 3, 'hostel_common_area_cleanliness', 'Чистота общих зон', 'Оцените чистоту кухни, лаунж-зоны, душевых. Требуется фото.', 10),
(3, (SELECT id FROM checklist_sections WHERE listing_type_id = 3 AND slug = 'bedroom'), 3, 2, ARRAY['image'], 2, 'hostel_bed_cleanliness_rating', 'Чистота спального места', 'Чистое ли постельное белье?', 10),
(3, (SELECT id FROM checklist_sections WHERE listing_type_id = 3 AND slug = 'staff'), 3, 1, ARRAY['image'], 1, 'hostel_staff_rating', 'Оцените работу персонала', null, 10),
-- === ЧЕК-ЛИСТ ДЛЯ ГОСТЕВОГО ДОМА (listing_type_id = 4) ===
(4, (SELECT id FROM checklist_sections WHERE listing_type_id = 4 AND slug = 'general'), 3, 2, ARRAY['image'], 3, 'guesthouse_host_hospitality_rating', 'Гостеприимство хозяев', 'Насколько радушными и готовыми помочь были хозяева?', 10),
(4, (SELECT id FROM checklist_sections WHERE listing_type_id = 4 AND slug = 'food'), 1, 1, ARRAY['image'], 1, 'guesthouse_breakfast_comment', 'Комментарий о завтраке', 'Если завтрак был включен, опишите его.', 10),
(4, (SELECT id FROM checklist_sections WHERE listing_type_id = 4 AND slug = 'room'), 4, 1, ARRAY['image'], 1, 'guesthouse_soundproofing_rating', 'Звукоизоляция', 'Оцените от 1 (все слышно) до 10 (ничего не слышно).', 10);



-- =========== ЗАПОЛНЕНИЕ ТАБЛИЦЫ ota_sg_reservations (БРОНИРОВАНИЯ ОТА) ===========

-- Бронирование 1:
INSERT INTO ota_sg_reservations (created_at,
                                ota_id,
                                booking_number,
                                listing_id,
                                checkin_date,
                                checkout_date,
                                pricing,
                                status_id,
                                source_msg)
VALUES (
     NOW(),
    'f6b1c8f4-23ab-4c32-87a1-7810e7a3e9b1', -- из source_msg
    'TG-20250927-AB1234', -- из source_msg
    (SELECT id FROM listings WHERE code = 'b9ec4c3d-5db2-47bc-9fb4-f0d67d33f1d0'), -- поиск по уникальному коду
    '2025-10-05T15:00:00Z', -- из source_msg
    '2025-10-10T12:00:00Z', -- из source_msg
    '{"pricing":{"currency":"RUB","total":25000,"breakdown":{"per_night":5000,"nights":5}}}'::jsonb, -- информация о стоимости
    (SELECT id FROM ota_sg_reservation_statuses WHERE slug = 'new'),
    '{"reservation":{"ota_id":"f6b1c8f4-23ab-4c32-87a1-7810e7a3e9b1","booking_number":"TG-20250927-AB1234","status":"reserved","listing":{"id":"b9ec4c3d-5db2-47bc-9fb4-f0d67d33f1d0","title":"Гранд Отель \"Центральный\"","description":"Роскошный отель в самом сердце города с видом на главную площадь.","main_picture":"https://cdn.worldota.net/t/1200x616/extranet/c5/b7/c5b726bddddc50f063af1577614fdb9ce026812e.jpeg","listing_type":{"id":1,"slug":"hotel","name":"Отель"},"address":"ул. Тверская, д. 1","city":"Москва","country":"Россия","latitude":55.7558,"longitude":37.6176},"dates":{"checkin":"2025-10-05T15:00:00Z","checkout":"2025-10-10T12:00:00Z"},"guests":{"adults":2,"children":1},"pricing":{"currency":"RUB","total":25000,"breakdown":{"per_night":5000,"nights":5}}},"source":"Ostrovok.com","received_at":"2025-09-27T00:12:00Z"}'::jsonb
);


-- =========== ЗАПОЛНЕНИЕ ТАБЛИЦЫ assignments (ПРЕДЛОЖЕНИЕ НА ОСНОВЕ БРОНИРОВАНИЯ ОТ ОТА) ===========


-- Предложение 1
INSERT INTO assignments (
    ota_sg_reservation_id,
    pricing,
    guests,
    checkin_date,
    checkout_date,
    listing_id,
    purpose,
    expires_at,
    status_id
)
SELECT
    r.id AS ota_sg_reservation_id,
    r.pricing,
    r.source_msg -> 'reservation' -> 'guests' AS guests,
    (r.source_msg -> 'reservation' -> 'dates' ->> 'checkin')::timestamp AS checkin_date,
    (r.source_msg -> 'reservation' -> 'dates' ->> 'checkout')::timestamp AS checkout_date,
    r.listing_id,
    'Проверка объекта по бронированию от OTA' AS purpose,
    ((r.source_msg -> 'reservation' -> 'dates' ->> 'checkin')::timestamp + interval '1 day') AS expires_at, -- например, истекает через 1 день после выезда
    (SELECT id FROM assignment_statuses WHERE slug = 'offered') -- или задай конкретный статус
FROM ota_sg_reservations r
WHERE r.booking_number = 'TG-20250927-AB1234'
ON CONFLICT (ota_sg_reservation_id) DO NOTHING;


-- ============================ ============================ ============================ ============================


-- Бронирование 1
INSERT INTO ota_sg_reservations (
    created_at, ota_id, booking_number, listing_id, checkin_date, checkout_date,
    pricing, status_id, source_msg
) VALUES (
    NOW(),
    'f7b1c8f4-23ab-4c32-87a1-7810e7a3e9b1',
    'TG-20251001-A001',
    (SELECT id FROM listings WHERE code = 'b9ec4c3d-5db2-47bc-9fb4-f0d67d33f1d0'),
    '2025-10-02T15:00:00Z',
    '2025-10-10T12:00:00Z',
    '{"pricing":{"currency":"USD","total":25000,"breakdown":{"per_night":5000,"nights":5}}}'::jsonb,
    (SELECT id FROM ota_sg_reservation_statuses WHERE slug = 'new'),
    '{
      "reservation": {
        "ota_id":"f7b1c8f4-23ab-4c32-87a1-7810e7a3e9b1",
        "booking_number":"TG-20251001-A001",
        "status":"reserved",
        "listing":{"code":"b9ec4c3d-5db2-47bc-9fb4-f0d67d33f1d0"},
        "dates":{"checkin":"2025-10-05T15:00:00Z","checkout":"2025-10-10T12:00:00Z"},
        "guests":{"adults":2,"children":1},
        "pricing":{"currency":"USD","total":25000,"breakdown":{"per_night":5000,"nights":5}}
      },
      "source":"Ostrovok.com",
      "received_at":"2025-10-01T12:00:00Z"
    }'::jsonb
);

-- Бронирование 2
INSERT INTO ota_sg_reservations (
    created_at, ota_id, booking_number, listing_id, checkin_date, checkout_date,
    pricing, status_id, source_msg
) VALUES (
    NOW(),
    'a1b2c3d4-5678-9101-1121-314151617181',
    'TG-20251001-A002',
    (SELECT id FROM listings WHERE code = 'da5811d2-36e4-4d19-9b23-1234567890ab'),
    '2025-10-02T14:00:00Z',
    '2025-10-12T11:00:00Z',
    '{"pricing":{"currency":"BYN","total":18000,"breakdown":{"per_night":4500,"nights":4}}}'::jsonb,
    (SELECT id FROM ota_sg_reservation_statuses WHERE slug = 'new'),
    '{
      "reservation": {
        "ota_id":"a1b2c3d4-5678-9101-1121-314151617181",
        "booking_number":"TG-20251001-A002",
        "status":"reserved",
        "listing":{"code":"da5811d2-36e4-4d19-9b23-1234567890ab"},
        "dates":{"checkin":"2025-10-08T14:00:00Z","checkout":"2025-10-12T11:00:00Z"},
        "guests":{"adults":1,"children":0},
        "pricing":{"currency":"BYN","total":18000,"breakdown":{"per_night":4500,"nights":4}}
      },
      "source":"Booking.com",
      "received_at":"2025-10-01T13:00:00Z"
    }'::jsonb
);

-- Бронирование 3
INSERT INTO ota_sg_reservations (
    created_at, ota_id, booking_number, listing_id, checkin_date, checkout_date,
    pricing, status_id, source_msg
) VALUES (
    NOW(),
    'f9e8d7c6-b5a4-3210-9f8e-7d6c5b4a3e2f',
    'TG-20251001-A003',
    (SELECT id FROM listings WHERE code = '1fe9eba4-d884-22e0-891f-15920d90be7e'),
    '2025-10-02T16:00:00Z',
    '2025-10-07T11:00:00Z',
    '{"pricing":{"currency":"KZT","total":22000,"breakdown":{"per_night":5500,"nights":4}}}'::jsonb,
    (SELECT id FROM ota_sg_reservation_statuses WHERE slug = 'new'),
    '{
      "reservation": {
        "ota_id":"f9e8d7c6-b5a4-3210-9f8e-7d6c5b4a3e2f",
        "booking_number":"TG-20251001-A003",
        "status":"reserved",
        "listing":{"code":"1fe9eba4-d884-22e0-891f-15920d90be7e"},
        "dates":{"checkin":"2025-10-03T16:00:00Z","checkout":"2025-10-07T11:00:00Z"},
        "guests":{"adults":3,"children":0},
        "pricing":{"currency":"KZT","total":22000,"breakdown":{"per_night":5500,"nights":4}}
      },
      "source":"Airbnb.com",
      "received_at":"2025-10-01T14:00:00Z"
    }'::jsonb
);

-- Бронирование 4
INSERT INTO ota_sg_reservations (
    created_at, ota_id, booking_number, listing_id, checkin_date, checkout_date,
    pricing, status_id, source_msg
) VALUES (
    NOW(),
    '123e4567-e89b-12d3-a456-426614174000',
    'TG-20251001-A004',
    (SELECT id FROM listings WHERE code = 'c681b19c-8d17-548d-22f3-80e7266ecc36'),
    '2025-10-02T15:00:00Z',
    '2025-10-15T12:00:00Z',
    '{"pricing":{"currency":"EUR","total":27000,"breakdown":{"per_night":5400,"nights":5}}}'::jsonb,
    (SELECT id FROM ota_sg_reservation_statuses WHERE slug = 'new'),
    '{
      "reservation": {
        "ota_id":"123e4567-e89b-12d3-a456-426614174000",
        "booking_number":"TG-20251001-A004",
        "status":"reserved",
        "listing":{"code":"c681b19c-8d17-548d-22f3-80e7266ecc36"},
        "dates":{"checkin":"2025-10-10T15:00:00Z","checkout":"2025-10-15T12:00:00Z"},
        "guests":{"adults":2,"children":2},
        "pricing":{"currency":"EUR","total":27000,"breakdown":{"per_night":5400,"nights":5}}
      },
      "source":"Expedia.com",
      "received_at":"2025-10-01T15:00:00Z"
    }'::jsonb
);

-- =========== СОЗДАНИЕ ПРЕДЛОЖЕНИЙ НА ОСНОВЕ БРОНИРОВАНИЙ ===========

INSERT INTO assignments (
    ota_sg_reservation_id,
    pricing,
    guests,
    checkin_date,
    checkout_date,
    listing_id,
    purpose,
    expires_at,
    status_id
)
SELECT
    r.id AS ota_sg_reservation_id,
    r.pricing,
    r.source_msg -> 'reservation' -> 'guests' AS guests,
    (r.source_msg -> 'reservation' -> 'dates' ->> 'checkin')::timestamp AS checkin_date,
    (r.source_msg -> 'reservation' -> 'dates' ->> 'checkout')::timestamp AS checkout_date,
    r.listing_id,
    'Проверка объекта по бронированию от OTA' AS purpose,
    ((r.source_msg -> 'reservation' -> 'dates' ->> 'checkin')::timestamp + interval '1 day') AS expires_at,
    (SELECT id FROM assignment_statuses WHERE slug = 'offered')
FROM ota_sg_reservations r
WHERE r.booking_number IN ('TG-20251001-A001','TG-20251001-A002','TG-20251001-A003','TG-20251001-A004')
ON CONFLICT (ota_sg_reservation_id) DO NOTHING;
