// src/view.js
import onChange from 'on-change';

const renderFeeds = (feeds, container, i18n) => {
  container.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('feeds');
  cardBody.appendChild(cardTitle);
  card.appendChild(cardBody);

  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach(({ title, description }) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = title;
    const feedDesc = document.createElement('p');
    feedDesc.classList.add('m-0', 'small', 'text-black-50');
    feedDesc.textContent = description;
    item.appendChild(feedTitle);
    item.appendChild(feedDesc);
    list.appendChild(item);
  });

  card.appendChild(list);
  container.appendChild(card);
};

const renderPosts = (posts, readPosts, container, i18n) => {
  container.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('posts');
  cardBody.appendChild(cardTitle);
  card.appendChild(cardBody);

  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach(({ id, title, link }) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.dataset.id = id;
    a.classList.add(readPosts.has(id) ? 'fw-normal' : 'fw-bold');
    a.textContent = title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.dataset.id = id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18n.t('preview');

    item.appendChild(a);
    item.appendChild(button);
    list.appendChild(item);
  });

  card.appendChild(list);
  container.appendChild(card);
};

const renderForm = (form, elements, i18n) => {
  const { form: formEl, input, feedback } = elements;
  // reset state
  input.classList.remove('is-invalid');
  feedback.textContent = '';
  feedback.classList.remove('text-success', 'text-danger');

  if (form.error) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = form.error;
  } else if (form.valid) {
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('success');
    formEl.reset();
    input.focus();
  }
};

export default (state, elements, i18n) => onChange(state, (path) => {
  if (path === 'feeds') {
    renderFeeds(state.feeds, elements.feedsContainer, i18n);
  }
  if (path === 'posts' || path === 'readPosts') {
    renderPosts(state.posts, state.readPosts, elements.postsContainer, i18n);
  }
  if (path === 'form.valid' || path === 'form.error') {
    renderForm(state.form, elements, i18n);
  }
});