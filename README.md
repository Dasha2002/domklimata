# Дом Климата — главная страница

Локальная адаптивная вёрстка на PHP 8.0+, без сборки и зависимостей.

## Запуск

Из корня проекта: `php -S 127.0.0.1:8080 -t .`

Открыть http://127.0.0.1:8080/. PHP-файлам нужен сервер.

## Структура

- `index.php` — метаданные и подключения `include __DIR__ . '/includes/имя/имя.php';`.
- `css/style.css` — общие переменные, типографика, формы и кнопки.
- `css/index-page.css` — импорты CSS всех секций главной.
- `includes/<секция>/<секция>.php` и одноимённый CSS — независимые блоки.
- `includes/home-data.php` — категории, FAQ, преимущества, SVG-иконки.
- `assets/products.json`, `assets/articles.json` — снимок данных старого сайта.
- `js/script.js` — мобильное меню, поиск, диалоги и подготовка письма.

## Поведение

Главная готова как вёрстка. Ссылки каталога, товаров, услуг и статей ведут на существующий domklimata59.ru. Поиск охватывает категории и товары с главной. Выбор площади даёт предварительный ориентир и переносит задачу в форму; это не фильтр всего каталога. Расчёт монтажа собирает параметры для специалиста, стоимость не выдумывается.

Форма валидирует данные и готовит mailto-письмо. Ничего не отправляется автоматически. Для серверной отправки потребуется обработчик/SMTP или подключение к CMS.

Отзывы: сохранены площадки и оценки со старой главной. Тексты отзывов и авторы не выдумывались. Работы и статьи взяты из опубликованного блога.

## Источники и иллюстрация

ТЗ: https://docs.google.com/document/d/1GR_oCa6usmh49gdwXSqixzKis-x33wf4sdqz1Bi33xo/edit

Контакты, условия, преимущества, товары, фотографии и логотипы: https://domklimata59.ru/ и его каталог/блог. Числа и рейтинги перенесены как снимок исходного сайта, без живой выгрузки.

Интерьер первого экрана создан встроенным ImageGen: `assets/hero-interior.png`; оптимизированные варианты — `hero-interior.webp` и `hero-interior-mobile.webp`. Это иллюстрация, не фотография выполненного объекта.

Промпт: Photorealistic wide landscape photograph for an air conditioning company website hero, no text, no logos, no UI. Airy contemporary apartment living room, floor-to-ceiling windows overlooking a green city and river, pale gray sofa, teal cushion, light oak side table, green plant, sheer curtains. White wall-mounted air conditioner on upper right wall. Soft cool-white morning light. Right two-thirds occupied by scene; left third bright and empty for headline. 16:9. No people, airflow streaks or typography.
