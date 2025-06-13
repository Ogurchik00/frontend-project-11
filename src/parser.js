export default (data) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'application/xml');
  
    const parseError = doc.querySelector('parsererror');
    if (parseError) return null;
  
    const channel = doc.querySelector('channel');
    if (!channel) return null;
  
    const title = channel.querySelector('title')?.textContent ?? '';
    const description = channel.querySelector('description')?.textContent ?? '';
  
    const items = Array.from(doc.querySelectorAll('item')).map((item) => ({
      title: item.querySelector('title')?.textContent ?? '',
      description: item.querySelector('description')?.textContent ?? '',
      link: item.querySelector('link')?.textContent ?? '',
    }));
  
    return { title, description, items };
  };
  