// CONFIG
const DATA_PATH = 'assets/json/works.json'; // <- adjust if your file is at a different path
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

function removeEl(selector) {
    const el = document.querySelector(selector);
    if (el) el.remove();
}

// Populate the page with project data. If a major piece of data is missing,
// remove the entire related section to avoid blank paddings or empty layout.
function populatePage(d) {
    if (!d) return warn('populatePage called with null data');

    // -------------------
    // WORK / INTRO
    // -------------------
    const workSection = document.querySelector('section.work');

    // Title
    const titleEl = document.querySelector('.work-title');
    if (titleEl && d.title) titleEl.textContent = d.title;
    else if (titleEl && !d.title) titleEl.remove();

    // Play button
    const playBtn = document.querySelector('.slide-btn');
    if (playBtn) {
        if (d.playLink || d.playIcon) {
            if (d.playLink) playBtn.setAttribute('href', d.playLink);
            const iconImg = playBtn.querySelector('img');
            if (iconImg && d.playIcon) iconImg.src = d.playIcon;
            // if no playLink & no playIcon -> remove the playBtn
            if (!d.playLink && !d.playIcon) playBtn.remove();
        } else {
            playBtn.remove();
        }
    }

    // Work background image / CSS var
    if (workSection) {
        if (d.bgImage) {
            workSection.style.setProperty('--bg-image', `url("${d.bgImage}")`);
        } else {
            // remove the whole inline background var to prevent ghost visuals
            workSection.style.removeProperty('--bg-image');
            workSection.style.backgroundImage = '';
        }
    }

    // Intro text (if absent -> remove the whole intro container)
    const introEl = document.querySelector('.work-description');
    if (introEl) {
        if (d.intro) {
            if (Array.isArray(d.introHighlights) && d.introHighlights.length) introEl.innerHTML = wrapHighlights(d.intro, d.introHighlights);
            else introEl.textContent = d.intro || '';
        } else {
            // remove the container that wraps title + intro if both missing
            const introContainer = document.querySelector('.intro');
            if (introContainer) {
                // if title exists we only remove the paragraph; otherwise remove whole intro
                if (d.title) introEl.remove();
                else introContainer.remove();
            } else {
                introEl.remove();
            }
        }
    }

    // If neither title nor intro nor play button nor bgImage exist, remove the whole section.work
    const workHasContent = Boolean(d.title || d.intro || d.playLink || d.playIcon || d.bgImage);
    if (workSection && !workHasContent) workSection.remove();

    // -------------------
    // FIRST GALLERY (section.picture)
    // -------------------
    const galleryContainer = document.querySelector('.picture .picture-container.grid');
    const pictureSection = document.querySelector('section.picture');
    if (galleryContainer && Array.isArray(d.gallery) && d.gallery.length) {
        galleryContainer.innerHTML = '';
        (d.gallery).forEach((src, i) => {
            const alt = (Array.isArray(d.galleryAlts) && d.galleryAlts[i]) ? d.galleryAlts[i] : `Screenshot ${i + 1}`;
            galleryContainer.appendChild(createImg(src, alt, 'picture-img'));
        });
    } else {
        // remove the whole picture section if no gallery
        if (pictureSection) pictureSection.remove();
    }

    // -------------------
    // LONG DESCRIPTION
    // -------------------
    const longEl = document.querySelector('.work-description2');
    if (longEl) {
        if (d.longDescription) {
            if (Array.isArray(d.longDescriptionHighlights) && d.longDescriptionHighlights.length) longEl.innerHTML = wrapHighlights(d.longDescription || '', d.longDescriptionHighlights);
            else longEl.textContent = d.longDescription || '';
        } else {
            // remove the element if no long description so it doesn't take space
            longEl.remove();
        }
    }

    // -------------------
    // CONTRIBUTIONS (keep gallery)
    // -------------------
    const contribSection = document.querySelector('section.contributions');
    const contribList = document.querySelector('.contribution-list');
    const contribSubtitle = contribSection ? contribSection.querySelector('.section-subtitle') : null;
    const secContainer = document.querySelector('.contributions .picture-container.grid');

    const hasContribs = Array.isArray(d.contributions) && d.contributions.length > 0;

    if (!hasContribs) {
        // remove only the title and the list (keep the section and gallery)
        if (contribList) contribList.remove();
        if (contribSubtitle) contribSubtitle.remove();
    } else {
        // ensure subtitle exists (create if missing)
        if (!contribSubtitle && contribSection) {
            const h3 = document.createElement('h3');
            h3.className = 'section-subtitle';
            h3.textContent = 'My Contributions';
            // insert at the top of the container inside the section
            const container = contribSection.querySelector('.container') || contribSection;
            container.insertBefore(h3, container.firstChild);
        }

        // populate the contributions list (create it if missing)
        let listEl = document.querySelector('.contribution-list');
        if (!listEl && contribSection) {
            const container = contribSection.querySelector('.container') || contribSection;
            listEl = document.createElement('ul');
            listEl.className = 'contribution-list';
            container.appendChild(listEl);
        }

        if (listEl) {
            listEl.innerHTML = '';
            d.contributions.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                listEl.appendChild(li);
            });
        }
    }

    // Secondary gallery: leave as-is (populate if present, otherwise it can remain in HTML)
    if (secContainer) {
        if (Array.isArray(d.gallerySecondary) && d.gallerySecondary.length) {
            secContainer.innerHTML = '';
            d.gallerySecondary.forEach((src, i) => secContainer.appendChild(createImg(src, `Screenshot ${i + 1}`, 'picture-img')));
        } else {
            // if you prefer to clear gallery when missing, uncomment the next line:
            // secContainer.innerHTML = '';
        }
    }

    // -------------------
    // TOOLS USED (div.container.tools)
    // -------------------
    const toolsDiv = document.querySelector('.container.tools .tool-icons');
    const toolsParent = document.querySelector('.container.tools');
    if (toolsDiv && Array.isArray(d.tools) && d.tools.length) {
        toolsDiv.innerHTML = '';
        d.tools.forEach(t => {
            const src = t.src || t;
            const alt = t.alt || '';
            toolsDiv.appendChild(createImg(src, alt));
        });
    } else if (toolsParent) {
        toolsParent.remove();
    }

    // -------------------
    // FOOTER IMAGE & COPY & SOCIAL
    // -------------------
    const footer = document.querySelector('footer.footer');
    if (footer) {
        if (d.bgImage) {
            footer.style.setProperty('--ft-image', `url("${d.bgImage}")`);
        } else {
            footer.style.removeProperty('--ft-image');
            footer.style.backgroundImage = '';
        }
    }

    const footerCopy = document.querySelector('.footer-copy');
    if (footerCopy) {
        if (d.footerCopy) footerCopy.innerHTML = d.footerCopy || '';
        else footerCopy.remove();
    }

    // Social links: if none provided, remove the entire footer-social container
    const social = d.social || {};
    const ig = document.querySelector('.footer-social .icon-instagram');
    const fb = document.querySelector('.footer-social .icon-facebook');
    const li = document.querySelector('.footer-social .icon-linkedin');
    const footerSocial = document.querySelector('.footer-social');

    let anySocial = false;
    if (ig && social.instagram) { ig.setAttribute('href', social.instagram); anySocial = true; } else if (ig) ig.remove();
    if (fb && social.facebook) { fb.setAttribute('href', social.facebook); anySocial = true; } else if (fb) fb.remove();
    if (li && social.linkedin) { li.setAttribute('href', social.linkedin); anySocial = true; } else if (li) li.remove();

    if (footerSocial && !anySocial) {
        // if there are no social links remove the social block entirely
        footerSocial.remove();
    }

    // Remove footer completely if it has no meaningful children (optional)
    if (footer && footer.querySelectorAll('*').length === 0) footer.remove();

    // -------------------
    // Document title
    // -------------------
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
