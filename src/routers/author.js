const express = require('express')
const { Author } = require('../models/author')
const { User } = require('../models/user')
const { auth } = require('../middlewares/auth')
const authorRouter = express.Router()
const cloudinary = require('cloudinary').v2
const { VideoBlog } = require('../models/videoBlog')

const fs = require("fs");
const path = require("path");


authorRouter.post("/author/create/blogs", async (req, res) => {
      try {
            // console.log("Asla asla asla");
            if (!req.files || Object.keys(req.files).length === 0) {
                  throw new Error("No files Are there!");
            }
            const { photo1, photo2 } = req.files
            // console.log(photo1)
            if (!photo1) {
                  throw new Error("Main Image not available!");
            }
            const allowedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
            if (!allowedFormats.includes(photo1.mimetype) ||
                  (photo2 && !allowedFormats.includes(photo2.mimetype))) {
                  throw new Error("Invalid extensions");
            }

            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            const _id = req._id;
            const details = await User.findOne({ _id: _id });
            // console.log(details);
            if (!details || details.role === "user") {
                  throw new Error("You cant make this request.");
            }
            const uploadPromise = [
                  cloudinary.uploader.upload(photo1.tempFilePath),
                  photo2 ? cloudinary.uploader.upload(photo2.tempFilePath) : Promise.resolve(null)
            ]

            const [photo1Res, photo2Res] = await Promise.all(uploadPromise);

            if (!photo1Res || photo1Res.error || (photo2 && (!photo2Res || photo2Res.error))) {
                  throw new Error("Main Image Not Available!");
            }

            // console.log("ANANANAN")
            const { authorName, title1, desc1, category, title2, desc2 } = req.body;
            // console.log(title1, desc1, category, title2, desc2)
            const data = new Author({
                  authorName: details.name.toLowerCase(),
                  authorAvatar: details.avatar.url,
                  title1,
                  desc1,
                  category:category.toLowerCase(),
                  title2,
                  desc2,
                  authorId: _id,
                  photo1: {
                        public_id: photo1Res.public_id,
                        url: photo1Res.secure_url
                  }
            })
            if (photo2Res) {
                  data.photo2 = {
                        public_id: photo2Res.public_id,
                        url: photo2Res.secure_url
                  }
            }
            const d = await data.save();
            if (!d) {
                  throw new Error("Data could not saved!");
            }
            res.send("Post created sucessfully");
      } catch (err) {
            res.status(400).send("Bad Request! " + err.message);
      }
})


authorRouter.post("/author/create/videoblog", async (req, res) => {
      try {
            const authResult=await auth(req);
            const _id=req._id;
            if(!authResult.success){
                  return res.status(401).json({ message: authResult.message });
            }
            const {category,title1,secure_url,public_id,desc1,title2,secure_url2,public_id2,desc2}=req.body;
            if(!title1 || ! secure_url || ! public_id || ! desc1 || !category){
                  return res.status(400).json({message:"all the required details are not present"});
            }
            const details=await User.findOne({_id:_id});
            if(! details || details.role==="user"){
                  throw new Error("You can't make this request!");
            }
            const data = new VideoBlog({
                  authorName: details.name.toLowerCase(),
                  authorAvatar: details.avatar.url,
                  title1,
                  category:category.toLowerCase(),
                  desc1,
                  authorId: details._id,
                  video1: {
                        public_id: public_id,
                        url: secure_url
                  },
                  video2:{
                        public_id:public_id2,
                        url:secure_url2
                  }
            })
            if(desc2){
                  data.desc2=desc2;
            }
            if(title2){
                  data.title2=title2;
            }
            const savedBlog=await data.save();
            // console.log(savedBlog);
            if(!savedBlog){
                  throw new Error("Data Not Saved");
            }
            res.send("Post Created Sucessfully!");
      } catch (err) {
            // console.log(err);
            res.status(400).json({message:"Bad Request!",error:err.message});
      }
    }); 
authorRouter.get("/author/view/videoblog",async(req,res)=>{
      try{
            const authResult=await auth(req,res);
            if(! authResult.success){
                  return res.status(400).send("You are not logged in !");
            }
            const _id=req._id;
            const details=await User.findOne({_id:_id});
            if(details.role==="user" || ! details){
                  throw new Error("You are a User");
            }
            const allBlogs=await VideoBlog.find({authorId:_id});
            if(!allBlogs){
                  throw new Error("No Blogs Are There!");
            }
            res.send(allBlogs)
      }catch(err){
            // console.log(err);
            res.status(400).send("Bad Request |",err.message);
      }
})

authorRouter.get("/author/view/blogs", async (req, res) => {
      try {
            await auth(req, res);
            const _id = req._id;
            const details = await User.findOne({ _id: _id });
            if (details.role === "user") {
                  throw new Error("You can't make this request!");
            }
            const allBlogs = await Author.find({ authorId: _id });
            if (!allBlogs) {
                  throw new Error("No blogs Yet!");
            }
            res.send(allBlogs);
      }
      catch (err) {
            res.status(400).send("Bad Request !" + err.message);
      }
})
authorRouter.patch("/author/update/blogs/:blogId", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            const _id = req._id;
            const blogId = req.params.blogId;
            const det = await Author.findOne({ _id: blogId });
            // console.log(det);
            if (det.authorId.toString() !== _id) {
                  // console.log("ebatk ala kn");
                  // console.log(det.authorId)
                  // console.log(_id);
                  throw new Error("You cannot make this request!");
            }
            // console.log(req.files)
            if (!req.files || Object.keys(req.files).length === 0) {
                  // console.log(req.files, "nanai")

                  throw new Error("No files Are There!!");
            }
            const { photo1, photo2 } = req.files;

            // console.log(req.files);
            // console.log("etak aslana11", photo1, photo2);
            let allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
            if (!allowedFormats.includes(photo1.mimetype)) {
                  throw new Error("Invalid Imagege");
            }
            if (photo2) {
                  if (!allowedFormats.includes(photo2.mimetype)) {
                        throw new Error("Invalid Imagege");
                  }
            }
            // console.log("etak aslana")
            const cloudinaryResponse = await cloudinary.uploader.upload(
                  photo1.tempFilePath
            );
            if (!cloudinaryResponse || cloudinaryResponse.error) {
                  console.error(
                        "Cloudinary error:",
                        cloudinaryResponse.error || "Unknown cloudinary error!"
                  );
            }
            const { title1, desc1, category, title2, desc2 } = req.body;
            let d = {};
            // console.log("d tal k");
            if (photo1 && photo2) {
                  // console.log("@ thir ta k dhukla");
                  const cloudinaryResponse2 = await cloudinary.uploader.upload(
                        photo2.tempFilePath
                  );
                  if (!cloudinaryResponse2 || cloudinaryResponse2.error) {
                        console.error(
                              "Cloudinary error:",
                              cloudinaryResponse2.error || "Unknown cloudinary error!"
                        );
                  }
                  // console.log("d upar k");
                  // console.log(blogId);
                  d = await Author.findByIdAndUpdate({ _id: blogId },
                        {
                              photo1: {
                                    public_id: cloudinaryResponse.public_id,
                                    url: cloudinaryResponse.secure_url
                              },
                              photo2: {
                                    public_id: cloudinaryResponse2.public_id,
                                    url: cloudinaryResponse2.secure_url
                              }
                              , title1, desc1, category:category.toLowerCase(), title2, desc2
                        },
                        {
                              runValidators: true,
                              returndocument: "after"
                        }
                  )
                  // console.log("First vitar k");

            }
            else {
                  d = await Author.findByIdAndUpdate({ _id: blogId },
                        {
                              photo1: {
                                    public_id: cloudinaryResponse.public_id,
                                    url: cloudinaryResponse.secure_url
                              }, title1, desc1, category:category.toLowerCase(), title2, desc2
                        },
                        {
                              runValidators: true,
                              returndocument: "after"
                        }
                  )
                  // console.log(d)
            }

            // console.log("etak");
            // console.log(d);
            if (!d) {
                  throw new Error("No blog!");
            }
            res.send("Data Updated Sucessfully !");
      } catch (err) {
            return res.status(400).send("Bad request! " + err.message);
      }
})
authorRouter.patch("/author/update/video/blogs/:blogId", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            const _id = req._id;
            const blogId = req.params.blogId;
            const det = await VideoBlog.findOne({ _id: blogId });
            // console.log(det);
            if (det.authorId.toString() !== _id) {
                  // console.log("ebatk ala kn");
                  // console.log(det.authorId)
                  // console.log(_id);
                  throw new Error("You cannot make this request!");
            }
            const {secure_url,secure_url2,public_id,public_id2, title1, desc1, category, title2, desc2 } = req.body;
            // console.log(secure_url,secure_url2,public_id,public_id2, title1, desc1, category, title2, desc2)
            const details=await VideoBlog.findByIdAndUpdate({_id:blogId},{
                  video1:{
                        public_id:public_id,
                        url:secure_url
                  },
                  video2:{
                        public_id:public_id2,
                        url:secure_url2
                  },
                  title1, desc1, category:category.toLowerCase(),title2,desc2
            },{
                  runValidators:true,
                  returnDocument:"after"
            });
            if(!details){
                  throw new Error("BLog Not Updated!");
            }
            res.send("Successfully Updated!");
      } catch (err) {
            return res.status(400).send("Bad request! " + err.message);
      }
})
authorRouter.delete("/author/delete/blog/:blogId", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            const _id = req._id;
            const blogId = req.params.blogId
            const det = await User.findOne({ _id: _id });
            // console.log(_id + " " + det._id);
            if (det._id.toString() !== _id) {
                  throw new Error("You cannot make this request!");
            }
            const d = await Author.findByIdAndDelete({ _id: blogId }, { returnDocument: "after" })
            // console.log(d);
            res.send("Blog deleted sucessfully.");
      } catch (err) {
            res.status(400).send("Bad Request!" + err.message);
      }
})
authorRouter.delete("/author/delete/video/blog/:blogId", async (req, res) => {
      try {
            // console.log("asla")
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            const _id = req._id;
            const blogId = req.params.blogId
            const det = await User.findOne({ _id: _id });
            // console.log(det);
            // console.log(_id + " " + det.authorId);
            if (det._id.toString() !== _id) {
                  throw new Error("You cannot make this request!");
            }
            const d = await VideoBlog.findByIdAndDelete({ _id: blogId }, { returnDocument: "after" })
            // console.log(d);
            res.send("Blog deleted sucessfully.");
      } catch (err) {
            res.status(400).send("Bad Request!" + err.message);
      }
})
module.exports = { authorRouter } 