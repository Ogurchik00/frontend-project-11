// src/parser.js
export default (xmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
  
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      throw new Error('ParseError');
    }
  
    const feedTitle = doc.querySelector('channel > title')?.textContent || '';
    const feedDescription = doc.querySelector('channel > description')?.textContent || '';
  
    const items = [...doc.querySelectorAll('item')].map((item) => ({
      title: item.querySelector('title')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
    }));
  
    return {
      feed: {
        title: feedTitle,
        description: feedDescription,
      },
      items,
    };
  };
  