document.addEventListener('DOMContentLoaded', function () {
    // Mobile dropdown functionality
    if (window.innerWidth < 1199.2) {
        // Handle main dropdown toggles
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const dropdownToggle = dropdown.querySelector('.nav-link.dropdown-toggle');
            const arrow = dropdown.querySelector('.dropdown-toggle-arrow');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');

            // Only handle clicks on the arrow icon for dropdown toggle
            if (arrow && dropdownMenu) {
                arrow.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Toggle arrow rotation
                    const icon = this.querySelector('i');
                    if (dropdownMenu.classList.contains('show')) {
                        icon.className = 'fa fa-caret-down';
                    } else {
                        icon.className = 'fa fa-caret-up';
                    }

                    // Close other open dropdowns
                    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                        if (menu !== dropdownMenu) {
                            menu.classList.remove('show');
                            // Reset other arrows
                            const otherDropdown = menu.closest('.dropdown');
                            const otherArrow = otherDropdown.querySelector('.dropdown-toggle-arrow i');
                            if (otherArrow) {
                                otherArrow.className = 'fa fa-caret-down';
                            }
                        }
                    });

                    // Toggle current dropdown
                    dropdownMenu.classList.toggle('show');
                });
            }

            // Allow the dropdown toggle link to navigate normally
            if (dropdownToggle) {
                dropdownToggle.addEventListener('click', function (e) {
                    e.stopPropagation();
                });
            }
        });


        // Handle submenu toggles
        document.querySelectorAll('.dropdown-submenu').forEach(submenu => {
            const submenuToggle = submenu.querySelector('.dropdown-item.dropdown-toggle');
            const arrow = submenu.querySelector('.dropdown-toggle-arrow');
            const submenuDropdown = submenu.querySelector('.submenu');

            // Only handle clicks on the arrow for submenu toggle
            if (arrow && submenuDropdown) {
                arrow.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Toggle arrow rotation
                    const icon = this.querySelector('i');
                    if (submenuDropdown.classList.contains('show')) {
                        icon.className = 'fa fa-caret-down';
                    } else {
                        icon.className = 'fa fa-caret-up';
                    }

                    // Close other open submenus in the same parent dropdown
                    const parentDropdown = submenu.closest('.dropdown-menu');
                    if (parentDropdown) {
                        parentDropdown.querySelectorAll('.submenu.show').forEach(menu => {
                            if (menu !== submenuDropdown) {
                                menu.classList.remove('show');
                                // Reset other submenu arrows
                                const otherSubmenu = menu.closest('.dropdown-submenu');
                                const otherArrow = otherSubmenu.querySelector('.dropdown-toggle-arrow i');
                                if (otherArrow) {
                                    otherArrow.className = 'fa fa-caret-down';
                                }
                            }
                        });
                    }

                    // Toggle current submenu
                    submenuDropdown.classList.toggle('show');
                });
            }

            // Allow submenu toggle links to work as normal links (if they have hrefs)
            if (submenuToggle) {
                submenuToggle.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        e.stopPropagation();
                    } else {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            }
        });

        // Handle third-level submenu toggles
        document.querySelectorAll('.dropdown-submenu .dropdown-submenu').forEach(submenu => {
            const submenuToggle = submenu.querySelector('.dropdown-item.dropdown-toggle');
            const arrow = submenu.querySelector('.dropdown-toggle-arrow');
            const submenuDropdown = submenu.querySelector('.submenu-level-2');

            if (arrow && submenuDropdown) {
                arrow.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const icon = this.querySelector('i');
                    if (submenuDropdown.classList.contains('show')) {
                        icon.className = 'fa fa-caret-down';
                    } else {
                        icon.className = 'fa fa-caret-up';
                    }

                    // Close other third-level menus
                    const parentSubmenu = submenu.closest('.submenu');
                    if (parentSubmenu) {
                        parentSubmenu.querySelectorAll('.submenu-level-2.show').forEach(menu => {
                            if (menu !== submenuDropdown) {
                                menu.classList.remove('show');
                                const otherSubmenu = menu.closest('.dropdown-submenu');
                                const otherArrow = otherSubmenu.querySelector('.dropdown-toggle-arrow i');
                                if (otherArrow) {
                                    otherArrow.className = 'fa fa-caret-down';
                                }
                            }
                        });
                    }

                    submenuDropdown.classList.toggle('show');
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                    // Reset arrows
                    const dropdown = menu.closest('.dropdown');
                    const arrow = dropdown.querySelector('.dropdown-toggle-arrow i');
                    if (arrow) {
                        arrow.className = 'fa fa-caret-down';
                    }
                });
                document.querySelectorAll('.submenu.show').forEach(menu => {
                    menu.classList.remove('show');
                    // Reset submenu arrows
                    const submenu = menu.closest('.dropdown-submenu');
                    const arrow = submenu.querySelector('.dropdown-toggle-arrow i');
                    if (arrow) {
                        arrow.className = 'fa fa-caret-down';
                    }
                });
            }
        });
    }

    // Handle window resize to reset dropdowns when switching between mobile/desktop
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1199.2) {
            // Remove show classes when switching to desktop view
            document.querySelectorAll('.dropdown-menu.show, .submenu.show').forEach(menu => {
                menu.classList.remove('show');
            });
            // Reset all arrows
            document.querySelectorAll('.dropdown-toggle-arrow i').forEach(arrow => {
                arrow.className = 'fa fa-caret-down';
            });
        }
    });

    // Active nav highlighting
    function setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));

        let exactMatch = false;

        // First, try to find an exact match
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
                exactMatch = true;
            }
        });

        // If no exact match, find the best partial match
        if (!exactMatch) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href !== '/' && currentPath.startsWith(href)) {
                    link.classList.add('active');
                }
            });
        }
    }

    // Set active nav item on page load
    setActiveNavItem();

    // Update active nav item when navigating with browser back/forward buttons
    window.addEventListener('popstate', setActiveNavItem);
});

// Search functionality
const searchData = [
    // Airfield Ground Lights
    { title: "LED Approach Light", category: "Approach Lighting", url: "/led-approach-light", description: "High-intensity, Uni-directional, Elevated Runway Approach,Threshold, Threshold Wingbar & Runway End lights used in SAPL & ICAO category I, II & III runways." },
    { title: "LED Threshold Light", category: "Approach Lighting", url: "/led-threshold-light", description: "High-intensity, Uni-directional, Elevated Threshold lights for ICAO category I, II & III runways." },
    { title: "LED Runway End Light", category: "Approach Lighting", url: "/led-runway-end-light", description: "High-intensity, Uni-directional, Elevated Runway End lights for ICAO category I, II & III runways." },
    { title: "PAPI Lighting", category: "PAPI Lighting", url: "/papi-lighting", description: "Precision Approach Path Indicator for aircraft glide slope guidance using visual light array." },
    { title: "Runway Edge Light", category: "Runway Lighting", url: "/runway-edge-light", description: "Medium intensity omni-directional inset runway edge light for general applications." },
    { title: "Runway Centerline Light", category: "Runway Lighting", url: "/runway-centerline-light", description: "Runway centerline light for CAT III airfield ground lighting systems with LAHSO support." },
    { title: "Taxiway Centerline Lighting", category: "Taxiway Lighting", url: "/taxiway-centerline-lighting", description: "High-performance taxiway centerline lighting system." },
    { title: "Runway Guard Lights", category: "Taxiway Lighting", url: "/runway-guard-light", description: "Elevated runway guard lights for taxiway/runway intersections to avoid incursions." },
    { title: "Airfield Guidance Signs", category: "Airfield Guidance Signs", url: "/airfield-guidance-signs", description: "Comprehensive airfield signage system for pilot navigation and safety." },
    { title: "Mandatory Information Signs", category: "Airfield Guidance Signs", url: "/mandatory-information-signs", description: "LED signs meeting ICAO requirements for mandatory and informational guidance." },
    { title: "Series Circuit Isolating Transformers", category: "Transformers & Connector Kits", url: "/series-circuit-isolating-transformers", description: "Plug-in type isolating transformers for series airfield lighting circuits." },
    { title: "Micro 100 CCR", category: "CCRs & Accessories", url: "/micro-100-ccr", description: "Compact Constant Current Regulator with high efficiency for AGL circuits." },
    { title: "Portable Lighting", category: "Portable Lighting", url: "/portable-lighting", description: "Portable airfield lighting for temporary and emergency operations." },
    { title: "Windsock Mast", category: "Windsock Mast", url: "/windsock-mast", description: "Floodlit windsock mast with ICAO-compliant visibility and design." },
    { title: "AGNiS Docking Aid", category: "AGNiS Docking Aid", url: "/agnis-docking-aid", description: "Azimuth guidance system for safe aircraft stand alignment." },

    // Other Products
    { title: "AVDGS", category: "AVDGS", url: "/avdgs", description: "Advanced Visual Docking Guidance System with 3D laser tracking and ICAO compliance." },
    { title: "Photometric System", category: "Photometric System", url: "/photometric-system", description: "Advanced light performance measurement and calibration systems." },
    { title: "ILCMS", category: "ILCMS", url: "/ilcms", description: "Integrated Lighting Control and Monitoring System for airfield lighting infrastructure." },
    { title: "Heliport Lighting", category: "Heliport Lighting", url: "/heliport-lighting", description: "Specialized lighting systems for heliports and helipads including TLOF, FATO, beacon, etc." },
    { title: "Air Traffic Management", category: "Air Traffic Management", url: "/air-traffic-management", description: "Integrated systems for managing air traffic with surveillance, radar, communication and alarms." },
    { title: "Navigation & Tracking", category: "Navigation & Tracking", url: "/navigation-tracking", description: "Precision navigation and tracking systems including NDB, ADS-B, and monitoring." },
    { title: "Weather & Communication", category: "Weather & Communication", url: "/weather-communication", description: "Automated weather monitoring and tactical communication solutions." },
    { title: "Support Equipment", category: "Support Equipment", url: "/support-equipment", description: "Auxiliary equipment like shelters, power generators, pilot cages for airfield operations." },
    { title: "Smart Metering", category: "Smart Metering", url: "/smart-metering", description: "Modern metering systems for energy management and emergency alerts." },

    // Main Pages
    { title: "About Us", category: "Company", url: "/about", description: "Learn about Vardhman Airport Solutions" },
    { title: "Our Products", category: "Products", url: "/our-products", description: "Complete range of airport lighting and infrastructure products" },
    { title: "Our Solutions", category: "Solutions", url: "/solutions", description: "Tailored airport and defense solutions from Vardhman" },
    { title: "News", category: "News", url: "/news", description: "Latest news, updates, and innovations" },
    { title: "Point of View", category: "Insights", url: "/pov", description: "Expert perspectives on airport systems and technologies" },
    { title: "Careers", category: "Careers", url: "/careers", description: "Join the Vardhman team and shape airport technology" },
    { title: "Contact", category: "Contact", url: "/contact", description: "Reach out to Vardhman for product or business inquiries" },

    { title: "Defense Solutions", category: "Sector", url: "/our-products?sector=defense", description: "Explore defense-grade airport systems, radar, lighting, ATC shelters and tactical equipment." },
    { title: "Airport Infrastructure", category: "Sector", url: "/our-products?sector=airport", description: "Advanced airport solutions for lighting, docking, communication, and navigation systems." },
    { title: "Railway Systems", category: "Sector", url: "/our-products?sector=railways", description: "Smart metering and communication systems tailored for rail infrastructure." },
    { title: "Smart Infrastructure", category: "Sector", url: "/our-products", description: "Integrated lighting, energy, and monitoring systems for modern infrastructure needs." },
    { title: "Tactical Communication", category: "Defense", url: "/weather-communication", description: "Military-grade tactical communication systems and emergency response tools." },
    { title: "Air Traffic Control", category: "Air Traffic Management", url: "/air-traffic-management", description: "Real-time ATC solutions, mobile towers, alarm systems, and voice recorders." },
    { title: "Meteorological Systems", category: "Weather & Communication", url: "/weather-communication", description: "Weather radars, AWOS, and observation tools for all-weather operations." },
    { title: "Lighting Control", category: "ILCMS", url: "/ilcms", description: "Integrated Lighting Control and Monitoring Systems for airfields." },

];


function initializeSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const searchLoading = document.getElementById('searchLoading');
    const searchDropdown = document.querySelector('.search-dropdown');

    if (!searchToggle || !searchInput || !searchBtn || !searchResults) return;

    // Handle search toggle
    searchToggle.addEventListener('click', function (e) {
        console.log("yes")
        e.preventDefault();
        if (window.innerWidth < 1199.2) {
            // Mobile behavior
            searchDropdown.classList.toggle('show');
            if (searchDropdown.classList.contains('show')) {
                console.log("true")
                setTimeout(() => searchInput.focus(), 100);
            }
        } else {
            // Desktop behavior - focus input when clicked
            setTimeout(() => searchInput.focus(), 100);
        }
    });

    // Handle search input
    let searchTimeout;
    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        searchLoading.classList.remove('d-none');
        searchResults.innerHTML = '';

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    // Handle search button
    searchBtn.addEventListener('click', function () {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            performSearch(query);
        }
    });

    // Handle Enter key
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query.length >= 2) {
                performSearch(query);
            }
        }
    });

    function performSearch(query) {
        searchLoading.classList.add('d-none');

        const results = searchData.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );

        displayResults(results, query);
    }

    function displayResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.slice(0, 8).map(item => `
            <div class="search-result-item" onclick="window.location.href='${item.url}'">
                <div class="search-result-title">${highlightMatch(item.title, query)}</div>
                <div class="search-result-category">${item.category}</div>
                <div class="search-result-description">${highlightMatch(item.description, query)}</div>
            </div>
        `).join('');

        searchResults.innerHTML = resultsHTML;
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Close search dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown') || !e.target.closest('.search-dropdown')) {
            if (window.innerWidth < 1199.2) {
                searchDropdown.classList.remove('show');
            }
        }
    });
}

// Initialize search when DOM is loaded
initializeSearch();