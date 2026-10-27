/* Список публикаций и единый шаблон статьи. Данные сохранены локально. */
(function () {
  'use strict';
  var posts = window.climatePosts || [];
  var root = document.body.dataset.root || '';
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
      '<h3><a href="' + href + '">' + escape(post.title) + '</a></h3><p>' + escape(post.excerpt) + '</p>' +
      '<a class="page-link" href="' + href + '">Читать статью <span class="icon icon--arrow-up-right" aria-hidden="true"></span></a></div></article>';
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
  var requestedCategory = new URLSearchParams(window.location.search).get('category');
  var category = filters.some(function (button) { return button.dataset.blogFilter === requestedCategory; }) ? requestedCategory : 'Все публикации';
  var visible = 9;
  function render(reset) {
    if (reset) visible = 9;
    var query = search.value.trim().toLocaleLowerCase('ru-RU');
    var matching = cards.filter(function (item) {
      return (category === 'Все публикации' || item.dataset.category === category) && item.dataset.search.indexOf(query) !== -1;
    });
    cards.forEach(function (item) { item.hidden = true; });
    matching.slice(0, visible).forEach(function (item) { item.hidden = false; });
    filters.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.blogFilter === category)); });
    more.hidden = matching.length <= visible;
    document.querySelector('[data-blog-empty]').hidden = matching.length !== 0;
    document.querySelector('[data-blog-count]').textContent = 'Показано ' + Math.min(visible, matching.length) + ' из ' + matching.length;
    var url = new URL(window.location.href);
    if (category === 'Все публикации') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    window.history.replaceState(null, '', url);
  }
  filters.forEach(function (button) { button.addEventListener('click', function () { category = button.dataset.blogFilter; render(true); }); });
  search.addEventListener('input', function () { render(true); });
  document.querySelector('.blog-search').addEventListener('submit', function (event) { event.preventDefault(); render(true); });
  more.addEventListener('click', function () { visible += 9; render(false); });
  document.querySelector('[data-blog-reset]').addEventListener('click', function () { search.value = ''; category = 'Все публикации'; render(true); search.focus(); });
  render(false);
})();
