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
  initHeroSlider();
  initSmoothDetails();
  initSelection();
  initRequestModal();
  initPhoneMask();
  initRequestForms();
  initMarquee();
  initReveal();
  initCookie();
  initProductCards();
  initCatalog();
  initDetailsAnimation();
  initGallery();
  initProductPage();
  initMiniCart();
  initCart();
});

var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Первый экран: горизонтальная прокрутка, автосмена и свайпы. */
function initHeroSlider() {
  var hero = document.querySelector('.hero');
  if (!hero || hero.dataset.initialized) return;
  hero.dataset.initialized = 'true';
  var slides = Array.from(hero.querySelectorAll('.hero__slide'));
  var track = hero.querySelector('.hero__track');
  var viewport = hero.querySelector('.hero__slides');
  var current = 0;
  var timer;
  var paused = reducedMotion.matches;
  var hovered = false;
  var inView = true;
  var touchStart = null;

  function schedule() {
    window.clearTimeout(timer);
    if (!paused && !hovered && inView && !document.hidden && !hero.querySelector('.hero__content:focus-within')) {
      timer = window.setTimeout(function () { show(current + 1, false); }, 7000);
    }
  }

  function show(index, announce) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;

    });
    track.style.transform = 'translateX(-' + current * 100 + '%)';
    if (announce) hero.querySelector('[data-hero-status]').textContent = slides[current].getAttribute('aria-label');
    schedule();
  }

  function select(index) { show(index, true); }
  hero.querySelector('.hero__arrow--prev').addEventListener('click', function () { select(current - 1); });
  hero.querySelector('.hero__arrow--next').addEventListener('click', function () { select(current + 1); });
  hero.querySelectorAll('.hero__content').forEach(function (content) {
    content.addEventListener('mouseenter', function () { hovered = true; schedule(); });
    content.addEventListener('mouseleave', function () { hovered = false; schedule(); });
  });
  hero.addEventListener('focusin', schedule);
  hero.addEventListener('focusout', function () { window.setTimeout(schedule, 0); });
  hero.addEventListener('keydown', function (event) {
    if (event.target.closest('input, textarea, select')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (viewport.contains(document.activeElement)) hero.querySelector('.hero__arrow--next').focus();
    select(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  viewport.addEventListener('touchstart', function (event) {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    window.clearTimeout(timer);
  }, { passive: true });
  viewport.addEventListener('touchend', function (event) {
    if (!touchStart) return;
    var dx = event.changedTouches[0].clientX - touchStart.x;
    var dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) select(current + (dx < 0 ? 1 : -1));
    else schedule();
    touchStart = null;
  }, { passive: true });
  viewport.addEventListener('touchcancel', function () { touchStart = null; schedule(); }, { passive: true });
  // Горизонтальный жест тачпада: один слайд за жест, без пролистывания инерцией.
  var wheelDistance = 0;
  var wheelLocked = false;
  var wheelEnd;
  viewport.addEventListener('wheel', function (event) {
    if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.2) return;
    event.preventDefault();
    window.clearTimeout(wheelEnd);
    wheelEnd = window.setTimeout(function () { wheelDistance = 0; wheelLocked = false; }, 180);
    if (wheelLocked) return;
    var multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
    wheelDistance += event.deltaX * multiplier;
    if (Math.abs(wheelDistance) >= 40) {
      select(current + (wheelDistance > 0 ? 1 : -1));
      wheelLocked = true;
    }
  }, { passive: false });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', function (event) {
    paused = event.matches; schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; schedule(); }).observe(hero);
  }
  hero.querySelector('.hero__controls').hidden = false;
  schedule();
}

/* Плавное раскрытие с поддержкой быстрых повторных нажатий и групп details. */
function initSmoothDetails() {
  var items = Array.from(document.querySelectorAll('.page-details, .faq__item')).map(function (element) {
    var item = {
      element: element,
      summary: element.querySelector('summary'),
      body: element.querySelector('.page-details__body, .faq__answer'),
      group: element.getAttribute('name'),
      expanded: element.open,
      animation: null
    };
    // JS управляет закрытием, чтобы нативная группа не обрывала анимацию.
    element.removeAttribute('name');
    item.summary.setAttribute('aria-expanded', String(item.expanded));
    return item;
  });

  function expand(item, open) {
    var element = item.element;
    var start = element.getBoundingClientRect().height;
    if (item.animation) {
      item.animation.onfinish = null;
      item.animation.cancel();
    }
    item.expanded = open;
    item.summary.setAttribute('aria-expanded', String(open));
    item.body.inert = !open;
    element.classList.toggle('is-collapsing', !open);
    function finish() {
      element.open = open;
      element.style.height = '';
      element.style.overflow = '';
      element.classList.remove('is-collapsing');
      item.animation = null;
    }
    if (reducedMotion.matches || !element.animate) { finish(); return; }
    element.style.height = start + 'px';
    element.style.overflow = 'hidden';
    element.open = true;
    var style = getComputedStyle(element);
    var border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    var end = item.summary.getBoundingClientRect().height + border;
    if (open) end += item.body.getBoundingClientRect().height;
    item.animation = element.animate([{ height: start + 'px' }, { height: end + 'px' }], {
      duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
    });
    item.animation.onfinish = finish;
  }

  items.forEach(function (item) {
    item.summary.addEventListener('click', function (event) {
      event.preventDefault();
      var open = !item.expanded;
      if (open && item.group) {
        items.forEach(function (other) {
          if (other !== item && other.group === item.group && other.expanded) expand(other, false);
        });
      }
      expand(item, open);
    });
  });
}

/* ==========================================================================
   Анимации раскрытия
   ========================================================================== */

// Короткая, но заметная: 0,3 с, быстрый старт и мягкая остановка
var REVEAL = { duration: 300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' };

function canAnimate(el) {
  return !reducedMotion.matches && typeof el.animate === 'function';
}

/**
 * Плавное раскрытие <details> (FAQ, группы фильтров): высота самого
 * details от закрытой до полной, содержимое проявляется со сдвигом.
 * CSS-переходом это не сделать: высоту details в Safari и Firefox
 * не анимировать.
 *
 * Нативный аккордеон (name="faq") заменяется своим data-group: браузер
 * закрывает соседний ответ мгновенно, а он должен закрыться плавно.
 * Пока идёт закрытие, у details класс is-closing: по нему CSS сразу
 * поворачивает иконку обратно, не дожидаясь конца анимации.
 */
function initDetailsAnimation() {
  document.querySelectorAll('.faq__item, .filters__group, .cart-summary__promo').forEach(function (details) {
    var summary = details.querySelector('summary');
    var content = summary.nextElementSibling;
    var group = details.getAttribute('name');
    var heightAnim = null;
    var contentAnim = null;

    if (group) {
      details.removeAttribute('name');
      details.setAttribute('data-group', group);
    }

    function closedHeight() {
      var style = getComputedStyle(details);
      return summary.offsetHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    }

    function stop() {
      if (heightAnim) heightAnim.cancel();
      if (contentAnim) contentAnim.cancel();
      heightAnim = contentAnim = null;
    }

    function run(from, to, opening) {
      details.style.overflow = 'hidden';
      heightAnim = details.animate({ height: [from + 'px', to + 'px'] }, REVEAL);
      contentAnim = content.animate({
        opacity: opening ? [0, 1] : [1, 0],
        transform: opening ? ['translateY(-8px)', 'none'] : ['none', 'translateY(-8px)']
      }, { duration: REVEAL.duration, easing: REVEAL.easing, fill: 'forwards' });

      heightAnim.onfinish = function () {
        if (!opening) {
          details.open = false;
          details.classList.remove('is-closing');
        }
        details.style.overflow = '';
        stop();
      };
    }

    function open() {
      if (group) {
        document.querySelectorAll('details[data-group="' + group + '"]').forEach(function (other) {
          if (other !== details && other.open && !other.classList.contains('is-closing')) other.closeAnimated();
        });
      }
      // Если панель ещё закрывается, раскрываем с текущей высоты
      var from = details.open ? details.offsetHeight : closedHeight();
      stop();
      details.classList.remove('is-closing');
      details.open = true;
      run(from, details.offsetHeight, true);
    }

    function close() {
      var from = details.offsetHeight;
      stop();
      details.classList.add('is-closing');
      run(from, closedHeight(), false);
    }

    details.closeAnimated = close;

    summary.addEventListener('click', function (event) {
      event.preventDefault();
      var opening = !details.open || details.classList.contains('is-closing');

      if (!canAnimate(details)) {
        if (opening && group) {
          document.querySelectorAll('details[data-group="' + group + '"]').forEach(function (other) {
            other.open = false;
          });
        }
        details.open = opening;
        return;
      }

      if (opening) open();
      else close();
    });
  });
}

/**
 * Плавно показать или скрыть блок с атрибутом hidden (высота и прозрачность).
 * Повторный вызов посреди анимации продолжает с текущей высоты.
 */
function slideToggle(el, show) {
  if (!canAnimate(el)) {
    el.hidden = !show;
    return;
  }

  var from = el.hidden ? 0 : el.offsetHeight;
  if (el.slideAnim) el.slideAnim.cancel();
  el.hidden = false;
  var to = show ? el.offsetHeight : 0;

  el.style.overflow = 'hidden';
  el.slideAnim = el.animate({
    height: [from + 'px', to + 'px'],
    opacity: show ? [0, 1] : [1, 0]
  }, REVEAL);

  el.slideAnim.onfinish = function () {
    el.slideAnim = null;
    el.style.overflow = '';
    if (!show) el.hidden = true;
  };
}

/* ==========================================================================
   Шапка
   ========================================================================== */

/**
 * Бургер раскрывает общую навигацию на всех размерах экрана.
 * Закрывается по ссылке, клику снаружи и Esc.
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
    if (isOpen) {
      var catalog = document.getElementById('catalog-menu');
      var catalogButton = document.querySelector('.header__catalog');
      if (catalog) catalog.hidden = true;
      if (catalogButton) catalogButton.setAttribute('aria-expanded', 'false');
    }
  }

  var header = document.querySelector('.header');
  var navigation = header.querySelector('.header__links');
  var desktop = window.matchMedia('(min-width: 1025px)');
  function updateBurger(isVisible) {
    var show = !desktop.matches || !isVisible;
    header.classList.toggle('is-navigation-hidden', show);
    if (!show && !menu.hidden) setOpen(false);
  }
  if (navigation && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      updateBurger(entries[0].isIntersecting);
    }, { threshold: 0 }).observe(navigation);
    desktop.addEventListener('change', function () {
      var rect = navigation.getBoundingClientRect();
      updateBurger(rect.height > 0 && rect.bottom > 0);
    });
    var rect = navigation.getBoundingClientRect();
    updateBurger(rect.height > 0 && rect.bottom > 0);
  } else header.classList.add('is-navigation-hidden');

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
    if (event.key === 'Tab' && !menu.hidden) {
      var links = Array.from(menu.querySelectorAll('a[href], button'));
      var first = links[0];
      var last = links[links.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === burger)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        burger.focus();
      }
    }
  });

  document.addEventListener('click', function (event) {
    if (!menu.hidden && !menu.contains(event.target) && !burger.contains(event.target)) setOpen(false);
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

  var items = menu.querySelectorAll('.catalog-menu__list > li, .catalog-menu__aside');
  var isOpen = false;
  var animation = null;

  // Панель выезжает сверху, категории проявляются по очереди.
  // Закрытие быстрее открытия: меню не должно мешать
  function setOpen(open) {
    if (open === isOpen) return;
    isOpen = open;
    button.setAttribute('aria-expanded', String(open));

    if (!canAnimate(menu)) {
      menu.hidden = !open;
      return;
    }

    if (animation) animation.cancel();
    menu.hidden = false;
    animation = menu.animate({
      opacity: open ? [0, 1] : [1, 0],
      transform: open ? ['translateY(-12px)', 'none'] : ['none', 'translateY(-8px)']
    }, { duration: open ? 260 : 160, easing: REVEAL.easing });

    if (open) {
      items.forEach(function (item, index) {
        item.animate({ opacity: [0, 1], transform: ['translateY(-6px)', 'none'] },
          { duration: 260, delay: 40 + index * 30, easing: REVEAL.easing, fill: 'backwards' });
      });
    }

    animation.onfinish = function () {
      animation = null;
      if (!isOpen) menu.hidden = true;
    };
  }

  button.addEventListener('click', function () {
    setOpen(!isOpen);
  });

  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', function (event) {
    if (isOpen && !menu.contains(event.target) && !button.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen) {
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
      url: 'catalog/?category=bitovie_konditsioneri',
      note: 'Ориентир для потолков до 2,7 м. Солнечная сторона, техника и люди в помещении повышают нагрузку: это учтёт инженер.'
    },
    multi: {
      name: 'Мультисплит-система',
      img: 'img/categories/multi.webp',
      url: 'catalog/?category=multisplit_sistemi',
      note: 'Один наружный блок на фасаде и отдельный внутренний блок в каждой комнате. Мощность блоков подбирается по площади комнат.'
    },
    commercial: {
      name: 'Полупромышленный кондиционер',
      img: 'img/categories/commercial.webp',
      url: 'catalog/?category=polupromishlennie_konditsioneri',
      note: 'Для большой площади подойдёт кассетный, канальный или напольно-потолочный блок. Схему подберёт инженер после замера.'
    }
  };

  // Типовые мощности бытовых сплит-систем: [предел кВт, типоразмер, площадь
  // модификации в каталоге]. Площадь уходит в ссылку «Смотреть модели»
  var SIZES = [[2.2, '07', 20], [2.8, '09', 25], [3.6, '12', 35], [5.4, '18', 50], [7.3, '24', 70]];

  function formatKw(value) {
    return value.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' кВт';
  }

  function sizeFor(power) {
    for (var i = 0; i < SIZES.length; i++) {
      if (power <= SIZES[i][0]) return SIZES[i];
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
    out.link.href = root + type.url + (typeKey === 'split' ? '&area=' + sizeFor(power)[2] : '');
    setImage(root + type.img);

    if (typeKey === 'split') {
      out.sizeLabel.textContent = 'Типоразмер';
      out.size.textContent = sizeFor(power)[1];
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
    if (form.elements.email) {
      rules.email = function (input) { return input.value.trim().length > 0 && input.validity.valid; };
    }

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

/* ==========================================================================
   Карточки товаров
   ========================================================================== */

var nbsp = ' ';

function formatPrice(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, nbsp) + nbsp + '₽';
}

/**
 * Карточка: выбор площади (модификации) меняет модель, цену, статус
 * и кнопку («В корзину», если цена есть, иначе «Узнать цену»).
 * Плюс избранное и корзина. Данные модификации — в data-атрибутах радио.
 */
function initProductCards() {
  var STATUS = {
    price: { icon: 'truck', text: 'Доставка по Перми' },
    order: { icon: 'clock', text: 'Поставка до 7 дней' },
    request: { icon: 'phone', text: 'Цену уточнит менеджер' }
  };
  var PRICE_TEXT = { order: 'Под заказ', request: 'Цена по запросу' };

  document.querySelectorAll('.product-card').forEach(function (card) {
    var title = card.querySelector('.product-card__title').textContent.trim();
    var model = card.querySelector('[data-card-model]');
    var price = card.querySelector('[data-card-price]');
    var status = card.querySelector('[data-card-status]');
    var cart = card.querySelector('[data-add-cart]');
    var ask = card.querySelector('.product-card__ask');
    var links = card.querySelectorAll('.product-card__media, .product-card__title a, .product-card__more');
    var baseHref = links[0].getAttribute('href');

    function apply(input) {
      var value = input.getAttribute('data-price');
      var state = input.getAttribute('data-status');
      var info = STATUS[state];

      model.textContent = input.getAttribute('data-model');
      price.textContent = value ? formatPrice(value) : PRICE_TEXT[state];
      price.classList.toggle('product-card__price--none', !value);
      status.querySelector('.icon').className = 'icon icon--' + info.icon;
      status.lastElementChild.textContent = info.text;

      cart.hidden = !value;
      ask.hidden = !!value;
      cart.classList.remove('is-added');
      cart.textContent = 'В корзину';
      ask.setAttribute('data-request-comment',
        'Узнать цену: ' + title + ', ' + input.getAttribute('data-model') + ' (' + input.value + ' м²).');

      // Страница товара откроется с этой же площадью (?area=)
      links.forEach(function (link) {
        link.setAttribute('href', baseHref + '?area=' + encodeURIComponent(input.value));
      });
    }

    card.querySelectorAll('.size input').forEach(function (input) {
      input.addEventListener('change', function () { apply(input); });
    });

    // У товаров без модификаций по площади (котлы, аксессуары) радио нет:
    // цена и кнопка уже в разметке, остаётся текст для заявки
    var checked = card.querySelector('.size input:checked');
    if (checked) {
      apply(checked);
    } else {
      ask.setAttribute('data-request-comment', 'Узнать цену: ' + title + ', ' + model.textContent + '.');
    }

    card.querySelector('.product-card__fav').addEventListener('click', function () {
      var isOn = this.getAttribute('aria-pressed') !== 'true';
      this.setAttribute('aria-pressed', String(isOn));
      this.setAttribute('aria-label', (isOn ? 'Убрать из избранного: ' : 'Добавить в избранное: ') + title);
    });

    // Корзина в вёрстке: счётчик в шапке и подтверждение на кнопке.
    // Повторный клик ведёт в корзину.
    // На WordPress: запрос wc-ajax=add_to_cart с id выбранной модификации
    cart.addEventListener('click', function () {
      if (cart.classList.contains('is-added')) {
        window.location.href = document.querySelector('.header__cart').href;
        return;
      }
      cart.classList.add('is-added');
      cart.textContent = 'В корзине';
      updateCartCount(1);
    });
  });
}

function updateCartCount(delta) {
  var badge = document.querySelector('[data-cart-count]');
  if (!badge) return;
  var count = Number(badge.textContent) + delta;
  badge.textContent = count;
  badge.hidden = count <= 0;
  badge.closest('a').setAttribute('aria-label', 'Корзина, товаров: ' + count);
}


/* ==========================================================================
   Каталог: категория, фильтры, сортировка и вид
   ========================================================================== */

/**
 * Состояние каталога живёт в адресе (search params), имена — как у полей
 * формы #catalog-filter-form:
 *   ?category=bitovie_konditsioneri&brand=Axioma&brand=Bosch&area=35
 *    &inverter=yes&stock=price&price_from=20000&price_to=60000&sort=price-asc
 * Значения внутри группы объединяются через «или», группы — через «и».
 *
 * Фильтры обновляют адрес через replaceState (история не засоряется),
 * смена категории — через pushState, чтобы «Назад» возвращал к прошлой.
 * На WordPress те же параметры читает сервер; без скрипта форма уходит
 * обычным GET, ссылки категорий — обычные ссылки с ?category=.
 */
function initCatalog() {
  var form = document.getElementById('catalog-filter-form');
  var grid = document.querySelector('[data-product-grid]');
  if (!form || !grid) return;

  var FILTERS = ['brand', 'area', 'inverter', 'stock'];
  var GROUP_LABEL = { brand: '', area: 'Площадь', inverter: 'Инвертор', stock: '' };

  var panel = document.getElementById('catalog-filters');
  var cards = Array.prototype.slice.call(grid.children);
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.cat-nav__link'));
  var categoryInput = form.elements.category;
  var sortSelect = document.querySelector('[data-catalog-sort]');
  var empty = document.querySelector('[data-catalog-empty]');
  var pagination = document.querySelector('.pagination');
  var activeBox = document.querySelector('[data-active-filters]');
  var activeList = document.querySelector('[data-active-list]');
  var activeCount = document.querySelector('[data-active-count]');
  var openButton = document.querySelector('[data-filters-open]');
  var titleEl = document.querySelector('[data-catalog-title]');
  var textEl = document.querySelector('[data-catalog-text]');
  var crumbs = document.querySelector('[data-catalog-breadcrumbs]');
  var priceMin = form.querySelector('[data-price-min]');
  var priceMax = form.querySelector('[data-price-max]');
  var baseTitle = document.title;
  var catalogHref = navLinks[0].getAttribute('href');

  cards.forEach(function (card, index) { card.setAttribute('data-index', index); });

  function plural(n, one, few, many) {
    var mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function list(value) {
    return value ? value.split(' ') : [];
  }

  function cardPrices(card) {
    return list(card.getAttribute('data-prices')).map(Number);
  }

  function cardValues(card, name) {
    if (name === 'area') return list(card.getAttribute('data-areas'));
    if (name === 'stock') return [cardPrices(card).length ? 'price' : 'order'];
    return list(card.getAttribute('data-' + name));
  }

  /* --- Состояние формы --------------------------------------------------- */

  function readState() {
    var groups = {};
    FILTERS.forEach(function (name) {
      groups[name] = Array.prototype.filter.call(form.querySelectorAll('input[name="' + name + '"]'), function (input) {
        return input.checked;
      }).map(function (input) { return input.value; });
    });
    return {
      category: categoryInput.value,
      groups: groups,
      priceFrom: Number(form.elements.price_from.value) || 0,
      priceTo: Number(form.elements.price_to.value) || 0
    };
  }

  // except — группа, которую не учитываем: для счётчиков внутри неё
  function matches(card, state, except) {
    if (state.category && card.getAttribute('data-category') !== state.category) return false;

    var ok = FILTERS.every(function (name) {
      var selected = state.groups[name];
      if (name === except || !selected.length) return true;
      return cardValues(card, name).some(function (v) { return selected.indexOf(v) !== -1; });
    });
    if (!ok) return false;

    if (state.priceFrom || state.priceTo) {
      return cardPrices(card).some(function (p) {
        return (!state.priceFrom || p >= state.priceFrom) && (!state.priceTo || p <= state.priceTo);
      });
    }
    return true;
  }

  /* --- Адрес ------------------------------------------------------------- */

  function categoryLink(category) {
    return navLinks.filter(function (link) {
      return link.getAttribute('data-category') === category;
    })[0];
  }

  // Адрес → форма. Неизвестные значения просто не находят своё поле
  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get('category') || '';
    form.reset();
    categoryInput.value = categoryLink(category) ? category : '';

    FILTERS.forEach(function (name) {
      var values = params.getAll(name);
      form.querySelectorAll('input[name="' + name + '"]').forEach(function (input) {
        input.checked = values.indexOf(input.value) !== -1;
      });
    });
    form.elements.price_from.value = params.get('price_from') || '';
    form.elements.price_to.value = params.get('price_to') || '';

    var sort = params.get('sort');
    sortSelect.value = sortSelect.querySelector('option[value="' + sort + '"]') ? sort : 'default';
  }

  // Форма → адрес. Пустые поля и сортировка по умолчанию в адрес не попадают
  function writeUrl(push) {
    var params = new URLSearchParams();
    if (categoryInput.value) params.set('category', categoryInput.value);
    FILTERS.forEach(function (name) {
      form.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (input) {
        params.append(name, input.value);
      });
    });
    ['price_from', 'price_to'].forEach(function (name) {
      if (form.elements[name].value) params.set(name, form.elements[name].value);
    });
    if (sortSelect.value !== 'default') params.set('sort', sortSelect.value);

    var query = params.toString();
    var url = window.location.pathname + (query ? '?' + query : '');
    if (url === window.location.pathname + window.location.search) return;
    history[push ? 'pushState' : 'replaceState'](null, '', url);
  }

  /* --- Отрисовка --------------------------------------------------------- */

  // Заголовок, описание, крошки и активная ссылка для текущей категории
  function renderCategory() {
    var category = categoryInput.value;
    var link = categoryLink(category) || navLinks[0];

    navLinks.forEach(function (item) {
      if (item === link) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });

    // На телефоне категории — горизонтальная лента: подкручиваем её
    // к активной ссылке (scrollLeft, чтобы не двигать саму страницу)
    var nav = link.closest('.cat-nav');
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = link.parentNode.offsetLeft - nav.offsetLeft - 16;
    }

    titleEl.textContent = link.getAttribute('data-title');
    textEl.textContent = link.getAttribute('data-text');
    document.title = category ? link.getAttribute('data-title') + ' в Перми | Дом Климата' : baseTitle;

    // Крошки: «Каталог» становится ссылкой, последней идёт категория
    var items = crumbs.querySelectorAll('.breadcrumbs__item');
    for (var i = items.length - 1; i > 0; i--) crumbs.removeChild(items[i]);

    var catalogItem = document.createElement('li');
    catalogItem.className = 'breadcrumbs__item';
    if (category) {
      var catalogLink = document.createElement('a');
      catalogLink.href = catalogHref;
      catalogLink.textContent = 'Каталог';
      catalogItem.appendChild(catalogLink);

      var current = document.createElement('li');
      current.className = 'breadcrumbs__item';
      current.setAttribute('aria-current', 'page');
      current.textContent = link.textContent.trim();
      crumbs.appendChild(catalogItem);
      crumbs.appendChild(current);
    } else {
      catalogItem.setAttribute('aria-current', 'page');
      catalogItem.textContent = 'Каталог';
      crumbs.appendChild(catalogItem);
    }
  }

  // Сколько товаров даст каждое значение при остальных фильтрах
  function renderCounts(state) {
    form.querySelectorAll('.check').forEach(function (label) {
      var input = label.querySelector('input');
      var count = cards.filter(function (card) {
        return matches(card, state, input.name) && cardValues(card, input.name).indexOf(input.value) !== -1;
      }).length;
      label.querySelector('[data-filter-count]').textContent = count;
      label.classList.toggle('is-empty', count === 0 && !input.checked);
      input.disabled = count === 0 && !input.checked;
    });

    // Подсказка в полях цены: диапазон товаров текущей категории
    var prices = [];
    cards.forEach(function (card) {
      if (!state.category || card.getAttribute('data-category') === state.category) {
        prices = prices.concat(cardPrices(card));
      }
    });
    priceMin.placeholder = prices.length ? formatPrice(Math.min.apply(null, prices)).replace(/\s?₽$/, '') : '0';
    priceMax.placeholder = prices.length ? formatPrice(Math.max.apply(null, prices)).replace(/\s?₽$/, '') : '0';
  }

  function renderActive(state) {
    var chips = [];

    FILTERS.forEach(function (name) {
      form.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (input) {
        var label = input.parentNode.querySelector('span').textContent;
        if (name === 'area') label += ' м²';
        chips.push({
          text: GROUP_LABEL[name] ? GROUP_LABEL[name] + ': ' + label : label,
          clear: function () { input.checked = false; }
        });
      });
    });

    if (state.priceFrom || state.priceTo) {
      chips.push({
        text: 'Цена: ' + [
          state.priceFrom ? 'от ' + formatPrice(state.priceFrom) : '',
          state.priceTo ? 'до ' + formatPrice(state.priceTo) : ''
        ].filter(Boolean).join(' '),
        clear: function () {
          form.elements.price_from.value = '';
          form.elements.price_to.value = '';
        }
      });
    }

    activeList.innerHTML = '';
    chips.forEach(function (item) {
      var li = document.createElement('li');
      var button = document.createElement('button');
      var text = document.createElement('span');
      var icon = document.createElement('span');
      button.type = 'button';
      button.className = 'cat-active__chip';
      button.setAttribute('aria-label', 'Убрать фильтр: ' + item.text);
      text.textContent = item.text;
      icon.className = 'icon icon--x';
      icon.setAttribute('aria-hidden', 'true');
      button.appendChild(text);
      button.appendChild(icon);
      button.addEventListener('click', function () {
        item.clear();
        update();
        writeUrl(false);
      });
      li.appendChild(button);
      activeList.appendChild(li);
    });

    activeBox.hidden = chips.length === 0;
    activeCount.hidden = chips.length === 0;
    activeCount.textContent = chips.length;
    return chips.length;
  }

  // Если выбрана площадь, карточка сразу показывает подходящую модификацию
  function selectArea(card, areas) {
    if (!areas.length) return;
    var current = card.querySelector('.size input:checked');
    if (current && areas.indexOf(current.value) !== -1) return;
    var input = Array.prototype.filter.call(card.querySelectorAll('.size input'), function (i) {
      return areas.indexOf(i.value) !== -1;
    })[0];
    if (input) {
      input.checked = true;
      input.dispatchEvent(new Event('change'));
    }
  }

  // Модификация из разметки: фильтр по площади мог переключить карточку
  function restoreCards() {
    cards.forEach(function (card) {
      var initial = Array.prototype.filter.call(card.querySelectorAll('.size input'), function (input) {
        return input.defaultChecked;
      })[0];
      if (initial && !initial.checked) {
        initial.checked = true;
        initial.dispatchEvent(new Event('change'));
      }
    });
  }

  // Сортировка: перестановка карточек. Товары без цены — в конце
  function sortCards() {
    var mode = sortSelect.value;
    var sorted = cards.slice().sort(function (a, b) {
      var byIndex = a.getAttribute('data-index') - b.getAttribute('data-index');
      if (mode === 'default') return byIndex;
      var pa = cardPrices(a)[0] || 0;
      var pb = cardPrices(b)[0] || 0;
      if (!pa || !pb) return (!pa - !pb) || byIndex;
      return mode === 'price-asc' ? pa - pb : pb - pa;
    });
    sorted.forEach(function (card) { grid.appendChild(card); });
  }

  function update() {
    var state = readState();
    var found = 0;

    cards.forEach(function (card) {
      var show = matches(card, state);
      card.hidden = !show;
      if (show) {
        found++;
        selectArea(card, state.groups.area);
      }
    });

    var text = found + ' ' + plural(found, 'товар', 'товара', 'товаров');
    document.querySelectorAll('[data-found-text]').forEach(function (el) { el.textContent = text; });
    empty.hidden = found !== 0;
    grid.hidden = found === 0;

    renderCounts(state);
    var activeTotal = renderActive(state);

    // Пагинация в вёрстке относится к полному списку без фильтров
    pagination.hidden = Boolean(state.category) || activeTotal > 0 || found === 0;
  }

  // Полная перерисовка из адреса: при загрузке и по «Назад» / «Вперёд»
  function fromUrl() {
    readUrl();
    restoreCards();
    renderCategory();
    sortCards();
    update();
  }

  /* --- События ----------------------------------------------------------- */

  form.addEventListener('change', function (event) {
    if (event.target === sortSelect) return;
    update();
    writeUrl(false);
  });
  form.addEventListener('input', function (event) {
    if (event.target.type !== 'number') return;
    update();
    writeUrl(false);
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    update();
    writeUrl(false);
  });

  sortSelect.addEventListener('change', function () {
    sortCards();
    writeUrl(false);
  });

  // Категория: без перезагрузки, фильтры прошлой категории сбрасываются,
  // сортировка остаётся. Клик с Ctrl/Cmd открывает ссылку как обычно
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      var category = link.getAttribute('data-category');
      if (category === categoryInput.value) return;

      var sort = sortSelect.value;
      form.reset();
      sortSelect.value = sort;
      categoryInput.value = category;
      restoreCards();
      renderCategory();
      update();
      writeUrl(true);
    });
  });

  window.addEventListener('popstate', fromUrl);

  // «Сбросить все» снимает фильтры, но оставляет категорию и сортировку
  document.querySelectorAll('[data-filters-reset]').forEach(function (button) {
    button.addEventListener('click', function () {
      var category = categoryInput.value;
      var sort = sortSelect.value;
      form.reset();
      categoryInput.value = category;
      sortSelect.value = sort;
      restoreCards();
      update();
      writeUrl(false);
    });
  });

  // «Показать ещё» в списке брендов. Если выбран бренд из скрытой части,
  // список раскрыт сразу
  var moreToggle = form.querySelector('[data-filters-more-toggle]');
  var more = form.querySelector('[data-filters-more]');
  // instant — без анимации: при загрузке страницы
  function setMore(isOpen, instant) {
    if (instant) more.hidden = !isOpen;
    else slideToggle(more, isOpen);
    moreToggle.setAttribute('aria-expanded', String(isOpen));
    moreToggle.textContent = isOpen ? 'Свернуть' : 'Показать ещё';
  }
  moreToggle.addEventListener('click', function () {
    setMore(moreToggle.getAttribute('aria-expanded') !== 'true');
  });

  // Вид: плитка или список. Это настройка браузера, а не фильтр,
  // поэтому она в localStorage, а не в адресе
  var VIEW_KEY = 'dk-catalog-view';
  var viewButtons = document.querySelectorAll('[data-catalog-view]');
  function setView(view) {
    grid.classList.toggle('product-grid--list', view === 'list');
    viewButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-catalog-view') === view));
    });
  }
  viewButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var view = button.getAttribute('data-catalog-view');
      setView(view);
      try { localStorage.setItem(VIEW_KEY, view); } catch (e) { /* нет доступа */ }
    });
  });
  try { setView(localStorage.getItem(VIEW_KEY) || 'grid'); } catch (e) { /* нет доступа */ }

  // Выдвижная панель фильтров (до 1024px)
  function setPanel(isOpen) {
    panel.classList.toggle('is-open', isOpen);
    openButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('is-locked', isOpen);
    if (isOpen) panel.querySelector('.filters__close').focus();
  }

  openButton.addEventListener('click', function () { setPanel(true); });
  panel.querySelectorAll('[data-filters-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      setPanel(false);
      openButton.focus();
    });
  });
  // Клик мимо панели (по затемнению) закрывает её
  document.addEventListener('click', function (event) {
    if (panel.classList.contains('is-open') && !panel.contains(event.target) && !openButton.contains(event.target)) {
      setPanel(false);
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) {
      setPanel(false);
      openButton.focus();
    }
  });
  window.matchMedia('(min-width: 1025px)').addEventListener('change', function (event) {
    if (event.matches) setPanel(false);
  });

  fromUrl();
  // Адрес с неизвестными значениями (?category=nope) приводим к тому,
  // что реально показано
  writeUrl(false);
  setMore(Boolean(more.querySelector('input:checked')), true);
}

/* ==========================================================================
   Страница товара
   ========================================================================== */

/**
 * Галерея: миниатюры, стрелки, свайп по фото, увеличенный просмотр
 * в <dialog> со стрелками и клавишами ← →.
 */
function initGallery() {
  var gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  var main = gallery.querySelector('[data-gallery-main]');
  var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('[data-gallery-thumb]'));
  var lightbox = gallery.querySelector('[data-lightbox]');
  var lightboxImage = gallery.querySelector('[data-lightbox-image]');
  var counter = gallery.querySelector('[data-lightbox-counter]');
  var current = 0;

  function show(index) {
    current = (index + thumbs.length) % thumbs.length;
    var thumb = thumbs[current];

    thumbs.forEach(function (item) { item.removeAttribute('aria-current'); });
    thumb.setAttribute('aria-current', 'true');

    main.src = thumb.getAttribute('data-src');
    main.alt = thumb.getAttribute('data-alt');
    main.classList.remove('is-changing');
    void main.offsetWidth; // перезапуск анимации проявления
    main.classList.add('is-changing');

    lightboxImage.src = main.src;
    lightboxImage.alt = main.alt;
    counter.textContent = (current + 1) + ' / ' + thumbs.length;
  }

  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () { show(index); });
  });

  gallery.querySelectorAll('[data-gallery-prev]').forEach(function (button) {
    button.addEventListener('click', function () { show(current - 1); });
  });
  gallery.querySelectorAll('[data-gallery-next]').forEach(function (button) {
    button.addEventListener('click', function () { show(current + 1); });
  });

  // Свайп по фото на тач-экранах. После свайпа клик (лупа) не нужен
  var startX = null;
  var swiped = false;
  main.addEventListener('touchstart', function (event) {
    startX = event.touches[0].clientX;
  }, { passive: true });
  main.addEventListener('touchend', function (event) {
    if (startX === null) return;
    var delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 40) {
      show(current + (delta < 0 ? 1 : -1));
      swiped = true;
    }
    startX = null;
  });

  function openLightbox() {
    if (typeof lightbox.showModal !== 'function') return;
    show(current);
    lightbox.showModal();
    document.body.classList.add('is-locked');
  }

  main.addEventListener('click', function () {
    if (swiped) {
      swiped = false;
      return;
    }
    openLightbox();
  });
  gallery.querySelector('[data-gallery-zoom]').addEventListener('click', openLightbox);
  gallery.querySelector('[data-lightbox-close]').addEventListener('click', function () { lightbox.close(); });

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
  lightbox.addEventListener('close', function () {
    document.body.classList.remove('is-locked');
  });

  show(0);
  main.classList.remove('is-changing');
}

/**
 * Выбор площади на странице товара: модель, цена, подписи «до N м²»,
 * текст заявки на монтаж. Модификация хранится в адресе (?area=25),
 * как фильтры каталога: ссылкой можно поделиться, с карточки каталога
 * товар открывается сразу с нужной площадью.
 */
function initProductPage() {
  var inputs = Array.prototype.slice.call(document.querySelectorAll('input[name="pr-area"]'));
  if (!inputs.length) return;

  var title = document.querySelector('.pr-head__title').textContent.trim();
  var price = document.querySelector('[data-pr-price]');
  var cart = document.querySelector('[data-pr-cart]');
  var cartText = document.querySelector('[data-pr-cart-text]');
  var install = document.querySelector('[data-pr-install]');
  var fav = document.querySelector('[data-pr-fav]');
  var favText = document.querySelector('[data-pr-fav-text]');

  function apply(input) {
    var model = input.getAttribute('data-model');
    document.querySelectorAll('[data-pr-model]').forEach(function (el) { el.textContent = model; });
    document.querySelectorAll('[data-pr-area]').forEach(function (el) { el.textContent = input.value; });
    price.textContent = formatPrice(input.getAttribute('data-price'));
    install.setAttribute('data-request-comment',
      'Монтаж: ' + title + ', ' + model + ' (' + input.value + ' м²).');

    cart.classList.remove('is-added');
    cartText.textContent = 'В корзину';
  }

  function writeUrl(value) {
    var params = new URLSearchParams(window.location.search);
    if (value === inputs[0].value) params.delete('area');
    else params.set('area', value);
    var query = params.toString();
    history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
  }

  inputs.forEach(function (input) {
    input.addEventListener('change', function () {
      apply(input);
      writeUrl(input.value);
    });
  });

  // Площадь из адреса. Неизвестное значение — первая модификация
  var fromUrl = new URLSearchParams(window.location.search).get('area');
  var initial = inputs.filter(function (input) { return input.value === fromUrl; })[0] || inputs[0];
  initial.checked = true;
  apply(initial);
  writeUrl(initial.value);

  // Корзина в вёрстке: счётчик в шапке, повторный клик ведёт в корзину.
  // На WordPress: wc-ajax=add_to_cart с id выбранной вариации
  cart.addEventListener('click', function () {
    if (cart.classList.contains('is-added')) {
      window.location.href = document.querySelector('.header__cart').href;
      return;
    }
    cart.classList.add('is-added');
    cartText.textContent = 'В корзине, перейти';
    updateCartCount(1);
  });

  fav.addEventListener('click', function () {
    var isOn = fav.getAttribute('aria-pressed') !== 'true';
    fav.setAttribute('aria-pressed', String(isOn));
    favText.textContent = isOn ? 'В избранном' : 'В избранное';
  });
}

/**
 * Кнопка корзины в компактной карточке (похожие товары).
 */
function initMiniCart() {
  document.querySelectorAll('[data-mini-cart]').forEach(function (button) {
    var label = button.getAttribute('aria-label');
    button.addEventListener('click', function () {
      if (button.classList.contains('is-added')) {
        window.location.href = document.querySelector('.header__cart').href;
        return;
      }
      button.classList.add('is-added');
      button.querySelector('.icon').className = 'icon icon--check';
      button.setAttribute('aria-label', label.replace('В корзину', 'В корзине, перейти в корзину'));
      updateCartCount(1);
    });
  });
}

/* ==========================================================================
   Корзина
   ========================================================================== */

function setCartCount(count) {
  var badge = document.querySelector('[data-cart-count]');
  if (!badge) return;
  badge.textContent = count;
  badge.hidden = count <= 0;
  badge.closest('a').setAttribute('aria-label', count > 0 ? 'Корзина, товаров: ' + count : 'Корзина');
}

/**
 * Корзина и оформление: количество, удаление с отменой, пересчёт
 * товаров и доставки, проверка формы, панель «Итого» на телефоне.
 * Доставка по Перми бесплатна от 20 000 ₽, иначе 1 000 ₽ (условия сайта),
 * за пределами города и монтаж — расчёт менеджера.
 * На WordPress пересчёт и сохранение делает WooCommerce, скрипт
 * отправляет изменения запросом; разметка остаётся той же.
 */
function initCart() {
  var section = document.querySelector('[data-cart]');
  if (!section) return;

  var FREE_FROM = 20000;
  var DELIVERY_PRICE = 1000;

  var form = document.getElementById('checkout-form');
  var items = Array.prototype.slice.call(section.querySelectorAll('.cart-item'));
  var layout = section.querySelector('[data-cart-layout]');
  var countText = section.querySelector('[data-cart-count-text]');
  var emptyState = section.querySelector('[data-cart-empty]');
  var successState = section.querySelector('[data-cart-success]');
  var itemsLabel = section.querySelector('[data-summary-items-label]');
  var itemsValue = section.querySelector('[data-summary-items]');
  var deliveryValue = section.querySelector('[data-summary-delivery]');
  var deliveryNote = section.querySelector('[data-summary-note]');
  var totals = section.querySelectorAll('[data-summary-total]');
  var installRow = section.querySelector('[data-summary-install]');
  var addressField = section.querySelector('[data-checkout-address]');
  var submit = section.querySelector('[data-checkout-submit]');
  var submitText = submit.textContent;
  var serverError = section.querySelector('[data-checkout-error]');
  var bar = section.querySelector('[data-cart-bar]');
  var toast = section.querySelector('[data-cart-toast]');
  var toastText = section.querySelector('[data-cart-toast-text]');
  var toastTimer = null;
  var lastRemoved = null;

  function plural(n, one, few, many) {
    var mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function activeItems() {
    return items.filter(function (item) { return !item.hasAttribute('data-removed'); });
  }

  function qtyOf(item) {
    var value = parseInt(item.querySelector('[data-qty]').value, 10);
    return isNaN(value) ? 1 : Math.min(99, Math.max(1, value));
  }

  /* --- Пересчёт ---------------------------------------------------------- */

  function renderItem(item, keepInput) {
    var qty = qtyOf(item);
    var input = item.querySelector('[data-qty]');
    if (!keepInput) input.value = qty;
    item.querySelector('[data-line-total]').textContent = formatPrice(Number(item.getAttribute('data-price')) * qty);
    item.querySelector('[data-unit-price]').hidden = qty === 1;
    item.querySelector('[data-qty-minus]').disabled = qty <= 1;
    item.querySelector('[data-qty-plus]').disabled = qty >= 99;
  }

  function recalc() {
    var active = activeItems();
    var count = 0;
    var sum = 0;
    active.forEach(function (item) {
      var qty = qtyOf(item);
      count += qty;
      sum += qty * Number(item.getAttribute('data-price'));
    });

    var pickup = form.elements.delivery.value === 'pickup';
    var delivery = pickup || sum >= FREE_FROM ? 0 : DELIVERY_PRICE;

    countText.textContent = count + ' ' + plural(count, 'товар', 'товара', 'товаров');
    itemsLabel.textContent = 'Товары, ' + count + ' шт.';
    itemsValue.textContent = formatPrice(sum);
    deliveryValue.textContent = delivery ? formatPrice(delivery) : 'Бесплатно';
    deliveryValue.classList.toggle('is-free', !delivery);

    if (pickup) {
      deliveryNote.textContent = 'Самовывоз: Пермь, ул. Трамвайная, 27, офис 4.';
    } else if (sum >= FREE_FROM) {
      deliveryNote.textContent = 'По Перми. За пределами города стоимость рассчитает менеджер.';
    } else {
      deliveryNote.textContent = 'По Перми. Добавьте товаров на ' + formatPrice(FREE_FROM - sum) + ', и доставка станет бесплатной.';
    }

    totals.forEach(function (el) { el.textContent = formatPrice(sum + delivery); });
    installRow.hidden = !active.some(function (item) { return item.hasAttribute('data-installable'); });
    setCartCount(count);

    var isEmpty = active.length === 0;
    layout.hidden = isEmpty;
    countText.hidden = isEmpty;
    emptyState.hidden = !isEmpty;
    if (isEmpty) bar.classList.remove('is-visible');
  }

  /* --- Количество -------------------------------------------------------- */

  items.forEach(function (item) {
    var input = item.querySelector('[data-qty]');

    function change(delta) {
      input.value = qtyOf(item) + delta;
      renderItem(item);
      recalc();
    }

    item.querySelector('[data-qty-minus]').addEventListener('click', function () { change(-1); });
    item.querySelector('[data-qty-plus]').addEventListener('click', function () { change(1); });

    // Пока печатают, поле не трогаем; на выходе из поля — приводим к 1-99
    input.addEventListener('input', function () {
      renderItem(item, true);
      recalc();
    });
    input.addEventListener('change', function () {
      renderItem(item);
      recalc();
    });

    item.querySelector('[data-cart-remove]').addEventListener('click', function () { remove(item); });
    renderItem(item);
  });

  /* --- Удаление с отменой ------------------------------------------------ */

  function hideToast() {
    clearTimeout(toastTimer);
    toast.hidden = true;
    lastRemoved = null;
  }

  function remove(item) {
    item.setAttribute('data-removed', '');
    item.querySelector('[data-qty]').disabled = true; // не уходит в заказ
    slideToggle(item, false);
    lastRemoved = item;

    var title = item.querySelector('.cart-item__title').textContent.trim();
    toastText.textContent = 'Удалено: ' + title;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 6000);
    recalc();
  }

  section.querySelector('[data-cart-undo]').addEventListener('click', function () {
    var item = lastRemoved;
    if (!item) return;
    hideToast();
    item.removeAttribute('data-removed');
    item.querySelector('[data-qty]').disabled = false;
    recalc();
    slideToggle(item, true);
    item.querySelector('[data-cart-remove]').focus();
  });

  /* --- Получение, монтаж, промокод --------------------------------------- */

  form.addEventListener('change', function (event) {
    if (event.target.name !== 'delivery') return;
    var isDelivery = event.target.value === 'delivery';
    slideToggle(addressField, isDelivery);
    if (!isDelivery) setError(form.elements.address, false);
    recalc();
  });

  var promoInput = section.querySelector('#checkout-promo');
  var promoNote = section.querySelector('[data-promo-note]');
  section.querySelector('[data-promo-apply]').addEventListener('click', function () {
    if (!promoInput.value.trim()) {
      promoInput.focus();
      return;
    }
    promoNote.hidden = false;
  });
  promoInput.addEventListener('input', function () { promoNote.hidden = true; });

  /* --- Проверка и отправка ----------------------------------------------- */

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var rules = {
    name: function (input) { return input.value.trim().length >= 2; },
    phone: function (input) { return input.value.replace(/\D/g, '').length === 11; },
    email: function (input) { return !input.value.trim() || EMAIL.test(input.value.trim()); },
    address: function (input) {
      return form.elements.delivery.value !== 'delivery' || input.value.trim().length >= 5;
    },
    consent: function (input) { return input.checked; }
  };

  function setError(input, isInvalid) {
    var ids = (input.getAttribute('aria-describedby') || '').split(' ');
    var errorId = ids.filter(function (id) { return /-error$/.test(id); })[0];
    var error = errorId && document.getElementById(errorId);
    input.closest('.field').classList.toggle('is-invalid', isInvalid);
    input.setAttribute('aria-invalid', String(isInvalid));
    if (error) error.hidden = !isInvalid;
  }

  // Ошибка снимается, как только поле исправили (consent живёт вне формы,
  // но привязан к ней атрибутом form, поэтому слушаем документ)
  document.addEventListener('input', function (event) {
    var input = event.target;
    if (input.form !== form || !rules[input.name]) return;
    if (input.getAttribute('aria-invalid') === 'true' && rules[input.name](input)) setError(input, false);
  });
  document.addEventListener('change', function (event) {
    var input = event.target;
    if (input.form === form && input.name === 'consent' && input.checked) setError(input, false);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    serverError.hidden = true;

    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      var isInvalid = !rules[name](input);
      setError(input, isInvalid);
      if (isInvalid && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Отправляем…';

    sendRequest(new FormData(form))
      .then(function () {
        layout.hidden = true;
        countText.hidden = true;
        bar.classList.remove('is-visible');
        hideToast();
        successState.hidden = false;
        successState.focus();
        successState.scrollIntoView({ block: 'center', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        setCartCount(0);
      })
      .catch(function () {
        serverError.hidden = false;
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = submitText;
      });
  });

  /* --- Панель «Итого» на телефоне ---------------------------------------- */

  // Видна, пока кнопка оформления в сводке за пределами экрана.
  // На десктопе панель скрыта стилями, класс ничего не меняет
  if ('IntersectionObserver' in window) {
    // Только пока кнопка ниже экрана: когда сводку прокрутили,
    // панель не нужна и закрывала бы подвал
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      var visible = !entry.isIntersecting && entry.boundingClientRect.top > 0 && !layout.hidden;
      bar.classList.toggle('is-visible', visible);
    }).observe(submit);
  }

  // «Оформить» на панели запускает ту же проверку: первое незаполненное
  // поле получит фокус, и страница сама к нему прокрутится
  section.querySelector('[data-cart-bar-go]').addEventListener('click', function () {
    submit.click();
  });

  recalc();
}
