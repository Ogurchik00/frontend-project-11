export default (elements, posts, modalWindowId) => {
  console.log(posts);
  const post = posts.find(({ id }) => modalWindowId === id.toString());
  const { modal } = elements;

  modal.title.textContent = post.title;
  modal.body.textContent = post.description;
  modal.footer.firstElementChild.href = post.link;
};
