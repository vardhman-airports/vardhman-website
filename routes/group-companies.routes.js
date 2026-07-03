import { Router } from "express";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Group companies and their document sections. Each section maps to a category
// in the shared investor_documents table, so everything is managed from the
// existing Investors admin panel. Add new companies / sections here.
const GROUP_COMPANIES = [
    {
        name: 'RLG Docking Systems Corporation Private Limited',
        sections: [
            { title: 'Audited Financial Statements', category: 'group-companies/rlg-docking/audited-financials' },
        ],
    },
];

// Fetch docs for a category, newest first, mapped to the { label, file } shape
const getDocs = async (category) => {
    const { data } = await supabase
        .from('investor_documents')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

    return (data || []).map(doc => ({
        label: doc.label,
        file: `/investors/doc/${doc.id}`,
    }));
};

router.get("/", async (req, res) => {
    const companies = [];
    for (const company of GROUP_COMPANIES) {
        const sections = [];
        for (const section of company.sections) {
            sections.push({ title: section.title, documents: await getDocs(section.category) });
        }
        companies.push({ name: company.name, sections });
    }

    res.render("group-companies/index.ejs", {
        currentTitle: "Group Companies",
        companies,
    });
});

export default router;
