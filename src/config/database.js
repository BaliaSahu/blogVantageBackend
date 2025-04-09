const mongoose=require('mongoose')

const compassLink="mongodb+srv://Project:CpTH4ZDTusEaBkVO@project.yciu4.mongodb.net/allInfo"

const connectDb=async()=>{
      await mongoose.connect(compassLink)
}
module.exports={connectDb}