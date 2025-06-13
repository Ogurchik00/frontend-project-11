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
  cardBody.append(cardTitle);
  card.append(cardBody);

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
    item.append(feedTitle, feedDesc);
    list.append(item);
  });

  card.append(list);
  container.append(card);
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
  cardBody.append(cardTitle);
  card.append(cardBody);

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

    item.append(a, button);
    list.append(item);
  });

  card.append(list);
  container.append(card);
};

const renderForm = (form, elements, i18n) => {
  const { input, feedback } = elements;
  if (form.valid) {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('success');
  } else {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = form.error;
  }
};

export default (state, elements, i18n) => onChange(state, (path) => {
  if (path === 'feeds') {
    renderFeeds(state.feeds, elements.feedsContainer, i18n);
  }
  if (path === 'posts' || path === 'readPosts') {
    renderPosts(state.posts, state.readPosts, elements.postsContainer, i18n);
  }
  if (path.startsWith('form')) {
    renderForm(state.form, elements, i18n);
  }
});
