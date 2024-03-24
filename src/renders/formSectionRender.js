const renderFeedbackOfFormSetion = (status, message) => {
  try {
    const input = document.querySelector('#url-input');
    input.value = '';

    const columnForm = document.querySelector('div[data-head-content]');
    const oldP = document.querySelector('.feedback');
    if (oldP) oldP.remove();

    if (input.classList.contains('is-invalid')) input.classList.remove('is-invalid');

    const p = document.createElement('p');
    p.classList.add('feedback', 'm-0', 'position-absolute', 'small');
    p.textContent = message;
    columnForm.append(p);

    if (status) {
      p.classList.add('text-success');
      return;
    }

    p.classList.add('text-danger');
    input.classList.add('is-invalid');
    input.focus();
  } catch (e) {
    console.log(e, 'something wrong in view');
  }
};

const renderBtnOfFormSection = (process) => {
  const button = document.querySelector('.btn-form');
  const input = document.querySelector('#url-input');
  switch (true) {
    case (process === 'loadingRssContent'):
      button.setAttribute('disabled', '');
      input.setAttribute('readonly', '');
      break;
    case (process === 'fillingRssUrl'):
      button.removeAttribute('disabled');
      input.removeAttribute('readonly');
      break;
    default:
      throw new Error(`${process} something wrong in activity Btn`);
  }
};

export { renderFeedbackOfFormSetion, renderBtnOfFormSection };
