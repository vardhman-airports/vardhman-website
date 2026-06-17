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
    // Airfield Ground Lights - Approach Lighting
    { title: "LED Elevated Approach Light", category: "Approach Lighting", url: "/led-approach-light", description: "High-intensity, Uni-directional, Elevated Runway Approach,Threshold, Threshold Wingbar & Runway End lights used in SAPL & ICAO category I, II & III runways. Siderow Barrette used in ICAO category II & III runways." },
    { title: "LED Elevated Threshold Light", category: "Approach Lighting", url: "/led-threshold-light", description: "High-intensity, Uni-directional, Elevated Runway Approach,Threshold, Threshold Wingbar & Runway End lights used in SAPL & ICAO category I, II & III runways. Siderow Barrette used in ICAO category II & III runways." },
    { title: "LED Elevated Runway End Light", category: "Approach Lighting", url: "/led-runway-end-light", description: "High-intensity, Uni-directional, Elevated Runway Approach,Threshold, Threshold Wingbar & Runway End lights used in SAPL & ICAO category I, II & III runways. Siderow Barrette used in ICAO category II & III runways." },
    { title: "Halogen Elevated Approach & Siderow Light", category: "Approach Lighting", url: "/elevated-approach-siderow-barrette", description: "High intensity, uni-directional, elevated runway approach and siderow barrette lights suitable for use in all weather operation installations up to ICAO category III systems." },
    { title: "Halogen Elevated Threshold & Threshold Light", category: "Approach Lighting", url: "/elevated-threshold-threshold-wingbar", description: "High intensity uni-directional elevated threshold and threshold wingbar and suitable for use in all weather operation installations up to ICAO category III systems." },
    { title: "Halogen Elevated Runway End Light", category: "Approach Lighting", url: "/elevated-runway-end-light", description: "High intensity, uni-directional, elevated runway end lights suitable for use in all weather operation installations up to ICAO category III systems." },
    { title: "Inset LED Approach Light", category: "Approach Lighting", url: "/inset-approach-siderow-barrette", description: "High intensity inset siderow barrette fitting suitable for use in category I, II and III all weather operation airfield lighting systems." },
    { title: "Inset LED Threshold Light", category: "Approach Lighting", url: "/inset-threshold-light", description: "High intensity inset threshold light fitting suitable for use in category I, II and III all weather operation airfield lighting systems." },
    { title: "Inset LED Runway End Light", category: "Approach Lighting", url: "/inset-runway-end-light", description: "High intensity inset Runway End fitting suitable for use in category I, II and III all weather operation airfield lighting systems." },
    { title: "Inset Threshold/Runway End Light", category: "Approach Lighting", url: "/inset-threshold-runway-end-lights", description: "High intensity inset Threshold/Runway End fitting suitable for use in category I, II and III all weather operation airfield lighting systems." },
    { title: "Inset Threshold Wingbar", category: "Approach Lighting", url: "/inset-threshold-wingbar", description: "High intensity inset threshold wingbar suitable for use in category I, II and III all weather operation airfield lighting systems." },
    { title: "Sequenced Flashing Lighting System", category: "Approach Lighting", url: "/sequenced-flashing-lighting-system", description: "High-intensity approach lighting system with sequenced flash patterns to guide pilots during final approach. Designed for CAT I, II & III runway approaches." },

    // Airfield Ground Lights - PAPI Lighting
    { title: "PAPI Lighting", category: "PAPI Lighting", url: "/papi-lighting", description: "Precision Approach Path Indicator (PAPI) lights for accurate glide path guidance during landing." },

    // Airfield Ground Lights - Runway Lighting
    { title: "LED Elevated Runway Edge Light", category: "Runway Lighting", url: "/elevated-runway-edge-light", description: "High intensity, Elevated bi-directional (with omni-directional component), elevated runway edge light for use in all weather operation installations up to ICAO category III systems. Medium intensity, bi/uni-directional elevated threshold/end light." },
    { title: "LED Inset Runway Centreline Light", category: "Runway Lighting", url: "/centerline-tdz-high-intensity-light", description: "Uni or bi-directional inset fitting suitable for use in category I, II and III all weather operation as: Runway centreline fitting." },
    { title: "Inset LED TDZ Uni-Directional Light", category: "Runway Lighting", url: "/centerline-tdz-bi-directional-light", description: "Inset Runway centreline or touchdown zone fixture for use in category I, II & III all weather operation airfield lighting systems." },
    { title: "Inset Runway Edge Light", category: "Runway Lighting", url: "/runway-edge-light", description: "High intensity, inset runway edge fitting suitable for use in category I, II and III all weather operation airfield lighting systems." },
    { title: "Inset LED Turn Pad Light", category: "Runway Lighting", url: "/runway-centerline-light", description: "Omni-directional medium intensity inset fitting for taxiway, helipad, turnpad edge and general applications." },
    { title: "Runway Centerline Light", category: "Runway Lighting", url: "/runway-tdz-light", description: "Runway centerline, Land and Hold Short Operations (LAHSO). CAT III all weather operation airfield ground lighting (agl) systems.As applicable to the application, compliance with other civil aviation and military regulations confirmed on request.Light Direction and Colors, Bidirectional: white-white, white-red .Unidirectional: white, red." },

    // Airfield Ground Lights - Taxiway Lighting
    { title: "Inset LED Taxiway Center Line Light", category: "Taxiway Lighting", url: "/taxiway-centerline-lighting", description: "High-performance taxiway centerline lighting system." },
    { title: "Inset LED Taxiway Stop Bar Light", category: "Taxiway Lighting", url: "/taxiway-stopbar", description: "High-performance taxiway stop bar lighting system." },
    { title: "Inset LED Rapid Exit Taxiway Indicator Light", category: "Taxiway Lighting", url: "/taxiway-indicator", description: "High-performance rapid exit taxiway indicator lighting system." },
    { title: "Inset LED Intermediate Holding Position Light", category: "Taxiway Lighting", url: "/taxiway-indermediate", description: "High-performance intermediate holding position lighting system." },
    { title: "High Intensity Runway Guard Light", category: "Taxiway Lighting", url: "/high-intensity-runway-guard-light", description: "Elevated runway guard lights for taxiway/runway intersections to avoid incursions." },
    { title: "Elevated Halogen Taxiway Edge Light", category: "Taxiway Lighting", url: "/elevated-omni-directional-light", description: "It is an Omni-directional tungsten halogen taxiway and apron edge fitting for CAT III all weather operation airfield ground lighting (AGL) systems." },
    { title: "Elevated LED Taxiway & apron edge Light", category: "Taxiway Lighting", url: "/taxiway-apron-edge-elevated-omni-directional-light", description: "It is an Omni-directional taxiway and apron edge fitting suitable for CAT III all weather operation airfield ground lighting (AGL) systems." },
    { title: "Inset LED Aircraft Stand Manoeuvring Guidance Light", category: "Taxiway Lighting", url: "/inset-omni-directional-apron-light", description: "Omni-directional inset fitting for Stand Manoeuvring in Apron." },

    // Airfield Ground Lights - Airfield Guidance Signs
    { title: "Mandory/Information Signs", category: "Airfield Guidance Signs", url: "/mandatory-information-signs", description: "It is LED airfield guidance sign is the latest model of airfield sign to be manufactured by Vardhman airports. This sign is specifically designed to meet the ICAO requirements for Mandatory and Information airfield guidance signs." },
    { title: "Runway Distance Marker", category: "Airfield Guidance Signs", url: "/runway-distance-marker", description: "Illuminated Runway Distance Markers indicate the distance to the end of the active runway to the pilot." },

    // Airfield Ground Lights - Transformers & Connector Kits
    { title: "Series Circuit Isolating Transformers", category: "Transformers & Connector Kits", url: "/series-circuit-isolating-transformers", description: "Series circuit airfield lighting isolating transformers are featuring plug-in connectors to simplify installation and maintenance." },
    { title: "Primary Connector Kits", category: "Transformers & Connector Kits", url: "/primary-connector-kits-2", description: "To provide separable waterproof connections between non-screened primary cable and an isolating transformer." },
    { title: "Primary Connector Kits (Resin Type)", category: "Transformers & Connector Kits", url: "/primary-connector-kits-resin-type", description: "To provide separable waterproof connections between all classes of armoured or un-armoured airfield lighting cable and polychloroprene encapsulated transformers." },
    { title: "Secondary Connector Kits", category: "Transformers & Connector Kits", url: "/secondary-connector-kits", description: "To terminate two core round waterproof insulated cable with a receptacle (female) connector conforming to FAA specification L-823, style 12." },

    // Airfield Ground Lights - CCRs & Accessories
    { title: "Constant Current Regulator", category: "CCRs & Accessories", url: "/micro-100-ccr", description: "The CCR is specifically designed for the efficient and effective supply of power to airfield ground lighting series circuits." },
    { title: "Micro Processor Constant Current Regulator", category: "CCRs & Accessories", url: "/mpccr", description: "Designed specifically for the supply of airport lighting series circuits of varying intensities. Features HMI control, parallel & serial communication, and comprehensive fault protection." },
    { title: "Multiway Circuit Selector Switch", category: "CCRs & Accessories", url: "/multiway-circuit-selector-switch", description: "Enables CCR to switch power to multiple series lighting circuits on runways, taxiways, etc., with safe and flexible output selection." },
    { title: "Series Circuit Cut-Out Switch", category: "CCRs & Accessories", url: "/series-circuit-cut-out-switch", description: "Allows safe disconnection, isolation, and earthing of field series circuits in airfield ground lighting using a rotating connector lid." },

    // Airfield Ground Lights - Portable Lighting
    { title: "Portable Aviation Runway Light", category: "Portable Lighting", url: "/portable-aviation-runway-lighting-fixture", description: "The Portable LED Light is used to set up temporary or semipermanent lighting systems for aircraft or helicopters to land on grass strips, frozen lakes, or roadways, or as emergency runway lighting on major airports." },
    { title: "Obstruction Aviation LED Light", category: "Taxiway Lighting", url: "/portable-aviation-led-light", description: "For temporary installations at civil and military airfields and heliports in case of emergency or maintenance power-offs or to delineate areas temporarily closed to traffic for works." },

    // Airfield Ground Lights - Windsock Mast
    { title: "Illuminated Wind Direction Indicator", category: "Windsock Mast", url: "/windsock-mast", description: "High-quality windsock masts for airfield operations." },

    // Other Products
    { title: "Advanced Visual Docking Guidance System (AVDGS)", category: "AVDGS", url: "/avdgs", description: "Cutting-edge 3D laser technology based Advanced Visual Docking Guidance System which fully complies with ICAO Annex 14 recommendations. It accommodate all aircraft types without the error factors resulting from variations in aircraft height and gross weight." },
    { title: "Photometric Workshop Equipment (PAC Lab II)", category: "Photometric System", url: "/photometric-workshop-equipment", description: "Advanced light performance measurement and calibration systems." },
    { title: "Workshop photometry controller", category: "Photometric System", url: "/photometric-workshop-equipment", description: "Advanced light performance measurement and calibration systems." },
    { title: "m-TAC Manual Torque of AGL Control", category: "Photometric System", url: "/frame-reader-equipment", description: "The m-TAC system is the ultimate tool for manual control of the torque value of each screw/ bolt tightening the inset fittings on their respective shallow base." },
    { title: "PAC Matrix", category: "Photometric System", url: "/frame-reader-equipment", description: "The PAC Matrix (Matrix of sensors for Photometric Airfield Calibration) is a portable photometry measurement system that can be used both in workshop and on-site." },
    { title: "Mobile Photometric Airfield Calibration", category: "Photometric System", url: "/photometric-airfield-calibration", description: "The Innovation in Mobile Light Measurement of Airfield Lighting System" },
    { title: "PAPI Photometric Calibration System", category: "Photometric System", url: "/papi-photometric-calibration-system", description: "The PAPI (Precision Approach Path Indicator) system provides the pilot a positive indication of the aircraft's position relative to the optimal glide slope during final approach to the runway." },
    { title: "Airfield Guidance Signs Calibration System", category: "Photometric System", url: "/airfield-guidance-signs-calibration-system", description: "The Airfield Signs are signs that are used to provide pilots with mandatory instructions, information on a specific location or destination on a movement area." },
    { title: "Airfield Lighting Soda Powder Cleaning Equipment", category: "Photometric System", url: "/sodice-airfield-lighting-soda-powder-cleaning-equipment", description: "This system is designed for airports wishing to use safe and advanced equipment for cleaning their inset and elevated lights with the greatest efficiency and under all weather conditions." },
    { title: "Airfield Lighting Control and Monitoring Systems (ALCMS)", category: "ILCMS", url: "/ilcms", description: "Integrated Lighting Control and Monitoring System for airfield lighting infrastructure." },
    { title: "Heliport Approach Path Indicator (HAPI)", category: "Heliport Lighting", url: "/heliport-approach-path-indicator", description: "The Helicopter Approach Path Indicator - HAPI system consists of a single lighting to provide a visual indication of the correct approaching path of the helicopter." },
    { title: "LED Helipad Elevated Light", category: "Heliport Lighting", url: "/heliport-elevated-light", description: "Heliport Elevated light should not exceed a height of 25cm. There is a fragile coupling in the base connection, so if aircraft hit the light by accident, the base will break immediately to avoid more damage." },
    { title: "Heliport Beacon", category: "Heliport Lighting", url: "/heliport-beacon", description: "A heliport beacon should be provided at a heliport where: a) long-range visual guidance is considered necessary and is not provided by other visual means; or b) identification of the heliport is difficult due to surrounding lights" },
    { title: "LED Heliport Inset Light", category: "Heliport Lighting", url: "/heliport-inset-light", description: "Heliport Inset light is always be installed at locations where the lights are frequently knocked down by aircraft or maintenance vehicles. It could be used as Aiming point light, perimeter light of FATO(Final approach and take-off areas), TLOF (Touchdown and lift-off areas), taxiway, runway, Flight path alignment guidance lighting, etc." },
    { title: "Floodlight Helipad Lighting System", category: "Heliport Lighting", url: "/floodlight-helipad-lighting-system", description: "LED Surface Heliport Flood Light is used for illuminate the whole heliport area at night. It is specially designed for helipads/Helideck, providing glare-free, uniform surface lighting for landing and loading activities." },
    { title: "Air Traffic Management System", category: "Air Traffic Management", url: "/air-traffic-management-system", description: "The ATM (Air Traffic Management) system is a modern, integrated framework designed to ensure the safe, efficient, and coordinated movement of aircraft both in controlled airspace and at airports." },
    { title: "Automatic Weather Observation System (AWOS)", category: "Weather & Communication", url: "/automatic-weather-observation-system", description: "Automated Weather Observing System (AWOS) enhances airfield and operational safety by delivering continuous, real-time meteorological data." },
    { title: "Portable Tracking System", category: "Navigation & Tracking", url: "/portable-tracking-system", description: "Portable Tracking System provides real-time aircraft tracking and enhanced situational awareness, ensuring efficient surveillance and coordination in dynamic airspace environments." },
    { title: "Aircraft Monitoring System for Air Traffic Control Recording", category: "Navigation & Tracking", url: "/aircraft-monitoring-system", description: "Aircraft Monitoring System delivers continuous, intelligent monitoring for secure and efficient airbase/heliport operations." },
    { title: "Airfield/Heliport Alarm System", category: "Air Traffic Management", url: "/airfield-alarm-system", description: "The Airfield alarm system swiftly alerts emergency services, including ambulances, fire departments, and other agencies, in the event of a crash." },
    { title: "Airfield Road Traffic Management System", category: "Air Traffic Management", url: "/airfield-road-traffic-management", description: "Airfield Road Traffic Management System provides secure and efficient access control across critical runway areas." },
    { title: "Voice Communication Control System", category: "Weather & Communication", url: "/voice-communication-control-system", description: "Voice Communication Control System delivers reliable, secure, and multi-channel voice communication for coordinated command and control in dynamic environments." },
    { title: "Digital Voice Recorder System", category: "Air Traffic Management", url: "/digital-voice-recorder-system", description: "The Digital Recorder System shall be a complete network-based solution to record, playback and analyze all data exchanged in an ATC/ATM." },
    { title: "External Pilot Cage Protection", category: "Support Equipment", url: "/external-pilot-cage-protection", description: "A robust access barrier solution using hydraulic telescopic bollards, integrated with high-strength galvanized components and remote push-button controls." },
    { title: "Power Generation System", category: "Support Equipment", url: "/power-generation-system", description: "Designed for critical aviation environments, this system ensures seamless power continuity through intelligent auto-start and load management." },
    { title: "Runway/Tower Miscellaneous Equipment", category: "Support Equipment", url: "/runway-miscellaneous-equipment", description: "Miscellaneous equipment for runway and tower operations." },
    { title: "Mobile ATC", category: "Air Traffic Management", url: "/mobile-atc", description: "Mobile ATC provides flexible, reliable and scalable air traffic control in various operational scenarios." },
    { title: "Weather Radar", category: "Weather & Communication", url: "/weather-radar", description: "A Doppler Weather Radar is an advanced meteorological system engineered to detect and monitor weather phenomena with high precision." },
    { title: "NDB - Non-Directional Beacon", category: "Navigation & Tracking", url: "/ndb-beacon", description: "A Non-Directional Beacon (NDB) is a ground-based radio transmitter used in aviation for navigation." },
    { title: "CADF - Commutated Aerial Direction Finding", category: "Navigation & Tracking", url: "/cadf-system", description: "CADF is a ground-based system that detects the direction from which a radio signal is transmitted by an aircraft." },
    { title: "Equipment Shelter", category: "Support Equipment", url: "/equipment-shelter", description: "An equipment shelter is a secure, weatherproof enclosure designed to protect critical electronic and mechanical systems." },
    { title: "Smart Energy Meter", category: "Smart Metering", url: "/smart-energy-meter", description: "The Smart Energy Meter is a modern power monitoring device designed to bring visibility, efficiency, and control to energy usage." },
    { title: "Emergency Alert System", category: "Support Equipment", url: "/emergency-alert-system", description: "The Emergency Alert System is a dedicated device equipped with an integrated application designed to send instant emergency SMS alerts." },

    // Main Pages
    { title: "About Us", category: "Company", url: "/about", description: "Learn about Vardhman Airport Solutions" },
    { title: "Our Products", category: "Products", url: "/our-products", description: "Complete range of airport lighting and infrastructure products" },
    { title: "Our Solutions", category: "Solutions", url: "/solutions", description: "Tailored airport and defense solutions from Vardhman" },
    { title: "News", category: "News", url: "/news", description: "Latest news, updates, and innovations" },
    { title: "Point of View", category: "Insights", url: "/pov", description: "Expert perspectives on airport systems and technologies" },
    { title: "Careers", category: "Careers", url: "/careers", description: "Join the Vardhman team and shape airport technology" },
    { title: "Contact", category: "Contact", url: "/contact", description: "Reach out to Vardhman for product or business inquiries" },

    // Categories
    { title: "Airfield Ground Lights", category: "Product Category", url: "/our-products?category=airfield-ground-lights", description: "Built on Experience, designed for the future Vardhman Airports provide a comprehensive range of airfield lighting solutions for clients all over the world." },
    { title: "Advanced Visual Docking Guidance Systems (AVDGS)", category: "Product Category", url: "/our-products?category=avdgs", description: "Cutting-edge 3D laser technology based Advanced Visual Docking Guidance System." },
    { title: "Photometric System", category: "Product Category", url: "/our-products?category=photometric-system", description: "Advanced light performance measurement and calibration systems." },
    { title: "Airfield Lighting Control and Monitoring Systems (ALCMS)", category: "Product Category", url: "/our-products?category=ilcms", description: "Integrated Lighting Control and Monitoring System for airfield lighting infrastructure." },
    { title: "Heliport Lighting", category: "Product Category", url: "/our-products?category=heliport-lighting", description: "Specialized lighting systems for heliports and helipads." },
    { title: "Air Traffic Management", category: "Product Category", url: "/our-products?category=air-traffic-management", description: "Integrated systems for managing air traffic with surveillance, radar, communication and alarms." },
    { title: "Navigation Aids", category: "Product Category", url: "/our-products?category=navigation-tracking", description: "Precision navigation and tracking systems including NDB, ADS-B, and monitoring." },
    { title: "Weather & Communication", category: "Product Category", url: "/our-products?category=weather-communication", description: "Automated weather monitoring and tactical communication solutions." },
    { title: "Smart Equipment", category: "Product Category", url: "/our-products?category=support-equipment", description: "Auxiliary equipment like shelters, power generators, pilot cages for airfield operations." },
    { title: "Smart Metering", category: "Product Category", url: "/our-products?category=smart-metering", description: "Modern metering systems for energy management and emergency alerts." },

    // Subcategories
    { title: "Approach Lighting", category: "Subcategory", url: "/our-products?category=airfield-ground-lights&subcategory=approach-lighting", description: "Vardhman Airports offer a range of airfield lighting solutions in approach, threshold, end lighting compliant to all the latest standards." },
    { title: "PAPI Lighting", category: "Subcategory", url: "/our-products?category=airfield-ground-lights&subcategory=papi-lighting", description: "Precision Approach Path Indicator (PAPI) lights for accurate glide path guidance." },
    { title: "Runway Lighting", category: "Subcategory", url: "/our-products?category=airfield-ground-lights&subcategory=runway-lighting", description: "Vardhman Airports offer a wide range of airfield lighting solutions including runway lighting and runway edge lighting." },
    { title: "Taxiway Lighting", category: "Subcategory", url: "/our-products?category=airfield-ground-lights&subcategory=taxiway-lighting", description: "Vardhman Airports offer a range of airfield lighting solutions including taxiway lighting, center line and edge lighting." },
    { title: "Airfield Guidance Signs", category: "Subcategory", url: "/our-products?category=airfield-ground-lights&subcategory=airfield-guidance-signs", description: "Vardhman airports offer a range of airfield guidance signs,LED Runway guidance signs, LED taxiway guidance signs." },
    { title: "Transformers & Connector Kits", category: "Subcategory", url: "/our-products?category=airfield-ground-lights&subcategory=transformers-connector-kits", description: "Reliable transformers and connectors for airfield lighting systems." },
    { title: "CCRs & Accessories", category: "Subcategory", url: "/our-products?category=airfield-ground-lights&subcategory=ccrs-accessories", description: "Constant current regulators and accessories for efficient airfield lighting control." },
    { title: "Portable Aviation Runway Light", category: "Subcategory", url: "/portable-aviation-runway-lighting-fixture", description: "Portable airfield lighting solutions for temporary and emergency operations." },
    { title: "Windsock Mast", category: "Subcategory", url: "/our-products?category=airfield-ground-lights&subcategory=windsock-mast", description: "High-quality windsock masts for airfield operations." },
    { title: "Photometric Workshop Equipment", category: "Subcategory", url: "/our-products?category=photometric-system&subcategory=photometric-workshop-equipment", description: "Advanced light performance measurement and calibration systems." },
    { title: "Frame Reader Equipment", category: "Subcategory", url: "/our-products?category=photometric-system&subcategory=frame-reader-equipment", description: "Portable photometry measurement systems." },
    { title: "Photometric Airfield Calibration", category: "Subcategory", url: "/our-products?category=photometric-system&subcategory=photometric-airfield-calibration", description: "Mobile light measurement systems for airfield calibration." },
    { title: "PAPI Photometric Calibration System", category: "Subcategory", url: "/our-products?category=photometric-system&subcategory=papi-photometric-calibration-system", description: "Calibration systems for PAPI lighting." },
    { title: "Airfield Guidance Signs Calibration System", category: "Subcategory", url: "/our-products?category=photometric-system&subcategory=airfield-guidance-signs-calibration-system", description: "Calibration systems for airfield guidance signs." },
    { title: "Sodice Airfield Lighting Soda Powder Cleaning Equipment", category: "Subcategory", url: "/our-products?category=photometric-system&subcategory=sodice-airfield-lighting-soda-powder-cleaning-equipment", description: "Advanced cleaning equipment for airfield lights." },
    { title: "Aiming Point Lights", category: "Subcategory", url: "/our-products?category=heliport-lighting&subcategory=aiming-point-lights", description: "Heliport approach path indicators." },
    { title: "Approach Steady", category: "Subcategory", url: "/our-products?category=heliport-lighting&subcategory=approach-steady", description: "Steady approach lighting for heliports." },
    { title: "Heliport Beacon", category: "Subcategory", url: "/our-products?category=heliport-lighting&subcategory=heliport-beacon", description: "Beacons for heliport identification." },
    { title: "FATO", category: "Subcategory", url: "/our-products?category=heliport-lighting&subcategory=fato", description: "Final approach and take-off area lighting." },
    { title: "Floodlight Heliport Lighting System", category: "Subcategory", url: "/our-products?category=heliport-lighting&subcategory=floodlight-helipad-lighting-system", description: "Floodlight systems for heliport illumination." },
    { title: "Air Traffic Management System", category: "Subcategory", url: "/our-products?category=air-traffic-management&subcategory=air-traffic-management-system", description: "Integrated air traffic management frameworks." },
    { title: "Automatic Weather Observation System", category: "Subcategory", url: "/our-products?category=weather-communication&subcategory=automatic-weather-observation-system", description: "Automated weather observing systems." },
    { title: "Portable Tracking System", category: "Subcategory", url: "/our-products?category=navigation-tracking&subcategory=portable-tracking-system", description: "Portable aircraft tracking systems." },
    { title: "Aircraft Monitoring System", category: "Subcategory", url: "/our-products?category=navigation-tracking&subcategory=aircraft-monitoring-system", description: "Intelligent aircraft monitoring systems." },
    { title: "Airfield Alarm System", category: "Subcategory", url: "/our-products?category=air-traffic-management&subcategory=airfield-alarm-system", description: "Emergency alert systems for airfields." },
    { title: "Airfield Road Traffic Management", category: "Subcategory", url: "/our-products?category=air-traffic-management&subcategory=airfield-road-traffic-management", description: "Traffic management systems for airfield roads." },
    { title: "Voice Communication Control System", category: "Subcategory", url: "/our-products?category=weather-communication&subcategory=voice-communication-control-system", description: "Multi-channel voice communication systems." },
    { title: "Digital Voice Recorder System", category: "Subcategory", url: "/our-products?category=air-traffic-management&subcategory=digital-voice-recorder-system", description: "Network-based voice recording systems." },
    { title: "External Pilot Cage Protection", category: "Subcategory", url: "/our-products?category=support-equipment&subcategory=external-pilot-cage-protection", description: "Protection systems for pilot cages." },
    { title: "Power Generation System", category: "Subcategory", url: "/our-products?category=support-equipment&subcategory=power-generation-system", description: "Power generation systems for aviation." },
    { title: "Runway Miscellaneous Equipment", category: "Subcategory", url: "/our-products?category=support-equipment&subcategory=runway-miscellaneous-equipment", description: "Miscellaneous runway equipment." },
    { title: "Trailer Mounted Mobile ATC", category: "Subcategory", url: "/our-products?category=air-traffic-management&subcategory=trailer-mounted-mobile-atc", description: "Mobile air traffic control systems." },
    { title: "Weather Radar", category: "Subcategory", url: "/our-products?category=weather-communication&subcategory=weather-radar", description: "Doppler weather radar systems." },
    { title: "NDB Beacon", category: "Subcategory", url: "/our-products?category=navigation-tracking&subcategory=ndb-beacon", description: "Non-directional beacon systems." },
    { title: "CADF System", category: "Subcategory", url: "/our-products?category=navigation-tracking&subcategory=cadf-system", description: "Commutated aerial direction finding systems." },
    { title: "Equipment Shelter", category: "Subcategory", url: "/our-products?category=support-equipment&subcategory=equipment-shelter", description: "Weatherproof equipment enclosures." },
    { title: "Smart Energy Meter", category: "Subcategory", url: "/our-products?category=smart-metering&subcategory=smart-energy-meter", description: "Smart energy monitoring devices." },
    { title: "Emergency Alert System", category: "Subcategory", url: "/our-products?category=support-equipment&subcategory=emergency-alert-system", description: "Emergency SMS alert systems." },

    // Sectors
    { title: "Defense Solutions", category: "Sector", url: "/our-products?sector=defense", description: "Explore defense-grade airport systems, radar, lighting, ATC shelters and tactical equipment." },
    { title: "Airport Infrastructure", category: "Sector", url: "/our-products?sector=airport", description: "Advanced airport solutions for lighting, docking, communication, and navigation systems." },
    { title: "Railway Systems", category: "Sector", url: "/our-products?sector=railways", description: "Smart metering and communication systems tailored for rail infrastructure." },
    { title: "Smart Infrastructure", category: "Sector", url: "/our-products?sector=smart-infrastructure", description: "Integrated lighting, energy, and monitoring systems for modern infrastructure needs." },

    // Solutions
    { title: "System Integration", category: "Solutions", url: "/solutions/system-integration", description: "Connecting Your World - Comprehensive system integration services." },
    { title: "SITC / Turnkey Projects", category: "Solutions", url: "/solutions/sitc-turnkey-projects", description: "Your Vision, Delivered - Complete turnkey project solutions." },
    { title: "O&M (Operation & Maintenance)", category: "Solutions", url: "/solutions/onm", description: "Keeping You Running - Operation and maintenance services." },
    { title: "Lifecycle Services", category: "Solutions", url: "/solutions/lifecycle-services", description: "Maximizing Your Investment - Full lifecycle support." },
    { title: "Repair and Upgrade Services", category: "Solutions", url: "/solutions/repair-upgrade-services", description: "Future-Proofing Your Assets - Repair and upgrade solutions." },
    { title: "3rd Party Items & Spares", category: "Solutions", url: "/solutions/3rd-party-items-spares", description: "Reliable Sourcing - Third-party items and spare parts." },

    // Case Studies
    { title: "SITC of Cat-II Lighting at Calicut Airport", category: "Case Study", url: "/solutions/sitc-turnkey-projects", description: "Project completed in record time of 120 days, valued at ₹7 Cr." },
    { title: "First ILCMS project of Defense Market - Palam Airbase", category: "Case Study", url: "/solutions/sitc-turnkey-projects", description: "First defense ILCMS project, Cat-IIIB lighting system." },
    { title: "Maharishi Valmiki International Airport Ayodhya", category: "Case Study", url: "/solutions/sitc-turnkey-projects", description: "First Cat-I airport constructed by UP Government." },

    // Tactical Communication
    { title: "Tactical Communication", category: "Defense", url: "/weather-communication", description: "Military-grade tactical communication systems and emergency response tools." },

    // Air Traffic Control
    { title: "Air Traffic Control", category: "Air Traffic Management", url: "/air-traffic-management", description: "Real-time ATC solutions, mobile towers, alarm systems, and voice recorders." },

    // Meteorological Systems
    { title: "Meteorological Systems", category: "Weather & Communication", url: "/weather-communication", description: "Weather radars, AWOS, and observation tools for all-weather operations." },

    // Lighting Control
    { title: "Lighting Control", category: "ILCMS", url: "/ilcms", description: "Integrated Lighting Control and Monitoring Systems for airfields." },

    // Home Page Sections
    { title: "Home", category: "Page", url: "/", description: "Welcome to Vardhman Airport Solutions - Your partner in airport and defense infrastructure." },
    { title: "Defense Solutions", category: "Home Section", url: "/defense", description: "Advanced defense-grade airport systems, radar, lighting, ATC shelters and tactical equipment." },
    { title: "Airfield Ground Lighting", category: "Home Section", url: "/airfield-ground-lights", description: "Comprehensive LED-based airfield lighting solutions ensuring safe aircraft operations." },
    { title: "Advanced Visual Docking Guidance System", category: "Home Section", url: "/avdgs", description: "3D laser technology based AVDGS for precise aircraft stand alignment." },

    // Company Features
    { title: "Industry Expertise", category: "Company", url: "/", description: "Driven by innovation and vision, reimagining infrastructure for airport and defense sectors." },
    { title: "State of Art Solutions", category: "Company", url: "/", description: "State-of-the-art airports and defense solutions engineered for precision and reliability." },
    { title: "Maintenance Services", category: "Company", url: "/", description: "Comprehensive maintenance and lifecycle support for optimal system performance." },
    { title: "Global Standards", category: "Company", url: "/", description: "Products adhering to international aviation standards including ICAO Annexure 14." },
    { title: "Innovation & Technology", category: "Company", url: "/", description: "Continuous R&D investment and partnerships for cutting-edge solutions." },
    { title: "Turnkey Solutions", category: "Company", url: "/", description: "End-to-end project management from design to commissioning and training." },

    // About Page Sections
    { title: "Our Mission", category: "About", url: "/about", description: "Deliver high-quality products and innovative solutions adhering to international best practices." },
    { title: "Our Vision", category: "About", url: "/about", description: "Preferred partner for infrastructure projects contributing to Make in India initiative." },
    { title: "Make in India", category: "Initiative", url: "/about", description: "Contributing to Government of India's Make in India through local product development." },
    { title: "National Defense", category: "About", url: "/about", description: "Strengthening national defense through indigenous design and advanced technologies." },
    { title: "Airport Infrastructure", category: "About", url: "/about", description: "Modernizing airport infrastructure with advanced technologies and systems." },

    // Contact Information
    { title: "Delhi Office", category: "Contact", url: "/contact", description: "Vardhman Airport Solutions, I & II Floor, Plot no. 13/C and 13/3, Rama Road, Najafgarh Road Industrial Area, Delhi, 110015, India." },
    { title: "Pune Office", category: "Contact", url: "/contact", description: "Office No. 334, 3rd Floor, Amanora Chambers, Hadapsar, Pune, 411028, India." },
    { title: "Phone Support", category: "Contact", url: "/contact", description: "Toll free: 18002741688, Airports: +91 9319729468, Defense: +91 7428555878, Landline: +011 45710588." },
    { title: "Email Contact", category: "Contact", url: "/contact", description: "enquiry@vardhmanairports.com, contact@vardhmanairports.com, service@vardhmanairports.com, careers@vardhmanairports.com." },
    { title: "Business Hours", category: "Contact", url: "/contact", description: "Monday-Friday: 10:00 AM - 6:30 PM, Saturday: 9:00 AM - 1:30 PM, Sunday: Closed." },

    // Services and Capabilities
    { title: "Air Traffic Management", category: "Service", url: "/air-traffic-management", description: "Integrated systems for managing air traffic with surveillance, radar, communication and alarms." },
    { title: "Navigation & Tracking", category: "Service", url: "/navigation-tracking", description: "Precision navigation and tracking systems including NDB, ADS-B, and monitoring." },
    { title: "Weather & Communication", category: "Service", url: "/weather-communication", description: "Automated weather monitoring and tactical communication solutions." },
    { title: "Support Equipment", category: "Service", url: "/support-equipment", description: "Auxiliary equipment like shelters, power generators, pilot cages for airfield operations." },
    { title: "Smart Metering", category: "Service", url: "/smart-metering", description: "Modern metering systems for energy management and emergency alerts." },
    { title: "Photometric Systems", category: "Service", url: "/photometric-system", description: "Advanced light performance measurement and calibration systems." },
    { title: "Heliport Lighting", category: "Service", url: "/heliport-lighting", description: "Specialized lighting systems for heliports and helipads." },

    // Certifications and Standards
    { title: "ICAO Compliance", category: "Certification", url: "/about", description: "International Civil Aviation Organization standards and compliance." },
    { title: "FAA Standards", category: "Certification", url: "/about", description: "Federal Aviation Administration standards for aviation systems." },
    { title: "Military Standards", category: "Certification", url: "/about", description: "Defense and military specifications for tactical equipment." },

    // Industries
    { title: "Airport Industry", category: "Industry", url: "/our-products?sector=airport", description: "Advanced airport solutions for lighting, docking, communication, and navigation systems." },
    { title: "Defense Industry", category: "Industry", url: "/our-products?sector=defense", description: "Defense-grade systems, radar, lighting, ATC shelters and tactical equipment." },
    { title: "Railway Industry", category: "Industry", url: "/our-products?sector=railways", description: "Smart metering and communication systems for rail infrastructure." },

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