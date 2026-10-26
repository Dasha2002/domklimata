/**
 * Сборка страницы из HTML-секций.
 *
 * В странице секция объявляется плейсхолдером:
 *   <div data-include="sections/hero/hero.html"></div>
 *
 * Скрипт подгружает файл и заменяет плейсхолдер его разметкой.
 *
 * Внутри секций пути пишутся через {{root}}: {{root}}img/logo.webp.
 * Вместо него подставляется data-root у <body>: "" на главной,
 * "../" на странице уровнем глубже. Одна и та же секция работает
 * на любой глубине вложенности.
 *
 * Работает только по http(s): открывайте проект через Live Server.
 * При открытии файла напрямую (file://) браузер блокирует fetch.
 *
 * После вставки всех секций на document бросается событие
 * "sections:loaded". На него вешается инициализация скриптов.
 *
 * Во фрагментах секций не должно быть </svg> и </body>: Live Server
 * вставляет перед ними скрипт автообновления, а длину ответа считает
 * на одну вставку, и конец секции обрезается. Иконки поэтому
 * подключаются через CSS (span.icon), а не инлайновым <svg>.
 */
(function () {
  'use strict';

  function renderError(el, url, error) {
    console.error('[include] Не удалось загрузить ' + url, error);
    el.outerHTML =
      '<div style="padding:24px;margin:8px 20px;border:2px dashed #d23c00;' +
      'border-radius:12px;color:#d23c00;font:14px/1.4 monospace">' +
      'Секция не загружена: ' + url + '<br>' + error.message +
      '</div>';
  }

  function loadSection(el) {
    var url = el.getAttribute('data-include');

    return fetch(url, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(response.status + ' ' + response.statusText);
        }
        return response.text();
      })
      .then(function (html) {
        var root = document.body.getAttribute('data-root') || '';
        var template = document.createElement('template');
        template.innerHTML = html.trim().split('{{root}}').join(root);
        el.replaceWith(template.content);
      })
      .catch(function (error) {
        renderError(el, url, error);
      });
  }

  function scrollToHash() {
    if (!window.location.hash) return;

    var target = document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView();
  }

  function init() {
    var placeholders = Array.prototype.slice.call(
      document.querySelectorAll('[data-include]')
    );

    // Грузим параллельно, порядок на странице задаёт разметка.
    Promise.all(placeholders.map(loadSection)).then(function () {
      document.body.classList.add('is-loaded');
      document.dispatchEvent(new CustomEvent('sections:loaded'));
      scrollToHash();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
