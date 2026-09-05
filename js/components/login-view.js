import { signin } from '../api/signin.js';
import { setToken } from '../utils/token.js';
import { createElement } from '../utils/dom.js';

// Friendly messages for each sign-in failure reason.
const ERROR_MESSAGES = {
  invalid:
    'Invalid credentials. Please check your username or email and password.',
  unreachable: 'Cannot reach the server. Check your connection and try again.',
};

export function renderLoginView(container, options) {
  container.textContent = '';

  const identifier = createElement('input', {
    attributes: {
      id: 'login-identifier',
      name: 'identifier',
      type: 'text',
      autocomplete: 'username',
    },
  });
  identifier.required = true;

  const password = createElement('input', {
    attributes: {
      id: 'login-password',
      name: 'password',
      type: 'password',
      autocomplete: 'current-password',
    },
  });
  password.required = true;

  // Inline error message, hidden until the form needs it.
  const error = createElement('p', {
    className: 'login-error',
    attributes: { role: 'alert' },
  });
  error.hidden = true;

  const submit = createElement('button', {
    attributes: { type: 'submit' },
    text: 'Sign in',
  });

  const form = createElement('form', {
    className: 'login-form',
    attributes: { novalidate: '' },
    children: [
      createElement('h2', { text: 'Sign in' }),
      createElement('label', {
        attributes: { for: 'login-identifier' },
        text: 'Username or email',
      }),
      identifier,
      createElement('label', {
        attributes: { for: 'login-password' },
        text: 'Password',
      }),
      password,
      error,
      submit,
    ],
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;

    const identifierValue = identifier.value.trim();
    const passwordValue = password.value;

    // Require both fields before contacting the server.
    if (!identifierValue || !passwordValue) {
      showFormError('Please fill in both fields.');
      return;
    }

    // Disable the button while the request is in flight so it cannot be sent twice.
    submit.disabled = true;
    const result = await signin(identifierValue, passwordValue);
    submit.disabled = false;

    if (result.ok) {
      setToken(result.token);
      options.onAuthenticated();
    } else {
      showFormError(
        ERROR_MESSAGES[result.reason] || 'Sign-in failed. Please try again.',
      );
    }
  });

  container.append(form);

  // Show an error and put focus back on the first field.
  function showFormError(message) {
    error.textContent = message;
    error.hidden = false;
    identifier.focus();
  }
}
