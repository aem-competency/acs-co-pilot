/**
 * Loads and decorates the testimonial-page section
 * @param {Element} block The testimonial-page block element
 */
export default async function decorate(block) {
  // Add classes to the block
  block.classList.add('testimonial-page');
  const wrapper = document.createElement('div');
  wrapper.className = 'testimonial-page-wrapper';
  while (block.firstChild) {
    wrapper.appendChild(block.firstChild);
  }
  block.appendChild(wrapper);
  const testimonialEntries = wrapper.querySelectorAll(':scope > div');
  let testimonialCounter = 1;
  testimonialEntries.forEach((entry) => {
    entry.classList.add('testimonial-entry');
    entry.id = testimonialCounter.toString();
    testimonialCounter += 1;
    const contentDiv = entry.querySelector(':scope > div');
    if (!contentDiv) return;
    const paragraphs = [...contentDiv.querySelectorAll('p')];
    if (paragraphs.length < 3) return;
    let pictureIndex = -1;
    for (let i = 0; i < paragraphs.length; i += 1) {
      if (paragraphs[i].querySelector('picture')) {
        pictureIndex = i;
        break;
      }
    }
    if (pictureIndex === -1) return;
    const leftContainer = document.createElement('div');
    leftContainer.className = 'testimonial-left';
    const imageContainer = document.createElement('div');
    imageContainer.className = 'testimonial-image-wrapper';
    const pictureParagraph = paragraphs[pictureIndex];
    const picture = pictureParagraph.querySelector('picture');
    if (picture) {
      imageContainer.appendChild(picture.cloneNode(true));
    }
    leftContainer.appendChild(imageContainer);
    const nameContainer = document.createElement('div');
    nameContainer.className = 'testimonial-name-container';
    let nameFromBrAdded = false;
    const brTag = pictureParagraph.querySelector('br');
    if (brTag && brTag.nextSibling) {
      const nameParagraph = document.createElement('p');
      nameParagraph.className = 'testimonial-name';
      let currentNode = brTag.nextSibling;
      while (currentNode) {
        nameParagraph.appendChild(currentNode.cloneNode(true));
        currentNode = currentNode.nextSibling;
      }
      nameContainer.appendChild(nameParagraph);
      nameFromBrAdded = true;
    }
    const maxNameParagraphs = nameFromBrAdded ? 1 : 2;
    let nameCount = 0;
    for (let i = pictureIndex + 1; i < paragraphs.length && nameCount < maxNameParagraphs; i += 1) {
      const paragraph = paragraphs[i];
      nameContainer.appendChild(paragraph.cloneNode(true));
      nameCount += 1;
    }
    leftContainer.appendChild(nameContainer);
    const textContainer = document.createElement('div');
    textContainer.className = 'testimonial-content';
    const startIndex = pictureIndex + 1 + nameCount;
    for (let i = startIndex; i < paragraphs.length; i += 1) {
      textContainer.appendChild(paragraphs[i].cloneNode(true));
    }
    contentDiv.innerHTML = '';
    contentDiv.appendChild(leftContainer);
    contentDiv.appendChild(textContainer);
  });

  const { hash } = window.location;
  if (hash) {
    setTimeout(() => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  }
}
