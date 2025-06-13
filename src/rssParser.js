import i18n from './i18n';

const createRssParser = () => {
  const fetchRssFeed = async (url) => {
    console.log('Запрос к прокси:', url);
    
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      console.log('Полный URL прокси:', proxyUrl);

      const response = await fetch(proxyUrl);
      console.log('Статус ответа:', response.status);

      if (!response.ok) {
        throw new Error(i18n.t('errors.network'));
      }

      const data = await response.json();
      console.log('Данные от прокси:', data);

      if (!data.contents) {
        throw new Error(i18n.t('errors.invalidResponse'));
      }

      return data.contents;
    } catch (err) {
      console.error('Ошибка при получении RSS:', err);
      throw err;
    }
  };

  const parseRss = (xmlString) => {
    console.log('Полученный XML:', xmlString.substring(0, 100) + '...'); // Логируем только начало
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');

      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        console.error('Ошибка парсера:', parseError.textContent);
        throw new Error(i18n.t('errors.invalidRss'));
      }

      const channel = doc.querySelector('channel');
      if (!channel) throw new Error(i18n.t('errors.noChannel'));

      const feed = {
        title: channel.querySelector('title')?.textContent || i18n.t('feed.noTitle'),
        description: channel.querySelector('description')?.textContent || '',
      };

      const items = doc.querySelectorAll('item');
      const posts = Array.from(items).map(item => ({
        title: item.querySelector('title')?.textContent || i18n.t('post.noTitle'),
        description: item.querySelector('description')?.textContent || '',
        link: item.querySelector('link')?.textContent || '#',
        pubDate: item.querySelector('pubDate')?.textContent || null
      }));

      return { feed, posts };
    } catch (err) {
      console.error('Ошибка парсинга:', err);
      throw new Error(i18n.t('errors.parseError'));
    }
  };

  const checkForUpdates = (existingPosts, newPosts) => {
    const existingLinks = new Set(existingPosts.map(post => post.link));
    return newPosts.filter(post => !existingLinks.has(post.link));
  };

  return { fetchRssFeed, parseRss, checkForUpdates };
};

export default createRssParser;