/* Навигация и лайтбоксы внутренних страниц. */
document.addEventListener('sections:loaded', function () {
  var current = window.location.pathname.replace(/index\.html$/, '').toLowerCase();
  document.querySelectorAll('.header a[href]').forEach(function (link) {
    if (new URL(link.href).pathname.replace(/index\.html$/, '').toLowerCase() === current) {
      link.setAttribute('aria-current', 'page');
    }
  });

  var certificateViewer = document.querySelector('.certificate-viewer');
  if (certificateViewer) {
    document.querySelectorAll('[data-certificate]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var image = link.querySelector('img');
        certificateViewer.querySelector('img').src = link.href;
        certificateViewer.querySelector('img').alt = image.alt;
        certificateViewer.querySelector('figcaption').textContent = link.dataset.caption || image.alt;
        document.body.classList.add('is-locked');
        certificateViewer.showModal();
      });
    });
    certificateViewer.querySelector('button').addEventListener('click', function () { certificateViewer.close(); });
    // Клик по затемнению вокруг документа закрывает просмотр,
    // по самому документу и подписи — нет
    certificateViewer.addEventListener('click', function (event) {
      if (!event.target.closest('img, figcaption, button')) certificateViewer.close();
    });
    certificateViewer.addEventListener('close', function () { document.body.classList.remove('is-locked'); });
  }

  if (window.Fancybox) {
    Fancybox.bind('[data-fancybox]', {
      mainClass: 'climate-lightbox',
      l10n: {
        CLOSE: 'Закрыть', NEXT: 'Следующее фото', PREV: 'Предыдущее фото',
        MODAL: 'Просмотр изображений. Для закрытия нажмите Escape',
        ERROR: 'Не удалось загрузить изображение', IMAGE_ERROR: 'Не удалось загрузить изображение',
        TOGGLE_ZOOM: 'Увеличить или уменьшить', TOGGLE_THUMBS: 'Показать миниатюры',
        TOGGLE_FULL: 'Увеличить или уменьшить', TOGGLE_1TO1: 'Исходный размер',
        TOGGLE_AUTOPLAY: 'Автопоказ', TOGGLE_SLIDESHOW: 'Автопоказ', TOGGLE_FULLSCREEN: 'На весь экран'
      },
      Carousel: { infinite: true }
    });
  }
});
