import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import * as yup from 'yup';
import initView from './view.js';
import resources from './locales/index.js';
import parse from './parser.js';
import { loadFeed, updateFeeds } from './rss.js';

const state = {
  feeds: [],
  posts: [],
  readPosts: new Set(),
  form: {
    valid: true,
    error: null,
  },
};

const app = () => {
  const i18n = i18next.createInstance();

  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const elements = {
      form: document.querySelector('form'),
      input: document.querySelector('input'),
      feedback: document.querySelector('.feedback'),
      feedsContainer: document.querySelector('.feeds'),
      postsContainer: document.querySelector('.posts'),
      modal: document.getElementById('modal'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalLink: document.querySelector('.full-article'),
    };

    const watchedState = initView(state, elements, i18n);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = elements.input.value.trim();
      const urls = state.feeds.map((f) => f.url);

      const schema = yup.string().url(i18n.t('errors.invalidUrl')).notOneOf(urls, i18n.t('errors.duplicate')).required();

      schema.validate(url)
        .then((validUrl) => loadFeed(validUrl, watchedState, i18n))
        .catch((err) => {
          watchedState.form.valid = false;
          watchedState.form.error = err.message;
        });
    });

    setInterval(() => updateFeeds(watchedState, i18n), 5000);

    elements.postsContainer.addEventListener('click', (e) => {
      if (e.target.dataset.id) {
        const post = state.posts.find((p) => p.id === e.target.dataset.id);
        state.readPosts.add(post.id);
        watchedState.readPosts = new Set(state.readPosts);
        elements.modalTitle.textContent = post.title;
        elements.modalBody.textContent = post.description;
        elements.modalLink.href = post.link;
      }
    });
  });
};

app();
