// Request-access modal
(() => {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const planLabel = document.getElementById('modal-plan-label');
  const planInput = document.getElementById('modal-plan-input');
  const form = document.getElementById('lead-form');
  const formWrap = document.getElementById('modal-form-wrap');
  const successWrap = document.getElementById('modal-success');
  const errorEl = document.getElementById('modal-error');
  const submitBtn = document.getElementById('modal-submit');

  function openModal(plan) {
    form.reset();
    planInput.value = plan;
    planLabel.textContent = plan === 'General' ? 'Request early access' : `Request early access — ${plan}`;
    formWrap.hidden = false;
    successWrap.hidden = true;
    errorEl.hidden = true;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-modal]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(el.getAttribute('data-plan') || 'General');
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }
      formWrap.hidden = true;
      successWrap.hidden = false;
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
})();

// Scroll-reveal for section content
(() => {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
})();
