import { Router } from "express";
const router = Router();

router.get("/", (req,res)=>{
    res.render("news.ejs");
})
router.get("/temp", (req,res)=>{
    res.render("newsTemp.ejs");
})

export default router