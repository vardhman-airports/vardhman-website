import { Router } from "express";
const router = Router();

router.get("/", (req,res)=>{
    res.render("news.ejs");
})

export default router