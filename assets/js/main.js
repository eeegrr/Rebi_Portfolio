/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close');
/* Menu Show */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

/* Menu Hidden */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav-link');

const linkAction = () => {
    const navMenu = document.getElementById('nav-menu');
    // When we click on each nav-link, we remove the show-menu class
    navMenu.classList.remove('show-menu');
}
navLink.forEach(n => n.addEventListener('click', linkAction));

/*=============== ADD BLUR HEADER ===============*/
const blurHeader = () => {
    const header = document.getElementById('header');
    this.scrollY >= 50 ? header.classList.add('blur-header') : header.classList.remove('blur-header');
}
window.addEventListener('scroll', blurHeader);

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
    const scrollUp = document.getElementById('scroll-up')
    this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
        : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () => {
    const scrollDown = window.scrollY

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 58,
            sectionId = current.getAttribute('id'),
            sectionsClass = document.querySelector('.nav-menu a[href*=' + sectionId + ']')

        if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
            sectionsClass.classList.add('active-link')
        } else {
            sectionsClass.classList.remove('active-link')
        }
    })
}

window.addEventListener('scroll', scrollActive)


/*=============== CHARACTER IMAGE ANIMATION ===============*/
document.addEventListener('DOMContentLoaded', () => {
    const imgs = document.querySelectorAll('.me-img');

    imgs.forEach(img => {
        const defaultSrc = img.getAttribute('src');
        const hoverSrc = img.getAttribute('data-hover');
        if (!hoverSrc) return;

        // Preload the hover image to avoid flicker & catch missing path
        const pre = new Image();
        pre.src = hoverSrc;
        pre.onerror = () => console.warn('Hover image not found:', hoverSrc);

        // Helpful: log if the default path is wrong too
        img.addEventListener('error', () => {
            console.warn('Image failed to load:', img.src);
        });

        const toHover = () => (img.src = hoverSrc);
        const toDefault = () => (img.src = defaultSrc);

        // Works for mouse & pen
        img.addEventListener('pointerenter', toHover);
        img.addEventListener('pointerleave', toDefault);

        // Keyboard accessibility (tab focus)
        img.tabIndex = 0;
        img.addEventListener('focus', toHover);
        img.addEventListener('blur', toDefault);
    });
});

/*=============== PRELOADER ===============*/
var loader = document.getElementById("preloader");
var minDisplayTime = 3000; // 3 seconds
var startTime = Date.now();

if (!sessionStorage.getItem("preloaderShown")) {
    window.addEventListener("load", function () {
        var elapsedTime = Date.now() - startTime;
        var remainingTime = minDisplayTime - elapsedTime;

        setTimeout(function () {
            loader.style.display = "none";
            sessionStorage.setItem("preloaderShown", "true");
        }, remainingTime > 0 ? remainingTime : 0);
    });
} else {
    loader.style.display = "none";
}

/*=============== SEND MESSAGE ===============*/
(function () {
    'use strict';

    // ---------- Query DOM ----------
    const form = document.querySelector('.contact-form');
    if (!form) {
        console.warn('contact.js: .contact-form not found');
        return;
    }

    const fullName = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    // Success panel element (should exist in markup; if not, we create one)
    let successPanel = document.getElementById('contact-success');

    // If user didn't include a success panel, create a simple one (transparent overlay style)
    if (!successPanel) {
        successPanel = document.createElement('div');
        successPanel.id = 'contact-success';
        successPanel.setAttribute('aria-hidden', 'true');
        successPanel.style.display = 'none';
        // inner content will be wrapped into .success-card by the setup below
        successPanel.innerHTML = `
      <h3>Thanks — message sent!</h3>
      <p>I'll get back to you as soon as possible.</p>
      <button id="success-close" class="pop-btn" type="button">Close</button>
    `;
        document.body.appendChild(successPanel);
    }

    // ensure there is a close button and an inner success-card wrapper for styling
    let successClose = successPanel.querySelector('#success-close') || null;
    if (!successPanel.querySelector('.success-card')) {
        const inner = document.createElement('div');
        inner.className = 'success-card';
        // move existing children into the inner card
        while (successPanel.firstChild) inner.appendChild(successPanel.firstChild);
        successPanel.appendChild(inner);
    }
    successClose = successPanel.querySelector('#success-close');

    // ---------- Helpers: show/hide errors ----------
    function showErrorFor(fieldEl, msg) {
        if (!fieldEl) return;
        const container = fieldEl.closest('.field');
        if (!container) return;
        const errorTxt = container.querySelector('.error-txt');
        if (errorTxt) errorTxt.textContent = msg;
        container.classList.add('error');
        fieldEl.setAttribute('aria-invalid', 'true');
    }

    function hideErrorFor(fieldEl) {
        if (!fieldEl) return;
        const container = fieldEl.closest('.field');
        if (!container) return;
        container.classList.remove('error');
        fieldEl.removeAttribute('aria-invalid');
    }

    function isValidEmail(v) {
        // reasonable client-side check
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
    }

    function validateField(fieldEl) {
        const val = (fieldEl.value || '').trim();

        if (fieldEl === email) {
            if (val === '') {
                showErrorFor(fieldEl, "Email address can't be blank");
                return false;
            }
            if (!isValidEmail(val)) {
                showErrorFor(fieldEl, 'Please enter a valid email address');
                return false;
            }
            hideErrorFor(fieldEl);
            return true;
        }

        // name & message
        if (val === '') {
            const defaultMsg = fieldEl.tagName.toLowerCase() === 'textarea'
                ? "Message can't be blank"
                : "Name can't be blank";
            showErrorFor(fieldEl, defaultMsg);
            return false;
        }

        hideErrorFor(fieldEl);
        return true;
    }

    function validateAll() {
        const a = validateField(fullName);
        const b = validateField(email);
        const c = validateField(message);
        return a && b && c;
    }

    // ---------- Overlay show/hide (exported to window) ----------
    function showContactSuccess() {
        successPanel.classList.add('open');
        successPanel.setAttribute('aria-hidden', 'false');
        successPanel.style.display = 'flex';
        const btn = successPanel.querySelector('#success-close');
        if (btn) btn.focus();
        document.documentElement.style.overflow = 'hidden';
    }

    function hideContactSuccess() {
        successPanel.classList.remove('open');
        successPanel.setAttribute('aria-hidden', 'true');
        successPanel.style.display = 'none';
        document.documentElement.style.overflow = '';
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.focus();
    }

    window.showContactSuccess = showContactSuccess;
    window.hideContactSuccess = hideContactSuccess;

    // close handlers
    if (successClose) {
        successClose.addEventListener('click', () => {
            hideContactSuccess();
            form.reset();
        });
    }

    // click overlay outside card to close
    successPanel.addEventListener('click', (evt) => {
        const card = successPanel.querySelector('.success-card');
        if (card && !card.contains(evt.target)) {
            hideContactSuccess();
        }
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Escape' || e.key === 'Esc') && successPanel.classList.contains('open')) {
            hideContactSuccess();
        }
    });

    // ---------- Utility: derive FormSubmit AJAX endpoint ----------
    function ajaxUrlFor(formEl) {
        try {
            const action = (formEl.getAttribute('action') || '').trim();
            if (!action) return null;
            if (action.includes('/ajax/')) return action;
            const url = new URL(action);
            return `${url.protocol}//${url.host}/ajax${url.pathname}`;
        } catch (err) {
            if (typeof formEl.action === 'string' && formEl.action.includes('/')) {
                return formEl.action.replace('/submit', '/ajax/submit');
            }
            console.warn('contact.js: cannot compute ajaxUrlFor', err);
            return null;
        }
    }

    // ---------- Live validation listeners (attach once) ----------
    [fullName, email, message].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });

    // ---------- Submit handler (AJAX to FormSubmit) ----------
    let sending = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (sending) return;
        const ok = validateAll();
        if (!ok) {
            const firstInvalid = form.querySelector('.field.error .form-input');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const fd = new FormData(form);
        const ajaxUrl = ajaxUrlFor(form);
        if (!ajaxUrl) {
            form.submit();
            return;
        }

        sending = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-disabled', 'true');
        }

        try {
            const response = await fetch(ajaxUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: fd,
                credentials: 'omit'
            });

            if (response.ok) {
                let json = null;
                try { json = await response.json(); } catch (err) { json = null; }

                if (response.status === 200 && (json === null || json.success === true || json.message)) {
                    showContactSuccess();
                    form.reset();
                } else {
                    console.warn('contact.js: unexpected FormSubmit response', json);
                    const card = successPanel.querySelector('.success-card');
                    if (card) {
                        card.querySelector('h3').textContent = 'Thanks — but there was a hiccup';
                        card.querySelector('p').textContent = 'Your message was received by FormSubmit but the server returned a non-standard response. If you don’t get an email, please try again later.';
                    }
                    showContactSuccess();
                }
            } else {
                console.warn('contact.js: network response not ok', response.status);
                alert('Sending failed. Please try again later or email directly.');
            }
        } catch (err) {
            console.error('contact.js: submit error', err);
            alert('Network error when sending message. Please try again later.');
        } finally {
            sending = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-disabled');
            }
        }
    });

    window._contactDebug = {
        show: showContactSuccess,
        hide: hideContactSuccess
    };
})();
