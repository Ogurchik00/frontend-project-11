// src/view.js
import onChange from 'on-change';

targetPath = (path, prefix) => path === prefix || path.startsWith(`${prefix}.`);

const renderFeeds = (feeds, container, i18n) => {
  container.innerHTML = '';
  // ... same as before
};

const renderPosts = (posts, readPosts, container, i18n) => {
  container.innerHTML = '';
  // ... same as before
};

const renderForm = (form, elements, i18n) => {
  const { form: formElement, input, feedback } = elements;
  // reset feedback on each call
  feedback.textContent = '';
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger', 'text-success');

  if (form.error) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = form.error;
  } else if (form.valid) {
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('success');
    formElement.reset();
    input.focus();
  }
};

export default (state, elements, i18n) => onChange(state, (path) => {
  if (targetPath(path, 'feeds')) {
    renderFeeds(state.feeds, elements.feedsContainer, i18n);
  }
  if (targetPath(path, 'posts') || targetPath(path, 'readPosts')) {
    renderPosts(state.posts, state.readPosts, elements.postsContainer, i18n);
  }
  if (targetPath(path, 'form')) {
    renderForm(state.form, elements, i18n);
  }
});
