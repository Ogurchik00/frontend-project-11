import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal } from 'bootstrap';
import i18n from './i18n';
import createValidation from './validation';
import createRssParser from './rssParser';
import createUpdater from './updater';

const createApp = () => {
  // Состояние приложения
  const state = {
    feeds: [],
    posts: [],
    process: {
      state: 'filling',
      error: null
    },
    ui: {
      lastUpdate: null,
      updating: false,
      updateInterval: 5000
    }
  };

  let postIdCounter = 1;
  const generatePostId = () => postIdCounter++;

  // Инициализация модулей
  const { fetchRssFeed, parseRss } = createRssParser();
  const { validateUrl } = createValidation(() => state);

  // Функция рендеринга списка фидов
  const renderFeeds = () => {
    const container = document.getElementById('feeds-list');
    if (!container) return;

    container.innerHTML = state.feeds.length > 0
      ? `<div class="card border-0">
           <div class="card-body">
             <h2 class="card-title h4">${i18n.t('feeds.title')}</h2>
             <ul class="list-group border-0 rounded-0">
               ${state.feeds.map(feed => `
                 <li class="list-group-item border-0 border-end-0">
                   <h3 class="h6 m-0">${feed.title}</h3>
                   <p class="m-0 small text-muted">${feed.description}</p>
                 </li>
               `).join('')}
             </ul>
           </div>
         </div>`
      : `<div class="alert alert-info">${i18n.t('feeds.empty')}</div>`;
  };

  // Функция рендеринга списка постов
  const renderPosts = () => {
    const container = document.getElementById('posts-list');
    if (!container) return;

    container.innerHTML = state.posts.length > 0
      ? `<div class="card border-0">
           <div class="card-body">
             <h2 class="card-title h4">${i18n.t('posts.title')}</h2>
             <ul class="list-group border-0 rounded-0">
               ${state.posts.map(post => `
                 <li class="list-group-item border-0 border-end-0 ${post.read ? 'bg-light' : ''}">
                   <div class="d-flex justify-content-between align-items-start">
                     <a href="${post.link}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="${post.read ? 'fw-normal' : 'fw-bold'}">
                       ${post.title}
                     </a>
                     <button type="button" 
                             class="btn btn-sm btn-outline-primary" 
                             data-post-id="${post.id}"
                             data-bs-toggle="modal" 
                             data-bs-target="#postModal">
                       ${i18n.t('modal.preview')}
                     </button>
                   </div>
                 </li>
               `).join('')}
             </ul>
           </div>
         </div>`
      : `<div class="alert alert-info">${i18n.t('posts.empty')}</div>`;

    // Обработчики для кнопок предпросмотра
    document.querySelectorAll('[data-post-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const postId = e.currentTarget.getAttribute('data-post-id');
        const post = state.posts.find(p => p.id === postId);
        if (post) post.read = true;
      });
    });
  };

  // Настройка обработчиков событий
  const setupEventListeners = () => {
    const form = document.getElementById('rss-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('rss-url');
      const url = urlInput.value.trim();
      
      state.process = { state: 'sending', error: null };
      renderApp();

      try {
        const validation = await validateUrl(url);
        if (!validation.isValid) throw new Error(validation.error);
        if (state.feeds.some(feed => feed.url === url)) throw new Error('errors.duplicate');

        const xmlString = await fetchRssFeed(url);
        const { feed, posts } = await parseRss(xmlString);
        
        state.feeds = [{ ...feed, url }, ...state.feeds];
        state.posts = [
          ...posts.map(post => ({
            ...post,
            id: generatePostId(),
            read: false,
            pubDate: post.pubDate || new Date().toISOString()
          })),
          ...state.posts
        ];
        state.process = { state: 'success', error: null };
        urlInput.value = '';
      } catch (error) {
        state.process = { 
          state: 'error', 
          error: error.message.includes('Network') ? 'errors.network' : error.message
        };
      } finally {
        renderApp();
      }
    });

    const modal = document.getElementById('postModal');
    if (modal) {
      modal.addEventListener('show.bs.modal', (e) => {
        const button = e.relatedTarget;
        const postId = button.getAttribute('data-post-id');
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          document.getElementById('postModalTitle').textContent = post.title;
          document.getElementById('postModalBody').textContent = post.description;
          document.getElementById('postModalLink').href = post.link;
        }
      });
    }
  };

  // Основная функция рендеринга
  const renderApp = () => {
    const app = document.getElementById('app');
    if (!app) return;

    const { process } = state;

    app.innerHTML = `
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-10 col-lg-8 mx-auto my-4">
            <h1 class="display-4 mb-4 text-center">${i18n.t('rssForm.title')}</h1>
            
            <form id="rss-form">
              <div class="row">
                <div class="col">
                  <div class="form-floating">
                    <input type="text" 
                           class="form-control ${process.error ? 'is-invalid' : ''}" 
                           id="rss-url" 
                           placeholder="${i18n.t('rssForm.placeholder')}" 
                           required
                           aria-label="url">
                    <label for="rss-url">${i18n.t('rssForm.label')}</label>
                    <div class="invalid-feedback">${process.error ? i18n.t(process.error) : ''}</div>
                  </div>
                </div>
                <div class="col-auto">
                  <button type="submit" 
                          class="btn btn-primary h-100" 
                          ${process.state === 'sending' ? 'disabled' : ''}>
                    ${i18n.t('rssForm.submit')}
                  </button>
                </div>
              </div>
            </form>

            <div class="feedback">
                ${process.state === 'success' ? `
                    <div class="alert alert-success mt-3">
                        RSS успешно загружен
                </div>
            ` : ''}
      ${process.error ? `
        <div class="alert alert-danger mt-3">
          ${i18n.t(process.error)}
        </div>
      ` : ''}
    </div>

            <div id="feeds-list" class="mt-5"></div>
            <div id="posts-list" class="mt-4"></div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="postModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="postModalTitle"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${i18n.t('modal.close')}"></button>
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

  // Инициализация updater после объявления renderApp
  const { startAutoUpdate } = createUpdater(
    () => state,
    renderApp,
    renderPosts,
    generatePostId
  );

  return { 
    init: () => {
      i18n.changeLanguage('ru').then(() => {
        renderApp();
        if (state.feeds.length > 0) {
          startAutoUpdate();
        }
      });
    }
  };
};

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = createApp();
  app.init();
});