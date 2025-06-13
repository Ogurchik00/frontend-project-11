// src/main.js
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import * as yup from 'yup';
import initView from './view.js';
import resources from './locales/index.js';
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
      input: document.querySelector('input[name="url"]'),
      submit: document.querySelector('button[type="submit"]'),
      feedback: document.querySelector('.feedback'),
      feedsContainer: document.querySelector('.feeds'),
      postsContainer: document.querySelector('.posts'),
      modal: document.getElementById('modal'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalLink: document.querySelector('.full-article'),
    };

    const watchedState = initView(state, elements, i18n);

    const validateUrl = (url, existingUrls) => {
      const schema = yup
        .string()
        .url(i18n.t('errors.invalidUrl'))
        .notOneOf(existingUrls, i18n.t('errors.duplicate'))
        .required();
      return schema.validate(url);
    };

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = elements.input.value.trim();
      const urls = state.feeds.map((feed) => feed.url);

      validateUrl(url, urls)
        .then((validUrl) => loadFeed(validUrl, watchedState, i18n))
        .then(() => {
          watchedState.form.valid = true;
          watchedState.form.error = null;
        })
        .catch((err) => {
          let errorKey = 'errors.invalidUrl';
          if (err.message === i18n.t('errors.duplicate')) {
            errorKey = 'errors.duplicate';
          }
          watchedState.form.valid = false;
          watchedState.form.error = i18n.t(errorKey);
        });
    });

    setInterval(() => updateFeeds(watchedState, i18n), 5000);

    elements.postsContainer.addEventListener('click', (e) => {
      const postId = e.target.dataset.id;
      if (postId) {
        const post = state.posts.find((p) => p.id === postId);
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