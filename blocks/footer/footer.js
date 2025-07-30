import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Load footer fragment
  const footerPath = getMetadata('footer')
    ? new URL(getMetadata('footer'), window.location).pathname
    : '/footer';
  const fragment = await loadFragment(footerPath);

  if (!fragment) return;
  block.textContent = '';
  const footer = document.createElement('div');
  footer.append(...fragment.children);
  block.append(footer);
  const defaultContentWrapper = footer.querySelector('.default-content-wrapper');
  const copyrightPara = defaultContentWrapper?.querySelector('p');
  const pictures = [...footer.querySelectorAll('picture')];
  const links = [...footer.querySelectorAll('a')];
  if (pictures.length > 0 && links.length > 0 && defaultContentWrapper) {
    const logoContainer = document.createElement('div');
    logoContainer.className = 'footer-logos';
    logoContainer.style.gridColumn = '1';
    logoContainer.style.display = 'flex';
    logoContainer.style.alignItems = 'center';
    logoContainer.style.gap = '20px';
    pictures.forEach((picture, index) => {
      const link = index < links.length ? links[index] : null;
      if (link) {
        const newLink = document.createElement('a');
        newLink.href = link.href;
        newLink.target = '_blank';
        const pictureClone = picture.cloneNode(true);
        const img = pictureClone.querySelector('img');
        if (img) {
          img.style.maxWidth = '30px';
          img.style.height = 'auto';
        }
        newLink.appendChild(pictureClone);
        logoContainer.appendChild(newLink);
        if (link.textContent.includes('http') || link.textContent.includes('mailto')) {
          link.remove();
        }
      }
      picture.remove();
    });
    defaultContentWrapper.insertBefore(logoContainer, defaultContentWrapper.firstChild);
  }

  const backToTopElement = document.createElement('a');
  backToTopElement.className = 'back-to-top';
  backToTopElement.href = '#';
  backToTopElement.innerHTML = "<span class='back-to-top-icon'>↑</span>";

  // Find the copyright paragraph again or create one if it doesn't exist
  let finalCopyrightPara = copyrightPara;
  if (!finalCopyrightPara) {
    finalCopyrightPara = document.createElement('div');
    finalCopyrightPara.className = 'footer-bottom';
    finalCopyrightPara.innerHTML = "<span class='copyright'>Copyright © Adobe - Powered by Adobe.</span>";
    footer.appendChild(finalCopyrightPara);
  } else {
    finalCopyrightPara.style.gridColumn = '3';
    finalCopyrightPara.style.textAlign = 'right';
    finalCopyrightPara.style.display = 'flex';
    finalCopyrightPara.style.justifyContent = 'flex-end';
    finalCopyrightPara.style.alignItems = 'center';
  }
  finalCopyrightPara.appendChild(backToTopElement);
  backToTopElement.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  // Forcing the window reload for footer links for the support block as
  // # is not reloading the window
  const footerLinks = block.querySelector(':scope .default-content-wrapper > ul');

  footerLinks?.querySelectorAll(':scope > li > a[href*="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.open(link.href, '_blank'); // Open in a new tab
    });
  });
}
