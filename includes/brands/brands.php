<section class="container brands" aria-labelledby="brands-title"><div class="brands-heading"><span class="eyebrow">Качество, которому доверяем</span><h2 id="brands-title">Официальные представители брендов</h2></div><div class="brands-grid">
<?php foreach (['daikin' => 'Daikin', 'midea' => 'Midea', 'daichi' => 'Daichi', 'axioma' => 'Axioma', 'lessar' => 'Lessar', 'kentatsu' => 'Kentatsu', 'haier' => 'Haier', 'royalclima' => 'Royal Clima'] as $file => $name): ?>
    <a href="<?= original('/catalog/') ?>" aria-label="<?= e($name) ?> — перейти в каталог"><img src="/assets/<?= $file ?>.webp" width="160" height="64" alt="<?= e($name) ?>" loading="lazy"></a>
<?php endforeach; ?></div></section>
