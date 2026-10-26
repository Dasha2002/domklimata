<section class="container advantages" aria-label="Преимущества компании">
<?php foreach ($advantages as [$symbol, $number, $title]): ?>
    <a class="advantage" href="<?= $symbol === 'truck' ? '#faq' : '#about' ?>"><span class="icon-disc <?= $symbol !== 'truck' ? 'teal' : '' ?>"><?= icon($symbol) ?></span><span><strong><?= e($number) ?></strong><small><?= e($title) ?></small></span><?= icon('diagonal', 'advantage-arrow') ?></a>
<?php endforeach; ?>
</section>
