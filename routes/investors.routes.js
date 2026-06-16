import { Router } from "express";
const router = Router();

const docPage = (title, breadcrumb, documents = []) => ({
    currentTitle: `${title} | Investors`,
    pageTitle: title,
    breadcrumb,
    documents
});

const inv = (label, href) => ({ label, href });

const BASE = "/investors/pdfs";

// ── Notices ────────────────────────────────────────────────────────────────
const NOTICES = [
    { label: "AGM Notice — 2025",              file: `${BASE}/notices/agm-notice-2025.pdf` },
    { label: "AGM Notice — Addendum",          file: `${BASE}/notices/agm-addendum.pdf` },
    { label: "EGM Notice — 27 February 2026",  file: `${BASE}/notices/egm-notice-feb-2026.pdf` },
    { label: "EGM Notice — 03 April 2025",     file: `${BASE}/notices/egm-notice-apr-2025.pdf` },
];

// ── Annual Report ──────────────────────────────────────────────────────────
const ANNUAL_REPORT = [
    { label: "Director's Report FY 2024-25",      file: `${BASE}/annual-report/directors-report-fy2425.pdf` },
    { label: "Audit Report FY 2024-25",            file: `${BASE}/annual-report/audit-report-fy2425.pdf` },
    { label: "Financial Statement FY 2024-25",     file: `${BASE}/annual-report/financial-statement-fy2425.pdf` },
];

// ── Financial Results ──────────────────────────────────────────────────────
const BOARD_REPORT = [
    { label: "Board Report FY 2024-25", file: `${BASE}/financial-results/board-report/board-report-fy2425.pdf` },
];

const BALANCE_SHEET = [
    { label: "Balance Sheet / Financial Statement FY 2024-25", file: `${BASE}/financial-results/balance-sheet/balance-sheet-fy2425.pdf` },
];

const FORM_AOC4 = [
    { label: "Form AOC-4 FY 2024-25", file: `${BASE}/financial-results/aoc4/form-aoc4-fy2425.pdf` },
];

// ── Shareholding Pattern ───────────────────────────────────────────────────
const SHAREHOLDING = [
    { label: "List of Shareholders — 31 March 2026", file: `${BASE}/shareholding-pattern/list-of-shareholders-mar-2026.pdf` },
];

// ── Annual Return ──────────────────────────────────────────────────────────
const ANNUAL_RETURN = [
    { label: "Annual Return (MGT-7) FY 2024-25", file: `${BASE}/annual-return/mgt7-fy2425.pdf` },
];

// ── Corporate Governance ───────────────────────────────────────────────────
const CORPORATE_GOVERNANCE = [
    { label: "Committee Constitution", file: `${BASE}/corporate-governance/committee-constitution.docx` },
];

// ── Company Policies ───────────────────────────────────────────────────────
const COMPANY_POLICIES = [
    { label: "Archival Policy",                              file: `${BASE}/company-policies/Archival-Policy_VAS.pdf` },
    { label: "Board Diversity (SMP) Policy",                 file: `${BASE}/company-policies/BoD-SMP-Policy_VAS.pdf` },
    { label: "CSR Policy",                                   file: `${BASE}/company-policies/CSR-Policy_VAS.pdf` },
    { label: "Dividend Distribution Policy",                 file: `${BASE}/company-policies/Dividend-Distribution-Policy-_VAS.pdf` },
    { label: "Familiarization of Independent Directors Policy", file: `${BASE}/company-policies/Familiarization-of-ID-Policy_VAS.pdf` },
    { label: "Identification of Group Companies Policy",     file: `${BASE}/company-policies/Identification-of-Group-Policy_VAS.pdf` },
    { label: "Insider Trading Policy",                       file: `${BASE}/company-policies/Insider-Trading-Policy_VAS.pdf` },
    { label: "Materiality Information Policy",               file: `${BASE}/company-policies/Materiality-information-Policy_VAS.pdf` },
    { label: "Nomination and Remuneration Policy",           file: `${BASE}/company-policies/Nomination-and-Remuneration-Policy_VAS.pdf` },
    { label: "POSH Policy",                                  file: `${BASE}/company-policies/Posh-Policy_VAS.pdf` },
    { label: "Preservation of Documents Policy",             file: `${BASE}/company-policies/Preservation-of-documents-Policy_VAS.pdf` },
    { label: "Risk Management Policy",                       file: `${BASE}/company-policies/Risk-Mgt-Policy_VAS.pdf` },
    { label: "Related Party Transactions (RPT) Policy",      file: `${BASE}/company-policies/RPT-Policy_VAS.pdf` },
    { label: "Unpublished Price Sensitive Information Policy", file: `${BASE}/company-policies/Unpublished-Price-Policy_VAS.pdf` },
    { label: "Whistle Blower Policy",                        file: `${BASE}/company-policies/Whistle-Blower-Policy_VAS.pdf` },
];

// ── Landing ────────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
    res.render("investors/index.ejs", {
        currentTitle: "Investors",
        style: req.query.style === "b" ? "b" : "a",
    });
});

// ── Notices ────────────────────────────────────────────────────────────────
router.get("/notices", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Notices",
        [inv("Investors", "/investors"), inv("Notices")],
        NOTICES
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

// ── Board Meeting Outcome ──────────────────────────────────────────────────
router.get("/board-meeting-outcome", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Board Meeting Outcome",
        [inv("Investors", "/investors"), inv("Board Meeting Outcome")],
        []
    ));
});

// ── Voting Results ─────────────────────────────────────────────────────────
router.get("/voting-results", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Voting Results",
        [inv("Investors", "/investors"), inv("Voting Results")],
        []
    ));
});

// ── Financial Results ──────────────────────────────────────────────────────
router.get("/financial-results", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Financial Results",
        [inv("Investors", "/investors"), inv("Financial Results")],
        [...BOARD_REPORT, ...BALANCE_SHEET, ...FORM_AOC4]
    ));
});

router.get("/financial-results/board-report", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Board Report",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Board Report")],
        BOARD_REPORT
    ));
});

router.get("/financial-results/balance-sheet", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Balance Sheet",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Balance Sheet")],
        BALANCE_SHEET
    ));
});

router.get("/financial-results/form-aoc4", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Form AOC-4",
        [inv("Investors", "/investors"), inv("Financial Results", "/investors/financial-results"), inv("Form AOC-4")],
        FORM_AOC4
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
        CORPORATE_GOVERNANCE
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

// ── Offer Documents ────────────────────────────────────────────────────────
router.get("/offer-documents", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Offer Documents",
        [inv("Investors", "/investors"), inv("Offer Documents")],
        []
    ));
});

router.get("/offer-documents/drhp", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Draft Red Herring Prospectus (DRHP)",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("DRHP")],
        []
    ));
});

router.get("/offer-documents/rhp", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Red Herring Prospectus (RHP)",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("RHP")],
        []
    ));
});

router.get("/offer-documents/prospectus", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Prospectus",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("Prospectus")],
        []
    ));
});

router.get("/offer-documents/other-documents", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Other Documents",
        [inv("Investors", "/investors"), inv("Offer Documents", "/investors/offer-documents"), inv("Other Documents")],
        []
    ));
});

// ── Investor Enquiry ───────────────────────────────────────────────────────
router.get("/investor-enquiry", (req, res) => {
    res.render("investors/enquiry.ejs");
});

router.get("/investor-grievance", (req, res) => {
    res.redirect(301, "/investors/investor-enquiry");
});

// ── Media & Press ──────────────────────────────────────────────────────────
router.get("/media-press", (req, res) => {
    res.render("investors/document-list.ejs", docPage(
        "Media & Press",
        [inv("Investors", "/investors"), inv("Media & Press")],
        []
    ));
});

export default router;
