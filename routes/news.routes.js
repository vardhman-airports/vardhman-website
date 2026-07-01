import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
    res.redirect(301, "/pov#news");
});
router.get("/temp", (req, res) => {
    res.render("newsTemp.ejs");
});

export default router