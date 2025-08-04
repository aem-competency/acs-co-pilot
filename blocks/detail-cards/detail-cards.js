const buildDetailCard = (detailElement) => {
  const detailCard = document.createElement('div');
  detailCard.classList.add('detail-card');

  const percentDiv = document.createElement('div');
  percentDiv.classList.add('percent-div');

  const pElements = Array.from(detailElement.querySelectorAll('p'));
  const [percentValue, ...others] = pElements;
  const img = detailElement.querySelector('picture');
  percentDiv.append(img);
  percentValue.classList.add('percent');
  percentDiv.append(percentValue);
  const textElements = others.filter((el) => el.textContent?.trim());

  if (others.length > 2) {
    const subTextEl = textElements.at(0);
    subTextEl.classList.add('sub-text');
    const mainTextEl = textElements.at(1);
    mainTextEl.classList.add('main-text');
  } else {
    const mainTextEl = textElements.at(0);
    mainTextEl.classList.add('main-text');
  }
  detailCard.append(percentDiv, ...textElements);

  return detailCard;
};

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const details = block.children;
  const detailContainer = document.createElement('div');
  detailContainer.classList.add('detail-container');
  const detailCards = Array.from(details).map((element) => buildDetailCard(element));
  detailContainer.append(...detailCards);
  block.replaceChildren();
  block.appendChild(detailContainer);
}
