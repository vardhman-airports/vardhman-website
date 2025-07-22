import { Router } from "express";
const router = Router();

// System Integration Case Studies Data
const systemIntegrationData = {
    'calicut-airport': {
        title: 'SITC of Cat-II Lighting at Calicut Airport',
        category: 'SITC/Turnkey Projects',
        badge: '₹7 Cr.',
        image: '/images/caseStudies/calicut-airport-case.jpg',
        challenge: [
            'Timelines Reduced to 120 Days by AAI',
            'LED lighting Installations on typical existing Installations',
            'Close Coordination with Civil Contractor for pipe laying and aligning our day-to-day program with them',
            'Working on Operational Runways and Taxiways'
        ],
        solution: [
            'Proper Planning and approval from both AAI and other stack holders',
            'Taking proper coordinates of lights with DGPS',
            'Deputation of Experienced and qualified engineers',
            'Keeping extra machines, man-power and tools to avoid any failure',
            'Modification in Existing Remote Desk',
            'Early ordering of Imported lights and picked by Air'
        ],
        results: [
            'Project Finished as per AAI requirements within 120 Days, which is a History in AAI',
            'Completion certificate issued by NSC'
        ],
        stats: [
            { label: 'Project Value', value: '₹7 Cr.' },
            { label: 'System Type', value: 'Cat-II' },
            { label: 'Completion Time', value: '120 Days' },
            { label: 'Achievement', value: 'Record Time' }
        ],
        gallery: [
            '/images/caseStudies/calicut-1.jpg',
            '/images/caseStudies/calicut-2.jpg',
            '/images/caseStudies/calicut-3.png',
            '/images/caseStudies/calicut-4.png'
        ]
    },

    'palam-airbase': {
        title: 'First ILCMS project of Defense Market - SITC of Cat-IIIB Lighting at Palam Airbase',
        category: 'SITC/Turnkey Projects',
        badge: '₹7 Cr.',
        image: '/images/caseStudies/palam-airbase-case.jpg',
        challenge: [
            'Multiple clients and working area was under control of IAF and AAI',
            'Secondary Cable laying on Concrete Slabs',
            'Close Coordination with Atg for single lamp monitoring system',
            'Integration of Nasu CCRs to atg ILCMS'
        ],
        solution: [
            'Proper Planning and approval from IAF',
            'Taking proper coordinates of lights with DGPS',
            'Deputation of Experienced and qualified engineers',
            'Keeping extra machines and tools to avoid any failure',
            'Training to IAF in ILCMS and installation'
        ],
        results: [
            'Project Finished as per IAF requirements on Time',
            'Completion certificate issued IAF'
        ],
        stats: [
            { label: 'Project Value', value: '₹7 Cr.' },
            { label: 'System Type', value: 'Cat-IIIB' },
            { label: 'Client', value: 'IAF' },
            { label: 'Specialty', value: 'First Defense ILCMS' }
        ],
        gallery: [
            '/images/caseStudies/palam-1.jpg',
            '/images/caseStudies/palam-2.jpg'
        ]
    },

    'ayodhya-airport': {
        title: 'Divine place - SITC of Cat-I Lighting at Maharishi Valmiki International Airport Ayodhya',
        category: 'SITC/Turnkey Projects',
        badge: '₹7 Cr.',
        image: '/images/caseStudies/ayodhya-airport-case.jpg',
        challenge: [
            'First Cat-I Airport Constructed by Up Government',
            'Regular Visit of the CM of UP and their officials, which led to Regular Scope change',
            'Timelines Reduced by Up Government by 3 months',
            'First Design Build Contract for VAS'
        ],
        solution: [
            'A dedicated Engineering and procurement team placed in HQ',
            'Materials Ordering done by priority',
            'Deputation of Experienced and qualified engineers',
            'Keeping extra machines and tools to avoid any failure'
        ],
        results: [
            'Project Finished as per Timelines given by UP Government',
            'Highlights of this project was in all news paper'
        ],
        stats: [
            { label: 'Project Value', value: '₹7 Cr.' },
            { label: 'System Type', value: 'Cat-I' },
            { label: 'Timeline Reduction', value: '3 Months' },
            { label: 'Media Coverage', value: 'National News' }
        ],
        gallery: [
            '/images/caseStudies/ayodhya-1.jpg',
            '/images/caseStudies/ayodhya-2.jpg'
        ]
    },

    'jaipur-airport': {
        title: '23 No\'s AVDGS AT JAIPUR AIRPORT',
        category: 'SITC/Turnkey Projects',
        badge: '₹8 Cr.',
        image: '/images/caseStudies/jaipur-airport-case.jpg',
        challenge: [
            'Installation on remote parking bays',
            'Integration with existing GOS',
            'Cable laying through HDD technology',
            'Power from existing source'
        ],
        solution: [
            'Marking of AVDGS pole coordinates with DGPS',
            'Experienced and qualified technicians identified',
            'Installation of foundation well before time',
            'Approval of structural design engineer for DGCA',
            'Software modification of GOS'
        ],
        results: [
            'Installation of AVDGS completed on time',
            'Seamless integration to existing GOS',
            'Proper Functioning of AVDGS'
        ],
        stats: [
            { label: 'Project Value', value: '₹8 Cr.' },
            { label: 'AVDGS Units', value: '23' },
            { label: 'Technology', value: 'HDD' },
            { label: 'Integration', value: 'Seamless' }
        ],
        gallery: [
            '/images/caseStudies/jaipur-1.jpg',
            '/images/caseStudies/jaipur-2.png',
            '/images/caseStudies/jaipur-3.jpg'
        ]
    },

    'chandigarh-airport': {
        title: 'SITC of Cat-IIIB Lighting at Chandigarh Airport',
        category: 'SITC/Turnkey Projects',
        badge: '₹10 Cr.',
        image: '/images/caseStudies/chandigarh-airport-case.png',
        challenge: [
            'Multiple clients and working area was under control of IAF and AAI',
            'Secondary Cable laying on Concrete Slabs',
            'Close Coordination with Civil Contractor for Identification of Pipe',
            'Conversion of All Halogen Lights to LED'
        ],
        solution: [
            'Proper Planning and approval from both AAI and IAF',
            'Taking proper coordinates of lights with DGPS',
            'Deputation of Experienced and qualified engineers',
            'Keeping extra machines and tools to avoid any failure'
        ],
        results: [
            'Project Finished as per IAF & AAI requirements on Time',
            'Completion certificate issued AAI'
        ],
        stats: [
            { label: 'Project Value', value: '₹1.75 Cr.' },
            { label: 'System Type', value: 'Cat-IIIB' },
            { label: 'Client', value: 'IAF & AAI' },
            { label: 'Conversion', value: 'Halogen to LED' }
        ],
        gallery: [
            '/images/caseStudies/chandigarh-1.png',
            '/images/caseStudies/chandigarh-2.png'
        ]
    },

    'bial-airport': {
        title: 'SITC of AGL System at BIAL Airport',
        category: 'SITC/Turnkey Projects',
        badge: '₹15 Cr.',
        image: '/images/caseStudies/bial-airport-case.png',
        challenge: [
            'Execution of work during the covid lockdown and pandemic situation',
            'IR Value was too low due to heavy raining in most days',
            'Ground level gap of 10mm for PAPI installation',
            'Survey point delay for coring and shallow base installation',
            'Duct placed 700+mm depth in PQC area',
            'Duct block for cable pulling'
        ],
        solution: [
            'Planned approach and material arranged on time',
            'Implemented Covid precautions to work during pandemic situation',
            'Deputed experienced team to complete the cable pulling work on time',
            '8 legs cored for placing the 4 PAPI at desired levels'
        ],
        results: [
            'Hand overed Runway on March 25 as per schedule',
            'Hand overed Taxiway on July 09 as per schedule',
            'Completed the project with zero incident and accident following every safety procedures'
        ],
        stats: [
            { label: 'Project Value', value: '₹2 Cr.' },
            { label: 'System Type', value: 'AGL' },
            { label: 'Safety Record', value: '0 Incidents' },
            { label: 'Completion', value: 'On Schedule' }
        ],
        gallery: []
    },

    'prayagraj-airport': {
        title: 'AVDGS AT PRAYAGRAJ AIRPORT',
        category: 'SITC/Turnkey Projects',
        badge: '₹5 Cr.',
        image: '/images/caseStudies/prayagraj-airport-case.png',
        challenge: [
            'Stringent timeline of 3 months for inauguration by PM before Kumbh mela for greenfield airport',
            'Approval of DGCA as per CAR',
            'Coordination with PBB manufacturer',
            'Installation of Operator panel in PBB on site'
        ],
        solution: [
            'Marking of AVDGS pole coordinates with DGPS',
            'Experienced and qualified technicians identified',
            'Installation of foundation well before time',
            'Approval of structural design engineer for DGCA',
            'Installation of cable on same route of PBB cable'
        ],
        results: [
            'Project completed within 3 months',
            'AVDGS installed in 2 days',
            'Performance certificate issued by Tata Projects'
        ],
        stats: [
            { label: 'Project Value', value: '₹1 Cr.' },
            { label: 'Timeline', value: '3 Months' },
            { label: 'Installation', value: '2 Days' },
            { label: 'Event', value: 'Kumbh Mela' }
        ],
        gallery: []
    },
};

// SITC Turnkey Projects Case Studies Data
const sitcTurnkeyData = {
    'hasimara-airbase': {
        title: 'Refurbishment of MAFI AIRBASE-Hasimara',
        category: 'System Integration',
        badge: '₹3 Cr.',
        image: '/images/caseStudies/hasimara-airbase-case.png',
        challenge: [
            'System Installed at airbase is a proprietary system',
            'Integration of airfield lighting to Existing Tata Make CMS',
            'Close Coordination with Civil Contractor for Finalizing the Location of lights',
            'Installation of Lights on remote locations'
        ],
        solution: [
            'Taking proper coordinates of lights with DGPS',
            'Deputation of Experienced and qualified software engineers',
            'Fortnightly meetings with Civil for close coordination\'s',
            'Keeping extra machines and tools to avoid any failure'
        ],
        results: [
            'Integration done successful',
            'Project Finished as per IAF requirements',
            'Performance certificate issued GE Projects'
        ],
        stats: [
            { label: 'Project Value', value: '₹3 Cr.' },
            { label: 'System Type', value: 'Proprietary' },
            { label: 'Client', value: 'IAF' }
        ],
        gallery: []
    }
};

// O&M (Operations & Maintenance) Case Studies Data
const onmData = {
    'guwahati-airport': {
        title: 'AGL Maintenance at Guwahati International AIRPORT (ADANI)',
        category: 'O&M',
        badge: '₹4 Cr.',
        image: '/images/caseStudies/guwahati-6.jpg',
        challenge: [
            'Taking over the site with in 5 days, from AAI contractor',
            'BCAS clearance',
            'No proper process was in Place',
            'SITC of CMMS',
            'Hiring of 32 Resources on very short notice'
        ],
        solution: [
            'Experienced and qualified Engineers & technicians identified during bidding time',
            'Day and night working on all desired documentation',
            'Arrangement of all tools and Vehicles'
        ],
        results: [
            'Successful taking over on 1st Aug 2022 (between 31st July and 31st Aug 2022)',
            'Successful implementation of CMMS',
            'Appreciation from Adani Team and DGCA during DGCA visit'
        ],
        stats: [
            { label: 'Project Value', value: '₹4 Cr.' },
            { label: 'Takeover Time', value: '5 Days' },
            { label: 'Resources Hired', value: '32' },
            { label: 'CMMS Implementation', value: 'Successful' }
        ],
        gallery: [
            '/images/caseStudies/guwahati-1.jpg',
            '/images/caseStudies/guwahati-2.jpg',
            '/images/caseStudies/guwahati-3.jpg',
            '/images/caseStudies/guwahati-4.jpg',
            '/images/caseStudies/guwahati-5.jpg',
            '/images/caseStudies/guwahati-airport-case.jpg',
            '/images/caseStudies/guwahati-7.jpg'
        ]
    },

    'amritsar-airport': {
        title: 'CAT IIIB AGL MAINTENANCE AMRITSAR AIRPORT',
        category: 'O&M',
        badge: '₹1.65 Cr.',
        image: '/images/caseStudies/amritsar-airport-case.png',
        challenge: [
            'Integration of 6 different types of CCRs in ALCMS',
            'Shifting the CCRs in operational airport',
            'Legacy hardwares',
            'Changing IT hardware during live operations'
        ],
        solution: [
            'Serial and parallel comms integration of CCRs',
            'Experienced and qualified technicians identified',
            'Adopted written lock in and lock out procedures',
            'NOTAM taken for performing work on the system'
        ],
        results: [
            'Integration project completed in 2 months',
            'CCRs shifted in record time of 2 days',
            'IT hardware of ALCMS changed in 1 day'
        ],
        stats: [
            { label: 'Project Value', value: '₹1.65 Cr.' },
            { label: 'CCR Types', value: '6' },
            { label: 'Integration Time', value: '2 Months' },
            { label: 'Hardware Change', value: '1 Day' }
        ],
        gallery: []
    },
};

// Lifecycle Services Case Studies Data
const lifecycleData = {
    
};

// Repair & Upgrade Services Case Studies Data
const repairUpgradeData = {
    
};

const itemAndSpares = {
    
};

// Routes
router.get("/", (req, res) => {
    res.render("solutions/index.ejs");
});

router.get("/system-integration", (req, res) => {
    res.render("solutions/solution.ejs", { 
        caseStudiesData: systemIntegrationData,
        pageImage: "/images/solutions/1.jpg",
        pageTitle: "System Integration",
        pageDescription: "Complexity can be a major hurdle, but we turn it into synergy. Our System Integration solutions seamlessly blend diverse systems from multiple vendors into a single, cohesive, and fully functional whole.",
        pageBullets: [
            "Seamless Interoperability: We ensure all your systems, regardless of origin, communicate and operate flawlessly, eliminating data silos and boosting operational flow.",
            "Centralized Control: Gain a unified, intuitive command center for your entire infrastructure, simplifying management, enhancing awareness, and enabling faster decisions.",
            "Enhanced Reliability: By optimizing system interactions and proactively eliminating potential failure points, we significantly increase the stability and dependability of your operations.",
            "Industry Expertise: We specialize in the unique demands of complex environments like airfields, defense installations, and railway infrastructure, understanding their specific needs and regulatory requirements."
        ]
    });
});

router.get("/sitc-turnkey-projects", (req, res) => {
    res.render("solutions/solution.ejs", { 
        caseStudiesData: sitcTurnkeyData,
        pageImage: "/images/solutions/2.jpg",
        pageTitle: "SITC Turnkey Projects",
        pageDescription: "Have a critical infrastructure project? We take it from concept to completion. Our Supply, Installation, Testing, and Commissioning (SITC) / Turnkey Project solutions offer a complete, end-to-end approach, handling every phase for you.",
        pageBullets: [
            "Comprehensive Project Management: We manage the entire lifecycle, from detailed design and planning to procurement, installation, and rigorous testing.",
            "Single Point of Contact: Benefit from a streamlined process with one dedicated team overseeing all aspects, reducing complexity and ensuring clear communication.",
            "Guaranteed Performance: Our methodical approach and stringent quality controls ensure the commissioned infrastructure meets or exceeds all performance and regulatory standards.",
            "Reduced Burden: We alleviate the operational stress on your team, letting you focus on your core business while we deliver a fully operational system."
        ]
    });
});

router.get("/onm", (req, res) => {
    res.render("solutions/solution.ejs", { 
        caseStudiesData: onmData,
        pageImage: "/images/4.png",
        pageTitle: "Operations & Maintenance",
        pageDescription: "Your critical systems are vital. Our Operation & Maintenance (O&M) solutions provide long-term, proactive support to ensure continuous, safe, and compliant operation of your infrastructure.",
        pageBullets: [
            "Maximized Uptime: Through continuous monitoring, preventive maintenance, and rapid incident response, we minimize downtime, ensuring your systems are always available when you need them.",
            "Ensured Safety: We adhere to the highest safety protocols and industry best practices, safeguarding both personnel and assets during all operational and maintenance activities.",
            "Regulatory Compliance: Our team stays updated on all relevant industry regulations and standards, ensuring your infrastructure consistently meets legal and operational compliance requirements.",
            "Proactive & Reactive Support: We offer both scheduled preventive maintenance to prevent issues and swift reactive support to address any unforeseen problems, keeping your operations smooth."
        ]
    });
});

router.get("/lifecycle-services", (req, res) => {
    res.render("solutions/solution.ejs", { 
        caseStudiesData: lifecycleData,
        pageImage: "/images/solutions/3.png",
        pageTitle: "Lifecycle Services",
        pageDescription: "Infrastructure is a significant investment. Our Lifecycle Services solutions offer a holistic approach to managing your assets, from initial planning through to eventual retirement, ensuring you achieve maximum return on investment (ROI).",
        pageBullets: [
            "Strategic Planning: We help develop long-term strategies for your infrastructure, aligning technology investments with your organizational goals.",
            "Optimized Deployment: Our expertise ensures efficient and effective deployment of new systems and upgrades, minimizing disruption and maximizing benefits.",
            "Continuous Monitoring & Optimization: We use advanced tools and techniques to continuously monitor asset performance, identify areas for improvement, and optimize operational efficiency.",
            "Strategic Retirement & Replacement: We guide you through the responsible retirement of aging assets and the strategic planning for their replacement, ensuring a smooth transition and continuous operational capability."
        ]
    });
});

router.get("/repair-upgrade-services", (req, res) => {
    res.render("solutions/solution.ejs", { 
        caseStudiesData: repairUpgradeData,
        pageImage: "/images/solutions/4.png",
        pageTitle: "Repair & Upgrade Services",
        pageDescription: "Don't let aging systems hold you back. Our dedicated Repair & Upgrade Services solutions extend the operational life and enhance the performance of your existing infrastructure.",
        pageBullets: [
            "Timely Repairs: Our skilled technicians provide prompt and effective repairs, minimizing system downtime and quickly restoring full functionality.",
            "Strategic Retrofits: We implement modern enhancements and modifications to existing hardware, improving efficiency, safety, or compatibility without requiring a full system replacement.",
            "Hardware Upgrades: Boost performance and capacity with state-of-the-art hardware component upgrades, ensuring your systems remain competitive and capable.",
            "Software Updates: We ensure your systems are running on the latest, most secure, and feature-rich software versions, enhancing functionality and protecting against vulnerabilities."
        ]
    });
});

router.get("/3rd-party", (req, res) => {
    res.render("solutions/solution.ejs", { 
        caseStudiesData: itemAndSpares,
        pageImage: "/images/solutions/5.jpg",
        pageTitle: "3rd Party Items & Spares",
        pageDescription: "Having the right part at the right time is crucial. We specialize in the reliable Procurement and Supply of Genuine 3rd Party Components, Spare Parts, and Accessories from a global network of trusted Original Equipment Manufacturers (OEMs).",
        pageBullets: [
            "Genuine Parts Guarantee: We ensure the supply of authentic, high-quality components directly from manufacturers, guaranteeing compatibility and performance.",
            "Extensive Network: Our global procurement network allows us to source even hard-to-find parts for a wide range of systems, both legacy and modern.",
            "Full System Support: We provide comprehensive support for integrating these components, ensuring they seamlessly fit into your existing infrastructure.",
            "Minimizing Downtime: Quick access to essential spares helps reduce lead times for repairs and maintenance, minimizing potential operational disruptions."
        ]
    });
});


export default router;