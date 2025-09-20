const CARDS_JSON_URL = 'assets/json/cards.json';

async function loadCards() {
    const res = await fetch(CARDS_JSON_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${CARDS_JSON_URL}: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

function createCard(item) {
    // use anchor so it's keyboard accessible and discoverable
    const card = document.createElement('a');
    card.className = 'card';
    card.dataset.name = (item.category || '').toLowerCase();

    // build link to generic project page (work.html)
    // -> /work.html?project=etherlocked
    if (item.slug) {
        card.href = `index.html?project=${encodeURIComponent(item.slug)}`;
    } else if (item.href) {
        // fallback to direct file link if slug missing
        card.href = item.href;
    } else {
        card.href = '#';
    }

    const img = document.createElement('img');
    img.src = item.imageSrc;
    img.alt = item.alt || item.title || '';
    img.loading = 'lazy';

    const body = document.createElement('div');
    body.className = 'card-body';

    const h3 = document.createElement('h3');
    h3.className = 'card-title';
    h3.textContent = item.title || '';

    body.appendChild(h3);
    card.appendChild(img);
    card.appendChild(body);

    return card;
}


function renderCards(items, category = 'all') {
    const container = document.getElementById('portfolio-cards');
    if (!container) return;
    container.innerHTML = '';
    const cat = category.toLowerCase();
    items.forEach(item => {
        const itemCat = (item.category || '').toLowerCase();
        if (cat === 'all' || itemCat === cat) {
            container.appendChild(createCard(item));
        }
    });
}

function setupFilters(allItems) {
    const buttons = document.querySelectorAll('.portfolio-filters .slide-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const selected = btn.dataset.name || 'all';
            renderCards(allItems, selected);
        });
    });
}

(async function initPortfolio() {
    try {
        const items = await loadCards();
        renderCards(items, 'all');
        setupFilters(items);
    } catch (err) {
        console.error(err);
        // Optional: show a fallback message
        const container = document.getElementById('portfolio-cards');
        if (container) container.innerHTML = '<p>Could not load portfolio items.</p>';
    }
})();