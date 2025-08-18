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
export function generatePayload(form) {
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
 * Handles form submission, sends the form data as a JSON payload via a POST request.
 * @param {HTMLFormElement} form - The form element being submitted.
 */
function handleSubmit(form) {
  if (form.dataset.submitting === 'true') return;

  const submit = form.querySelector('button[type="submit"]');
  form.dataset.submitting = 'true';
  submit.disabled = true;

  // Extract form data for API submission
  const messageElement = form.querySelector('#form-message');
  const nameElement = form.querySelector('#form-name');
  const emailElement = form.querySelector('#form-email');
  const categoryElement = form.querySelector('#form-category');

  // Create payload for API
  // Extract username part from email (everything before @)
  let emailValue = '';
  if (emailElement && emailElement.value) {
    // Split the email at @ and take the first part
    emailValue = emailElement.value.split('@')[0] || '';
  }

  const payload = {
    token_size: 0,
    prompt: messageElement ? messageElement.value : '',
    type: 'site-user-form',
    path: nameElement ? nameElement.value : '',
    userid: emailValue, // Only use the part before @ in email
    version: categoryElement ? categoryElement.value : '',
  };

  // API endpoint and key
  const API_URL = '/api/entry-proxy';
  const API_KEY = '8bc7a5a1-04bf-4d0e-8553-97237362cb7e';
  // Send data to API directly without proxy
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      // Create and show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'form-success-message';
      successMessage.textContent = 'Your form has been submitted successfully!';
      form.parentNode.insertBefore(successMessage, form.nextSibling);
      // Reset the form
      form.reset();
      // Remove success message after 5 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 5000);
      // Optional: Scroll to success message
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    .catch((error) => {
      // Create error message in case something fails
      const errorMessage = document.createElement('div');
      errorMessage.className = 'form-error-message';

      // Check if it's a CORS error (this is a common pattern for detecting CORS issues)
      if (error.message.includes('NetworkError') || error.message.includes('CORS')) {
        errorMessage.textContent = 'CORS error: Unable to connect to the server. This is likely a Cross-Origin Resource Sharing (CORS) issue.';
        console.error('CORS error detected:', error);
      } else {
        errorMessage.textContent = 'Something went wrong. Please try again.';
        console.error('Form submission error:', error);
      }

      form.parentNode.insertBefore(errorMessage, form.nextSibling);
      setTimeout(() => {
        errorMessage.remove();
      }, 5000);
    })
    .finally(() => {
      form.dataset.submitting = 'false';
      submit.disabled = false;
    });
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
