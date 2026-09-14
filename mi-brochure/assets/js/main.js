const API_URL = 'api/get_brochure_data.php';

const bookElement = document.querySelector('#book');
const loadingState = document.querySelector('#loading-state');
const errorState = document.querySelector('#error-state');
const retryButton = document.querySelector('#retry-button');
const previousButton = document.querySelector('#previous-page');
const nextButton = document.querySelector('#next-page');
const pageIndicator = document.querySelector('#page-indicator');

let pageFlip = null;
let totalPages = 0;

function appendTextElement(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
}

function appendContactLinks(container, page) {
    const links = document.createElement('div');
    links.className = 'contact-links';

    if (page.email) {
        const email = document.createElement('a');
        email.href = `mailto:${page.email}`;
        email.textContent = page.email;
        links.append(email);
    }

    if (page.phone) {
        const phone = document.createElement('a');
        phone.href = `tel:${page.phone.replace(/\s/g, '')}`;
        phone.textContent = page.phone;
        links.append(phone);
    }

    container.append(links);
}

function createPage(page, index, pageCount) {
    const pageElement = document.createElement('article');
    pageElement.className = `page page--${page.type}`;
    pageElement.dataset.density = page.type === 'cover' || index === pageCount - 1 ? 'hard' : 'soft';

    const content = document.createElement('div');
    content.className = 'page-content';

    if (page.type === 'cover') {
        const background = document.createElement('div');
        background.className = 'cover-background';
        const backgroundUrl = new URL(page.background, document.baseURI).href;
        const backgroundImage = document.createElement('img');
        backgroundImage.className = 'cover-background-image';
        backgroundImage.src = backgroundUrl;
        backgroundImage.alt = '';
        background.append(backgroundImage);

        const coverContent = document.createElement('div');
        coverContent.className = 'cover-content';

        const coverLogo = document.createElement('img');
        coverLogo.className = 'cover-brand';
        coverLogo.src = new URL('assets/img/ADYAR INDUSTRIES-02.png', document.baseURI).href;
        coverLogo.alt = 'ADYAR Industries';
        coverContent.append(coverLogo);

        appendTextElement(coverContent, 'p', 'cover-company', page.company);
        appendTextElement(coverContent, 'p', 'cover-subtitle', page.text);
        appendTextElement(coverContent, 'h2', 'cover-title', page.title);

        if (page.teamImage) {
            const teamContainer = document.createElement('div');
            teamContainer.className = 'cover-team-container';
            const teamImg = document.createElement('img');
            teamImg.className = 'cover-team-image';
            teamImg.src = new URL(page.teamImage, document.baseURI).href;
            teamImg.alt = 'Equipo ADYARCA';
            teamContainer.append(teamImg);
            coverContent.append(teamContainer);
        }

        const coverBottom = document.createElement('div');
        coverBottom.className = 'cover-bottom';

        const coverHighlights = document.createElement('div');
        coverHighlights.className = 'cover-highlights';
        if (Array.isArray(page.sections)) {
            page.sections.forEach((section) => {
                const highlight = document.createElement('div');
                highlight.className = 'cover-highlight';

                const iconBox = document.createElement('div');
                iconBox.className = 'cover-highlight-icon';
                const isVision = section.title.toLowerCase().includes('visi');
                const iconName = isVision ? 'globe' : 'settings';
                iconBox.innerHTML = `<i data-lucide="${iconName}" aria-hidden="true"></i>`;

                const bodyBox = document.createElement('div');
                bodyBox.className = 'cover-highlight-body';
                appendTextElement(bodyBox, 'h3', 'section-title', `${section.title.toUpperCase()}:`);
                appendTextElement(bodyBox, 'p', 'section-text', section.text);

                highlight.append(iconBox, bodyBox);
                coverHighlights.append(highlight);
            });
        }
        coverBottom.append(coverHighlights);

        if (page.commitment || page.sectors) {
            const coverSide = document.createElement('div');
            coverSide.className = 'cover-side';
            if (page.commitment) {
                const item = document.createElement('div');
                item.className = 'cover-side-item';
                appendTextElement(item, 'h3', 'section-title', 'Nuestro Compromiso:');
                appendTextElement(item, 'p', 'section-text', page.commitment);
                coverSide.append(item);
            }
            if (page.sectors) {
                const item = document.createElement('div');
                item.className = 'cover-side-item';
                appendTextElement(item, 'h3', 'section-title', 'Sectores Clave:');
                appendTextElement(item, 'p', 'section-text', page.sectors);
                coverSide.append(item);
            }
            coverBottom.append(coverSide);
        }
        coverContent.append(coverBottom);

        const edition = appendTextElement(coverContent, 'p', 'cover-edition', page.edition);
        content.append(background, coverContent);
        appendTextElement(content, 'span', 'page-number', String(index + 1).padStart(2, '0'));
        pageElement.append(content);
        return pageElement;
    }

    const copy = document.createElement('div');
    copy.className = 'page-copy';
    appendTextElement(copy, 'p', 'page-eyebrow', page.name);
    appendTextElement(copy, 'h2', 'page-title', page.title);
    appendTextElement(copy, 'p', 'page-text', page.text);

    if (Array.isArray(page.sections)) {
        const sections = document.createElement('div');
        sections.className = 'page-sections';
        page.sections.forEach((section) => {
            appendTextElement(sections, 'h3', 'section-title', section.title);
            appendTextElement(sections, 'p', 'section-text', section.text);
        });
        copy.append(sections);
    }

    appendTextElement(content, 'span', 'page-number', String(index + 1).padStart(2, '0'));
    content.append(copy);
    pageElement.append(content);
    return pageElement;
}

function updateControls(pageIndex = 0) {
    const currentPage = Math.min(pageIndex + 1, totalPages);
    pageIndicator.textContent = `${String(currentPage).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`;
    previousButton.disabled = pageIndex <= 0;
    nextButton.disabled = pageIndex >= totalPages - 1;
}

function initializePageFlip() {
    if (!window.St?.PageFlip) {
        throw new Error('La librería PageFlip no está disponible.');
    }

    pageFlip = new window.St.PageFlip(bookElement, {
        width: 560,
        height: 760,
        size: 'stretch',
        minWidth: 280,
        maxWidth: 560,
        minHeight: 380,
        maxHeight: 760,
        maxShadowOpacity: 0.45,
        showCover: true,
        mobileScrollSupport: false,
        usePortrait: true,
        flippingTime: 900,
        drawShadow: true,
    });

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    pageFlip.on('flip', (event) => updateControls(event.data));
    pageFlip.on('changeOrientation', () => updateControls(pageFlip.getCurrentPageIndex()));
}

async function loadBrochure() {
    loadingState.hidden = false;
    errorState.hidden = true;
    bookElement.classList.remove('is-ready');
    previousButton.disabled = true;
    nextButton.disabled = true;

    try {
        const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });

        if (!response.ok) {
            throw new Error(`El servidor respondió con estado ${response.status}.`);
        }

        const brochure = await response.json();

        if (!Array.isArray(brochure.pages) || brochure.pages.length !== 6) {
            throw new Error('El brochure debe contener exactamente seis páginas.');
        }

        if (pageFlip) {
            pageFlip.destroy();
            pageFlip = null;
        }

        bookElement.replaceChildren();
        totalPages = brochure.pages.length;
        brochure.pages.forEach((page, index) => {
            bookElement.append(createPage(page, index, totalPages));
        });

        window.lucide?.createIcons();

        initializePageFlip();
        updateControls();
        loadingState.hidden = true;
        requestAnimationFrame(() => bookElement.classList.add('is-ready'));
    } catch (error) {
        console.error(error);
        loadingState.hidden = true;
        errorState.hidden = false;
    }
}

previousButton.addEventListener('click', () => pageFlip?.flipPrev());
nextButton.addEventListener('click', () => pageFlip?.flipNext());
retryButton.addEventListener('click', loadBrochure);
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') pageFlip?.flipPrev();
    if (event.key === 'ArrowRight') pageFlip?.flipNext();
});

window.addEventListener('DOMContentLoaded', () => {
    window.lucide?.createIcons();
    loadBrochure();
});