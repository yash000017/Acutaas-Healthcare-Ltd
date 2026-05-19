function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

let scrollTicking = false;

function onScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const scrollTop = window.scrollY;
  navbar.classList.toggle('scrolled', scrollTop > 50);

  let onLightSection = false;
  document.querySelectorAll('section').forEach((section) => {
    if (section.id !== 'home' && section.id !== 'values' && section.id !== 'cta') {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom > 80) onLightSection = true;
    }
  });

  navbar.classList.toggle('light-nav', onLightSection && scrollTop > 50);
}

function reveal() {
  document.querySelectorAll('.reveal').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight - 120) {
      el.classList.add('visible');
    }
  });
}

function onScrollFrame() {
  scrollTicking = false;
  onScroll();
  reveal();
}

window.addEventListener(
  'scroll',
  () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollFrame);
    }
  },
  { passive: true }
);

window.addEventListener('load', reveal);

document.addEventListener('DOMContentLoaded', () => {
  onScroll();
  reveal();

  const form = document.getElementById('contactForm');
  document.querySelectorAll('.custom-select-container').forEach((container) => {
    const select = container.querySelector('select');
    const trigger = container.querySelector('.custom-select-trigger');
    const triggerText = trigger.querySelector('span');
    const options = container.querySelectorAll('.custom-option');

    trigger.addEventListener('click', () => container.classList.toggle('open'));

    options.forEach((option) => {
      option.addEventListener('click', () => {
        select.value = option.getAttribute('data-value');
        select.dispatchEvent(new Event('input', { bubbles: true }));
        triggerText.textContent = option.textContent;
        options.forEach((opt) => opt.classList.remove('selected'));
        option.classList.add('selected');
        container.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) container.classList.remove('open');
    });
  });

  if (form) {
    form.addEventListener('input', (e) => {
      if (!e.target.classList.contains('invalid')) return;
      e.target.classList.remove('invalid');
      if (e.target.tagName === 'SELECT' && e.target.parentElement.classList.contains('custom-select-container')) {
        e.target.parentElement.querySelector('.custom-select-trigger').classList.remove('invalid');
      }
      const errorMsg = e.target.parentElement.querySelector('.error-msg');
      if (errorMsg) errorMsg.remove();
    });
  }
});

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  let isValid = true;

  form.querySelectorAll('.error-msg').forEach((el) => el.remove());
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));

  Array.from(form.elements).forEach((field) => {
    if (field.name && !field.validity.valid) {
      isValid = false;
      field.classList.add('invalid');

      if (field.tagName === 'SELECT' && field.parentElement.classList.contains('custom-select-container')) {
        field.parentElement.querySelector('.custom-select-trigger').classList.add('invalid');
      }

      const error = document.createElement('div');
      error.className = 'error-msg';
      if (field.validity.valueMissing) {
        error.textContent = 'This field is required.';
      } else if (field.validity.typeMismatch && field.type === 'email') {
        error.textContent = 'Please enter a valid email address.';
      } else {
        error.textContent = field.validationMessage || 'Invalid input.';
      }
      field.parentElement.appendChild(error);
    }
  });

  if (!isValid) return;

  let toast = document.getElementById('successToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'successToast';
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="toast-icon">
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      </div>
      <div class="toast-content">
        <span class="toast-title">Message Sent!</span>
        <span class="toast-message">Thank you. We will get back to you soon.</span>
      </div>
      <button type="button" class="toast-close" aria-label="Close notification">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>`;
    toast.querySelector('.toast-close').addEventListener('click', () => toast.classList.remove('show'));
    document.body.appendChild(toast);
  }

  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
  form.reset();

  document.querySelectorAll('.custom-select-container').forEach((container) => {
    const triggerText = container.querySelector('.custom-select-trigger span');
    const defaultOption = container.querySelector('.custom-option[data-value=""]');
    if (!defaultOption) return;
    triggerText.textContent = defaultOption.textContent;
    container.querySelectorAll('.custom-option').forEach((opt) => opt.classList.remove('selected'));
    defaultOption.classList.add('selected');
  });
}
