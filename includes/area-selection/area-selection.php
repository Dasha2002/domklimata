<section class="container area-selection" aria-labelledby="area-title">
    <div class="area-heading"><span class="icon-disc teal"><?= icon('home') ?></span><div><h2 id="area-title">Начнём с площади</h2><p>Какую комнату нужно сделать комфортнее?</p></div></div>
    <div class="area-options" role="group" aria-label="Площадь помещения"><?php foreach ([['20', 'до 20', 'Спальня, кабинет'], ['25', '20–25', 'Детская, гостиная'], ['35', '25–35', 'Квартира, студия'], ['50', '35–50', 'Дом, офис'], ['70', '50–70', 'Магазин, зал'], ['100', '70+', 'Большие объекты']] as [$value, $label, $note]): ?><button type="button" class="area-option" data-area="<?= $value ?>" aria-pressed="false"><strong><?= $label ?> <span>м²</span></strong><small><?= $note ?></small></button><?php endforeach; ?></div>
    <div class="area-result" id="area-result" hidden aria-live="polite"><p></p><button class="text-link" type="button" data-request-area>Получить точный подбор <?= icon('arrow') ?></button></div>
</section>
