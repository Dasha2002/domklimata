'use strict';
(() => {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const menuButton = $('.mobile-toggle');
  const mobileMenu = $('#mobile-menu');
  const closeMenu = () => { mobileMenu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Открыть меню'); };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    mobileMenu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  const menuBreakpoint = matchMedia('(min-width: 1081px)');
  menuBreakpoint.addEventListener('change', event => { if (event.matches) closeMenu(); });

  const searchDialog = $('#search-dialog');
  const calculatorDialog = $('#calculator-dialog');
  let previousFocus;
  function openDialog(dialog) {
    closeMenu();
    previousFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('modal-open');
    const input = $('input', dialog);
    if (input) input.focus({preventScroll:true});
  }
  $$('dialog').forEach(dialog => {
    $('[data-close-dialog]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      previousFocus?.focus({preventScroll:true});
    });
  });
  $$('[data-open-search]').forEach(button => button.addEventListener('click', () => openDialog(searchDialog)));
  $$('[data-open-calculator]').forEach(button => button.addEventListener('click', () => openDialog(calculatorDialog)));
  const searchInput = $('#site-search');
  const searchResults = $$('.search-result');
  searchInput.addEventListener('input', () => {
    const words = searchInput.value.trim().toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
    let count = 0;
    searchResults.forEach(result => {
      const text = result.dataset.search.toLocaleLowerCase('ru');
      const match = words.every(word => text.includes(word));
      result.hidden = !match;
      if (match) count++;
    });
    $('#search-status').textContent = words.length ? (count ? 'Найдено: ' + count : 'На главной совпадений нет. Попробуйте другой запрос или откройте весь каталог.') : 'Категории и модели с главной страницы';
  });
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); searchResults.find(result => !result.hidden)?.focus(); }
    if (event.key === 'Enter') { event.preventDefault(); searchResults.find(result => !result.hidden)?.click(); }
  });

  let selectedArea = '25';
  $$('[data-area]').forEach(button => button.addEventListener('click', () => {
    selectedArea = button.dataset.area;
    $$('[data-area]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    const result = $('#area-result');
    result.hidden = false;
    $('p', result).textContent = Number(selectedArea) > 70 ? 'Для большого помещения важны планировка и теплопритоки. Подберём настенное, кассетное или канальное решение индивидуально.' : 'Для помещения до ' + selectedArea + ' м² предварительный ориентир — ' + (Number(selectedArea) / 10).toLocaleString('ru') + ' кВт охлаждения. Точный подбор учитывает окна, потолки и теплопритоки.';
  }));
  function prepareRequest(message) {
    const textarea = $('#request-message');
    textarea.value = message;
    $('#contacts').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    textarea.focus({preventScroll:true});
  }
  $('[data-request-area]').addEventListener('click', () => prepareRequest('Нужен подбор кондиционера. Площадь помещения: ' + (Number(selectedArea) > 70 ? 'более 70' : selectedArea) + ' м².'));
  const calculatorForm = $('#calculator-form');
  const areaInput = $('[name="area"]', calculatorForm);
  const taskInput = $('[name="task"]', calculatorForm);
  const powerResult = $('#power-result');
  function updatePower() {
    if (taskInput.value.includes('вентиляцию')) { powerResult.textContent = 'Рассчитаем воздухообмен индивидуально'; return; }
    powerResult.textContent = areaInput.validity.valid ? 'Ориентир по мощности: ' + (Number(areaInput.value) / 10).toLocaleString('ru', {maximumFractionDigits:1}) + ' кВт' : 'Укажите площадь от 5 до 1 000 м²';
  }
  areaInput.addEventListener('input', updatePower);
  taskInput.addEventListener('change', updatePower);
  calculatorForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(calculatorForm);
    calculatorDialog.close();
    prepareRequest(data.get('task') + '. Площадь помещения: ' + data.get('area') + ' м². Прошу рассчитать стоимость.');
  });
  const contactForm = $('#contact-form');
  const phoneInput = $('[name="phone"]', contactForm);
  phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) { phoneInput.setCustomValidity('Укажите корректный номер телефона: от 10 до 15 цифр.'); phoneInput.reportValidity(); return; }
    const data = new FormData(contactForm);
    const message = ['Заявка с главной страницы Дом Климата', '', 'Имя: ' + data.get('name'), 'Телефон: ' + data.get('phone'), 'Помещение: ' + data.get('room'), 'Задача: ' + data.get('message'), '', 'Согласие на обработку персональных данных дано.'].join('\n');
    $('#email-request').href = 'mailto:info@domklimata59.ru?subject=' + encodeURIComponent('Заявка — Дом Климата') + '&body=' + encodeURIComponent(message);
    $('.form-result', contactForm).hidden = false;
  });
  contactForm.addEventListener('input', () => { $('.form-result', contactForm).hidden = true; });
})();
