<section class="section container products" id="products" aria-labelledby="products-title">
    <div class="section-heading"><div><span class="eyebrow">Проверенные решения</span><h2 id="products-title">Комфорт начинается <span class="gradient-text">с выбора</span></h2></div><a class="text-link" href="<?= original('/catalog/konditsionirovanie/bitovie_konditsioneri/') ?>">Все кондиционеры <?= icon('arrow') ?></a></div>
    <p class="section-intro">Модели из нашего каталога. Поможем сравнить и выбрать подходящую.</p>
    <div class="product-grid">
    <?php foreach ($products as $i => $product): ?>
        <article class="product-card">
            <div class="product-image"><span class="product-tag"><?= str_contains(strtolower($product['name']), 'inverter') ? 'Инвертор' : 'Сплит-система' ?></span><a href="<?= e(original($product['url'])) ?>" tabindex="-1" aria-hidden="true"><img src="/assets/product-<?= $i + 1 ?>.webp" width="400" height="260" alt="" loading="lazy"></a></div>
            <div class="product-info"><span class="product-brand">AXIOMA</span><h3><a href="<?= e(original($product['url'])) ?>"><?= e($product['name']) ?></a></h3><p class="product-model"><?= e($product['model']) ?></p><div class="product-features"><span><?= icon('snow') ?> Охлаждение</span><span><?= icon('home') ?> Для дома и офиса</span></div><div class="product-bottom"><div><strong class="product-price"><?= $product['price'] === 'Под заказ' ? 'Уточнить цену' : e(str_replace(['&nbsp;', ' р.'], [' ', ' ₽'], $product['price'])) ?></strong><small>Стоимость и наличие уточняйте</small></div><a class="product-button" href="<?= e(original($product['url'])) ?>" aria-label="Подробнее: <?= e($product['name']) ?>"><?= icon('arrow') ?></a></div></div>
        </article>
    <?php endforeach; ?>
    </div>
</section>
