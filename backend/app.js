const express=require("express")
const app= express()
const fs =require("fs")
let port =8080
app.listen(port,()=>{
    console.log("Working on the Server")
})
//Accesin  the REQUEST **select repo**
//taking the query from the url 
app.get("/check",(req,res)=>{
   const path=req.query.path
//Now Checking if its a directroy
if(!path){
    return res.status(400).send("Path required")
}
fs.stat(path,(err,stats)=>{
    if(err){
       return res.status(400).send("Invalid   path")
    }
    if(stats.isDirectory()){
        //function listing_folders();
       return res.send("Valid Directory")
        }
    else{
        return res.send("Not a valid directory")
    }
    
})
})



 









