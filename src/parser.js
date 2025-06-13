// src/parser.js
export default (xmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) return null;
  
    const feedTitle = doc.querySelector('channel > title')?.textContent;
    const feedDescription = doc.querySelector('channel > description')?.textContent;
  
    const items = [...doc.querySelectorAll('item')].map((itemEl) => ({
      title: itemEl.querySelector('title')?.textContent,
      description: itemEl.querySelector('description')?.textContent,
      link: itemEl.querySelector('link')?.textContent,
    }));
  
    return {
      title: feedTitle,
      description: feedDescription,
      items,
    };
  };