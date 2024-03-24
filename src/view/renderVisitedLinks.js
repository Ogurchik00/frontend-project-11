export default (setID) => {
  const currentVisitedID = [...setID.values()][setID.size - 1];
  const currentLink = document.querySelector(`[data-id="${currentVisitedID}"]`);
  currentLink.classList.toggle('fw-bold');
  currentLink.classList.toggle('fw-normal');
};
