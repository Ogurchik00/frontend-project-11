import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from './i18n';
import { validateUrl } from './validation';
import { fetchRssFeed, parseRss } from './rssParser';
import { startAutoUpdate, stopAutoUpdate, updateFeeds } from './updater';

// Состояние приложения
const state = {
  feeds: [],
  posts: [],
  process: {
    state: 'filling', // filling, sending, success, error
    error: null
  },
  ui: {
    lastUpdate: null,
    updating: false,
    updateInterval: 5000 // 5 секунд
  }
};

// Рендер всего приложения
const renderApp = () => {
  const app = document.getElementById('app');
  const { process, ui } = state;

  app.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="text-end mb-3">
          <button id="lang-en" class="btn btn-sm btn-outline-secondary">EN</button>
          <button id="lang-ru" class="btn btn-sm btn-outline-secondary">RU</button>
        </div>
        
        <h1 class="text-center mb-4">${i18n.t('rssForm.title')}</h1>
        
        <form id="rss-form" class="mb-4">
          <div class="mb-3">
            <label for="rss-url" class="form-label">${i18n.t('rssForm.label')}</label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control ${process.error ? 'is-invalid' : ''}" 
                id="rss-url" 
                placeholder="${i18n.t('rssForm.placeholder')}" 
                required
                ${process.state === 'sending' ? 'disabled' : ''}
              >
              <button 
                class="btn btn-primary" 
                type="submit" 
                ${process.state === 'sending' ? 'disabled' : ''}
              >
                ${process.state === 'sending' ? `
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ${i18n.t('rssForm.loading')}
                ` : i18n.t('rssForm.submit')}
              </button>
            </div>
            <div id="error" class="invalid-feedback">
              ${process.error ? i18n.t(process.error) : ''}
            </div>
            ${process.state === 'success' ? `
              <div class="valid-feedback">${i18n.t('rssForm.success')}</div>
            ` : ''}
          </div>
        </form>
        
        <div class="text-end small text-muted mb-2">
          ${ui.updating 
            ? `<span class="spinner-border spinner-border-sm" role="status"></span> ${i18n.t('updating')}`
            : `${i18n.t('lastUpdate')}: ${ui.lastUpdate || i18n.t('never')}`}
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-body">
                <h2 class="card-title h5">${i18n.t('feeds.title')}</h2>
                <div id="feeds-list" class="mt-3"></div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h2 class="card-title h5">${i18n.t('posts.title')}</h2>
                <div id="posts-list" class="mt-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  renderFeeds();
  renderPosts();
  setupEventListeners();
};

// Рендер списка RSS-лент
const renderFeeds = () => {
  const container = document.getElementById('feeds-list');
  if (!container) return;

  container.innerHTML = state.feeds.length > 0
    ? `<ul class="list-group">${
      state.feeds.map(feed => `
        <li class="list-group-item">
          <h3 class="h6">${feed.title}</h3>
          <p class="mb-1 small text-muted">${feed.description}</p>
          <span class="badge bg-secondary">${feed.url}</span>
        </li>
      `).join('')
    }</ul>`
    : `<div class="alert alert-info">${i18n.t('feeds.empty')}</div>`;
};

// Рендер списка постов
const renderPosts = () => {
  const container = document.getElementById('posts-list');
  if (!container) return;

  container.innerHTML = state.posts.length > 0
    ? `<ul class="list-group">${
      state.posts.map(post => `
        <li class="list-group-item">
          <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="fw-bold">
            ${post.title}
          </a>
          <p class="mb-1 small">${post.description}</p>
          <span class="badge bg-primary">${new Date(post.pubDate).toLocaleString()}</span>
        </li>
      `).join('')
    }</ul>`
    : `<div class="alert alert-info">${i18n.t('posts.empty')}</div>`;
};

// Настройка обработчиков событий
const setupEventListeners = () => {
  // Обработчик формы
  document.getElementById('rss-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const urlInput = document.getElementById('rss-url');
    const url = urlInput.value.trim();
    
    state.process = { state: 'sending', error: null };
    renderApp();

    try {
      // Валидация URL
      const validation = await validateUrl(url);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Проверка на дубликат
      if (state.feeds.some(feed => feed.url === url)) {
        throw new Error('errors.duplicate');
      }

      // Загрузка и парсинг RSS
      const xmlString = await fetchRssFeed(url);
      const { feed, posts } = await parseRss(xmlString);
      
      // Сохраняем URL в объекте feed
      feed.url = url;

      // Обновляем состояние
      state.feeds = [feed, ...state.feeds];
      state.posts = [...posts, ...state.posts];
      state.process = { state: 'success', error: null };
      
      // Запускаем автообновление
      startAutoUpdate();
      
      // Сбрасываем поле ввода
      urlInput.value = '';
    } catch (error) {
      state.process = { 
        state: 'error', 
        error: error.message.includes('Network Error') 
          ? 'errors.network' 
          : error.message
      };
    } finally {
      renderApp();
    }
  });

  // Переключение языков
  document.getElementById('lang-en')?.addEventListener('click', () => {
    i18n.changeLanguage('en').then(renderApp);
  });

  document.getElementById('lang-ru')?.addEventListener('click', () => {
    i18n.changeLanguage('ru').then(renderApp);
  });

  // Управление автообновлением при скрытии вкладки
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoUpdate();
    } else {
      startAutoUpdate();
      updateFeeds(); // Немедленная проверка при возвращении
    }
  });
};

// Инициализация приложения
i18n.init().then(() => {
  renderApp();
  
  // Запускаем автообновление, если уже есть ленты
  if (state.feeds.length > 0) {
    startAutoUpdate();
  }
});

// Экспортируем состояние для использования в других модулях
export { state, renderApp, renderPosts };