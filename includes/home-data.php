<?php
// Данные главной страницы. Источник: domklimata59.ru.
function e(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
function original(string $path): string { return 'https://domklimata59.ru' . $path; }
function icon(string $name, string $class = ''): string {
    $paths = [
        'arrow' => '<path d="M5 12h14m-6-6 6 6-6 6"/>',
        'diagonal' => '<path d="M6 18 18 6M6 6h12v12"/>',
        'chevron' => '<path d="m6 9 6 6 6-6"/>',
        'search' => '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
        'phone' => '<path d="m7 3 3 5-2 2c1.5 3 3 4.5 6 6l2-2 5 3c-1 5-5 5-9 2C6 15 1 8 4 4Z"/>',
        'pin' => '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
        'grid' => '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
        'shield' => '<path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7Z"/><path d="m8 12 3 3 5-6"/>',
        'tool' => '<path d="m14 6 4 4 4-4a7 7 0 0 1-9 9l-6 6a3 3 0 0 1-4-4l6-6a7 7 0 0 1 9-9Z"/>',
        'users' => '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4c3 0 4 2 4 4v3"/>',
        'truck' => '<path d="M2 5h12v12H2Zm12 5h4l4 4v3h-8"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
        'snow' => '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M3 10l4-1-1-4M21 14l-4 1 1 4M3 14l4 1-1 4M21 10l-4-1 1-4"/>',
        'home' => '<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3Z"/>',
        'leaf' => '<path d="M20 3C7 1 1 9 6 16s16 1 14-13ZM4 21 16 8"/>',
        'wind' => '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3"/>',
        'mail' => '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/>',
        'check' => '<path d="m5 12 4 4L19 6"/>',
        'close' => '<path d="m6 6 12 12M6 18 18 6"/>',
        'menu' => '<path d="M4 6h16M4 12h16M4 18h16"/>',
        'calc' => '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h1m3 0h1m3 0h.1M8 14h1m3 0h1m3 0h.1M8 18h1m3 0h1m3 0h.1"/>',
    ];
    return '<svg class="icon ' . e($class) . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . ($paths[$name] ?? $paths['arrow']) . '</svg>';
}
$categories = [
    ['Бытовые кондиционеры', 'Для квартир, домов и небольших офисов', 'category-home', '/catalog/konditsionirovanie/bitovie_konditsioneri/'],
    ['Мультисплит-системы', 'Один наружный блок — несколько комнат', 'category-multi', '/catalog/konditsionirovanie/multisplit_sistemi/'],
    ['Полупромышленные', 'Для бизнеса и просторных помещений', 'category-commercial', '/catalog/konditsionirovanie/polupromishlennie_konditsioneri/'],
    ['Вентиляция', 'Свежий воздух и здоровый микроклимат', 'category-ventilation', '/catalog/ventilyatsiya/'],
    ['Отопление', 'Комфортное тепло в любое время года', 'category-heating', '/catalog/otoplenie/'],
];
$products = json_decode(file_get_contents(__DIR__ . '/../assets/products.json'), true, 512, JSON_THROW_ON_ERROR);
$articles = json_decode(file_get_contents(__DIR__ . '/../assets/articles.json'), true, 512, JSON_THROW_ON_ERROR);
$advantages = [
    ['shield', 'До 5 лет', 'гарантии на оборудование'],
    ['tool', '12+ лет', 'опыта в климатической технике'],
    ['users', '10 000+', 'довольных клиентов'],
    ['truck', 'Доставка', 'по Перми от 20 000 ₽ бесплатно'],
];
$faqs = [
    ['Что входит в стандартный монтаж сплит-системы?', '<p>Монтаж наружного и внутреннего блоков, одно отверстие под коммуникации диаметром до 4 см, подключение питания до 3 м, прокладка фреоновой трассы до 3 м, дренажа и межблочного кабеля до 4 м. После установки — пусконаладка и демонстрация функций.</p><p>Включены медные трубы и изоляция, межблочный кабель, дренажный шланг, кронштейн, кабель-каналы, сетевая вилка и крепёж. Дополнительные работы согласовываем отдельно.</p>'],
    ['Есть ли доставка кондиционеров?', '<p>Да, доставляем кондиционеры по Перми. При заказе от 20 000 ₽ доставка в черте города бесплатная. При заказе до 20 000 ₽ стоимость доставки — 1 000 ₽.</p>'],
    ['Какая гарантия на оборудование?', '<p>Предоставляем до 5 лет гарантии на оборудование. Срок зависит от производителя и модели. У нас есть собственный сервисный центр: выполняем обслуживание и ремонт климатической техники.</p>'],
    ['Как можно оплатить покупку?', '<p>Онлайн картой или через СБП, картой или наличными в офисе, а также по расчётному счёту. Доступны «Долями» и рассрочка от Т-Банка. Условия уточняйте у менеджера.</p>'],
    ['Выполняете ли монтаж под ключ?', '<p>Да. Рассчитываем, проектируем и устанавливаем климатическое оборудование с гарантией на монтаж. Заранее согласовываем расположение блоков и коммуникаций, бережно относимся к вашему ремонту.</p>'],
];
