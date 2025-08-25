import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Closing all the navigation when we press the Escape key
 * @param {Event} e Keyboard event
 */
function closeOnEscape(e) {
  if (e.code !== 'Escape') return;

  const nav = document.getElementById('nav');
  const navSections = nav.querySelector('.nav-sections');
  const expandedSection = navSections.querySelector('[aria-expanded="true"]');

  if (expandedSection && isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(navSections);
    expandedSection.focus();
  } else if (!isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, navSections);
    nav.querySelector('button').focus();
  }
}

/**
 * Toggling of the Navigation bar when the focus is lost for Desktop
 * @param {Event} e The Navigation section toggles to false when the focus is lost
 */
function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(nav.querySelector('.nav-sections'), false);
  }
}

/**
 * The toggling of the navigation menu is handled with Space and Enter keyboard actions
 * @param {Event} e Keyboard event
 */
function openOnKeydown(e) {
  const focused = document.activeElement;
  if (focused.classList.contains('nav-drop') && ['Enter', 'Space'].includes(e.code)) {
    const expanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', !expanded);
  }
}

/**
 * Keydown keyboard event listener
 */
function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li')
    .forEach((section) => section.setAttribute('aria-expanded', expanded));
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', !expanded);
  toggleAllNavSections(navSections, !expanded && !isDesktop.matches);
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  navSections.querySelectorAll('.nav-drop').forEach((drop) => {
    if (isDesktop.matches) {
      drop.setAttribute('tabindex', drop.hasAttribute('tabindex') ? '' : '0');
      drop.addEventListener('focus', focusNavSection);
    } else {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    }
  });

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Wraps images followed by links within a matching <a> tag.
 * @param {Element} container The container element
 */
function wrapImgsInLinks(container) {
  container.querySelectorAll('picture').forEach((pic) => {
    const link = pic.nextElementSibling;
    if (link?.tagName === 'A' && link.href) {
      link.innerHTML = pic.outerHTML;
      pic.replaceWith(link);
    }
  });
}
function increaseNavFontSize(nav) {
  const navItems = nav.querySelectorAll('.nav-sections .default-content-wrapper > ul > li > a');
  navItems.forEach((link) => {
    link.style.fontSize = '20px';
    link.style.fontWeight = 'none';
  });
  const dropdownItems = nav.querySelectorAll('.nav-sections .default-content-wrapper > ul > li > ul > li > a');
  dropdownItems.forEach((link) => {
    link.style.fontSize = '22px';
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navPath = getMetadata('nav') ? new URL(getMetadata('nav'), window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  if (!fragment) return;

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.append(...fragment.children);
  setTimeout(() => increaseNavFontSize(nav), 100);

  ['brand', 'tools', 'sections'].forEach((c, i) => {
    const section = nav.children[i];
    if (section) {
      section.classList.add(`nav-${c}`);
      // Hide search component in the tools section
      if (c === 'tools') {
        const searchComponent = section.querySelector('.search');
        if (searchComponent) {
          searchComponent.style.display = 'none';
        }
      }
    }
  });

  const navBrand = nav.querySelector('.nav-brand .default-content-wrapper > p > a');
  if (navBrand) wrapImgsInLinks(navBrand.closest('.nav-brand'));

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li')
      .forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('mouseenter', () => {
          if (isDesktop.matches) {
            toggleAllNavSections(navSections, false);
            if (navSection.classList.contains('nav-drop')) {
              navSection.setAttribute('aria-expanded', 'true');
            }
          }
        });
        navSection.addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            if (navSection.getAttribute('aria-expanded') === 'true') {
              navSection.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
