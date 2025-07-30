import {
  decorateIcons,
  fetchPlaceholders,
} from '../../scripts/aem.js';

const searchParams = new URLSearchParams(window.location.search);

/**
 * Finds the next available heading or defaults to H2 heading
 * @param {Element} el Heading element
 * @returns heading element
 */
function findNextHeading(el) {
  let preceedingEl = el.parentElement.previousElement || el.parentElement.parentElement;
  let h = 'H2';
  while (preceedingEl) {
    const lastHeading = [...preceedingEl.querySelectorAll('h1, h2, h3, h4, h5, h6')].pop();
    if (lastHeading) {
      const level = parseInt(lastHeading.nodeName[1], 10);
      h = level < 6 ? `H${level + 1}` : 'H6';
      preceedingEl = false;
    } else {
      preceedingEl = preceedingEl.previousElement || preceedingEl.parentElement;
    }
  }
  return h;
}

/**
 * Response from query index json file
 * @param {URL} source Path to the query index json
 * @returns JSON data
 */
export async function fetchData(source) {
  const response = await fetch(source);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading API response', response);
    return null;
  }

  const json = await response.json();
  if (!json) {
    // eslint-disable-next-line no-console
    console.error('empty API response', source);
    return null;
  }

  return json.data;
}

/**
 * Structuring the results
 * @param {Element} result Each result element
 * @param {String} titleTag Heading tag element
 * @returns Each result element with required data
 */
function renderResult(result, titleTag) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = result.path;
  if (result.title) {
    const title = document.createElement(titleTag);
    title.className = 'search-result-title';
    const link = document.createElement('a');
    link.href = result.path;
    link.textContent = result.title;
    title.append(link);
    a.append(title);
  }
  li.append(a);
  return li;
}

/**
 * Clearing the search results
 * @param {Element} block Search block container
 */
function clearSearchResults(block) {
  const searchResults = block.querySelector('.search-results');
  searchResults.innerHTML = '';
}

/**
 * Clearing the search results from history and search query params
 * @param {Element} block Search block container
 */
function clearSearch(block) {
  clearSearchResults(block);
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = '';
    searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Rendering the obtained results
 * @param {Element} block Search container block element
 * @param {Object} config Placeholders and source details
 * @param {Object} filteredData Result from filter operation
 */
async function renderResults(block, config, filteredData) {
  clearSearchResults(block);
  const searchResults = block.querySelector('.search-results');
  const headingTag = searchResults.dataset.h;

  if (filteredData.length) {
    searchResults.classList.remove('no-results');
    filteredData.forEach((result) => {
      const li = renderResult(result, headingTag);
      searchResults.append(li);
    });
  } else {
    const noResultsMessage = document.createElement('li');
    searchResults.classList.add('no-results');
    noResultsMessage.textContent = config.placeholders.searchNoResults || 'No results found.';
    searchResults.append(noResultsMessage);
  }
}

function compareFound(hit1, hit2) {
  return hit1.minIdx - hit2.minIdx;
}

/**
 * Filtering based on the search input string
 * @param {String} searchTerms Input string with a minimum of 3 character for search
 * @param {JSON} data Json response data from the query indexing
 * @returns List of files matching the search criteria
 */
function filterData(searchTerms, data) {
  const foundInHeader = [];
  const foundInMeta = [];

  data.forEach((result) => {
    let minIdx = -1;

    searchTerms.forEach((term) => {
      const idx = (result.header || result.title).toLowerCase().indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInHeader.push({ minIdx, result });
      return;
    }

    const metaContents = `${result.title} ${result.description} ${result.path.split('/').pop()}`.toLowerCase();
    searchTerms.forEach((term) => {
      const idx = metaContents.indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInMeta.push({ minIdx, result });
    }
  });

  return [
    ...foundInHeader.sort(compareFound),
    ...foundInMeta.sort(compareFound),
  ].map((item) => item.result);
}

/**
 * Search operation for the input query parameters for a minimum of 3 characters
 * @param {Event} e Input for query param
 * @param {Element} block Search container block element
 * @param {Object} config Placeholders and Source configuration
 * @returns Search results
 */
async function handleSearch(e, block, config) {
  const searchValue = e.target.value;
  searchParams.set('q', searchValue);
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = searchParams.toString();
    window.history.replaceState({}, '', url.toString());
  }

  if (searchValue.length < 3) {
    clearSearch(block);
    return;
  }
  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => !!term);

  const data = await fetchData(config.source);
  const filteredData = filterData(searchTerms, data);
  await renderResults(block, config, filteredData);
}

/**
 * Creation of the search results container
 * @param {Element} block Search container element
 * @returns List of files as per the search
 */
function searchResultsContainer(block) {
  const results = document.createElement('ul');
  results.className = 'search-results';
  results.dataset.h = findNextHeading(block);
  return results;
}

/**
 * Creation of input element for search operation
 * @param {Element} block Search container block
 * @param {Object} config Placeholder and Source object
 * @returns Input element for search
 */
function searchInput(block, config) {
  const input = document.createElement('input');
  input.setAttribute('type', 'search');
  input.className = 'search-input';

  const searchPlaceholder = config.placeholders.searchPlaceholder || 'Search...';
  input.placeholder = searchPlaceholder;
  input.setAttribute('aria-label', searchPlaceholder);

  input.addEventListener('input', (e) => {
    handleSearch(e, block, config);
  });

  input.addEventListener('keyup', (e) => { if (e.code === 'Escape') { clearSearch(block); } });

  return input;
}

/**
 * Creation of the search icon as per the svg icon name
 * @returns Search icon
 */
function searchIcon() {
  const icon = document.createElement('span');
  icon.classList.add('icon', 'icon-white-search');
  return icon;
}

/**
 * Creation of the Search bar and search icon
 * @param {Element} block Search container element
 * @param {Object} config Source and placeholders object
 * @returns Search box with icon
 */
function searchBox(block, config) {
  const box = document.createElement('div');
  box.classList.add('search-box');
  box.append(
    searchIcon(),
    searchInput(block, config),
  );

  return box;
}

/**
 * Loads the search container
 * @param {Element} block Search Container element
 */
export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const source = block.querySelector('a[href]') ? block.querySelector('a[href]').href : '/query-index.json';
  block.innerHTML = '';
  block.append(
    searchBox(block, { source, placeholders }),
    searchResultsContainer(block),
  );

  if (searchParams.get('q')) {
    const input = block.querySelector('input');
    input.value = searchParams.get('q');
    input.dispatchEvent(new Event('input'));
  }

  decorateIcons(block);
}
