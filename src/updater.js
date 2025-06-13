import createRssParser from './rssParser';

const createUpdater = (getState, renderApp, renderPosts, generatePostId) => {
  const { fetchRssFeed, parseRss, checkForUpdates } = createRssParser();
  let updateInterval = null;

  const checkFeedUpdates = async (feed) => {
    try {
      const xmlString = await fetchRssFeed(feed.url);
      const { posts: newPosts } = await parseRss(xmlString);
      
      const existingLinks = new Set(getState().posts.map(post => post.link));
      const uniquePosts = newPosts.filter(post => !existingLinks.has(post.link));
      
      if (uniquePosts.length > 0) {
        return uniquePosts.map(post => ({
          ...post,
          id: generatePostId(),
          read: false,
          pubDate: post.pubDate || new Date().toISOString()
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error updating feed ${feed.url}:`, error.message);
      return [];
    }
  };

  const updateFeeds = async () => {
    const state = getState();
    if (state.feeds.length === 0 || state.ui.updating) return;
    
    state.ui.updating = true;
    renderApp();
    
    try {
      const updatePromises = state.feeds.map(checkFeedUpdates);
      const updates = await Promise.all(updatePromises);
      const allNewPosts = updates.flat();
      
      if (allNewPosts.length > 0) {
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

  const startAutoUpdate = () => {
    if (updateInterval) return;
    updateFeeds();
    updateInterval = setInterval(updateFeeds, getState().ui.updateInterval);
  };

  const stopAutoUpdate = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  };

  return { updateFeeds, startAutoUpdate, stopAutoUpdate };
};

export default createUpdater;