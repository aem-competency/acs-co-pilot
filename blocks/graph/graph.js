/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const image = block.querySelector('picture');
  const parent = image.parentNode;
  const grandparent = parent.parentNode;
  grandparent.appendChild(image);
}
