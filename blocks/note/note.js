import { decorateButtons } from '../../scripts/aem.js';

export default function decorate(block) {
  // Create a container for the note content
  const noteContent = document.createElement('div');
  noteContent.className = 'note-content';
  // Create a container for the icon
  const iconContainer = document.createElement('div');
  iconContainer.className = 'icon-container';
  // Find and append the picture element if it exists
  const picture = block.querySelector('picture');
  if (picture) {
    picture.className = 'note-icon';
    iconContainer.appendChild(picture);
  }
  noteContent.appendChild(iconContainer);
  // Create a container for the text
  const textContainer = document.createElement('div');
  textContainer.className = 'text-container';
  // Create a paragraph element and set its content
  const paragraph = document.createElement('p');
  paragraph.innerHTML = block.innerHTML.trim();
  textContainer.appendChild(paragraph);
  // Append the text container to the note content
  noteContent.appendChild(textContainer);
  // Clear the block's original content and append the new note content
  block.innerHTML = '';
  block.appendChild(noteContent);
  // Decorate buttons within the block
  decorateButtons(block);
}
