/* Список публикаций и единый шаблон статьи. Данные сохранены локально. */
(function () {
  'use strict';
  var posts = window.climatePosts || [];
  var root = document.body.dataset.root || '';
  function dateLabel(value) {
    return value ? new Date(value + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Дата не указана';
  }
  function monthLabel(value) {
    if (!value) return 'Без даты';
    var label = new Date(value + '-01T12:00:00').toLocaleDateString('ru-RU', { month: 'long' });
    return label.charAt(0).toUpperCase() + label.slice(1).replace(' г.', '');
  }
  function escape(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }
  function card(post) {
    var href = '?post=' + encodeURIComponent(post.slug);
    return '<article class="blog-card"><a class="blog-card__image" href="' + href + '">' +
      '<img src="' + root + post.image + '" width="' + post.width + '" height="' + post.height + '" alt="' + escape(post.title) + '" loading="lazy"></a>' +
      '<div class="blog-card__body"><a class="blog-card__category category-link" href="' + root + 'news/?category=' + encodeURIComponent(post.category) + '">' + escape(post.category) + '</a>' +
      '<time class="blog-card__date" datetime="' + escape(post.date || '') + '">' + dateLabel(post.date) + '</time>' +
      '<h3><a href="' + href + '">' + escape(post.title) + '</a></h3><p>' + escape(post.excerpt) + '</p>' +
      '<a class="page-link blog-card__read" href="' + href + '">Читать статью</a></div></article>';
  }
  var article = document.querySelector('[data-article]');
  if (article) {
    var slug = new URLSearchParams(window.location.search).get('post');
    var post = slug ? posts.find(function (item) { return item.slug === slug; }) : posts[0];
    if (!post) {
      document.querySelector('[data-article-title]').textContent = 'Статья не найдена';
      document.querySelector('[data-article-lead]').textContent = 'Выберите другую публикацию в блоге.';
      article.querySelector('.story__cover').hidden = true;
      article.querySelector('.story__layout').hidden = true;
      document.title = 'Статья не найдена | Дом Климата';
    } else {
      document.title = post.title + ' | Дом Климата';
      document.querySelector('meta[name="description"]').content = post.excerpt;
      document.querySelector('[data-article-title]').textContent = post.title;
      document.querySelector('[data-article-category]').textContent = post.category;
      document.querySelector('[data-article-category]').href = root + 'news/?category=' + encodeURIComponent(post.category);
      document.querySelector('[data-article-lead]').textContent = post.excerpt;
      var publication = document.querySelector('[data-article-date]');
      publication.dateTime = post.date || '';
      publication.textContent = dateLabel(post.date);
      var image = document.querySelector('[data-article-image]');
      image.src = root + post.image;
      image.alt = post.title;
      image.width = post.width;
      image.height = post.height;
      var body = document.querySelector('[data-article-body]');
      body.innerHTML = post.html.split('{{root}}').join(root);
      var minutes = Math.max(1, Math.ceil(body.textContent.trim().split(/\s+/).length / 180));
      document.querySelector('[data-article-reading]').textContent = minutes + ' мин. на чтение';
      var headings = Array.from(body.querySelectorAll('h2, h3'));
      headings.forEach(function (heading, index) { heading.id = 'article-section-' + (index + 1); });
      var mainHeadings = Array.from(body.querySelectorAll('h2'));
      if (!mainHeadings.length) mainHeadings = headings;
      var toc = document.querySelector('[data-article-toc]');
      if (!headings.length) toc.hidden = true;
      mainHeadings.forEach(function (heading) {
        var item = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent.trim();
        item.appendChild(link);
        toc.querySelector('ol').appendChild(item);
      });
      document.querySelector('[data-article-related]').innerHTML = posts.filter(function (item) { return item.slug !== post.slug; }).slice(0, 3).map(card).join('');
    }
  }
  var cards = Array.from(document.querySelectorAll('[data-blog-card]'));
  if (!cards.length) return;
  var search = document.getElementById('blog-search');
  var filters = Array.from(document.querySelectorAll('[data-blog-filter]'));
  var more = document.querySelector('[data-blog-more]');
  var yearSelect = document.querySelector('[data-archive-select="year"]');
  var monthSelect = document.querySelector('[data-archive-select="month"]');
  var dateReset = document.querySelector('[data-blog-date-reset]');
  var grid = cards[0].parentElement;
  var params = new URLSearchParams(window.location.search);
  var filterToggle = document.querySelector('[data-blog-toggle]');
  var filterPanel = document.querySelector('[data-blog-panel]');
  var filterAnimation;
  function toggleFilters(expanded) {
    var height = filterPanel.hidden ? 0 : filterPanel.getBoundingClientRect().height;
    if (filterAnimation) filterAnimation.cancel();
    filterToggle.setAttribute('aria-expanded', String(expanded));
    if (!expanded) [yearSelect, monthSelect].forEach(function (select) { select.open = false; });
    filterPanel.hidden = false;
    filterPanel.style.overflow = 'hidden';
    filterAnimation = filterPanel.animate([{ height: height + 'px', opacity: expanded ? 0.5 : 1 }, { height: expanded ? filterPanel.scrollHeight + 'px' : '0px', opacity: expanded ? 1 : 0 }], {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320,
      easing: 'cubic-bezier(.22,1,.36,1)'
    });
    filterAnimation.onfinish = function () {
      filterPanel.hidden = !expanded;
      filterPanel.style.overflow = '';
      filterAnimation = null;
    };
  }
  filterToggle.addEventListener('click', function () { toggleFilters(filterToggle.getAttribute('aria-expanded') !== 'true'); });
  if (params.get('month')) { filterPanel.hidden = false; filterToggle.setAttribute('aria-expanded', 'true'); }
  var months = Array.from(new Set(posts.filter(function (post) { return post.date; }).map(function (post) { return post.date.slice(0, 7); }))).sort().reverse();
  var years = Array.from(new Set(months.map(function (value) { return value.slice(0, 4); })));
  var selectedMonth = months.indexOf(params.get('month')) !== -1 ? params.get('month') : '';
  var selectedYear = selectedMonth ? selectedMonth.slice(0, 4) : years.indexOf(params.get('year')) !== -1 ? params.get('year') : years[0];
  function options(select, values, current, label, onSelect) {
    var container = select.querySelector('[data-archive-options]');
    container.replaceChildren();
    values.forEach(function (value) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = label(value);
      button.setAttribute('aria-pressed', String(value === current));
      button.addEventListener('click', function () {
        onSelect(value);
        select.open = false;
        select.querySelector('summary').focus();
        render(true);
      });
      container.appendChild(button);
    });
    select.querySelector('[data-archive-value]').textContent = label(current);
  }
  function refreshOptions() {
    options(yearSelect, years, selectedYear, function (value) { return value; }, function (value) { selectedYear = value; selectedMonth = ''; });
    options(monthSelect, [''].concat(months.filter(function (value) { return value.slice(0, 4) === selectedYear; })), selectedMonth,
      function (value) { return value ? monthLabel(value) : 'Все месяцы'; }, function (value) { selectedMonth = value; });
  }
  [yearSelect, monthSelect].forEach(function (select) {
    select.addEventListener('toggle', function () {
      if (select.open) [yearSelect, monthSelect].forEach(function (other) { if (other !== select) other.open = false; });
    });
    select.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { select.open = false; select.querySelector('summary').focus(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        select.open = true;
        var buttons = Array.from(select.querySelectorAll('button'));
        var index = buttons.indexOf(document.activeElement);
        var next = event.key === 'ArrowDown' ? (index + 1) % buttons.length : (index <= 0 ? buttons.length - 1 : index - 1);
        if (buttons[next]) buttons[next].focus();
      }
    });
  });
  document.addEventListener('click', function (event) {
    [yearSelect, monthSelect].forEach(function (select) { if (!select.contains(event.target)) select.open = false; });
  });
  cards.forEach(function (item) {
    var slug = new URL(item.querySelector('.blog-card__image').href).searchParams.get('post');
    var data = posts.find(function (post) { return post.slug === slug; });
    item.dataset.date = data && data.date || '';
  });
  cards.sort(function (a, b) { return b.dataset.date.localeCompare(a.dataset.date); });
  var headings = [];
  var previousMonth = null;
  cards.forEach(function (item) {
    var key = item.dataset.date.slice(0, 7);
    if (key !== previousMonth) {
      var heading = document.createElement('h2');
      heading.className = 'blog-month';
      heading.dataset.month = key;
      heading.textContent = monthLabel(key);
      headings.push(heading);
      grid.appendChild(heading);
      previousMonth = key;
    }
    grid.appendChild(item);
  });
  var requestedCategory = new URLSearchParams(window.location.search).get('category');
  var category = filters.some(function (button) { return button.dataset.blogFilter === requestedCategory; }) ? requestedCategory : 'Все публикации';
  var visible = 9;
  function render(reset) {
    if (reset) visible = 9;
    var query = search.value.trim().toLocaleLowerCase('ru-RU');
    var matching = cards.filter(function (item) {
      return (category === 'Все публикации' || item.dataset.category === category) && item.dataset.search.indexOf(query) !== -1 &&
        item.dataset.date.slice(0, 4) === selectedYear && (!selectedMonth || item.dataset.date.slice(0, 7) === selectedMonth);
    });
    cards.forEach(function (item) { item.hidden = true; });
    matching.slice(0, visible).forEach(function (item) { item.hidden = false; });
    headings.forEach(function (heading) {
      heading.hidden = !matching.slice(0, visible).some(function (item) { return item.dataset.date.slice(0, 7) === heading.dataset.month; });
    });
    dateReset.hidden = !selectedMonth;
    refreshOptions();
    filters.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.blogFilter === category)); });
    more.hidden = matching.length <= visible;
    document.querySelector('[data-blog-empty]').hidden = matching.length !== 0;
    document.querySelector('[data-blog-count]').textContent = 'Показано ' + Math.min(visible, matching.length) + ' из ' + matching.length;
    var url = new URL(window.location.href);
    if (category === 'Все публикации') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    url.searchParams.set('year', selectedYear);
    if (selectedMonth) url.searchParams.set('month', selectedMonth); else url.searchParams.delete('month');
    url.searchParams.delete('date');
    window.history.replaceState(null, '', url);
  }
  filters.forEach(function (button) { button.addEventListener('click', function () { category = button.dataset.blogFilter; render(true); }); });
  search.addEventListener('input', function () { render(true); });
  document.querySelector('.blog-search').addEventListener('submit', function (event) { event.preventDefault(); render(true); });
  more.addEventListener('click', function () { visible += 9; render(false); });
  dateReset.addEventListener('click', function () { selectedMonth = ''; render(true); });
  document.querySelector('[data-blog-reset]').addEventListener('click', function () { search.value = ''; category = 'Все публикации'; selectedYear = years[0]; selectedMonth = ''; render(true); search.focus(); });
  render(false);
})();
