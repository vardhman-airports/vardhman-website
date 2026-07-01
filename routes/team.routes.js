import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
    res.render("team/index.ejs", { currentTitle: "Our Team" });
});

export default router;
