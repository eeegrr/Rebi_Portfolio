// CONFIG
const DATA_PATH = '/assets/json/works.json'; // <- adjust if your file is at a different path
const USE_INLINE_FALLBACK = false; // set true and paste INLINE_DATA below if fetch blocked
const INLINE_DATA = {
    /* paste projects.json object here for local testing if necessary */
};

// ---- helpers ----
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function safeStr(v) { return (typeof v === 'string') ? v.trim().toLowerCase() : ''; }
function log(...args) { console.log('[project-loader]', ...args); }
function warn(...args) { console.warn('[project-loader]', ...args); }

async function loadJson(path) {
    if (USE_INLINE_FALLBACK && Object.keys(INLINE_DATA).length) {
        log('Using INLINE_DATA fallback.');
        return INLINE_DATA;
    }
    try {
        const res = await fetch(path, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json;
    } catch (err) {
        warn(`Failed to fetch ${path}:`, err);
        if (Object.keys(INLINE_DATA).length) {
            log('Falling back to INLINE_DATA.');
            return INLINE_DATA;
        }
        return null;
    }
}

function getRequestedSlug() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('project') || params.get('slug') || '';
    return safeStr(raw);
}

function findProject(data, requestedSlug) {
    if (!data || !Array.isArray(data.projects)) return null;

    // build maps/lists
    const projects = data.projects;
    const slugs = projects.map(p => safeStr(p.slug || ''));
    const titles = projects.map(p => safeStr(p.title || ''));

    log('Available slugs:', slugs);
    log('Available titles:', titles);

    if (!requestedSlug) {
        log('No ?project= provided — using first project:', projects[0] && projects[0].slug);
        return projects[0] || null;
    }

    // try exact slug match (case-insensitive)
    let idx = slugs.findIndex(s => s === requestedSlug);
    if (idx !== -1) {
        log(`Matched slug "${requestedSlug}" -> project index ${idx} (${projects[idx].slug})`);
        return projects[idx];
    }

    // try matching by title (sometimes users put title in URL)
    idx = titles.findIndex(t => t === requestedSlug);
    if (idx !== -1) {
        log(`Matched title "${requestedSlug}" -> project index ${idx} (${projects[idx].slug})`);
        return projects[idx];
    }

    // try partial match (slug contains requested or vice versa)
    idx = slugs.findIndex(s => s.includes(requestedSlug) || requestedSlug.includes(s));
    if (idx !== -1) {
        log(`Partial match for "${requestedSlug}" -> project index ${idx} (${projects[idx].slug})`);
        return projects[idx];
    }

    warn(`No project matched "${requestedSlug}". Falling back to first project (${projects[0] && projects[0].slug}).`);
    return projects[0] || null;
}

function wrapHighlights(text, highlights = []) {
    if (!text) return '';
    if (!Array.isArray(highlights) || highlights.length === 0) return text;
    // order by length to avoid partial overlaps
    const ordered = [...highlights].sort((a, b) => b.length - a.length);
    let result = text;
    for (const h of ordered) {
        const esc = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(esc, 'g'), `<span>${h}</span>`);
    }
    return result;
}

function createImg(src, alt = '', cls = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    if (cls) img.className = cls;
    return img;
}

function populatePage(d) {
    if (!d) return warn('populatePage called with null data');

    // Title
    const titleEl = document.querySelector('.work-title');
    if (titleEl) titleEl.textContent = d.title || '';

    // Work background
    const workSection = document.querySelector('section.work');
    if (workSection) {
        if (d.bgImage) {
            // set the CSS variable to an url(...) string so your CSS `var(--bg-image)` works
            workSection.style.setProperty('--bg-image', `url("${d.bgImage}")`);
        } else {
            // remove the CSS variable if no image provided
            workSection.style.removeProperty('--bg-image');
        }
        // remove any previously set inline background-image so it doesn't override the CSS rule
        workSection.style.backgroundImage = '';
    }

    // Play button
    const playBtn = document.querySelector('.slide-btn');
    if (playBtn) {
        if (d.playLink) playBtn.setAttribute('href', d.playLink);
        const iconImg = playBtn.querySelector('img');
        if (iconImg && d.playIcon) iconImg.src = d.playIcon;
    }

    // Intro with highlights
    const introEl = document.querySelector('.work-description');
    if (introEl) {
        if (Array.isArray(d.introHighlights) && d.introHighlights.length) introEl.innerHTML = wrapHighlights(d.intro, d.introHighlights);
        else introEl.textContent = d.intro || '';
    }

    // First gallery
    const galleryContainer = document.querySelector('.picture .picture-container.grid');
    if (galleryContainer) {
        galleryContainer.innerHTML = '';
        (Array.isArray(d.gallery) ? d.gallery : []).forEach((src, i) => {
            const alt = (Array.isArray(d.galleryAlts) && d.galleryAlts[i]) ? d.galleryAlts[i] : `Screenshot ${i + 1}`;
            galleryContainer.appendChild(createImg(src, alt, 'picture-img'));
        });
    }

    // Long description
    const longEl = document.querySelector('.work-description2');
    if (longEl) {
        if (Array.isArray(d.longDescriptionHighlights) && d.longDescriptionHighlights.length) longEl.innerHTML = wrapHighlights(d.longDescription || '', d.longDescriptionHighlights);
        else longEl.textContent = d.longDescription || '';
    }

    // Contributions
    const contribList = document.querySelector('.contribution-list');
    if (contribList) {
        contribList.innerHTML = '';
        (Array.isArray(d.contributions) ? d.contributions : []).forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            contribList.appendChild(li);
        });
    }

    // Secondary gallery
    const secContainer = document.querySelector('.contributions .picture-container.grid');
    if (secContainer) {
        secContainer.innerHTML = '';
        const sec = Array.isArray(d.gallerySecondary) ? d.gallerySecondary : (Array.isArray(d.gallery) ? d.gallery : []);
        sec.forEach((src, i) => secContainer.appendChild(createImg(src, `Screenshot ${i + 1}`, 'picture-img')));
    }

    // Tools
    const toolsDiv = document.querySelector('.container.tools .tool-icons');
    if (toolsDiv) {
        toolsDiv.innerHTML = '';
        (Array.isArray(d.tools) ? d.tools : []).forEach(t => {
            const src = t.src || t;
            const alt = t.alt || '';
            toolsDiv.appendChild(createImg(src, alt));
        });
    }

    // Footer image & copy
    const footer = document.querySelector('footer.footer');
    if (footer) {
        if (d.bgImage) {
            footer.style.setProperty('--ft-image', `url("${d.bgImage}")`);
        } else {
            footer.style.removeProperty('--ft-image');
        }
        footer.style.backgroundImage = '';
    }

    const footerCopy = document.querySelector('.footer-copy');
    if (footerCopy && d.footerCopy) footerCopy.innerHTML = d.footerCopy || '';

    // Social links
    if (d.social) {
        const ig = document.querySelector('.footer-social .icon-instagram');
        const fb = document.querySelector('.footer-social .icon-facebook');
        const li = document.querySelector('.footer-social .icon-linkedin');
        if (ig && d.social.instagram) ig.setAttribute('href', d.social.instagram);
        if (fb && d.social.facebook) fb.setAttribute('href', d.social.facebook);
        if (li && d.social.linkedin) li.setAttribute('href', d.social.linkedin);
    }

    // Document title
    if (d.title) document.title = `${d.title} - Portfolio`;
}

// ---- init ----
document.addEventListener('DOMContentLoaded', async () => {
    const requested = getRequestedSlug();
    log('Requested project slug:', requested || '(none)');

    const data = await loadJson(DATA_PATH);
    if (!data) {
        warn('No data loaded from projects.json. Check path and server.');
        return;
    }

    const project = findProject(data, requested);
    if (!project) {
        warn('findProject returned null — nothing to render.');
        return;
    }

    populatePage(project);
});
