import { signin } from '../api/signin.js';
import { setToken } from '../utils/token.js';

const ERROR_MESSAGES = {
  invalid: 'Invalid credentials. Please check your username or email and password.',
  unreachable: 'Cannot reach the server. Check your connection and try again.'
};

export function renderLoginView(container, options) {
  container.textContent = '';

  const form = document.createElement('form');
  form.className = 'login-form';
  form.noValidate = true;

  const title = document.createElement('h2');
  title.textContent = 'Sign in';
  form.append(title);

  const identifierLabel = document.createElement('label');
  identifierLabel.textContent = 'Username or email';
  identifierLabel.htmlFor = 'login-identifier';
  form.append(identifierLabel);

  const identifier = document.createElement('input');
  identifier.id = 'login-identifier';
  identifier.name = 'identifier';
  identifier.type = 'text';
  identifier.autocomplete = 'username';
  identifier.required = true;
  form.append(identifier);

  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = 'Password';
  passwordLabel.htmlFor = 'login-password';
  form.append(passwordLabel);

  const password = document.createElement('input');
  password.id = 'login-password';
  password.name = 'password';
  password.type = 'password';
  password.autocomplete = 'current-password';
  password.required = true;
  form.append(password);

  const error = document.createElement('p');
  error.className = 'login-error';
  error.hidden = true;
  error.setAttribute('role', 'alert');
  form.append(error);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Sign in';
  form.append(submit);

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    error.hidden = true;
    submit.disabled = true;

    const identifierValue = identifier.value.trim();
    const passwordValue = password.value;

    if (!identifierValue || !passwordValue) {
      showFormError('Please fill in both fields.');
      submit.disabled = false;
      return;
    }

    const result = await signin(identifierValue, passwordValue);
    if (result.ok) {
      setToken(result.token);
      submit.disabled = false;
      options.onAuthenticated();
    } else {
      const message = ERROR_MESSAGES[result.reason] || 'Sign-in failed. Please try again.';
      showFormError(message);
      submit.disabled = false;
    }
  });

  container.append(form);

  function showFormError(message) {
    error.textContent = message;
    error.hidden = false;
    identifier.focus();
  }
}