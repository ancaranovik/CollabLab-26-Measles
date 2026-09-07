(() => {
  'use strict';

  // Study-specific explanations paraphrase the existing article and canonical
  // paper (Methods pp. 3–4, Introduction p. 2, Limitations p. 11).
  const TERM_NOTES = Object.freeze({
    'herd-immunity': 'Protection at population level through high vaccination coverage. The paper notes that high overall coverage can still hide gaps in particular groups.',
    'retrospective-study': 'A study looking back at existing records. Here, researchers reviewed medical records rather than assigning treatments in a trial.',
    'igm': 'One of the two laboratory tests used to confirm measles in this study. Cases had fever and rash and a positive IgM or PCR result.',
    'pcr': 'One of the two laboratory tests used to confirm measles in this study. Cases had fever and rash and a positive PCR or IgM result.',
    'chi-square': 'The statistical test used here to compare group proportions and assess associations between categorical characteristics.',
    'pearson-correlation': 'The measure used here to examine the relationship between provincial population density and the rate of cases sent to this hospital.',
    'logistic-regression': 'The analysis used to assess associations with hospital-related infection while accounting for vaccination status, chronic disease and age together.',
    'hospital-related-source': 'A source-of-infection category based on symptom timing relative to hospital admission and discharge. It is not a clinical outcome.',
    'chronic-disease': 'A chronic disease identified in a child’s electronic medical record, as defined in this study.',
    'absolute-infection-risk': 'The probability of infection. This hospital study cannot estimate it without community-wide data.',
    'vaccine-effectiveness': 'How well vaccination protects against infection. The reported proportions among hospitalized cases do not directly estimate vaccine effectiveness.'
  });

  const note = document.createElement('div');
  note.id = 'editorial-term-note';
  note.className = 'term-note';
  note.setAttribute('role', 'tooltip');
  note.hidden = true;
  document.body.append(note);
  let activeTerm = null;
  let closeTimer = null;
  let hideTimer = null;

  function positionNote() {
    if (!activeTerm) return;
    const rect = activeTerm.getBoundingClientRect();
    const gap = 10;
    const margin = 14;
    const viewport = window.visualViewport;
    const leftEdge = (viewport?.offsetLeft || 0) + margin;
    const topEdge = (viewport?.offsetTop || 0) + margin;
    const rightEdge = leftEdge + (viewport?.width || innerWidth) - margin * 2;
    const bottomEdge = topEdge + (viewport?.height || innerHeight) - margin * 2;
    note.style.maxWidth = `${Math.min(300, rightEdge - leftEdge)}px`;
    const width = note.offsetWidth;
    const height = note.offsetHeight;
    const below = rect.bottom + gap;
    const above = rect.top - gap - height;
    const top = above >= topEdge ? above : below + height <= bottomEdge ? below : Math.max(topEdge, bottomEdge - height);
    note.style.left = `${Math.max(leftEdge, Math.min(rect.left, rightEdge - width))}px`;
    note.style.top = `${top}px`;
  }

  function hideNote() {
    clearTimeout(closeTimer);
    activeTerm?.removeAttribute('aria-describedby');
    activeTerm?.setAttribute('aria-expanded', 'false');
    activeTerm = null;
    note.classList.remove('is-visible');
    hideTimer = setTimeout(() => { note.hidden = true; }, 140);
  }

  function showNote(term) {
    clearTimeout(closeTimer);
    clearTimeout(hideTimer);
    if (activeTerm && activeTerm !== term) {
      activeTerm.removeAttribute('aria-describedby');
      activeTerm.setAttribute('aria-expanded', 'false');
    }
    activeTerm = term;
    note.textContent = TERM_NOTES[term.dataset.term];
    note.hidden = false;
    term.setAttribute('aria-describedby', note.id);
    term.setAttribute('aria-expanded', 'true');
    positionNote();
    requestAnimationFrame(() => { if (activeTerm) note.classList.add('is-visible'); });
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (document.activeElement !== activeTerm && !note.matches(':hover')) hideNote();
    }, 170);
  }

  document.querySelectorAll('.technical-term[data-term]').forEach((term) => {
    if (!TERM_NOTES[term.dataset.term]) return;
    term.tabIndex = 0;
    term.setAttribute('role', 'button');
    term.setAttribute('aria-expanded', 'false');
    term.setAttribute('aria-controls', note.id);
    term.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') showNote(term); });
    term.addEventListener('pointerleave', scheduleClose);
    term.addEventListener('focus', () => showNote(term));
    term.addEventListener('blur', scheduleClose);
    term.addEventListener('click', () => showNote(term));
    term.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (activeTerm === term) hideNote(); else showNote(term);
      }
    });
  });
  note.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  note.addEventListener('pointerleave', scheduleClose);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideNote(); });
  document.addEventListener('pointerdown', event => {
    if (activeTerm && !activeTerm.contains(event.target) && !note.contains(event.target)) hideNote();
  });
  // Keep keyboard notes anchored when focus scrolls a term into view.
  // This viewport handling is independent of story animation.
  window.addEventListener('scroll', () => {
    if (activeTerm && document.activeElement === activeTerm) positionNote();
    else if (activeTerm) hideNote();
  }, { passive: true });
  window.addEventListener('resize', hideNote, { passive: true });
  window.visualViewport?.addEventListener('resize', hideNote, { passive: true });
})();
