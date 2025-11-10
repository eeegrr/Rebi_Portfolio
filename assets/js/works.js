
// ================== CONFIG ==================
const DATA_PATH = '/assets/json/works.json'; // root-relative is safest
const USE_INLINE_FALLBACK = false;           // set true and fill INLINE_DATA for local testing
const INLINE_DATA = {
    /* optional local JSON for offline testing */
};

// ================== HELPERS ==================
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const safeStr = v => (typeof v === 'string') ? v.trim().toLowerCase() : '';
const log = (...a) => console.log('[project-loader]', ...a);
const warn = (...a) => console.warn('[project-loader]', ...a);

async function loadJson(path) {
    if (USE_INLINE_FALLBACK && Object.keys(INLINE_DATA).length) {
        log('Using INLINE_DATA fallback.');
        return INLINE_DATA;
    }
    try {
        const res = await fetch(path, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
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
    return safeStr(params.get('project') || params.get('slug') || '');
}

function findProject(data, requestedSlug) {
    if (!data || !Array.isArray(data.projects)) return null;

    const projects = data.projects;
    const slugs = projects.map(p => safeStr(p.slug || ''));
    const titles = projects.map(p => safeStr(p.title || ''));

    if (!requestedSlug) {
        log('No ?project provided — using first project:', projects[0]?.slug);
        return projects[0] || null;
    }

    let idx = slugs.findIndex(s => s === requestedSlug);
    if (idx !== -1) return projects[idx];

    idx = titles.findIndex(t => t === requestedSlug);
    if (idx !== -1) return projects[idx];

    idx = slugs.findIndex(s => s.includes(requestedSlug) || requestedSlug.includes(s));
    if (idx !== -1) return projects[idx];

    warn(`No project matched "${requestedSlug}". Falling back to first (${projects[0]?.slug}).`);
    return projects[0] || null;
}

function wrapHighlights(text, highlights = []) {
    if (!text) return '';
    if (!Array.isArray(highlights) || !highlights.length) return text;
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
    img.alt = alt || '';
    if (cls) img.className = cls;
    return img;
}

function selectWorkDetailByLabel(labelText) {
    const blocks = $$('.work .work-details .work-detail');
    for (const b of blocks) {
        const lbl = b.querySelector('.work-detail-label');
        if (lbl && lbl.textContent.trim().toLowerCase().startsWith(labelText.toLowerCase())) {
            return b;
        }
    }
    return null;
}

// ================== RENDER ==================
function populatePage(d) {
    if (!d) return warn('populatePage called with null data');

    // ---- WORK HEADER / INTRO ----
    const workSection = $('section.work');

    // Title
    const titleEl = $('.work-title');
    if (titleEl) {
        if (d.title) titleEl.textContent = d.title;
        else titleEl.remove();
    }

    /// Play button
    const playBtn = $('.slide-btn');
    if (playBtn) {
        const iconImg = playBtn.querySelector('img');
        const spanText = playBtn.querySelector('span');

        if (d.playLink) playBtn.setAttribute('href', d.playLink);
        if (iconImg && d.playIcon) iconImg.src = d.playIcon;

        if (spanText && d.playText) {
            spanText.textContent = d.playText;
        }

        if (!d.playLink && !d.playIcon && !d.playText) {
            playBtn.remove();
        }
    }

    // Background image CSS var (header)
    if (workSection) {
        if (d.bgImage) {
            log('bgImage set to:', d.bgImage);
            workSection.style.setProperty('--bg-image', `url("${d.bgImage}")`);
        } else {
            workSection.style.removeProperty('--bg-image');
            workSection.style.backgroundImage = '';
        }
    }

    // Type block ("Type:")
    const typeBlock = selectWorkDetailByLabel('Type:');
    if (typeBlock) {
        const info = typeBlock.querySelector('.work-detail-info');
        if (info) {
            if (d.typeHtml) {
                info.innerHTML = d.typeHtml;
            } else if (d.type || d.years) {
                const parts = [];
                if (d.type) parts.push(d.type);
                if (d.years) parts.push(d.years);
                info.innerHTML = parts.join('<br>');
            } else {
                typeBlock.remove();
            }
        }
    }

    // Role block ("Role:")
    const roleBlock = selectWorkDetailByLabel('Role:');
    if (roleBlock) {
        const list = roleBlock.querySelector('.contribution-list');
        if (list) {
            if (Array.isArray(d.contributions) && d.contributions.length) {
                list.innerHTML = '';
                d.contributions.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    list.appendChild(li);
                });
            } else {
                roleBlock.remove();
            }
        } else {
            roleBlock.remove();
        }
    }

    // Team block ("Team:")
    const teamBlock = selectWorkDetailByLabel('Team:');
    if (teamBlock) {
        const tlist = teamBlock.querySelector('.team-list');
        if (tlist) {
            if (Array.isArray(d.team) && d.team.length) {
                tlist.innerHTML = '';
                d.team.forEach(name => {
                    const li = document.createElement('li');
                    li.textContent = name;
                    tlist.appendChild(li);
                });
            } else {
                teamBlock.remove();
            }
        } else {
            teamBlock.remove();
        }
    }

    // ---- MULTI SECTIONS (intro + gallery), with <hr> between ----
    const mainEl = document.querySelector('main.main');
    const placeholderSection = document.querySelector('section.picture'); // use as template placeholder
    const dividerAfterHeader = document.querySelector('hr.section-divider'); // the first divider in the HTML

    if (Array.isArray(d.sections) && d.sections.length && mainEl && placeholderSection) {
        // remove the original placeholder section (we will build all sections)
        placeholderSection.remove();

        // if the HTML had a fixed divider right after placeholder, remove it (we will insert our own)
        if (dividerAfterHeader && dividerAfterHeader.previousElementSibling?.matches('section.picture') === false) {
            // keep it if not following a picture section; otherwise, remove
        } else if (dividerAfterHeader) {
            dividerAfterHeader.remove();
        }

        d.sections.forEach((sec, idx) => {
            const section = document.createElement('section');
            section.className = 'picture';

            // subtitle (optional; default varies)
            const subtitle = document.createElement('h3');
            subtitle.className = 'section-subtitle';
            if (sec.subtitle) {
                subtitle.textContent = sec.subtitle;
                section.appendChild(subtitle);
            }
            section.appendChild(subtitle);

            // intro (optional, supports highlights)
            if (sec.intro) {
                const p = document.createElement('p');
                p.className = 'work-description container';
                if (Array.isArray(sec.introHighlights) && sec.introHighlights.length) {
                    p.innerHTML = wrapHighlights(sec.intro, sec.introHighlights);
                } else {
                    p.textContent = sec.intro;
                }
                section.appendChild(p);
            }

            // gallery (optional)
            if (Array.isArray(sec.gallery) && sec.gallery.length) {
                const galleryWrap = document.createElement('div');
                galleryWrap.className = 'picture-gallery';
                const grid = document.createElement('div');
                const baseClass = 'picture-container grid';
                if (sec.usePictureContainer4) {
                    grid.className = `${baseClass} picture-container--4`;
                } else {
                    grid.className = baseClass;
                }


                sec.gallery.forEach((src, i) => {
                    const alt = (Array.isArray(sec.galleryAlts) && sec.galleryAlts[i])
                        ? sec.galleryAlts[i]
                        : `Screenshot ${i + 1}`;
                    grid.appendChild(createImg(src, alt, 'picture-img'));
                });

                galleryWrap.appendChild(grid);
                section.appendChild(galleryWrap);
            }

            // append section
            mainEl.appendChild(section);

            // add divider between sections (not after the last one)
            if (idx < d.sections.length - 1) {
                const hr = document.createElement('hr');
                hr.className = 'section-divider';
                mainEl.appendChild(hr);
            }
        });
    } else {
        // Legacy single-section support (uses the existing section in HTML)
        const introEl = $('.picture .work-description');
        if (introEl) {
            if (d.intro) {
                if (Array.isArray(d.introHighlights) && d.introHighlights.length) {
                    introEl.innerHTML = wrapHighlights(d.intro, d.introHighlights);
                } else {
                    introEl.textContent = d.intro;
                }
            } else {
                introEl.remove();
            }
        }

        const galleryContainer = $('.picture .picture-container.grid');
        const pictureSection = $('section.picture');
        if (galleryContainer) {
            if (Array.isArray(d.gallery) && d.gallery.length) {
                galleryContainer.innerHTML = '';
                d.gallery.forEach((src, i) => {
                    const alt = (Array.isArray(d.galleryAlts) && d.galleryAlts[i]) ? d.galleryAlts[i] : `Screenshot ${i + 1}`;
                    galleryContainer.appendChild(createImg(src, alt, 'picture-img'));
                });
            } else if (pictureSection) {
                const hasIntro = !!d.intro;
                if (!hasIntro) pictureSection.remove();
                else galleryContainer.innerHTML = '';
            }
        }
    }

    // ---- TOOLS ----
    const toolsWrap = $('.container.tools');
    const toolsIcons = $('.container.tools .tool-icons');
    if (toolsIcons) {
        if (Array.isArray(d.tools) && d.tools.length) {
            toolsIcons.innerHTML = '';
            d.tools.forEach(t => {
                const tool = document.createElement('div');
                tool.className = 'tool';
                const img = document.createElement('img');
                img.src = t.src || '';
                img.alt = t.alt || t.label || '';
                const label = document.createElement('span');
                label.textContent = t.label || t.alt || '';
                tool.appendChild(img);
                tool.appendChild(label);
                toolsIcons.appendChild(tool);
            });
        } else if (toolsWrap) {
            toolsWrap.remove();
        }
    }

    // --- Force "Tools" to the bottom of <main>, just above the footer ---
    const mainElForTools = document.querySelector('main.main');
    const toolsWrapToMove = document.querySelector('.container.tools');
    if (mainElForTools && toolsWrapToMove) {
        // optional: add a divider before tools
        const hr = document.createElement('hr');
        hr.className = 'section-divider';
        mainElForTools.appendChild(hr);

        // move the tools block to the very end of <main>
        mainElForTools.appendChild(toolsWrapToMove);
    }


    // ---- FOOTER (bg + copy + socials) ----
    const footer = $('footer.footer');
    if (footer) {
        if (d.footerBgImage) {
            footer.style.setProperty('--ft-image', `url("${d.footerBgImage}")`);
        } else if (d.bgImage) {
            footer.style.setProperty('--ft-image', `url("${d.bgImage}")`);
        } else {
            footer.style.removeProperty('--ft-image');
        }
    }


    const footerCopy = $('.footer-copy');
    if (footerCopy) {
        if (d.footerCopy) footerCopy.innerHTML = d.footerCopy;
        else footerCopy.remove();
    }

    const social = d.social || {};
    const ig = $('.footer-social .icon-instagram');
    const fb = $('.footer-social .icon-facebook');
    const li = $('.footer-social .icon-linkedin');
    const footerSocial = $('.footer-social');

    let anySocial = false;
    if (ig && social.instagram) { ig.setAttribute('href', social.instagram); anySocial = true; } else if (ig) ig.remove();
    if (fb && social.facebook) { fb.setAttribute('href', social.facebook); anySocial = true; } else if (fb) fb.remove();
    if (li && social.linkedin) { li.setAttribute('href', social.linkedin); anySocial = true; } else if (li) li.remove();
    if (footerSocial && !anySocial) footerSocial.remove();

    // ---- Document title ----
    if (d.title) document.title = `${d.title} - Portfolio`;
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', async () => {
    const requested = getRequestedSlug();
    log('Requested project slug:', requested || '(none)');

    const data = await loadJson(DATA_PATH);
    if (!data) {
        warn('No data loaded. Check path and server.');
        return;
    }

    const project = findProject(data, requested);
    if (!project) {
        warn('findProject returned null — nothing to render.');
        return;
    }

    populatePage(project);
});
