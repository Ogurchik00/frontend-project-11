import { fetchRssFeed, parseRss } from './rssParser';
import { state, renderApp, renderPosts } from './main';
import i18n from './i18n';

let updateInterval = null;

// Проверяет новые посты в RSS-ленте
const checkFeedUpdates = async (feed) => {
  try {
    const xmlString = await fetchRssFeed(feed.url);
    const { posts: newPosts } = await parseRss(xmlString);
    
    // Фильтруем только новые посты
    const existingLinks = new Set(state.posts.map(post => post.link));
    const uniquePosts = newPosts.filter(post => !existingLinks.has(post.link));
    
    if (uniquePosts.length > 0) {
      // Добавляем дату публикации для новых постов
      const postsWithDate = uniquePosts.map(post => ({
        ...post,
        pubDate: new Date().toISOString()
      }));
      
      return postsWithDate;
    }
    return [];
  } catch (error) {
    console.error(`Error updating feed ${feed.url}:`, error.message);
    return [];
  }
};

// Основная функция обновления всех лент
export const updateFeeds = async () => {
  if (state.feeds.length === 0 || state.ui.updating) return;
  
  state.ui.updating = true;
  renderApp();
  
  try {
    // Проверяем все ленты параллельно
    const updatePromises = state.feeds.map(checkFeedUpdates);
    const updates = await Promise.all(updatePromises);
    const allNewPosts = updates.flat();
    
    if (allNewPosts.length > 0) {
      // Добавляем новые посты в начало списка
      state.posts = [...allNewPosts, ...state.posts];
      state.ui.lastUpdate = new Date().toLocaleTimeString();
      renderPosts();
    }
  } catch (error) {
    console.error('Update error:', error.message);
  } finally {
    state.ui.updating = false;
    renderApp();
  }
};

// Запускаем автоматическое обновление
export const startAutoUpdate = () => {
  if (updateInterval) return;
  
  // Первое обновление сразу
  updateFeeds();
  
  // Затем каждые 5 секунд
  updateInterval = setInterval(() => {
    updateFeeds();
  }, state.ui.updateInterval);
};

// Останавливаем автоматическое обновление
export const stopAutoUpdate = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
};

// Очищаем интервал при завершении
window.addEventListener('beforeunload', () => {
  stopAutoUpdate();
});