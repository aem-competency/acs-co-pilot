/**
 * Function to add button container and button classes
 * @param {HTMLElement} block - The block element to process
 */
function addButtonContainerAndClasses(block) {
  // Find all paragraphs in the block
  const paragraphs = block.querySelectorAll('p');

  paragraphs.forEach((paragraph) => {
    // Check if paragraph contains links with title attributes
    const links = paragraph.querySelectorAll('a[title]');

    // Also check for links without title attributes as they might still need to be styled
    const allLinks = paragraph.querySelectorAll('a');

    // Process if there are 2 or more links in the paragraph
    if (links.length >= 2 || allLinks.length >= 2) {
      // Add button class to all links
      allLinks.forEach((link) => {
        link.classList.add('button');
      });

      // Create button container div
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');

      // Insert the button container before the paragraph
      paragraph.parentNode.insertBefore(buttonContainer, paragraph);

      // Move the paragraph inside the button container
      buttonContainer.appendChild(paragraph);
    }
  });
}

/**
 * Decorates the summary block
 * @param {HTMLElement} block - The block element to decorate
 */
export default function decorate(block) {
  // Add button container and button classes
  addButtonContainerAndClasses(block);
}
