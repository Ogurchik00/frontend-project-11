// src/rss.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import parse from './parser.js';

const makeProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

export const loadFeed = (url, state, i18n) => {
  const proxyUrl = makeProxyUrl(url);

  return axios.get(proxyUrl)
    .then((response) => {
      const { contents } = response.data;
      const parsed = parse(contents);

      if (!parsed) {
        state.form.valid = false;
        state.form.error = i18n.t('errors.invalidRss');
        throw new Error(i18n.t('errors.invalidRss'));
      }

      const feed = {
        id: uuidv4(),
        url,
        title: parsed.title,
        description: parsed.description,
      };

      const posts = parsed.items.map((item) => ({
        ...item,
        id: uuidv4(),
        feedId: feed.id,
      }));

      state.feeds.unshift(feed);
      state.posts.unshift(...posts);
    })
    .catch((err) => {
      state.form.valid = false;
      if (err.isAxiosError) {
        state.form.error = i18n.t('errors.network');
        throw new Error(i18n.t('errors.network'));
      }
      // parsing error or other
      state.form.error = err.message;
      throw err;
    });
};

export const updateFeeds = (state, i18n) => {
  const requests = state.feeds.map((feed) => {
    const proxyUrl = makeProxyUrl(feed.url);

    return axios.get(proxyUrl)
      .then((response) => {
        const { contents } = response.data;
        const parsed = parse(contents);
        if (!parsed) return;

        const existingLinks = new Set(state.posts.map((post) => post.link));
        const newPosts = parsed.items
          .filter((item) => !existingLinks.has(item.link))
          .map((item) => ({
            ...item,
            id: uuidv4(),
            feedId: feed.id,
          }));

        if (newPosts.length > 0) {
          state.posts.unshift(...newPosts);
        }
      })
      .catch(() => {
        // Игнорируем ошибки при обновлении
      });
  });

  return Promise.all(requests);
};
