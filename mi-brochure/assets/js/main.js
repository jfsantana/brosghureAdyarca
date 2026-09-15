const API_URL = 'api/get_brochure_data.php';

const bookElement = document.querySelector('#book');
const loadingState = document.querySelector('#loading-state');
const errorState = document.querySelector('#error-state');
const retryButton = document.querySelector('#retry-button');
const previousButton = document.querySelector('#previous-page');
const nextButton = document.querySelector('#next-page');
const pageIndicator = document.querySelector('#page-indicator');
const downloadButton = document.querySelector('#download-pdf');

let pageFlip = null;
let totalPages = 0;

function waitForImages(container) {
    return Promise.all(Array.from(container.querySelectorAll('img')).map((image) => {
        if (image.complete && image.naturalWidth > 0) return Promise.resolve();

        return new Promise((resolve, reject) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', reject, { once: true });
        });
    }));
}

async function downloadBrochurePdf() {
    if (!window.html2canvas || !window.jspdf?.jsPDF) {
        throw new Error('Las herramientas para generar el PDF no están disponibles.');
    }

    const label = downloadButton.querySelector('span');
    const originalLabel = label.textContent;
    downloadButton.disabled = true;
    label.textContent = 'Generando PDF...';

    const exportStage = document.createElement('div');
    exportStage.className = 'pdf-export-stage';
    document.body.append(exportStage);

    try {
        await document.fonts.ready;
        const sourcePages = Array.from(bookElement.querySelectorAll('.page'));
        const pdf = new window.jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [560, 760],
            hotfixes: ['px_scaling'],
        });

        for (const [pageIndex, sourcePage] of sourcePages.entries()) {
            const pageClone = sourcePage.cloneNode(true);
            pageClone.removeAttribute('style');
            pageClone.classList.add('pdf-export-page');
            exportStage.replaceChildren(pageClone);
            await waitForImages(pageClone);

            const canvas = await window.html2canvas(pageClone, {
                width: 560,
                height: 760,
                windowWidth: 1120,
                windowHeight: 760,
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            if (pageIndex > 0) pdf.addPage([560, 760], 'portrait');
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, 560, 760);
        }

        pdf.save('brochure-adyarca.pdf');
    } finally {
        exportStage.remove();
        downloadButton.disabled = false;
        label.textContent = originalLabel;
    }
}

function appendTextElement(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
}

function createBrandHeader(page) {
    const header = document.createElement('div');
    header.className = 'page-brand-header';

    const logo = document.createElement('img');
    logo.className = 'cover-brand';
    logo.src = new URL('assets/img/ADYAR INDUSTRIES-02.png', document.baseURI).href;
    logo.alt = 'ADYAR Industries';
    header.append(logo);

    const company = appendTextElement(header, 'p', 'cover-company', page.company || 'ADYAR INDUSTRIES, C.A.');
    company.setAttribute('aria-label', page.company || 'ADYAR INDUSTRIES, C.A.');

    return header;
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
    const pageClass = String(page.id).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    pageElement.className = `page page--${page.type} page--${pageClass}`;
    pageElement.dataset.density = 'soft';

    const content = document.createElement('div');
    content.className = 'page-content';

    if (page.background && page.type !== 'cover') {
        const background = document.createElement('div');
        background.className = 'page-background';
        const backgroundUrl = new URL(page.background, document.baseURI).href;
        const backgroundImage = document.createElement('img');
        backgroundImage.className = 'page-background-image';
        backgroundImage.src = backgroundUrl;
        backgroundImage.alt = '';
        background.append(backgroundImage);
        content.append(background);
    }

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

    if (!page.ImagenCentral) {
        content.append(createBrandHeader(page));
    }

    const copy = document.createElement('div');
    copy.className = 'page-copy';

    if (page.ImagenCentral) {
        copy.classList.add('closing-copy');
        appendTextElement(copy, 'h2', 'closing-title', page.title);
        appendTextElement(copy, 'p', 'closing-tagline', page.text);

        const centralLogo = document.createElement('img');
        centralLogo.className = 'closing-logo';
        centralLogo.src = new URL(page.ImagenCentral, document.baseURI).href;
        centralLogo.alt = 'ADYAR Industries';
        copy.append(centralLogo);

        const contacts = document.createElement('div');
        contacts.className = 'closing-contacts';
        const contactIcons = {
            celular: 'phone',
            direccion: 'map-pin',
            email: 'mail',
            'pagina web': 'globe-2',
            instagram: 'instagram',
            facebook: 'facebook',
            linkedin: 'linkedin',
        };

        page.sections?.forEach((section) => {
            const card = document.createElement('div');
            const normalizedTitle = section.title.toLowerCase();
            const contactClass = normalizedTitle.replace(/[^a-z0-9]+/g, '-');
            card.className = `closing-contact closing-contact--${contactClass}`;
            const icon = document.createElement('span');
            icon.className = 'closing-contact-icon';
            icon.innerHTML = `<i data-lucide="${contactIcons[normalizedTitle] || 'circle-dot'}" aria-hidden="true"></i>`;

            const body = document.createElement('div');
            body.className = 'closing-contact-body';
            appendTextElement(body, 'strong', 'closing-contact-title', section.title);

            let value;
            if (normalizedTitle === 'celular') {
                value = document.createElement('a');
                value.href = `tel:${section.text.replace(/[^+\d]/g, '')}`;
            } else if (normalizedTitle === 'email') {
                value = document.createElement('a');
                value.href = `mailto:${section.text}`;
            } else if (['pagina web', 'instagram', 'facebook', 'linkedin'].includes(normalizedTitle)) {
                value = document.createElement('a');
                value.href = section.text.startsWith('http') ? section.text : `https://${section.text.replace(/^@/, 'instagram.com/')}`;
                value.target = '_blank';
                value.rel = 'noopener noreferrer';
            } else {
                value = document.createElement('span');
            }
            value.className = 'closing-contact-value';
            value.textContent = section.text;
            body.append(value);
            card.append(icon, body);
            contacts.append(card);
        });

        copy.append(contacts);
        appendTextElement(copy, 'p', 'page-eyebrow', page.name);
        appendTextElement(content, 'span', 'page-number', String(index + 1).padStart(2, '0'));
        content.append(copy);
        pageElement.append(content);
        return pageElement;
    }

    if (page.firmaSeo) {
        const signature = document.createElement('img');
        signature.className = 'page-signature';
        signature.src = new URL(page.firmaSeo, document.baseURI).href;
        signature.alt = 'Firma de Adrián Seo';
        copy.append(signature);
    }

    appendTextElement(copy, 'p', 'page-eyebrow', page.name);
    appendTextElement(copy, 'h2', 'page-title', page.title);

    if (page.valoresImg) {
        const valuesImage = document.createElement('img');
        valuesImage.className = 'page-values-image';
        valuesImage.src = new URL(page.valoresImg, document.baseURI).href;
        valuesImage.alt = 'Valores de ADYAR Industries';
        copy.append(valuesImage);
    }

    if (page.SubTitleText) {
        const detail = document.createElement('div');
        detail.className = 'page-detail';
        appendTextElement(detail, 'h3', 'page-subtitle', page.SubTitleText);
        appendTextElement(detail, 'p', 'page-text', page.text);
        copy.append(detail);
    } else if (page.text) {
        appendTextElement(copy, 'p', 'page-text', page.text);
    }

    if (Array.isArray(page.sections)) {
        const sections = document.createElement('div');
        const hasServiceCards = page.sections.some((section) => section.image);
        sections.className = hasServiceCards ? 'page-sections service-cards' : 'page-sections';
        page.sections.forEach((section) => {
            const sectionItem = document.createElement('div');
            sectionItem.className = hasServiceCards ? 'page-section service-card' : 'page-section';

            if (hasServiceCards) {
                const serviceImage = document.createElement('img');
                serviceImage.className = 'service-card-image';
                serviceImage.src = new URL(section.image, document.baseURI).href;
                serviceImage.alt = section.title;

                const serviceBody = document.createElement('div');
                serviceBody.className = 'service-card-body';
                appendTextElement(serviceBody, 'span', 'service-card-badge', section.number);
                appendTextElement(serviceBody, 'h3', 'service-card-title', section.title);
                appendTextElement(serviceBody, 'p', 'service-card-text', section.text);
                appendTextElement(serviceBody, 'span', 'service-card-number', section.number);

                sectionItem.append(serviceImage, serviceBody);
                sections.append(sectionItem);
                return;
            }

            const icon = document.createElement('div');
            icon.className = 'page-section-icon';
            const isVision = section.title.toLowerCase().includes('visi');
            icon.innerHTML = `<i data-lucide="${isVision ? 'globe-2' : 'settings'}" aria-hidden="true"></i>`;

            const sectionBody = document.createElement('div');
            sectionBody.className = 'page-section-body';
            appendTextElement(sectionBody, 'h3', 'section-title', section.title);
            appendTextElement(sectionBody, 'p', 'section-text', section.text);

            sectionItem.append(icon, sectionBody);
            sections.append(sectionItem);
        });
        copy.append(sections);
    }

    const galleryImages = [page.Imagen1, page.Imagen2, page.Imagen3].filter(Boolean);
    if (galleryImages.length > 0) {
        const gallery = document.createElement('div');
        gallery.className = 'page-gallery';
        galleryImages.forEach((imagePath, imageIndex) => {
            const image = document.createElement('img');
            image.className = `page-gallery-image page-gallery-image--${imageIndex + 1}`;
            image.src = new URL(imagePath, document.baseURI).href;
            image.alt = `Instalaciones de ADYAR Industries ${imageIndex + 1}`;
            gallery.append(image);
        });
        copy.append(gallery);
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
downloadButton.addEventListener('click', () => {
    downloadBrochurePdf().catch((error) => {
        console.error(error);
        window.alert('No se pudo generar el PDF. Inténtalo nuevamente.');
    });
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') pageFlip?.flipPrev();
    if (event.key === 'ArrowRight') pageFlip?.flipNext();
});

window.addEventListener('DOMContentLoaded', () => {
    window.lucide?.createIcons();
    loadBrochure();
});