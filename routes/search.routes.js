import { Router } from "express";
import  {promises as fs} from 'fs';
const router = Router();

router.get("/", async (req,res)=>{
    try{
        const data = await fs.readFile('./public/data/test.json', 'utf8');
        const name = JSON.parse(data);
        res.render("search.ejs",{name : name.aryan});
        console.log(name.aryan)
    } catch(err){
        console.log(err);
    }
})

export default router