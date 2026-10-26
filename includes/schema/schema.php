<?php
$business = ['@context' => 'https://schema.org', '@type' => 'HVACBusiness', 'name' => 'Дом Климата', 'url' => 'https://domklimata59.ru/', 'telephone' => '+73422717711', 'email' => 'info@domklimata59.ru', 'address' => ['@type' => 'PostalAddress', 'addressLocality' => 'Пермь', 'streetAddress' => 'ул. Трамвайная, 27, офис №4', 'addressCountry' => 'RU'], 'openingHours' => 'Mo-Fr 09:00-18:00', 'sameAs' => ['https://vk.com/domklimata59', 'https://t.me/klimat59']];
$faqSchema = ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => array_map(fn($item) => ['@type' => 'Question', 'name' => $item[0], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => trim(strip_tags(str_replace('</p>', '</p> ', $item[1])))]], $faqs)];
?>
<script type="application/ld+json"><?= json_encode($business, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
<script type="application/ld+json"><?= json_encode($faqSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
