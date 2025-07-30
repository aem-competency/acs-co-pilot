import { createOptimizedPicture } from '../../scripts/aem.js';

function toggleVisibility(element1, element2, duration) {
  // Initially show element1 and hide element2
  element1.style.display = 'block';
  element2.style.display = 'none';
  setInterval(() => {
    // Toggle visibility every `duration` milliseconds
    const isElement1Visible = element1.style.display === 'block';
    element1.style.display = isElement1Visible ? 'none' : 'block';
    element2.style.display = isElement1Visible ? 'block' : 'none';
  }, duration);
}

export default function decorate(block) {
  const pictureDiv = block.querySelector('picture');
  const img = pictureDiv.querySelector('img');
  const { src, alt } = img;
  const newPicture = createOptimizedPicture(src, alt);
  const textDiv = document.createElement('div');
  textDiv.classList.add('did-you-know-text');
  // Extract text directly from the block's text content
  const blockText = block.textContent.trim();
  textDiv.textContent = blockText || 'Did You Know?'; // Default text if block text content is empty
  // Clear the block content except the picture
  block.innerHTML = '';
  block.append(newPicture, textDiv);
  block.classList.add('optimized-did-you-know');
  // Start toggling visibility between GIF and text
  toggleVisibility(newPicture, textDiv, 5000); // 5-second loop
}
