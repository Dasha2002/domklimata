/**
 * Общие скрипты сайта.
 * Секции вставляются асинхронно (include-sections.js), поэтому
 * инициализация запускается после события "sections:loaded".
 */
document.documentElement.classList.add('js');

document.addEventListener('sections:loaded', function () {
  initMobileMenu();
  initCatalogMenu();
  initSearchSuggest();
  initSelection();
  initRequestModal();
  initPhoneMask();
  initRequestForms();
  initMarquee();
  initReveal();
  initCookie();
});

var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ==========================================================================
   Шапка
   ========================================================================== */

/**
 * Мобильное меню: бургер раскрывает панель, id которой в aria-controls.
 * Закрывается по ссылке, Esc и при расширении окна до десктопа.
 */
function initMobileMenu() {
  var burger = document.querySelector('.header__burger');
  if (!burger) return;

  var menu = document.getElementById(burger.getAttribute('aria-controls'));
  if (!menu) return;

  function setOpen(isOpen) {
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !isOpen;
    document.body.classList.toggle('is-locked', isOpen);
  }

  burger.addEventListener('click', function () {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', function (event) {
    if (event.target.closest('a, [data-open-request]')) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      burger.focus();
    }
  });

  window.matchMedia('(min-width: 1025px)').addEventListener('change', function (event) {
    if (event.matches) setOpen(false);
  });
}

/**
 * Выпадающий каталог на десктопе.
 */
function initCatalogMenu() {
  var button = document.querySelector('.header__catalog');
  if (!button) return;

  var menu = document.getElementById(button.getAttribute('aria-controls'));
  if (!menu) return;

  function setOpen(isOpen) {
    button.setAttribute('aria-expanded', String(isOpen));
    menu.hidden = !isOpen;
  }

  button.addEventListener('click', function () {
    setOpen(menu.hidden);
  });

  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', function (event) {
    if (!menu.hidden && !menu.contains(event.target) && !button.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      button.focus();
    }
  });
}

/**
 * Подсказки поиска: фильтр по готовому списку ссылок в шапке.
 * Совпадение ищется в тексте ссылки и в data-keywords.
 * Enter без выбора подсказки отправляет обычный поиск (?s=).
 */
function initSearchSuggest() {
  var input = document.getElementById('header-search');
  var panel = document.getElementById('search-suggest');
  if (!input || !panel) return;

  var form = input.closest('form');
  var items = Array.prototype.slice.call(panel.querySelectorAll('li'));
  var empty = panel.querySelector('.search__suggest-empty');
  var title = panel.querySelector('.search__suggest-title');

  function filter() {
    var words = input.value.trim().toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
    var found = 0;

    items.forEach(function (item) {
      var link = item.querySelector('a');
      var text = (link.textContent + ' ' + (link.getAttribute('data-keywords') || '')).toLocaleLowerCase('ru');
      var match = words.every(function (word) { return text.indexOf(word) !== -1; });
      item.hidden = !match;
      if (match) found++;
    });

    title.hidden = found === 0;
    empty.hidden = found !== 0;
  }

  function open() {
    filter();
    panel.hidden = false;
  }

  function close() {
    panel.hidden = true;
  }

  input.addEventListener('focus', open);
  input.addEventListener('input', open);

  input.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown') {
      var first = panel.querySelector('li:not([hidden]) a');
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === 'Escape') {
      close();
    }
  });

  // Стрелками по подсказкам
  panel.addEventListener('keydown', function (event) {
    var links = Array.prototype.slice.call(panel.querySelectorAll('li:not([hidden]) a'));
    var index = links.indexOf(document.activeElement);
    if (index === -1) return;

    if (event.key === 'ArrowDown' && links[index + 1]) {
      event.preventDefault();
      links[index + 1].focus();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      (links[index - 1] || input).focus();
    }
    if (event.key === 'Escape') {
      close();
      input.focus();
    }
  });

  document.addEventListener('click', function (event) {
    if (!form.contains(event.target)) close();
  });

  form.addEventListener('focusout', function (event) {
    if (!form.contains(event.relatedTarget)) close();
  });
}

/* ==========================================================================
   Подбор оборудования
   ========================================================================== */

/**
 * Ориентировочный подбор по площади, типу помещения и числу комнат.
 * 0,1 кВт холода на 1 м² для жилья, 0,12 кВт для офиса и магазина
 * (люди и техника). Типоразмер — ближайшая типовая мощность.
 */
function initSelection() {
  var form = document.getElementById('selection-form');
  if (!form) return;

  var section = form.closest('.selection');
  var root = document.body.getAttribute('data-root') || '';
  var areaInput = form.elements.area;
  var areaValue = document.getElementById('selection-area-value');

  var out = {
    img: section.querySelector('[data-result-img]'),
    type: section.querySelector('[data-result-type]'),
    power: section.querySelector('[data-result-power]'),
    sizeLabel: section.querySelector('[data-result-size-label]'),
    size: section.querySelector('[data-result-size]'),
    note: section.querySelector('[data-result-note]'),
    link: section.querySelector('[data-result-link]'),
    request: section.querySelector('[data-open-request]')
  };

  var PLACES = {
    flat: 'квартира',
    house: 'частный дом',
    office: 'офис',
    shop: 'магазин или кафе'
  };

  var TYPES = {
    split: {
      name: 'Настенная сплит-система',
      img: 'img/categories/home.webp',
      url: 'catalog/konditsionirovanie/bitovie_konditsioneri/',
      note: 'Ориентир для потолков до 2,7 м. Солнечная сторона, техника и люди в помещении повышают нагрузку: это учтёт инженер.'
    },
    multi: {
      name: 'Мультисплит-система',
      img: 'img/categories/multi.webp',
      url: 'catalog/konditsionirovanie/multisplit_sistemi/',
      note: 'Один наружный блок на фасаде и отдельный внутренний блок в каждой комнате. Мощность блоков подбирается по площади комнат.'
    },
    commercial: {
      name: 'Полупромышленный кондиционер',
      img: 'img/categories/commercial.webp',
      url: 'catalog/konditsionirovanie/polupromishlennie_konditsioneri/',
      note: 'Для большой площади подойдёт кассетный, канальный или напольно-потолочный блок. Схему подберёт инженер после замера.'
    }
  };

  // Типовые мощности бытовых сплит-систем: [предел кВт, типоразмер]
  var SIZES = [[2.2, '07'], [2.8, '09'], [3.6, '12'], [5.4, '18'], [7.3, '24']];

  function formatKw(value) {
    return value.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' кВт';
  }

  function sizeFor(power) {
    for (var i = 0; i < SIZES.length; i++) {
      if (power <= SIZES[i][0]) return SIZES[i][1];
    }
    return null;
  }

  function setImage(src) {
    if (out.img.getAttribute('src') === src) return;
    if (reducedMotion.matches) {
      out.img.src = src;
      return;
    }
    out.img.classList.add('is-changing');
    setTimeout(function () {
      out.img.src = src;
      out.img.classList.remove('is-changing');
    }, 200);
  }

  function update() {
    var place = form.elements.place.value;
    var area = Number(areaInput.value);
    var rooms = Number(form.elements.rooms.value);
    var isBusiness = place === 'office' || place === 'shop';
    var power = Math.round(area * (isBusiness ? 0.12 : 0.1) * 10) / 10;

    var typeKey = 'split';
    if (rooms >= 2) typeKey = 'multi';
    if ((isBusiness && area > 70) || (rooms === 1 && !sizeFor(power))) typeKey = 'commercial';
    var type = TYPES[typeKey];

    // Ползунок: значение и заливка трека
    var percent = (area - areaInput.min) / (areaInput.max - areaInput.min) * 100;
    areaInput.style.setProperty('--fill', percent + '%');
    areaValue.textContent = area + ' м²';

    out.type.textContent = type.name;
    out.power.textContent = 'от ' + formatKw(power);
    out.note.textContent = type.note;
    out.link.href = root + type.url;
    setImage(root + type.img);

    if (typeKey === 'split') {
      out.sizeLabel.textContent = 'Типоразмер';
      out.size.textContent = sizeFor(power);
    } else if (typeKey === 'multi') {
      out.sizeLabel.textContent = 'Внутренних блоков';
      out.size.textContent = rooms === 4 ? '4 и больше' : String(rooms);
    } else {
      out.sizeLabel.textContent = 'Типоразмер';
      out.size.textContent = 'по проекту';
    }

    // Итог подбора уходит в комментарий заявки
    out.request.setAttribute('data-request-comment',
      'Подбор: ' + PLACES[place] + ', ' + area + ' м², комнат: ' +
      (rooms === 4 ? '4 и больше' : rooms) + '. Ориентир: ' +
      type.name.toLocaleLowerCase('ru') + ', от ' + formatKw(power) + '.');
  }

  form.addEventListener('input', update);
  form.addEventListener('submit', function (event) { event.preventDefault(); });
  update();
}

/* ==========================================================================
   Заявка
   ========================================================================== */

/**
 * Модалка заявки. Открывается любой кнопкой [data-open-request].
 * Если у кнопки есть data-request-comment, текст попадает в комментарий.
 */
function initRequestModal() {
  var modal = document.getElementById('request-modal');
  if (!modal || typeof modal.showModal !== 'function') return;

  var form = modal.querySelector('[data-request-form]');
  var comment = modal.querySelector('[data-request-comment]');
  var autoComment = '';

  document.addEventListener('click', function (event) {
    var opener = event.target.closest('[data-open-request]');
    if (!opener) return;

    // После успешной отправки форму показываем заново пустой
    if (form.classList.contains('is-sent')) resetRequestForm(form);

    var text = opener.getAttribute('data-request-comment');
    if (text && (!comment.value || comment.value === autoComment)) {
      comment.value = text;
      autoComment = text;
    }

    modal.showModal();
    document.body.classList.add('is-locked');
  });

  modal.querySelector('[data-close-modal]').addEventListener('click', function () {
    modal.close();
  });

  // Клик по подложке. У <dialog> подложка — это сам элемент
  modal.addEventListener('click', function (event) {
    if (event.target === modal) modal.close();
  });

  modal.addEventListener('close', function () {
    document.body.classList.remove('is-locked');
  });
}

/**
 * Маска телефона: +7 (XXX) XXX-XX-XX. Первая 8 заменяется на 7.
 */
function initPhoneMask() {
  document.querySelectorAll('[data-phone]').forEach(function (input) {
    function format() {
      var digits = input.value.replace(/\D/g, '');
      if (!digits) {
        input.value = '';
        return;
      }
      if (digits[0] === '8') digits = '7' + digits.slice(1);
      if (digits[0] !== '7') digits = '7' + digits;
      digits = digits.slice(0, 11);

      var parts = [
        '+7',
        digits.length > 1 ? ' (' + digits.slice(1, 4) : '',
        digits.length >= 4 ? ') ' + digits.slice(4, 7) : '',
        digits.length >= 7 ? '-' + digits.slice(7, 9) : '',
        digits.length >= 9 ? '-' + digits.slice(9, 11) : ''
      ];
      input.value = parts.join('');
    }

    input.addEventListener('input', function (event) {
      // Стирание не трогаем, иначе скобки и дефисы не дают удалить цифру
      if (event.inputType && event.inputType.indexOf('delete') === 0) return;
      format();
    });
    input.addEventListener('blur', format);
  });
}

/**
 * Проверка и отправка форм заявки [data-request-form].
 */
function initRequestForms() {
  document.querySelectorAll('[data-request-form]').forEach(function (form) {
    var submit = form.querySelector('.request-form__submit');
    var submitText = submit.textContent;
    var serverError = form.querySelector('.request-form__error');

    var rules = {
      name: function (input) { return input.value.trim().length >= 2; },
      phone: function (input) { return input.value.replace(/\D/g, '').length === 11; },
      consent: function (input) { return input.checked; }
    };

    function setError(input, isInvalid) {
      var field = input.closest('.field');
      var error = document.getElementById(input.getAttribute('aria-describedby'));
      field.classList.toggle('is-invalid', isInvalid);
      input.setAttribute('aria-invalid', String(isInvalid));
      if (error) error.hidden = !isInvalid;
    }

    function validate() {
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        var isInvalid = !rules[name](input);
        setError(input, isInvalid);
        if (isInvalid && !firstInvalid) firstInvalid = input;
      });
      return firstInvalid;
    }

    // Ошибка поля снимается, как только его исправили
    form.addEventListener('input', function (event) {
      var rule = rules[event.target.name];
      if (rule && event.target.getAttribute('aria-invalid') === 'true' && rule(event.target)) {
        setError(event.target, false);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      serverError.hidden = true;

      var firstInvalid = validate();
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      submit.disabled = true;
      submit.textContent = 'Отправляем…';

      sendRequest(new FormData(form))
        .then(function () {
          form.classList.add('is-sent');
          form.querySelector('.request-form__fields').hidden = true;
          form.querySelector('.request-form__success').hidden = false;
        })
        .catch(function () {
          serverError.hidden = false;
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = submitText;
        });
    });
  });
}

/**
 * Отправка заявки. В вёрстке сервера нет, поэтому сразу «успех».
 * На WordPress здесь запрос к admin-ajax.php или REST-эндпоинту
 * формы (Contact Form 7 и т. п.): вернуть промис, который
 * отклоняется при ошибке, и форма покажет нужное состояние.
 */
function sendRequest(data) {
  return Promise.resolve(data);
}

function resetRequestForm(form) {
  form.reset();
  form.classList.remove('is-sent');
  form.querySelector('.request-form__fields').hidden = false;
  form.querySelector('.request-form__success').hidden = true;
}

/* ==========================================================================
   Оформление
   ========================================================================== */

/**
 * Бегущая лента логотипов: копия списка встаёт следом за оригиналом,
 * анимация сдвигает обе на ширину одной.
 */
function initMarquee() {
  document.querySelectorAll('[data-marquee]').forEach(function (marquee) {
    var track = marquee.firstElementChild;
    var copy = track.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
    marquee.appendChild(copy);
    marquee.classList.add('is-running');
  });
}

/**
 * Появление блоков [data-reveal] при прокрутке.
 */
function initReveal() {
  var items = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (item) { item.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  items.forEach(function (item) { observer.observe(item); });
}

/**
 * Уведомление о cookie. localStorage может быть недоступен
 * (приватный режим), тогда просто показываем каждый раз.
 */
function initCookie() {
  var notice = document.getElementById('cookie-notice');
  if (!notice) return;

  var KEY = 'dk-cookie-accepted';
  var accepted = false;
  try { accepted = localStorage.getItem(KEY) === '1'; } catch (e) { /* нет доступа */ }
  if (accepted) return;

  notice.hidden = false;
  notice.querySelector('[data-cookie-accept]').addEventListener('click', function () {
    try { localStorage.setItem(KEY, '1'); } catch (e) { /* нет доступа */ }
    notice.hidden = true;
  });
}
