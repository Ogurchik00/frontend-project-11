export const fetchRssFeed = (url) => {
    return new Promise((resolve, reject) => {
      // Используем CORS-прокси для обхода ограничений
      const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
      
      const timeout = setTimeout(() => {
        reject(new Error(i18n.t('errors.timeout')));
      }, 10000); // 10 секунд таймаут
  
      fetch(proxyUrl)
        .then(response => {
          clearTimeout(timeout);
          if (!response.ok) {
            throw new Error(i18n.t('errors.network'));
          }
          return response.json();
        })
        .then(data => {
          if (data.status?.http_code !== 200) {
            throw new Error(i18n.t('errors.invalidResponse'));
          }
          resolve(data.contents);
        })
        .catch(err => {
          clearTimeout(timeout);
          reject(err);
        });
    });
  };
  
  export const parseRss = (xmlString) => {
    return new Promise((resolve) => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');
        
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          throw new Error(i18n.t('errors.invalidRss'));
        }
  
        const channel = doc.querySelector('channel');
        if (!channel) {
          throw new Error(i18n.t('errors.noChannel'));
        }
  
        const feed = {
          title: channel.querySelector('title')?.textContent || i18n.t('feed.noTitle'),
          description: channel.querySelector('description')?.textContent || '',
        };
  
        const items = doc.querySelectorAll('item');
        const posts = Array.from(items).map(item => ({
          title: item.querySelector('title')?.textContent || i18n.t('post.noTitle'),
          description: item.querySelector('description')?.textContent || '',
          link: item.querySelector('link')?.textContent || '#',
        }));
  
        resolve({ feed, posts });
      } catch (err) {
        throw new Error(i18n.t('errors.parseError'));
      }
    });
  };

  export const checkForUpdates = (existingPosts, newPosts) => {
    const existingLinks = new Set(existingPosts.map(post => post.link));
    return newPosts.filter(post => !existingLinks.has(post.link));
  };