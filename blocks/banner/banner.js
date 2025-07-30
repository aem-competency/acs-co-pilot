import { decorateButtons } from '../../scripts/aem.js';

// Main decorate function
export default function decorate(block) {
  // Extract content from the block
  const titleElement = block.querySelector(':scope > div > div').firstElementChild;
  const descriptionElement = block.querySelector('p:nth-of-type(1)');
  const buttonElement = block.querySelector('p:nth-of-type(2) a');
  const bannerTitle = titleElement?.innerHTML || '';
  const bannerDescription = descriptionElement?.textContent || '';
  const ctaText = buttonElement?.textContent || '';
  const ctaUrl = buttonElement?.getAttribute('href') || '';

  // Create a container element for the entire banner content
  const bannerContent = document.createElement('div');
  bannerContent.className = 'banner-content';

  // Create a text container for the title, description, and button
  const textContainer = document.createElement('div');
  textContainer.className = 'text-container';

  // Create and append the title element
  if (bannerTitle) {
    const header = document.createElement('h1');
    header.innerHTML = bannerTitle;
    textContainer.appendChild(header);
  }

  // Create and append the description paragraph
  if (bannerDescription) {
    const descriptionParagraph = document.createElement('p');
    descriptionParagraph.textContent = bannerDescription;
    textContainer.appendChild(descriptionParagraph);
  }

  // Create and append the call-to-action (CTA) link
  if (ctaText && ctaUrl) {
    const linkContainer = document.createElement('p');
    linkContainer.className = 'banner-link';
    const link = document.createElement('a');
    link.href = ctaUrl;
    link.textContent = ctaText;
    linkContainer.appendChild(link);
    textContainer.appendChild(linkContainer);
  }

  // Append the text container to the banner content
  bannerContent.appendChild(textContainer);

  // Clear the original block content and append the new banner content
  block.innerHTML = '';
  block.appendChild(bannerContent);

  // Call the decorateButtons function to potentially enhance any buttons
  decorateButtons(block);
}
