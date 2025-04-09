const express=require('express')
const app=express()
const cors=require('cors')
const cookieparser=require('cookie-parser')
const {connectDb}=require('../config/database')
const{authRouter}=require('../routers/auth')
const{userRouter}=require('../routers/user')
const {authorRouter}=require('../routers/author')
const{feedRouter}=require('../routers/feed')
const fileUpload=require("express-fileupload")
const cloudinary=require('cloudinary')

app.use(
      cors({
            // origin:["http://localhost:5173"],
            // origin:["https://67f636e0d5e53c73ac64e4eb--comfy-nasturtium-90c7ad.netlify.app/"],
            origin:["https://blog-vantage-frontend-ps6f.vercel.app/"],
            methods:['GET','POST','PATCH','DELETE'],
            credentials:true
      })
)

app.use(cookieparser()) 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(fileUpload({
      useTempFiles:true,
      tempFileDir:"/tmp/" 
}))
cloudinary.v2.config({ 
      cloud_name:"dgpfa1vxf",
      api_key:"577428824697531",
      api_secret:"xrn7tZoUEvlBfQKGAnede4xBIJg",
})

app.use("/",authRouter)
app.use("/",userRouter)
app.use("/",authorRouter)
app.use("/",feedRouter) 
 
connectDb()
      .then(()=>{
            app.listen(4000,()=>{
                  console.log("Database connection Sucessfull !") 
                  console.log("app listening on the port 4000 !")
            })
      })
      .catch((err)=>{
            console.log("Database connection failed !")
      })

module.exports={app}