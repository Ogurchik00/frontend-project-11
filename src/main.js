import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal } from 'bootstrap';
import i18n from './i18n';
import { validateUrl } from './validation';
import { fetchRssFeed, parseRss } from './rssParser';
import { startAutoUpdate, stopAutoUpdate } from './updater';

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

// Генератор ID для постов
let postIdCounter = 1;
const generatePostId = () => postIdCounter++;

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
    
    <!-- Модальное окно для предпросмотра -->
    <div class="modal fade" id="postModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="postModalTitle"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="postModalBody"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18n.t('modal.close')}</button>
            <a href="#" class="btn btn-primary" id="postModalLink" target="_blank">${i18n.t('modal.fullPost')}</a>
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
        <li class="list-group-item ${post.read ? 'bg-light' : ''}">
          <div class="d-flex justify-content-between align-items-start">
            <a href="${post.link}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="${post.read ? 'fw-normal' : 'fw-bold'}">
              ${post.title}
            </a>
            <button class="btn btn-sm btn-outline-primary preview-btn" 
                    data-post-id="${post.id}"
                    title="${i18n.t('modal.preview')}">
              <i class="bi bi-eye"></i>
            </button>
          </div>
          <p class="mb-1 small text-truncate">${post.description}</p>
          <span class="badge bg-secondary">${new Date(post.pubDate).toLocaleString()}</span>
        </li>
      `).join('')
    }</ul>`
    : `<div class="alert alert-info">${i18n.t('posts.empty')}</div>`;

  // Добавляем обработчики для кнопок предпросмотра
  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = e.currentTarget.getAttribute('data-post-id');
      showPostModal(postId);
    });
  });
};

// Показ модального окна с постом
const showPostModal = (postId) => {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  // Помечаем пост как прочитанный
  post.read = true;
  
  // Обновляем список постов (чтобы снять жирное начертание)
  renderPosts();

  // Заполняем модальное окно
  document.getElementById('postModalTitle').textContent = post.title;
  document.getElementById('postModalBody').innerHTML = post.description;
  document.getElementById('postModalLink').href = post.link;

  // Показываем модальное окно
  const modal = new Modal(document.getElementById('postModal'));
  modal.show();
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
      
      // Добавляем метаданные
      const postsWithMeta = posts.map(post => ({
        ...post,
        id: generatePostId(),
        read: false,
        pubDate: post.pubDate || new Date().toISOString()
      }));

      // Обновляем состояние
      state.feeds = [{ ...feed, url }, ...state.feeds];
      state.posts = [...postsWithMeta, ...state.posts];
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
export { state, renderApp, renderPosts, generatePostId };