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
 * Creates and shows a success modal with a message and OK button.
 * @param {string} message - The success message to display.
 * @param {Function} onConfirm - Callback function to execute when OK is clicked.
 */
function showSuccessModal(message, onConfirm) {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.setAttribute('role', 'dialog');
  modalOverlay.setAttribute('aria-modal', 'true');
  modalOverlay.setAttribute('aria-labelledby', 'modal-title');

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // Create modal title
  const modalTitle = document.createElement('h2');
  modalTitle.id = 'modal-title';
  modalTitle.className = 'modal-title';
  modalTitle.textContent = 'Success';

  // Create modal message
  const modalMessage = document.createElement('p');
  modalMessage.className = 'modal-message';
  modalMessage.textContent = message;

  // Create OK button
  const okButton = document.createElement('button');
  okButton.className = 'modal-ok-button';
  okButton.textContent = 'OK';
  okButton.type = 'button';

  // Assemble modal
  modalContent.appendChild(modalTitle);
  modalContent.appendChild(modalMessage);
  modalContent.appendChild(okButton);
  modalOverlay.appendChild(modalContent);

  // Add modal to document
  document.body.appendChild(modalOverlay);

  // Focus the OK button for accessibility
  okButton.focus();

  // Handle OK button click
  okButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
    if (onConfirm) onConfirm();
  });

  // Handle ESC key press
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(modalOverlay);
      document.removeEventListener('keydown', handleKeyDown);
      if (onConfirm) onConfirm();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // Handle click outside modal
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
      document.removeEventListener('keydown', handleKeyDown);
      if (onConfirm) onConfirm();
    }
  });
}

/**
 * Validates all required form fields and shows error messages for empty fields.
 * @param {HTMLFormElement} form - The form element to validate.
 * @returns {boolean} - True if all required fields are valid, false otherwise.
 */
function validateForm(form) {
  // Remove any existing error messages
  const existingErrors = form.querySelectorAll('.field-error-message');
  existingErrors.forEach((error) => error.remove());

  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach((field) => {
    const fieldWrapper = field.closest('.field-wrapper');
    let isEmpty = false;

    // Check different field types for emptiness
    if (field.type === 'checkbox' || field.type === 'radio') {
      // For checkboxes and radios, check if any in the group is checked
      const groupName = field.name;
      const groupFields = form.querySelectorAll(`[name="${groupName}"]`);
      const isGroupChecked = Array.from(groupFields).some((f) => f.checked);
      isEmpty = !isGroupChecked;
    } else {
      // For text inputs, textareas, selects
      isEmpty = !field.value || field.value.trim() === '';
    }

    if (isEmpty) {
      isValid = false;

      // Create and show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'field-error-message';
      errorMessage.textContent = 'This field is required';
      errorMessage.setAttribute('role', 'alert');

      // Add error styling to field wrapper
      if (fieldWrapper) {
        fieldWrapper.classList.add('field-error');
        fieldWrapper.appendChild(errorMessage);
      }

      // Add error styling to the field itself
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
    } else {
      // Remove error styling if field is now valid
      if (fieldWrapper) {
        fieldWrapper.classList.remove('field-error');
      }
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
    }
  });

  // If validation failed, scroll to first error field
  if (!isValid) {
    const firstErrorField = form.querySelector('.field-error [required]');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorField.focus();
    }
  }

  return isValid;
}

/**
 * Handles form submission, sends the form data as a JSON payload via a POST request.
 * @param {HTMLFormElement} form - The form element being submitted.
 */
function handleSubmit(form) {
  if (form.dataset.submitting === 'true') return;

  // Validate form before submission
  if (!validateForm(form)) {
    return;
  }

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
      // Show success modal and reset form when OK is clicked
      showSuccessModal('Your form has been submitted successfully!', () => {
        form.reset();
      });
    })
    .catch((error) => {
      // Create error message in case something fails
      const errorMessage = document.createElement('div');
      errorMessage.className = 'form-error-message';

      // Check if it's a CORS error (this is a common pattern for detecting CORS issues)
      if (error.message.includes('NetworkError') || error.message.includes('CORS')) {
        errorMessage.textContent = 'CORS error: Unable to connect to the server. This is likely a Cross-Origin Resource Sharing (CORS) issue.';
        // eslint-disable-next-line no-console
        console.error('CORS error detected:', error);
      } else {
        errorMessage.textContent = 'Something went wrong. Please try again.';
        // eslint-disable-next-line no-console
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

  // Add real-time validation - clear errors when user starts typing
  form.addEventListener('input', (e) => {
    const field = e.target;
    if (field.classList.contains('error')) {
      const fieldWrapper = field.closest('.field-wrapper');
      const errorMessage = fieldWrapper?.querySelector('.field-error-message');

      // Check if field now has value
      let hasValue = false;
      if (field.type === 'checkbox' || field.type === 'radio') {
        const groupFields = form.querySelectorAll(`[name="${field.name}"]`);
        hasValue = Array.from(groupFields).some((f) => f.checked);
      } else {
        hasValue = field.value && field.value.trim() !== '';
      }

      // Clear error state if field now has value
      if (hasValue) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        if (fieldWrapper) {
          fieldWrapper.classList.remove('field-error');
        }
        if (errorMessage) {
          errorMessage.remove();
        }
      }
    }
  });

  // Also handle change events for checkboxes and radio buttons
  form.addEventListener('change', (e) => {
    const field = e.target;
    if ((field.type === 'checkbox' || field.type === 'radio') && field.required) {
      const groupFields = form.querySelectorAll(`[name="${field.name}"]`);
      const isGroupChecked = Array.from(groupFields).some((f) => f.checked);

      // Clear errors for all fields in the group if one is now checked
      if (isGroupChecked) {
        groupFields.forEach((groupField) => {
          const groupWrapper = groupField.closest('.field-wrapper');
          const errorMessage = groupWrapper?.querySelector('.field-error-message');

          groupField.classList.remove('error');
          groupField.removeAttribute('aria-invalid');
          if (groupWrapper) {
            groupWrapper.classList.remove('field-error');
          }
          if (errorMessage) {
            errorMessage.remove();
          }
        });
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      handleSubmit(form);
    } else {
      form.querySelector(':invalid:not(fieldset)')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
