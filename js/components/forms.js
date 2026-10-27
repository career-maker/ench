// Client-side validation. No backend is configured: unless <form data-endpoint="..."> is set,
// a valid submission is NOT sent and the user is told so honestly.
function initForms() {
  document.querySelectorAll('form[data-validate]').forEach((form) => {
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type=submit]');
    const say = (type, msg) => { status.className = `form-status form-status--${type}`; status.textContent = msg; };

    const check = (el) => {
      const f = el.closest('.field');
      const err = f.querySelector('.field__error');
      let msg = '';
      if (el.required && !el.value.trim()) msg = 'This field is required.';
      else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) msg = 'Enter a valid email address.';
      else if (el.type === 'tel' && el.value && !/^[+\d][\d\s()-]{6,}$/.test(el.value)) msg = 'Enter a valid phone number.';
      else if (el.type === 'number' && el.value && Number(el.value) < 1) msg = 'Enter at least 1 guest.';
      f.classList.toggle('has-error', !!msg);
      el.setAttribute('aria-invalid', String(!!msg));
      err.textContent = msg;
      return !msg;
    };
    const q = new URLSearchParams(location.search).get('service'); // ?service=MICE preselects Service of interest
    if (q && form.elements.service) form.elements.service.value = q;
    form.querySelectorAll('input, select, textarea').forEach((el) => el.addEventListener('blur', () => check(el)));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submit.disabled) return;
      const fields = [...form.querySelectorAll('input, select, textarea')];
      const invalid = fields.filter((el) => !check(el));
      if (invalid.length) {
        say('error', `Please correct ${invalid.length} field${invalid.length > 1 ? 's' : ''} and try again.`);
        invalid[0].focus();
        return;
      }
      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        say('info', 'Thank you. Your details look complete, but this website preview is not yet connected to an email or CRM service, so nothing has been sent. Please email info@enchantiveasia.com or call +66 2028 2867.');
        return;
      }
      submit.disabled = true;
      say('info', 'Sending…');
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say('success', 'Thank you. Your enquiry has been sent and our team will be in touch shortly.');
      } catch {
        say('error', 'Sorry, we could not send your enquiry. Please try again or email info@enchantiveasia.com.');
      } finally {
        submit.disabled = false;
      }
    });
  });
}
