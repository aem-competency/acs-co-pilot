import createField from './form-fields.js';

/**
 * Asynchronously creates a form element based on JSON data retrieved from a URL.
 * @param {string} formHref - The URL containing form field definitions in JSON format.
 * @returns {Promise<HTMLFormElement>} - The generated form element.
 */
async function createForm(formHref) {
  const response = await fetch(new URL(formHref).pathname);
  const { data } = await response.json();
  const form = document.createElement('form');

  (await Promise.all(data.map((fd) => createField(fd, form)))).forEach((field) => {
    if (field) form.append(field);
  });

  return form;
}

/**
 * Generates a payload object containing form data.
 * @param {HTMLFormElement} form - The form element to extract data from.
 * @returns {Object} - The form data as an object.
 */
function generatePayload(form) {
  return [...form.elements].reduce((payload, field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio' && field.checked) {
        payload[field.name] = field.value;
      } else if (field.type === 'checkbox' && field.checked) {
        payload[field.name] = payload[field.name] ? `${payload[field.name]},${field.value}` : field.value;
      } else if (field.type !== 'radio' && field.type !== 'checkbox') {
        payload[field.name] = field.value;
      }
    }
    return payload;
  }, {});
}

/**
 * TO IMPLEMENT
 * Handles form submission, sends the form data as a JSON payload via a POST request.
 * @param {HTMLFormElement} form - The form element being submitted.
 */
async function handleSubmit(form) {
  if (form.dataset.submitting === 'true') return;

  const submit = form.querySelector('button[type="submit"]');
  form.dataset.submitting = 'true';
  submit.disabled = true;

  try {
    const response = await fetch(form.dataset.action, {
      method: 'POST',
      body: JSON.stringify({ data: generatePayload(form) }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(await response.text());

    if (form.dataset.confirmation) window.location.href = form.dataset.confirmation;
  } catch (e) {
    // eslint-disable-next-line no-empty
  } finally {
    form.dataset.submitting = 'false';
    submit.disabled = false;
  }
}

/**
 * Initializes and decorates the form block by fetching form data and handling its submission.
 * @param {HTMLElement} block - The block element containing the form-related links.
 */
export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')].map((a) => a.href);
  const formLink = links.find((link) => link.startsWith(window.location.origin) && link.endsWith('.json'));
  const submitLink = links.find((link) => link !== formLink);
  if (!formLink || !submitLink) return;

  // List of valid sections
  const validSections = ['contact-us', 'feedback', 'feature-request', 'bug-report'];
  const lastPathSegment = window.location.pathname.split('/').filter(Boolean).pop();
  const hash = window.location.hash.substring(1) || (lastPathSegment === 'support' ? 'contact-us' : lastPathSegment);

  if (!validSections.includes(hash) || !block.classList.contains(hash)) {
    block.textContent = '';
    return;
  }

  const form = await createForm(formLink, submitLink);

  // Create and append heading and paragraph elements
  form.prepend(Object.assign(document.createElement('p'), { textContent: block.querySelector('p').textContent }));
  const heading = document.createElement('div');
  heading.className = 'heading-wrapper';
  heading.prepend(Object.assign(document.createElement('h1'), { textContent: block.querySelector(':scope > div > div').firstElementChild.textContent }));
  form.prepend(heading);

  block.replaceChildren(form);

  // Replace input#form-message[type="textarea"] with textarea immediately after form is rendered
  setTimeout(() => {
    const input = form.querySelector('input#form-message[type="textarea"]');
    if (input) {
      const textarea = document.createElement('textarea');
      textarea.id = input.id;
      textarea.name = input.name;
      textarea.placeholder = input.placeholder;
      textarea.setAttribute('aria-labelledby', input.getAttribute('aria-labelledby'));
      textarea.value = input.value;
      textarea.className = input.className;
      input.parentNode.replaceChild(textarea, input);
    }
  }, 0);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      handleSubmit(form);
    } else {
      form.querySelector(':invalid:not(fieldset)')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
