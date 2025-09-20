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

/*=============== TAGS ===============*/
// one listener on the filters wrapper
const filtersEl = document.querySelector('.portfolio-filters');
const cards = document.querySelectorAll('.filterable-cards .card');

filtersEl.addEventListener('click', (e) => {
    // find the clicked <a class="games-badge"> even if <img>/<span> was clicked
    const btn = e.target.closest('a.slide-btn');
    if (!btn) return; // clicked outside a filter button
    e.preventDefault();

    // toggle active state
    const prev = filtersEl.querySelector('.active');
    if (prev) prev.classList.remove('active');
    btn.classList.add('active');

    // read filter name from data-name
    const filter = (btn.dataset.name || 'all').toLowerCase();

    // show/hide cards
    cards.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        card.hidden = !(filter === 'all' || name === filter);
    });
});

/*=============== SEND MESSAGE ===============*/
const form = document.querySelector('form');

function sendEmail() {
    Email.send({
        Host: "s1.maildns.net",
        Username: "username",
        Password: "password",
        To: 'them@website.com',
        From: "you@isp.com",
        Subject: "This is the subject",
        Body: "And this is the body"
    }).then(
        message => alert(message)
    );
}

/*=============== SWITCH WORK ===============*/
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.picture .picture-container.grid');
    function scrollX(delta) {
        if (!gallery) return;
        gallery.scrollBy({ left: delta, behavior: 'smooth' });
    }

    const topLeft = document.querySelector('.side-control.top-left .side-btn');
    const topRight = document.querySelector('.side-control.top-right .side-btn');
    const botLeft = document.querySelector('.footer-controls.left .side-btn');
    const botRight = document.querySelector('.footer-controls.right .side-btn');

    [topLeft, botLeft].forEach(btn => btn && btn.addEventListener('click', (e) => { e.preventDefault(); scrollX(-320); }));
    [topRight, botRight].forEach(btn => btn && btn.addEventListener('click', (e) => { e.preventDefault(); scrollX(320); }));
});


sr.reveal('.home-img, .new-data, .care-img, .contact-content , .footer')
sr.reveal('.home-data, .care-list, .contact-img', { delay: 500 })
sr.reveal('.new-card', { delay: 500, interval: 100 })
sr.reveal('.shop-card', { interval: 100 })