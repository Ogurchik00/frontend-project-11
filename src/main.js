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
      const urls = state.feeds.map((feed) => feed.url);

      const schema = yup.string()
        .url(i18n.t('errors.invalidUrl'))
        .notOneOf(urls, i18n.t('errors.duplicate'))
        .required(i18n.t('errors.required'));

      schema.validate(url)
        .then((validUrl) => {
          loadFeed(validUrl, watchedState, i18n)
            .then(() => {
              watchedState.form.valid = true;
              watchedState.form.error = null;
              elements.feedback.classList.remove('text-danger');
              elements.feedback.classList.add('text-success');
              elements.feedback.textContent = i18n.t('success');
            })
            .catch((err) => {
              watchedState.form.valid = false;
              watchedState.form.error = err.message;
              elements.feedback.classList.remove('text-success');
              elements.feedback.classList.add('text-danger');
              elements.feedback.textContent = err.message;
            });
        })
        .catch((err) => {
          watchedState.form.valid = false;
          watchedState.form.error = err.message;
          elements.feedback.classList.remove('text-success');
          elements.feedback.classList.add('text-danger');
          elements.feedback.textContent = err.message;
        });
    });

    elements.postsContainer.addEventListener('click', (e) => {
      const { id } = e.target.dataset;
      if (id) {
        const post = state.posts.find((p) => p.id === id);
        state.readPosts.add(post.id);
        watchedState.readPosts = new Set(state.readPosts);
        elements.modalTitle.textContent = post.title;
        elements.modalBody.textContent = post.description;
        elements.modalLink.href = post.link;
      }
    });

    // Автообновление фидов каждые 5 секунд
    setInterval(() => updateFeeds(watchedState, i18n), 5000);
  });
};

app();
