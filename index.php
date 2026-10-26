<?php
require_once __DIR__ . '/includes/home-data.php';
$pageTitle = 'Кондиционеры и климатическое оборудование в Перми — Дом Климата';
$pageDescription = 'Продажа, подбор, монтаж и обслуживание кондиционеров в Перми. Более 12 лет опыта, гарантия на оборудование до 5 лет. Дом Климата: +7 342 271 77 11.';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#f2f8fc">
    <title><?= e($pageTitle) ?></title>
    <meta name="description" content="<?= e($pageDescription) ?>">
    <link rel="canonical" href="https://domklimata59.ru/">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/index-page.css">
    <link rel="preload" as="image" href="/assets/hero-interior.webp" fetchpriority="high" media="(min-width: 601px)">
    <link rel="preload" as="image" href="/assets/hero-interior-mobile.webp" fetchpriority="high" media="(max-width: 600px)">
    <script src="/js/script.js" defer></script>
</head>
<body>
    <a class="skip-link" href="#main">Перейти к содержимому</a>
    <?php include __DIR__ . '/includes/header/header.php'; ?>
    <main id="main">
        <?php include __DIR__ . '/includes/hero/hero.php'; ?>
        <?php include __DIR__ . '/includes/advantages/advantages.php'; ?>
        <?php include __DIR__ . '/includes/categories/categories.php'; ?>
        <?php include __DIR__ . '/includes/area-selection/area-selection.php'; ?>
        <?php include __DIR__ . '/includes/popular-products/popular-products.php'; ?>
        <?php include __DIR__ . '/includes/climate-services/climate-services.php'; ?>
        <?php include __DIR__ . '/includes/about-section/about-section.php'; ?>
        <?php include __DIR__ . '/includes/brands/brands.php'; ?>
        <?php include __DIR__ . '/includes/projects/projects.php'; ?>
        <?php include __DIR__ . '/includes/reviews/reviews.php'; ?>
        <?php include __DIR__ . '/includes/news/news.php'; ?>
        <?php include __DIR__ . '/includes/faq/faq.php'; ?>
        <?php include __DIR__ . '/includes/contacts-section/contacts-section.php'; ?>
    </main>
    <?php include __DIR__ . '/includes/footer/footer.php'; ?>
    <?php include __DIR__ . '/includes/search-modal/search-modal.php'; ?>
    <?php include __DIR__ . '/includes/calculator/calculator.php'; ?>
    <?php include __DIR__ . '/includes/schema/schema.php'; ?>
</body>
</html>
