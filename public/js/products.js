document.addEventListener('DOMContentLoaded', function () {
    // Initialize filter functionality
    initializeFilters();

    // Initialize view toggle
    initializeViewToggle();

    // Initialize search functionality
    initializeProductsSearch();

    // Initialize clear filters
    initializeClearProductsFilters();

    // Initialize from URL parameters
    initializeProductsFromUrl();
});

function initializeFilters() {
    // Handle filter header clicks (accordion)
    const filterHeaders = document.querySelectorAll('.filter-header');

    filterHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const filterId = this.dataset.filter;
            const content = document.getElementById(filterId + '-content');

            // Toggle active class
            this.classList.toggle('active');
            content.classList.toggle('active');
        });
    });

    // Handle filter changes with radio button uncheck functionality
    const filterInputs = document.querySelectorAll('input[type="radio"]');

    filterInputs.forEach(input => {
        // Store the previous state to enable unchecking
        input.addEventListener('mousedown', function () {
            // Store the current state before the click
            this.wasChecked = this.checked;
        });

        input.addEventListener('click', function (e) {
            // If the radio was already checked, uncheck it
            if (this.wasChecked) {
                this.checked = false;

                // Handle special case for category unchecking - hide classifications
                if (this.name === 'category') {
                    const allClassifications = document.querySelectorAll('[id^="classifications-"]');
                    allClassifications.forEach(section => {
                        section.style.display = 'none';
                    });

                    // Also uncheck any selected classification
                    const selectedClassification = document.querySelector('input[name="classification"]:checked');
                    if (selectedClassification) {
                        selectedClassification.checked = false;
                    }
                }

                // Update filters after unchecking
                updateProductsFilters();
            } else {
                // If it wasn't checked, allow the selection and update filters
                updateProductsFilters();
            }
        });

        // Handle change event for programmatic changes
        input.addEventListener('change', function () {
            if (this.checked) {
                updateProductsFilters();
            }
        });
    });

    // Initialize accordion state - open first few sections by default
    const defaultOpenSections = ['sectors', 'categories'];
    defaultOpenSections.forEach(section => {
        const header = document.querySelector(`[data-filter="${section}"]`);
        const content = document.getElementById(section + '-content');
        if (header && content) {
            header.classList.add('active');
            content.classList.add('active');
        }
    });

    // Handle category selection to show/hide classifications
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    categoryInputs.forEach(input => {
        input.addEventListener('change', function () {
            // Hide all classification sections
            const allClassifications = document.querySelectorAll('[id^="classifications-"]');
            allClassifications.forEach(section => {
                section.style.display = 'none';
            });

            // Clear any selected classification that doesn't belong to the new category
            const selectedClassification = document.querySelector('input[name="classification"]:checked');
            let classificationCleared = false;
            if (selectedClassification) {
                const classificationId = selectedClassification.value;
                const parentCategoryId = findParentCategory(classificationId);

                // If the selected classification doesn't belong to the new category, clear it
                if (parentCategoryId !== this.value) {
                    selectedClassification.checked = false;
                    classificationCleared = true;
                }
            }

            // Show classifications for selected category
            if (this.checked) {
                const categoryId = this.value;
                const classificationsSection = document.getElementById(`classifications-${categoryId}`);
                if (classificationsSection) {
                    classificationsSection.style.display = 'block';
                }
            }

            // If a classification was cleared, update the URL immediately
            if (classificationCleared) {
                // Use setTimeout to ensure the DOM updates are complete
                setTimeout(() => {
                    updateProductsFilters();
                }, 0);
            }
        });
    });

    // Handle classification selection - don't auto-select parent category
    const classificationInputs = document.querySelectorAll('input[name="classification"]');
    classificationInputs.forEach(input => {
        input.addEventListener('change', function () {
            if (this.checked) {
                // Just ensure the parent category's classifications are visible
                const classificationId = this.value;
                const parentCategoryId = findParentCategory(classificationId);

                if (parentCategoryId) {
                    // Show the classifications section
                    const classificationsSection = document.getElementById(`classifications-${parentCategoryId}`);
                    if (classificationsSection) {
                        classificationsSection.style.display = 'block';
                    }
                }
            }
        });
    });

    // Initialize classification visibility based on current selection
    const selectedCategory = document.querySelector('input[name="category"]:checked');
    if (selectedCategory) {
        const categoryId = selectedCategory.value;
        const classificationsSection = document.getElementById(`classifications-${categoryId}`);
        if (classificationsSection) {
            classificationsSection.style.display = 'block';
        }
    }

    // Also check if there's a selected classification and show its parent section
    const selectedClassification = document.querySelector('input[name="classification"]:checked');
    if (selectedClassification) {
        const classificationId = selectedClassification.value;
        const parentCategoryId = findParentCategory(classificationId);

        if (parentCategoryId) {
            const classificationsSection = document.getElementById(`classifications-${parentCategoryId}`);
            if (classificationsSection) {
                classificationsSection.style.display = 'block';
            }
        }
    }
}

// Helper function to find parent category for a classification
function findParentCategory(classificationId) {
    // Method 1: If you have data attributes on the classification inputs
    const classificationInput = document.querySelector(`input[name="classification"][value="${classificationId}"]`);
    if (classificationInput && classificationInput.dataset.parentCategory) {
        return classificationInput.dataset.parentCategory;
    }

    // Method 2: If classifications are grouped in sections with IDs like "classifications-{categoryId}"
    const classificationInputs = document.querySelectorAll('input[name="classification"]');
    for (const input of classificationInputs) {
        if (input.value === classificationId) {
            // Find the parent section
            const parentSection = input.closest('[id^="classifications-"]');
            if (parentSection) {
                // Extract category ID from section ID (e.g., "classifications-air_traffic_management" -> "air_traffic_management")
                const sectionId = parentSection.id;
                const categoryId = sectionId.replace('classifications-', '');
                return categoryId;
            }
        }
    }

    return null;
}

function initializeViewToggle() {
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    const productsGrid = document.getElementById('products-grid');

    gridViewBtn.addEventListener('click', function () {
        productsGrid.classList.remove('list-view');
        this.classList.add('active');
        listViewBtn.classList.remove('active');
    });

    listViewBtn.addEventListener('click', function () {
        productsGrid.classList.add('list-view');
        this.classList.add('active');
        gridViewBtn.classList.remove('active');
    });
}

function initializeProductsSearch() {
    // Get the correct search input element
    const searchInput = document.getElementById('products-filter-search-input'); // Fixed ID
    const searchBtn = document.getElementById('products-filter-search-btn');
    let searchTimeout;

    if (!searchInput) {
        console.error('Search input not found');
        return;
    }

    // Search on Enter key
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            clearTimeout(searchTimeout);
            updateProductsFilters();
        }
    });

    // Search on button click
    if (searchBtn) {
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            clearTimeout(searchTimeout);
            updateProductsFilters();
        });
    }

    // Optional: Search on blur (when user clicks away)
    searchInput.addEventListener('blur', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateProductsFilters();
        }, 100);
    });
}

function initializeClearProductsFilters() {
    const clearBtn = document.getElementById('clear-filters');

    clearBtn.addEventListener('click', function () {
        // Clear all radio buttons
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(input => {
            input.checked = false;
        });

        // Clear search input - use correct ID
        const searchInput = document.getElementById('products-filter-search-input'); // Fixed ID
        if (searchInput) {
            searchInput.value = '';
        }

        // Hide all classification sections
        const allClassifications = document.querySelectorAll('[id^="classifications-"]');
        allClassifications.forEach(section => {
            section.style.display = 'none';
        });

        // Update filters
        updateProductsFilters();
    });
}

function updateProductsFilters() {
    // Get all filter values
    const sectorInput = document.querySelector('input[name="sector"]:checked');
    const categoryInput = document.querySelector('input[name="category"]:checked');
    const classificationInput = document.querySelector('input[name="classification"]:checked');
    const marketInput = document.querySelector('input[name="market"]:checked');
    const typeInput = document.querySelector('input[name="type"]:checked');
    const searchInput = document.getElementById('products-filter-search-input'); // Fixed ID

    // Build query string for ALL filters
    const params = new URLSearchParams();

    if (sectorInput) params.append('sector', sectorInput.value);
    if (categoryInput) params.append('category', categoryInput.value);
    if (classificationInput) params.append('classification', classificationInput.value);
    if (marketInput) params.append('market', marketInput.value);
    if (typeInput) params.append('type', typeInput.value);
    if (searchInput && searchInput.value.trim()) params.append('search', searchInput.value.trim());

    // Use the base URL without /products prefix
    const baseUrl = '/our-products';
    const queryString = params.toString();
    const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    window.location.href = newUrl;
}

// Utility function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Initialize filter state from URL on page load
function initializeProductsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    // Set search input - use correct ID
    const searchParam = urlParams.get('search');
    if (searchParam) {
        const searchInput = document.getElementById('products-filter-search-input'); // Fixed ID
        if (searchInput) {
            searchInput.value = searchParam;
        }
    }

    // Set radio buttons based on URL parameters
    const filterParams = ['sector', 'category', 'classification', 'market', 'type'];
    filterParams.forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            const input = document.querySelector(`input[name="${param}"][value="${value}"]`);
            if (input) {
                input.checked = true;
            }
        }
    });

    // Validate classification belongs to category after setting from URL
    const selectedCategory = document.querySelector('input[name="category"]:checked');
    const selectedClassification = document.querySelector('input[name="classification"]:checked');

    if (selectedCategory && selectedClassification) {
        const categoryId = selectedCategory.value;
        const classificationId = selectedClassification.value;
        const parentCategoryId = findParentCategory(classificationId);

        // If the classification doesn't belong to the selected category, clear it and update URL
        if (parentCategoryId !== categoryId) {
            selectedClassification.checked = false;
            // Update the URL immediately to reflect the cleared classification
            setTimeout(() => {
                updateProductsFilters();
            }, 0);
            return; // Exit early since we're updating the URL
        }
    }

    // Handle legacy URL path structure (for backward compatibility)
    const pathParts = window.location.pathname.split('/').filter(part => part !== '');

    // Updated path detection - no longer looking for 'products' prefix
    if (pathParts.length >= 1 && pathParts[0] !== 'our-products') {
        const slug = pathParts[0];

        // Only set from path if no query parameters exist
        if (!urlParams.toString()) {
            // Try to determine what type of filter this slug represents
            // Check if it's a sector
            const sectorInput = document.querySelector(`input[name="sector"][value="${slug}"]`);
            if (sectorInput) {
                sectorInput.checked = true;
                return;
            }

            // Check if it's a category
            const categoryInput = document.querySelector(`input[name="category"][value="${slug}"]`);
            if (categoryInput) {
                categoryInput.checked = true;

                // Show classifications for this category
                const classificationsSection = document.getElementById(`classifications-${slug}`);
                if (classificationsSection) {
                    classificationsSection.style.display = 'block';
                }
                return;
            }

            // Check if it's a classification
            const classificationInput = document.querySelector(`input[name="classification"][value="${slug}"]`);
            if (classificationInput) {
                classificationInput.checked = true;

                // Show the classifications section for this classification
                const parentCategoryId = findParentCategory(slug);
                if (parentCategoryId) {
                    const classificationsSection = document.getElementById(`classifications-${parentCategoryId}`);
                    if (classificationsSection) {
                        classificationsSection.style.display = 'block';
                    }
                }
                return;
            }
        }
    }

    // Handle any selected classification to show its parent section
    const finalSelectedClassification = document.querySelector('input[name="classification"]:checked');
    if (finalSelectedClassification) {
        const classificationId = finalSelectedClassification.value;
        const parentCategoryId = findParentCategory(classificationId);

        if (parentCategoryId) {
            const classificationsSection = document.getElementById(`classifications-${parentCategoryId}`);
            if (classificationsSection) {
                classificationsSection.style.display = 'block';
            }
        }
    }

    // Show classifications for any selected category
    const finalSelectedCategory = document.querySelector('input[name="category"]:checked');
    if (finalSelectedCategory) {
        const categoryId = finalSelectedCategory.value;
        const classificationsSection = document.getElementById(`classifications-${categoryId}`);
        if (classificationsSection) {
            classificationsSection.style.display = 'block';
        }
    }
}