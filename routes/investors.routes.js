import { Router } from "express";
const router = Router();

// Helper: builds the standard render config for every document-list page
const docPage = (title, breadcrumb, documents = []) => ({
    currentTitle: `${title} | Investors`,
    pageTitle: title,
    breadcrumb,
    documents
});

const inv = (label, href) => ({ label, href });

// ── Placeholder document data ──────────────────────────────────────────────
// Replace file paths with real PDFs when ready.
// label: displayed name  |  file: path served from public/

const BASE = "/investors/pdfs";

const NOTICES_AGM = [
    { label: "AGM Notice — 28 September 2024",   file: `${BASE}/notices/agm-notice-2024.pdf` },
    { label: "AGM Notice — 30 September 2023",   file: `${BASE}/notices/agm-notice-2023.pdf` },
    { label: "AGM Notice — 24 September 2022",   file: `${BASE}/notices/agm-notice-2022.pdf` },
    { label: "EGM Notice — 15 March 2024",        file: `${BASE}/notices/egm-notice-mar-2024.pdf` },
];

const NOTICES_POSTAL = [
    { label: "Postal Ballot Notice — September 2024", file: `${BASE}/notices/postal-ballot-sep-2024.pdf` },
    { label: "Postal Ballot Notice — June 2023",      file: `${BASE}/notices/postal-ballot-jun-2023.pdf` },
];

const ANNUAL_REPORT = [
    { label: "Annual Report 2023–24", file: `${BASE}/annual-report/annual-report-2024.pdf` },
    { label: "Annual Report 2022–23", file: `${BASE}/annual-report/annual-report-2023.pdf` },
    { label: "Annual Report 2021–22", file: `${BASE}/annual-report/annual-report-2022.pdf` },
    { label: "Annual Report 2020–21", file: `${BASE}/annual-report/annual-report-2021.pdf` },
];

const FINANCIAL_QUARTERLY = [
    { label: "Unaudited Financial Results — Q3 FY 2024-25 (Oct–Dec 2024)", file: `${BASE}/financial-results/quarterly/q3-fy2425.pdf` },
    { label: "Unaudited Financial Results — Q2 FY 2024-25 (Jul–Sep 2024)", file: `${BASE}/financial-results/quarterly/q2-fy2425.pdf` },
    { label: "Unaudited Financial Results — Q1 FY 2024-25 (Apr–Jun 2024)", file: `${BASE}/financial-results/quarterly/q1-fy2425.pdf` },
    { label: "Audited Financial Results — Q4 FY 2023-24 (Jan–Mar 2024)",   file: `${BASE}/financial-results/quarterly/q4-fy2324.pdf` },
    { label: "Unaudited Financial Results — Q3 FY 2023-24 (Oct–Dec 2023)", file: `${BASE}/financial-results/quarterly/q3-fy2324.pdf` },
    { label: "Unaudited Financial Results — Q2 FY 2023-24 (Jul–Sep 2023)", file: `${BASE}/financial-results/quarterly/q2-fy2324.pdf` },
    { label: "Unaudited Financial Results — Q1 FY 2023-24 (Apr–Jun 2023)", file: `${BASE}/financial-results/quarterly/q1-fy2324.pdf` },
];

const FINANCIAL_HALFYEARLY = [
    { label: "Half-Yearly Results H2 FY 2023-24 (Oct 2023 – Mar 2024)", file: `${BASE}/financial-results/half-yearly/h2-fy2324.pdf` },
    { label: "Half-Yearly Results H1 FY 2023-24 (Apr – Sep 2023)",      file: `${BASE}/financial-results/half-yearly/h1-fy2324.pdf` },
    { label: "Half-Yearly Results H2 FY 2022-23 (Oct 2022 – Mar 2023)", file: `${BASE}/financial-results/half-yearly/h2-fy2223.pdf` },
    { label: "Half-Yearly Results H1 FY 2022-23 (Apr – Sep 2022)",      file: `${BASE}/financial-results/half-yearly/h1-fy2223.pdf` },
];

const FINANCIAL_ANNUAL = [
    { label: "Audited Annual Results FY 2023-24", file: `${BASE}/financial-results/annual/annual-results-fy2324.pdf` },
    { label: "Audited Annual Results FY 2022-23", file: `${BASE}/financial-results/annual/annual-results-fy2223.pdf` },
    { label: "Audited Annual Results FY 2021-22", file: `${BASE}/financial-results/annual/annual-results-fy2122.pdf` },
    { label: "Audited Annual Results FY 2020-21", file: `${BASE}/financial-results/annual/annual-results-fy2021.pdf` },
];

const BOARD_REPORT = [
    { label: "Board Report 2023–24", file: `${BASE}/financial-results/board-report/board-report-2024.pdf` },
    { label: "Board Report 2022–23", file: `${BASE}/financial-results/board-report/board-report-2023.pdf` },
    { label: "Board Report 2021–22", file: `${BASE}/financial-results/board-report/board-report-2022.pdf` },
    { label: "Board Report 2020–21", file: `${BASE}/financial-results/board-report/board-report-2021.pdf` },
];

const FORM_AOC4 = [
    { label: "Form AOC-4 FY 2023-24", file: `${BASE}/financial-results/aoc4/form-aoc4-fy2324.pdf` },
    { label: "Form AOC-4 FY 2022-23", file: `${BASE}/financial-results/aoc4/form-aoc4-fy2223.pdf` },
    { label: "Form AOC-4 FY 2021-22", file: `${BASE}/financial-results/aoc4/form-aoc4-fy2122.pdf` },
    { label: "Form AOC-4 FY 2020-21", file: `${BASE}/financial-results/aoc4/form-aoc4-fy2021.pdf` },
];

const BOARD_MEETING = [
    { label: "Board Meeting Outcome — 14 February 2025",  file: `${BASE}/board-meeting/outcome-feb-2025.pdf` },
    { label: "Board Meeting Outcome — 14 November 2024",  file: `${BASE}/board-meeting/outcome-nov-2024.pdf` },
    { label: "Board Meeting Outcome — 09 August 2024",    file: `${BASE}/board-meeting/outcome-aug-2024.pdf` },
    { label: "Board Meeting Outcome — 15 May 2024",       file: `${BASE}/board-meeting/outcome-may-2024.pdf` },
    { label: "Board Meeting Outcome — 12 February 2024",  file: `${BASE}/board-meeting/outcome-feb-2024.pdf` },
    { label: "Board Meeting Outcome — 10 November 2023",  file: `${BASE}/board-meeting/outcome-nov-2023.pdf` },
    { label: "Board Meeting Outcome — 11 August 2023",    file: `${BASE}/board-meeting/outcome-aug-2023.pdf` },
    { label: "Board Meeting Outcome — 12 May 2023",       file: `${BASE}/board-meeting/outcome-may-2023.pdf` },
];

const VOTING_RESULTS = [
    { label: "Voting Results — AGM 28 September 2024",  file: `${BASE}/voting/voting-agm-sep-2024.pdf` },
    { label: "Voting Results — EGM 15 March 2024",      file: `${BASE}/voting/voting-egm-mar-2024.pdf` },
    { label: "Voting Results — AGM 30 September 2023",  file: `${BASE}/voting/voting-agm-sep-2023.pdf` },
    { label: "Voting Results — Postal Ballot Sep 2024", file: `${BASE}/voting/voting-postal-sep-2024.pdf` },
    { label: "Voting Results — Postal Ballot Jun 2023", file: `${BASE}/voting/voting-postal-jun-2023.pdf` },
];

const SHAREHOLDING = [
    { label: "Shareholding Pattern — Q3 FY 2024-25 (31 December 2024)", file: `${BASE}/shareholding/sh-pattern-q3-fy2425.pdf` },
    { label: "Shareholding Pattern — Q2 FY 2024-25 (30 September 2024)",file: `${BASE}/shareholding/sh-pattern-q2-fy2425.pdf` },
    { label: "Shareholding Pattern — Q1 FY 2024-25 (30 June 2024)",     file: `${BASE}/shareholding/sh-pattern-q1-fy2425.pdf` },
    { label: "Shareholding Pattern — Q4 FY 2023-24 (31 March 2024)",    file: `${BASE}/shareholding/sh-pattern-q4-fy2324.pdf` },
    { label: "Shareholding Pattern — Q3 FY 2023-24 (31 December 2023)", file: `${BASE}/shareholding/sh-pattern-q3-fy2324.pdf` },
    { label: "Shareholding Pattern — Q2 FY 2023-24 (30 September 2023)",file: `${BASE}/shareholding/sh-pattern-q2-fy2324.pdf` },
];

const ANNUAL_RETURN = [
    { label: "Annual Return (MGT-7) FY 2023-24", file: `${BASE}/annual-return/mgt7-fy2324.pdf` },
    { label: "Annual Return (MGT-7) FY 2022-23", file: `${BASE}/annual-return/mgt7-fy2223.pdf` },
    { label: "Annual Return (MGT-7) FY 2021-22", file: `${BASE}/annual-return/mgt7-fy2122.pdf` },
    { label: "Annual Return (MGT-7) FY 2020-21", file: `${BASE}/annual-return/mgt7-fy2021.pdf` },
];

const GOVERNANCE_COMPLIANCE = [
    { label: "Corporate Governance Report — Q3 FY 2024-25 (Dec 2024)", file: `${BASE}/governance/cg-report-q3-fy2425.pdf` },
    { label: "Corporate Governance Report — Q2 FY 2024-25 (Sep 2024)", file: `${BASE}/governance/cg-report-q2-fy2425.pdf` },
    { label: "Corporate Governance Report — Q1 FY 2024-25 (Jun 2024)", file: `${BASE}/governance/cg-report-q1-fy2425.pdf` },
    { label: "Corporate Governance Report — Q4 FY 2023-24 (Mar 2024)", file: `${BASE}/governance/cg-report-q4-fy2324.pdf` },
    { label: "Corporate Governance Report — Q3 FY 2023-24 (Dec 2023)", file: `${BASE}/governance/cg-report-q3-fy2324.pdf` },
    { label: "Corporate Governance Report — Q2 FY 2023-24 (Sep 2023)", file: `${BASE}/governance/cg-report-q2-fy2324.pdf` },
];

const GOVERNANCE_COMMITTEES = [
    { label: "Composition of Audit Committee",                        file: `${BASE}/governance/committees/audit-committee.pdf` },
    { label: "Composition of Nomination & Remuneration Committee",   file: `${BASE}/governance/committees/nrc-committee.pdf` },
    { label: "Composition of Stakeholders Relationship Committee",   file: `${BASE}/governance/committees/src-committee.pdf` },
    { label: "Composition of CSR Committee",                         file: `${BASE}/governance/committees/csr-committee.pdf` },
    { label: "Composition of Risk Management Committee",             file: `${BASE}/governance/committees/risk-committee.pdf` },
];

const COMPANY_POLICIES = [
    { label: "Code of Conduct & Business Ethics",           file: `${BASE}/policies/code-of-conduct.pdf` },
    { label: "Whistle Blower & Vigil Mechanism Policy",     file: `${BASE}/policies/whistle-blower-policy.pdf` },
    { label: "Related Party Transaction (RPT) Policy",      file: `${BASE}/policies/rpt-policy.pdf` },
    { label: "Corporate Social Responsibility (CSR) Policy",file: `${BASE}/policies/csr-policy.pdf` },
    { label: "Dividend Distribution Policy",                file: `${BASE}/policies/dividend-policy.pdf` },
    { label: "Risk Management Policy",                      file: `${BASE}/policies/risk-management-policy.pdf` },
    { label: "Policy on Materiality of Events / Information",file: `${BASE}/policies/materiality-policy.pdf` },
    { label: "Nomination & Remuneration Policy",            file: `${BASE}/policies/nomination-remuneration-policy.pdf` },
    { label: "Board Diversity Policy",                      file: `${BASE}/policies/board-diversity-policy.pdf` },
    { label: "Policy for Preservation of Documents",        file: `${BASE}/policies/document-preservation-policy.pdf` },
];

const OFFER_DOCS = [
    { label: "Draft Red Herring Prospectus (DRHP)",            file: `${BASE}/offer-documents/drhp.pdf` },
    { label: "Red Herring Prospectus (RHP)",                   file: `${BASE}/offer-documents/rhp.pdf` },
    { label: "Prospectus",                                     file: `${BASE}/offer-documents/prospectus.pdf` },
    { label: "Abridged Prospectus",                            file: `${BASE}/offer-documents/abridged-prospectus.pdf` },
    { label: "Statement of Deviation — Q3 FY 2024-25",        file: `${BASE}/offer-documents/statement-of-deviation-q3-fy2425.pdf` },
    { label: "Statement of Deviation — Q2 FY 2024-25",        file: `${BASE}/offer-documents/statement-of-deviation-q2-fy2425.pdf` },
    { label: "Statement of Deviation — Q1 FY 2024-25",        file: `${BASE}/offer-documents/statement-of-deviation-q1-fy2425.pdf` },
];

const DRHP = [
    { label: "Draft Red Herring Prospectus (DRHP)",  file: `${BASE}/offer-documents/drhp.pdf` },
];

const RHP = [
    { label: "Red Herring Prospectus (RHP)", file: `${BASE}/offer-documents/rhp.pdf` },
];

const PROSPECTUS = [
    { label: "Prospectus",          file: `${BASE}/offer-documents/prospectus.pdf` },
    { label: "Abridged Prospectus", file: `${BASE}/offer-documents/abridged-prospectus.pdf` },
];

const STATEMENT_OF_DEVIATION = [
    { label: "Statement of Deviation — Q3 FY 2024-25 (Dec 2024)", file: `${BASE}/offer-documents/statement-of-deviation-q3-fy2425.pdf` },
    { label: "Statement of Deviation — Q2 FY 2024-25 (Sep 2024)", file: `${BASE}/offer-documents/statement-of-deviation-q2-fy2425.pdf` },
    { label: "Statement of Deviation — Q1 FY 2024-25 (Jun 2024)", file: `${BASE}/offer-documents/statement-of-deviation-q1-fy2425.pdf` },
    { label: "Statement of Deviation — Q4 FY 2023-24 (Mar 2024)", file: `${BASE}/offer-documents/statement-of-deviation-q4-fy2324.pdf` },
];

const DISCLOSURES = [
    { label: "Details of Business — Reg. 46(2)(a)",                                     file: `${BASE}/disclosures/reg46-details-of-business.pdf` },
    { label: "Terms of Appointment of Independent Directors — Reg. 46(2)(b)",           file: `${BASE}/disclosures/reg46-independent-directors.pdf` },
    { label: "Composition of Committees — Reg. 46(2)(c)",                               file: `${BASE}/disclosures/reg46-committee-composition.pdf` },
    { label: "Code of Conduct — Reg. 46(2)(d)",                                         file: `${BASE}/disclosures/reg46-code-of-conduct.pdf` },
    { label: "Nomination & Remuneration Policy — Reg. 46(2)(e)",                        file: `${BASE}/disclosures/reg46-nomination-remuneration.pdf` },
    { label: "Criteria for Payments to Non-Executive Directors — Reg. 46(2)(f)",        file: `${BASE}/disclosures/reg46-payments-ned.pdf` },
    { label: "Dividend Distribution Policy — Reg. 46(2)(q)",                            file: `${BASE}/disclosures/reg46-dividend-policy.pdf` },
    { label: "Policy on Materiality of Events — Reg. 46(2)(r)",                         file: `${BASE}/disclosures/reg46-materiality-policy.pdf` },
    { label: "Contact Information of Designated Officials — Reg. 46(2)(l)",             file: `${BASE}/disclosures/reg46-contact-officials.pdf` },
    { label: "Investor Complaints Status — Reg. 46(2)(j)",                              file: `${BASE}/disclosures/reg46-investor-complaints.pdf` },
];

// ── Landing ────────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
    res.render("investors/index.ejs", {
        currentTitle: "Investors",
        style: req.query.style === "b" ? "b" : "a"
    });
});

// ── Notices ────────────────────────────────────────────────────────────────
router.get("/notices", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Notices",
        [inv("Investors", "/investors"), inv("Notices")],
        [...NOTICES_AGM, ...NOTICES_POSTAL]
    ));
});

router.get("/notices/agm-egm", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "AGM / EGM Notices",
        [inv("Investors", "/investors"), inv("Notices", "/investors/notices"), inv("AGM / EGM Notices")],
        NOTICES_AGM
    ));
});

router.get("/notices/postal-ballot", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Postal Ballot Notices",
        [inv("Investors", "/investors"), inv("Notices", "/investors/notices"), inv("Postal Ballot Notices")],
        NOTICES_POSTAL
    ));
});

// ── Annual Report ──────────────────────────────────────────────────────────
router.get("/annual-report", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Annual Report",
        [inv("Investors", "/investors"), inv("Annual Report")],
        ANNUAL_REPORT
    ));
});

// ── Financial Results ──────────────────────────────────────────────────────
router.get("/financial-results", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Financial Results",
        [inv("Investors", "/investors"), inv("Financial Results")],
        [...FINANCIAL_ANNUAL, ...FINANCIAL_QUARTERLY]
    ));
});

router.get("/financial-results/quarterly", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Quarterly Results",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Quarterly Results")],
        FINANCIAL_QUARTERLY
    ));
});

router.get("/financial-results/half-yearly", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Half-Yearly Results",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Half-Yearly Results")],
        FINANCIAL_HALFYEARLY
    ));
});

router.get("/financial-results/annual", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Annual Results",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Annual Results")],
        FINANCIAL_ANNUAL
    ));
});

router.get("/financial-results/board-report", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Board Report",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Board Report")],
        BOARD_REPORT
    ));
});

router.get("/financial-results/form-aoc4", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Form AOC-4",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Form AOC-4")],
        FORM_AOC4
    ));
});

// ── Board Meeting Outcome ──────────────────────────────────────────────────
router.get("/board-meeting-outcome", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Board Meeting Outcome",
        [inv("Investors", "/investors"), inv("Board Meeting Outcome")],
        BOARD_MEETING
    ));
});

// ── Voting Results ─────────────────────────────────────────────────────────
router.get("/voting-results", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Voting Results",
        [inv("Investors", "/investors"), inv("Voting Results")],
        VOTING_RESULTS
    ));
});

// ── Shareholding Pattern ───────────────────────────────────────────────────
router.get("/shareholding-pattern", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Shareholding Pattern",
        [inv("Investors", "/investors"), inv("Shareholding Pattern")],
        SHAREHOLDING
    ));
});

// ── Annual Return ──────────────────────────────────────────────────────────
router.get("/annual-return", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Annual Return (MGT-7)",
        [inv("Investors", "/investors"), inv("Annual Return")],
        ANNUAL_RETURN
    ));
});

// ── Corporate Governance ───────────────────────────────────────────────────
router.get("/corporate-governance", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Corporate Governance",
        [inv("Investors", "/investors"), inv("Corporate Governance")],
        [...GOVERNANCE_COMPLIANCE, ...GOVERNANCE_COMMITTEES]
    ));
});

router.get("/corporate-governance/compliance", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Compliance Reports",
        [inv("Investors", "/investors"), inv("Corporate Governance", "/investors/corporate-governance"), inv("Compliance Reports")],
        GOVERNANCE_COMPLIANCE
    ));
});

router.get("/corporate-governance/committees", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Committee Composition",
        [inv("Investors", "/investors"), inv("Corporate Governance", "/investors/corporate-governance"), inv("Committee Composition")],
        GOVERNANCE_COMMITTEES
    ));
});

// ── Company Policies ───────────────────────────────────────────────────────
router.get("/company-policies", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Company Policies",
        [inv("Investors", "/investors"), inv("Company Policies")],
        COMPANY_POLICIES
    ));
});

// ── Offer Documents (IPO) ──────────────────────────────────────────────────
router.get("/offer-documents", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Offer Documents",
        [inv("Investors", "/investors"), inv("Offer Documents")],
        OFFER_DOCS
    ));
});

router.get("/offer-documents/drhp", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Draft Red Herring Prospectus (DRHP)",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("DRHP")],
        DRHP
    ));
});

router.get("/offer-documents/rhp", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Red Herring Prospectus (RHP)",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("RHP")],
        RHP
    ));
});

router.get("/offer-documents/prospectus", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Prospectus",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("Prospectus")],
        PROSPECTUS
    ));
});

router.get("/offer-documents/statement-of-deviation", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Statement of Deviation",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("Statement of Deviation")],
        STATEMENT_OF_DEVIATION
    ));
});

// ── SEBI Disclosures (Reg. 46) ─────────────────────────────────────────────
router.get("/disclosures", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Disclosures under SEBI LODR Reg. 46",
        [inv("Investors", "/investors"), inv("Disclosures")],
        DISCLOSURES
    ));
});

// ── Investor Grievance ─────────────────────────────────────────────────────
router.get("/investor-grievance", (req, res) => {
    res.render("investors/grievance.ejs", {
        currentTitle: "Investor Grievance | Investors",
        breadcrumb: [inv("Investors", "/investors"), inv("Investor Grievance")]
    });
});

export default router;
