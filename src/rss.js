// src/rss.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import parse from './parser.js';

const proxyUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

export const loadFeed = (url, state, i18n) => {
  const { feeds, posts } = state;
  return axios.get(proxyUrl(url))
    .then((res) => {
      const { feed, items } = parse(res.data.contents);
      const newFeed = { ...feed, url };
      state.feeds = [...feeds, newFeed];
      const newPosts = items.map((item) => ({ ...item, id: uuidv4(), feedUrl: url }));
      state.posts = [...newPosts, ...posts];
      state.form = { valid: true, error: null };
    })
    .catch(() => {
      state.form = { valid: false, error: i18n.t('errors.network') };
    });
};

export const updateFeeds = (state, i18n) => {
  const { feeds, posts } = state;
  const requests = feeds.map((feed) =>
    axios.get(proxyUrl(feed.url))
      .then((res) => {
        const { items } = parse(res.data.contents);
        const existingLinks = posts.map((p) => p.link);
        const newPosts = items
          .filter((item) => !existingLinks.includes(item.link))
          .map((item) => ({ ...item, id: uuidv4(), feedUrl: feed.url }));
        if (newPosts.length > 0) {
          state.posts = [...newPosts, ...state.posts];
        }
      })
      .catch(() => {})
  );
  return Promise.all(requests);
};
