import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from './i18n';
import { validateUrl } from './validation';
import { fetchRssFeed, parseRss } from './rssParser';

const state = {
  feeds: [],
  posts: [],
  process: {
    state: 'filling', // filling, sending, success, error
    error: null
  }
};

const renderApp = () => {
  const app = document.getElementById('app');
  const { process } = state;

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

const renderFeeds = () => {
  const container = document.getElementById('feeds-list');
  if (!container) return;

  container.innerHTML = state.feeds.length > 0
    ? `<ul class="list-group">${
      state.feeds.map(feed => `
        <li class="list-group-item">
          <h3 class="h6">${feed.title}</h3>
          <p class="mb-1 small text-muted">${feed.description}</p>
        </li>
      `).join('')
    }</ul>`
    : `<div class="alert alert-info">${i18n.t('feeds.empty')}</div>`;
};

const renderPosts = () => {
  const container = document.getElementById('posts-list');
  if (!container) return;

  container.innerHTML = state.posts.length > 0
    ? `<ul class="list-group">${
      state.posts.map(post => `
        <li class="list-group-item">
          <a href="${post.link}" target="_blank" rel="noopener noreferrer">
            ${post.title}
          </a>
          <p class="mb-1 small">${post.description}</p>
        </li>
      `).join('')
    }</ul>`
    : `<div class="alert alert-info">${i18n.t('posts.empty')}</div>`;
};

const setupEventListeners = () => {
  document.getElementById('rss-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('rss-url').value.trim();
    
    state.process = { state: 'sending', error: null };
    renderApp();

    validateUrl(url)
      .then(({ isValid, error }) => {
        if (!isValid) {
          throw new Error(error);
        }
        return fetchRssFeed(url);
      })
      .then(parseRss)
      .then(({ feed, posts }) => {
        state.feeds = [...state.feeds, feed];
        state.posts = [...posts, ...state.posts];
        state.process = { state: 'success', error: null };
      })
      .catch((err) => {
        state.process = { 
          state: 'error', 
          error: err.message.includes('Network Error') 
            ? 'errors.network' 
            : 'errors.invalidRss'
        };
      })
      .finally(() => {
        renderApp();
      });
  });

  document.getElementById('lang-en')?.addEventListener('click', () => {
    i18n.changeLanguage('en').then(renderApp);
  });

  document.getElementById('lang-ru')?.addEventListener('click', () => {
    i18n.changeLanguage('ru').then(renderApp);
  });
};

// Инициализация приложения
i18n.init().then(renderApp);