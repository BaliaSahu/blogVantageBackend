const express = require('express')
const feedRouter = express.Router()
const { auth } = require("../middlewares/auth")
const { User } = require("../models/user")
const { Author } = require('../models/author')
const { VideoBlog } = require('../models/videoBlog')

feedRouter.get("/user/feeds/:page/:limit", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            const _id = req._id
            const page = req.params.page
            const limit = req.params.limit
            if (limit > 10) {
                  limit = 10
            }
            let skip = (limit * page) - limit
            const allBlogs = await Author.find();
            const f = [];
            allBlogs.forEach((row) => {
                  const likedBy = row.likedBy;
                  const dislikedBy = row.dislikedBy;
                  const reportBy = row.reportBy;
                  if (likedBy.includes(_id) || dislikedBy.includes(_id) || reportBy.includes(_id)) {
                        f.push(row._id);
                  }
            })
            const feed = await Author.find({
                  _id: { $nin: Array.from(f) }
            }).select("authorName photo1 title1 desc1 category photo2 title2 desc2 likes authorId").skip(skip).limit(limit)
            // console.log(feed)
            res.send(feed);
      } catch (err) {
            res.status(400).send("Error " + err.message)
      }
})
feedRouter.get("/user/allblogs", async (req, res) => {
      try {
            // await auth(req) 
            // const _id = req._id
            // const details=await User.findOne({_id:_id});
            // if(!details){
            //       throw new Error("No User Data");
            // } 
            const blogs = await Author.find().populate("authorId", "name avatar");
            if (!blogs || blogs.length < 0) {
                  throw new Error("No Blogs are there!");
            }
            // console.log("kkkkkk", blogs);
            res.json({ allBlogs: blogs })
      } catch (err) {
            return res.status(400).send("Bad Request" + err.message);
      }
})
feedRouter.get("/user/allvideoblogs", async (req, res) => {
      try {
            // await auth(req) 
            // const _id = req._id
            // const details=await User.findOne({_id:_id});
            // if(!details){
            //       throw new Error("No User Data");
            // } 
            const blogs = await VideoBlog.find().populate("authorId", "name avatar");
            if (!blogs || blogs.length < 0) {
                  throw new Error("No Blogs are there!");
            }
            // console.log("kkkkkk", blogs);
            res.json({ allBlogs: blogs })
      } catch (err) {
            return res.status(400).send("Bad Request" + err.message);
      }
})
feedRouter.get("/user/get/allauthor", async (req, res) => {
      try {
            // await auth(req, res);
            // const _id = req._id;
            // const det = await User.find();
            // if (det.role === "author") {
            //       throw new Error("You are a author");
            // }
            const details = await User.find({ role: "author" }).select("firstName lastName name avatar education role")
            // console.log(details);
            if (!details) {
                  throw new Error("No Authors Are There!");
            }
            res.send(details);
      } catch (err) {
            res.status(400).send("Bad Request! " + err.message);
      }
})
feedRouter.get("/user/search/:data", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            // console.log("asla");
            const _id = req._id;
            let data = req.params.data;
            data = data.toLowerCase()
            // console.log(data);

            if (data.length > 50 || data.length < 2) {
                  res.status(400).send("Bad Request! " + err.message);
                  throw new Error("NO RESULT FOUND!");
            }
            let results = [];

            results.push(...await Author.find({ authorName: data }));
            results.push(...await Author.find({ category: data }));
            results.push(...await VideoBlog.find({ authorName: data }));
            results.push(...await VideoBlog.find({ category: data }));
            
            if (results.length > 0) {
                  return res.json(results);
            }
            // console.log("No Result Found");
            res.send("No Result Found");

      } catch (err) {
            return res.status(400).send("Bad Request! " + err.message);
      }
}) 
feedRouter.get("/user/blog/:id", async (req, res) => {
      try {
            // console.log("asla")
            // console.log(req.params);
            await auth(req, res);
            const _id = req._id;
            const id = req.params.id;
            const details = await User.findOne({ _id: _id });
            // console.log("ena", _id)
            if (!details) {
                  throw new Error("No details!");
            }
            const blog = await Author.findOne({ _id: id }).populate("authorId")
            if (!blog) {
                  throw new Error("No blogs are there!");
            }
            res.json({ blog, authorAvatar: details.avatar });
      } catch (err) {
            return res.status(400).send("Bad Request! " + err.message);
      }
})
feedRouter.get("/user/videoblog/:id", async (req, res) => {
      try {
            // console.log("asla")
            // console.log(req.params);
            await auth(req, res);
            const _id = req._id;
            const id = req.params.id;
            const details = await User.findOne({ _id: _id });
            // console.log("ena", _id)
            if (!details) {
                  throw new Error("No details!");
            }
            const blog = await VideoBlog.findOne({ _id: id }).populate("authorId")
            if (!blog) {
                  throw new Error("No blogs are there!");
            }
            res.json({ blog, authorAvatar: details.avatar });
      } catch (err) {
            return res.status(400).send("Bad Request! " + err.message);
      }
})
feedRouter.post("/user/blog/report/:blogId", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            const _id = req._id;
            const blogId = req.params.blogId
            const data = await User.findOne({ _id: _id })
            if (data.role === "author") {
                  throw new Error("You are a author.")
            }
            const details = await Author.findOne({ _id: blogId })
            if (!details) {
                  throw new Error("No Blogs!");
            }
            const d = new Set(details.reportBy);
            d.add(_id);
            const dr = [...d];
            if (dr.length > 10) {
                  const dele = await Author.findByIdAndDelete({ _id: blogId })
                  res.send("Sucessfully reported.");
            }
            else {
                  const det = await Author.findByIdAndUpdate({ _id: blogId }, { reportBy: dr });
                  res.send("Sucessfully reported.");
            }
      } catch (err) {
            res.status(400).send("Bad Request! " + err.message);
      }
})
feedRouter.post("/user/videoblog/report/:blogId", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }
            const _id = req._id;
            const blogId = req.params.blogId
            const data = await User.findOne({ _id: _id })
            if (data.role === "author") {
                  throw new Error("You are a author.")
            }
            const details = await VideoBlog.findOne({ _id: blogId })
            if (!details) {
                  throw new Error("No Blogs!");
            }
            const d = new Set(details.reportBy);
            d.add(_id);
            const dr = [...d];
            if (dr.length > 10) {
                  const dele = await VideoBlog.findByIdAndDelete({ _id: blogId })
                  res.send("Sucessfully reported.");
            }
            else {
                  const det = await VideoBlog.findByIdAndUpdate({ _id: blogId }, { reportBy: dr });
                  res.send("Sucessfully reported.");
            }
      } catch (err) {
            res.status(400).send("Bad Request! " + err.message);
      }
})
feedRouter.post("/user/blog/:reaction/:blogId", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }

            const _id = req._id;
            const blogId = req.params.blogId;
            const reaction = req.params.reaction;
            const ar = ["like", "dislike"];
            if (!ar.includes(reaction)) {
                  throw new Error("Invalid Reaction request! ");
            }

            const details = await User.findOne({ _id: _id });
            // if (details.role === "author") {
            //       throw new Error("You are a author!")
            // }
            const blog = await Author.findOne({ _id: blogId });
            if (!blog) {
                  throw new Error("No Blog!");
            }
            let bl;
            let num;
            if (reaction === "like") {
                  const likedBy = new Set(blog.likedBy)
                  likedBy.add(_id);
                  const l = [...likedBy];
                  const dislikedBy = new Set(blog.dislikedBy);
                  dislikedBy.delete(_id);
                  const d = [...dislikedBy];
                  num = l.length;
                  bl = await Author.findByIdAndUpdate({ _id: blogId }, { likes: num, likedBy: l, dislikedBy: d },
                        {
                              runValidators: true,
                              returnDocument: "after"
                        }
                  )
            }
            else {
                  const likedBy = new Set(blog.likedBy)
                  likedBy.delete(_id);
                  const l = [...likedBy];
                  const dislikedBy = new Set(blog.dislikedBy)
                  dislikedBy.add(_id);
                  const d = [...dislikedBy]

                  num = l.length;
                  bl = await Author.findByIdAndUpdate({ _id: blogId }, { likes: num, likedBy: l, dislikedBy: d },
                        {
                              runValidators: true,
                              returnDocument: "after"
                        }
                  )
            }
            // console.log(bl, num)
            if (!bl) {
                  throw new Error("This Request could'nt processed!");
            }
            res.send("Sucessfully " + reaction + " the post!");
      } catch (err) {
            res.status(400).send("Bad Request! " + err.message);
      }
})
feedRouter.post("/user/videoblog/:reaction/:blogId", async (req, res) => {
      try {
            const authResult = await auth(req);
            if (!authResult.success) {
                  return res.status(401).json({ message: authResult.message });
            }

            const _id = req._id;
            const blogId = req.params.blogId;
            const reaction = req.params.reaction;
            const ar = ["like", "dislike"];
            if (!ar.includes(reaction)) {
                  throw new Error("Invalid Reaction request! ");
            }

            const details = await User.findOne({ _id: _id });
            // if (details.role === "author") {
            //       throw new Error("You are a author!")
            // }
            const blog = await VideoBlog.findOne({ _id: blogId });
            if (!blog) {
                  throw new Error("No Blog!");
            }
            let bl;
            let num;
            if (reaction === "like") {
                  const likedBy = new Set(blog.likedBy)
                  likedBy.add(_id);
                  const l = [...likedBy];
                  const dislikedBy = new Set(blog.dislikedBy);
                  dislikedBy.delete(_id);
                  const d = [...dislikedBy];
                  num = l.length;
                  bl = await VideoBlog.findByIdAndUpdate({ _id: blogId }, { likes: num, likedBy: l, dislikedBy: d },
                        {
                              runValidators: true,
                              returnDocument: "after"
                        }
                  )
            }
            else {
                  const likedBy = new Set(blog.likedBy)
                  likedBy.delete(_id);
                  const l = [...likedBy];
                  const dislikedBy = new Set(blog.dislikedBy)
                  dislikedBy.add(_id);
                  const d = [...dislikedBy]

                  num = l.length;
                  bl = await VideoBlog.findByIdAndUpdate({ _id: blogId }, { likes: num, likedBy: l, dislikedBy: d },
                        {
                              runValidators: true,
                              returnDocument: "after"
                        }
                  )
            }
            // console.log(bl, num)
            if (!bl) {
                  throw new Error("This Request could'nt processed!");
            }
            res.send("Sucessfully " + reaction + " the post!");
      } catch (err) {
            res.status(400).send("Bad Request! " + err.message);
      }
})
module.exports = { feedRouter }