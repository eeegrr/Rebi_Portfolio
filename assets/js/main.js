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
    if (!header) return;
    window.scrollY >= 50 ? header.classList.add('blur-header') : header.classList.remove('blur-header');
};
window.addEventListener('scroll', blurHeader);

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
    const el = document.getElementById('scroll-up');
    if (!el) return;
    window.scrollY >= 350 ? el.classList.add('show-scroll') : el.classList.remove('show-scroll');
};
window.addEventListener('scroll', scrollUp);

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

window.addEventListener('scroll', scrollActive);

/*=============== cursor ===============*/
; (() => {
    let down = false;
    window.addEventListener('mousedown', () => {
        if (!down) {
            down = true;
            document.body.classList.add('is-clicking');
        }
    });
    window.addEventListener('mouseup', () => {
        if (down) {
            down = false;
            document.body.classList.remove('is-clicking');
        }
    });
    window.addEventListener('blur', () => {
        down = false;
        document.body.classList.remove('is-clicking');
    });
})();