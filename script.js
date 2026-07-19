(function () {
  const body = document.body;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list a, .mobile-menu a').forEach(function (link) {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPage) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      mobileMenu.classList.add('open');
      body.classList.add('menu-open');
    });
  }

  if (closeMenu && mobileMenu) {
    closeMenu.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      body.classList.remove('menu-open');
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        body.classList.remove('menu-open');
      });
    });
  }

  const popup = document.getElementById('ctaPopup');
  const popupBackdrop = document.getElementById('ctaPopupBackdrop');
  const closePopup = document.getElementById('closePopup');
  const dismissPopup = document.getElementById('dismissPopup');

  if (!popup || !popupBackdrop) {
    return;
  }

  const hidePopup = function () {
    popup.classList.remove('show');
    popupBackdrop.classList.remove('show');
    body.classList.remove('popup-open');
  };

  const dismissAndHide = function () {
    hidePopup();
  };

  window.setTimeout(function () {
    popup.classList.add('show');
    popupBackdrop.classList.add('show');
    body.classList.add('popup-open');
  }, 1800);

  if (closePopup) {
    closePopup.addEventListener('click', dismissAndHide);
  }

  if (dismissPopup) {
    dismissPopup.addEventListener('click', dismissAndHide);
  }

  popupBackdrop.addEventListener('click', dismissAndHide);

  const revealNodes = document.querySelectorAll('main section');
  if (revealNodes.length > 0) {
    revealNodes.forEach(function (section) {
      section.classList.add('reveal-up');
    });

    const observer = new IntersectionObserver(function (entries, io) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    revealNodes.forEach(function (section) {
      observer.observe(section);
    });
  }

  const isSmallScreen = window.matchMedia('(max-width: 760px)').matches;
  if (isSmallScreen) {
    const bookingForms = document.querySelectorAll('.booking-form');

    bookingForms.forEach(function (form) {
      if (form.dataset.stepMode === 'enabled') {
        return;
      }

      const fields = Array.from(form.querySelectorAll('.form-field'));
      const rows = Array.from(form.querySelectorAll('.form-row, .form-group'));
      const submitButton = form.querySelector('button[type="submit"]');
      const note = form.querySelector('.form-note');

      if (fields.length < 2 || !submitButton) {
        return;
      }

      form.dataset.stepMode = 'enabled';
      form.classList.add('mobile-step-form');

      const controls = document.createElement('div');
      controls.className = 'mobile-step-controls';

      const backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.className = 'secondary-btn step-back';
      backButton.textContent = 'Back';

      const progress = document.createElement('p');
      progress.className = 'step-progress';

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'hero-btn step-next';
      nextButton.textContent = 'Next';

      controls.append(backButton, progress, nextButton);
      submitButton.insertAdjacentElement('beforebegin', controls);

      var currentStep = 0;

      const showStep = function (index) {
        currentStep = Math.max(0, Math.min(index, fields.length - 1));

        rows.forEach(function (row) {
          row.classList.add('step-row-hidden');
          row.classList.remove('step-row-active');
        });

        fields.forEach(function (field, fieldIndex) {
          const row = field.closest('.form-row, .form-group');
          if (fieldIndex === currentStep) {
            field.classList.remove('step-field-hidden');
            field.classList.add('step-field-active');
            if (row) {
              row.classList.add('step-row-active');
              row.classList.remove('step-row-hidden');
            }
          } else {
            field.classList.add('step-field-hidden');
            field.classList.remove('step-field-active');
          }
        });

        const isLastStep = currentStep === fields.length - 1;
        progress.textContent = 'Step ' + (currentStep + 1) + ' of ' + fields.length;
        backButton.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
        nextButton.style.display = isLastStep ? 'none' : 'inline-flex';
        submitButton.style.display = isLastStep ? 'inline-flex' : 'none';

        if (note) {
          note.style.display = isLastStep ? 'block' : 'none';
        }

        const activeControl = fields[currentStep].querySelector('input, select, textarea');
        if (activeControl) {
          window.setTimeout(function () {
            activeControl.focus();
          }, 180);
        }
      };

      const canProceed = function () {
        const field = fields[currentStep];
        if (!field) {
          return false;
        }

        const control = field.querySelector('input, select, textarea');
        if (!control) {
          return true;
        }

        if (!control.required && control.value.trim() === '') {
          return true;
        }

        return control.checkValidity();
      };

      const goNext = function () {
        if (!canProceed()) {
          const control = fields[currentStep].querySelector('input, select, textarea');
          if (control) {
            control.reportValidity();
          }
          return;
        }

        showStep(currentStep + 1);
      };

      backButton.addEventListener('click', function () {
        showStep(currentStep - 1);
      });

      nextButton.addEventListener('click', goNext);

      fields.forEach(function (field, index) {
        const control = field.querySelector('input, select, textarea');
        if (!control) {
          return;
        }

        const autoAdvance = function () {
          if (index !== currentStep) {
            return;
          }

          if (control.value.trim() === '' || !control.checkValidity()) {
            return;
          }

          if (currentStep < fields.length - 1) {
            window.setTimeout(function () {
              if (index === currentStep) {
                showStep(currentStep + 1);
              }
            }, 220);
          }
        };

        if (control.tagName === 'SELECT' || control.type === 'date' || control.type === 'time') {
          control.addEventListener('change', autoAdvance);
        } else {
          control.addEventListener('blur', autoAdvance);
        }
      });

      showStep(0);
    });
  }
})();
