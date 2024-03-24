const renderTitleOfViewedTopics = (viewedTopics) => {
  viewedTopics.forEach((viewedTopicId) => {
    console.log(viewedTopicId);
    const currentId = viewedTopicId;
    const currentLi = document.querySelector(`[data-topic-childrenId="${currentId}"]`);
    const a = currentLi.querySelector('a');
    a.classList.remove('fw-bold');
    a.classList.add('fw-normal', 'link-secondary');
  });
};

const buildColumn = (text, i18n) => {
  const column = document.createElement('div');
  switch (text) {
    case 'feeds':
      column.classList.add('col-md-10', 'col-lg-4', 'mx-auto', 'order-0', 'order-lg-1', 'feeds');
      break;
    case 'topics':
      column.classList.add('col-md-10', 'col-lg-8', 'order-1', 'mx-auto', 'posts');
      break;
    default:
      throw new Error('something wrong in colSecondSection');
  }
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTittle = document.createElement('card-tittle');
  cardTittle.classList.add('h4');
  cardTittle.textContent = i18n.t(`content.${text}`);

  cardBody.append(cardTittle);
  card.append(cardBody);
  column.append(card);

  return column;
};

const builFeedItem = (feed, id) => {
  const feedItem = document.createElement('li');
  feedItem.classList.add('list-group-item', 'border-0', 'rounded-0');
  feedItem.setAttribute('data-feed-id', id);

  const feedtitle = document.createElement('h3');
  feedtitle.classList.add('h6', 'm-0');
  feedtitle.textContent = feed.title;

  const feedDescription = document.createElement('p');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedDescription.textContent = feed.description;

  feedItem.append(feedtitle, feedDescription);
  return feedItem;
};

const builTopicItem = (viewedTopics, topic, i18n) => {
  const topicItem = document.createElement('li');
  topicItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  topicItem.setAttribute('data-topic-id', topic.id);
  topicItem.setAttribute('data-topic-childrenId', topic.childrenId);

  const topicTitle = document.createElement('a');
  if (viewedTopics.includes(topic.childrenId)) topicTitle.classList.add('fw-normal', 'link-secondary');
  if (!viewedTopics.includes(topic.childrenId)) topicTitle.classList.add('fw-bold');
  topicTitle.setAttribute('href', topic.link);
  topicTitle.textContent = topic.title;

  const topicModalButton = document.createElement('button');
  topicModalButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  topicModalButton.setAttribute('data-bs-toggle', 'modal');
  topicModalButton.setAttribute('data-bs-target', topic.childrenId);
  topicModalButton.textContent = i18n.t('content.view');

  topicItem.append(topicTitle, topicModalButton);
  return topicItem;
};

const renderRssContent = (watcherLoadingRSSContent, i18n) => {
  try {
    const parentContainer = document.querySelector('main');

    const oldChildrensContainer = document.querySelector('[data-response-section]');
    if (oldChildrensContainer) oldChildrensContainer.remove();

    const childrensContainer = document.createElement('section');
    childrensContainer.classList.add('container-fluid', 'container-xxl', 'p-5');
    childrensContainer.setAttribute('data-response-section', '');

    const row = document.createElement('div');
    row.setAttribute('data-content-container', '');
    row.classList.add('row');

    const feedColumn = buildColumn('feeds', i18n);
    const topicColumn = buildColumn('topics', i18n);

    const listGroupTopics = document.createElement('ul');
    listGroupTopics.classList.add('list-group', 'border-0', 'rounded-0');
    listGroupTopics.setAttribute('data-group-topics', '');

    const listGroupFeeds = document.createElement('ul');
    listGroupFeeds.classList.add('list-group', 'border-0', 'rounded-0');
    listGroupFeeds.setAttribute('data-group-feeds', '');

    const { feeds } = watcherLoadingRSSContent;
    const { topics } = watcherLoadingRSSContent;
    const { viewedTopics } = watcherLoadingRSSContent.uiState;
    feeds.forEach((feed) => {
      const feedId = feed.id;
      const feedItem = builFeedItem(feed, feedId);

      const topicItems = topics.filter(({ id }) => id === feedId)
        .map((currentTopic) => builTopicItem(viewedTopics, currentTopic, i18n));

      listGroupFeeds.append(feedItem);
      topicItems.forEach((currentTopicsList) => listGroupTopics.append(currentTopicsList));
    });

    topicColumn.append(listGroupTopics);
    feedColumn.append(listGroupFeeds);
    row.append(topicColumn, feedColumn);
    childrensContainer.append(row);
    parentContainer.append(childrensContainer);
  } catch (e) {
    console.log(e);
  }
};

export { renderRssContent, renderTitleOfViewedTopics };
