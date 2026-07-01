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

// Live parameter panel chart cycling
(() => {
  const line = document.getElementById('recal-line');
  const dot = document.getElementById('recal-dot');
  if (!line || !dot) return;

  const paths = [
    "0,110 30,95 60,100 90,70 120,80 150,50 180,60 210,35 240,45 270,20 300,28",
    "0,105 30,110 60,85 90,90 120,60 150,68 180,40 210,50 240,25 270,32 300,15",
    "0,115 30,98 60,102 90,78 120,55 150,62 180,48 210,30 240,38 270,22 300,10",
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % paths.length;
    line.setAttribute('points', paths[i]);
    const last = paths[i].split(' ').pop().split(',');
    dot.setAttribute('cx', last[0]);
    dot.setAttribute('cy', last[1]);
  }, 3200);
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
