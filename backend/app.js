const express=require("express")
const app= express()
const fs =require("fs")
 
//first make it able to execute the commands 
 const {exec}= require ("child_process")
let port =8080
app.listen(port,()=>{
    console.log("Working on the Server")
})
//Accesin  the REQUEST **select repo**
//taking the query from the url 
app.get("/check",async (req,res)=>{
  
//Now Checking if its a directroy
if(!path){
    return res.status(400).send("Path required")
}
fs.stat(path,(err,stats)=>{
    if(err || !stats.isDirectory()){
       return res.status(400).send("Invalid Directory")
    }
    
//Listing Folders 

 //reading the files inside directories  
 fs.readdir(path,(err,items)=>{
    if(err){
        return res.status(500).send("cannot read directory")
    }
    const results=[]
     //now looping through the folders and checking if a `.git` file is inside it or not
     let pending=items.length;
     let responded = false;

     if(pending===0){
       return res.json([])
     }
     for(const item of items) {
        //checking that if the full path is a folder or not 
        const full_path=path.join(path,item)
        fs.stat(full_path,(err,stats)=>{
    if(err || !stats.isDirectory()){
       pending--
     if(pending==0 && !responded){ 
   res.json(results)
  }
   return
 
    }
    exec("git rev-parse --is-inside-work-tree",{cwd:full_path},(err,stdout)=>{
if(!err && stdout.trim()==="true"){
   results.push({name:item,isGitRepo:true})
   }
     pending--;
     if(pending==0 && !responded){
    res.json(results);
}
  })
})

 
  
}


})
})
})
     
    
   
 









