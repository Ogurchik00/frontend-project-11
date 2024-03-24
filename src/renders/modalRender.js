const renderOfCurrentModalTopic = (viewedTopic) => {
  const {
    description, title, link, childrenId,
  } = viewedTopic;

  const modalFade = document.querySelector('.modal');
  modalFade.id = childrenId.slice(1);

  const modalTitle = document.querySelector('.modal-title');
  modalTitle.textContent = title;

  const modaBody = document.querySelector('.modal-body');
  modaBody.textContent = description;

  const btnCheck = document.querySelector('[data-check]');

  if (btnCheck.hasAttribute('[data-link^="ht"]')) {
    btnCheck.removeAttribute('[data-link^="ht"]');
  }

  btnCheck.setAttribute('data-link', link);
};

export default renderOfCurrentModalTopic;
