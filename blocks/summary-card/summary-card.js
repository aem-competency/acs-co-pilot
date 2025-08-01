const createSummaryElement = (element) => {
  const summaryDetail = document.createElement('div');
  summaryDetail.classList.add('summary-detail');

  summaryDetail.append(...element.querySelectorAll('p'));
  return summaryDetail;
};

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const [headingEl, ...summaryElements] = block.children;
  const summaryContainer = document.createElement('div');
  summaryContainer.classList.add('summary-cards');

  const summaryListCont = document.createElement('div');
  summaryListCont.classList.add('summary-list-container');

  const summaryDetails = Array.from(summaryElements)
    .map((element) => createSummaryElement(element));
  const heading = document.createElement('h3');
  heading.innerHTML = headingEl.textContent;
  summaryListCont.append(...summaryDetails);
  summaryContainer.append(heading, summaryListCont);

  block.replaceChildren();
  block.appendChild(summaryContainer);
}
