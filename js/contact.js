document.addEventListener('DOMContentLoaded', () => {
  if (typeof emailjs !== 'undefined') {
    emailjs.init('ziCqBvPC-MPUfeoyY');
  }

  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    form.querySelectorAll('.error-msg').forEach((el) => el.remove());
    form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));

    Array.from(form.elements).forEach((field) => {
      if (field.name && !field.validity.valid) {
        isValid = false;
        field.classList.add('invalid');

        if (field.tagName === 'SELECT' && field.closest('.custom-select-container')) {
          field.closest('.custom-select-container').querySelector('.custom-select-trigger').classList.add('invalid');
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

    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const templateParams = {
      from_first_name: document.getElementById('firstName').value.trim(),
      from_last_name: document.getElementById('lastName').value.trim(),
      from_name: `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`,
      from_email: document.getElementById('email').value.trim(),
      from_company: document.getElementById('company').value.trim() || 'N/A',
      enquiry_type: document.getElementById('enquiryType').value || 'Not specified',
      message: document.getElementById('message').value.trim(),
      to_name: 'Acutaas Healthcare',
    };

    try {
      await emailjs.send('service_6a6sni2', 'template_iytk4bb', templateParams);
      showToast(true);
      form.reset();
      resetCustomSelects();
    } catch (err) {
      console.error('EmailJS error:', err);
      showToast(false, 'Failed to send. Please email us directly at bd@acutaashealthcare.com');
    } finally {
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }
  });
});

function showToast(success, errorMsg = '') {
  const existing = document.getElementById('successToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'successToast';
  toast.className = 'toast-notification';

  if (success) {
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
  } else {
    toast.style.borderLeft = '4px solid #e53935';
    toast.innerHTML = `
      <div class="toast-icon" style="background: #fdecea; color: #e53935;">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      </div>
      <div class="toast-content">
        <span class="toast-title">Failed to Send</span>
        <span class="toast-message">${errorMsg}</span>
      </div>
      <button type="button" class="toast-close" aria-label="Close notification">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>`;
  }

  toast.querySelector('.toast-close').addEventListener('click', () => toast.classList.remove('show'));
  document.body.appendChild(toast);
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

function resetCustomSelects() {
  document.querySelectorAll('.custom-select-container').forEach((container) => {
    const triggerText = container.querySelector('.custom-select-trigger span');
    const defaultOption = container.querySelector('.custom-option[data-value=""]');
    if (defaultOption && triggerText) {
      triggerText.textContent = defaultOption.textContent;
      container.querySelectorAll('.custom-option').forEach((opt) => opt.classList.remove('selected'));
      defaultOption.classList.add('selected');
    }
  });
}
