// Get case studies data from window object (passed from server)
const caseStudiesData = window.caseStudiesData || {};

// DOM Elements
const modal = document.getElementById('caseStudyModal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalClose = document.querySelector('.modal-close');
const caseStudyCards = document.querySelectorAll('.case-study-card');

// Modal Elements
const modalImage = document.getElementById('modalImage');
const modalBadge = document.getElementById('modalBadge');
const modalTitle = document.getElementById('modalTitle');
const modalChallenge = document.getElementById('modalChallenge');
const modalSolution = document.getElementById('modalSolution');
const modalResults = document.getElementById('modalResults');
const modalGallery = document.getElementById('modalGallery');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add click event to case study cards
    caseStudyCards.forEach(card => {
        card.addEventListener('click', function() {
            const caseId = this.dataset.case;
            openModal(caseId);
        });
    });

    // Close modal events
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('caseStudySearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterCaseStudies(e.target.value);
        });
    }
    
    // Add modal navigation
    addModalNavigation();
});

// Open Modal Function
function openModal(caseId) {
    const caseData = caseStudiesData[caseId];
    if (!caseData) return;

    // Populate modal content
    modalImage.src = caseData.image;
    modalImage.alt = caseData.title;
    modalBadge.textContent = caseData.badge;
    modalTitle.textContent = caseData.title;

    // Populate challenge section
    modalChallenge.innerHTML = createList(caseData.challenge);

    // Populate solution section
    modalSolution.innerHTML = createList(caseData.solution);

    // Populate results section
    modalResults.innerHTML = createList(caseData.results);

    // Populate gallery
    modalGallery.innerHTML = createGallery(caseData.gallery);

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal Function
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Helper function to create list
function createList(items) {
    return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

// Helper function to create gallery
function createGallery(images) {
    return images.map(img => `
        <div class="gallery-item">
            <img src="${img}" alt="Project Gallery" loading="lazy">
        </div>
    `).join('');
}

// Helper function to create stats
function createStats(stats) {
    return stats.map(stat => `
        <div class="modal-stat-item">
            <span class="modal-stat-value">${stat.value}</span>
            <span class="modal-stat-label">${stat.label}</span>
        </div>
    `).join('');
}

// Smooth scrolling for case studies section
function scrollToCaseStudies() {
    document.getElementById('case-studies').scrollIntoView({
        behavior: 'smooth'
    });
}

// Animation on scroll


const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe case study cards for animation
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.case-study-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });
});

// Touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

modal.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

modal.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 100;
    const swipeDistance = touchStartY - touchEndY;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe up - could implement next case study
            console.log('Swipe up detected');
        } else {
            // Swipe down - close modal
            closeModal();
        }
    }
}

// Preload images for better performance
function preloadImages() {
    Object.values(caseStudiesData).forEach(caseData => {
        const img = new Image();
        img.src = caseData.image;
        
        // Preload gallery images
        caseData.gallery.forEach(galleryImg => {
            const galleryImage = new Image();
            galleryImage.src = galleryImg;
        });
    });
}

// Call preload on page load
document.addEventListener('DOMContentLoaded', preloadImages);

// Add loading state for modal
function showModalLoading() {
    modal.classList.add('loading');
}

function hideModalLoading() {
    modal.classList.remove('loading');
}

// Enhanced modal opening with loading state
function openModalEnhanced(caseId) {
    showModalLoading();
    
    setTimeout(() => {
        openModal(caseId);
        hideModalLoading();
    }, 300);
}

// Add search functionality for case studies
function filterCaseStudies(searchTerm) {
    const cards = document.querySelectorAll('.case-study-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.case-study-title').textContent.toLowerCase();
        const description = card.querySelector('.case-study-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (modal.classList.contains('active')) {
        switch(e.key) {
            case 'ArrowLeft':
                // Navigate to previous case study
                navigateModal('prev');
                break;
            case 'ArrowRight':
                // Navigate to next case study
                navigateModal('next');
                break;
        }
    }
});

function navigateModal(direction) {
    const currentCase = getCurrentCaseId();
    const caseIds = Object.keys(caseStudiesData);
    const currentIndex = caseIds.indexOf(currentCase);
    
    let nextIndex;
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % caseIds.length;
    } else {
        nextIndex = (currentIndex - 1 + caseIds.length) % caseIds.length;
    }
    
    openModal(caseIds[nextIndex]);
}

function getCurrentCaseId() {
    const title = modalTitle.textContent;
    return Object.keys(caseStudiesData).find(key => 
        caseStudiesData[key].title === title
    );
}

// Add modal navigation arrows
function addModalNavigation() {
    const navHTML = `
        <button class="modal-nav modal-prev" aria-label="Previous case study">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
        </button>
        <button class="modal-nav modal-next" aria-label="Next case study">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
        </button>
    `;
    
    modal.querySelector('.modal-content').insertAdjacentHTML('beforeend', navHTML);
    
    // Add event listeners for navigation
    modal.querySelector('.modal-prev').addEventListener('click', () => navigateModal('prev'));
    modal.querySelector('.modal-next').addEventListener('click', () => navigateModal('next'));
}