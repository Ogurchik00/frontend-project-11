const isNewRSSResource = (resources, url) => {
  const findedBrotherURL = resources.filter(({ value }) => value === url);
  return findedBrotherURL.length !== 1;
};

export default isNewRSSResource;
