app.get("/health",(req,res)=>{
    try{
        res.status(200).json({
            status:"ok",
            message :"server is alive",
            uptime:process.uptime(),
            environment: process.env.NODE_ENV || "development"

        })
    }
    catch(err){
        console.error(err)
      return res.status(503).json({
        status:"error",
        message: err.message
      })
    }
})