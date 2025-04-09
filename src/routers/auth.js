const express = require('express')
const bcrypt = require('bcrypt')
const { User } = require('../models/user')
const { validation } = require('../middlewares/validation')
const validator = require('validator')
const authRouter = express.Router()
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')


authRouter.post("/user/signup", async (req, res) => {
      try {

            if (!req.files || Object.keys(req.files).length === 0) {
                  // console.log(req.files)
                  throw new Error("No files Are There!!");
            }
            const { avatar } = req.files;

            const allowedFormats = ["image/png", "image/jpeg", "image/webp","image/jpg"];
            if (!allowedFormats.includes(avatar.mimetype)) {
                  throw new Error("Invalid Imagege"); 
            }
            const { password, name, email,phone, role ,education} = req.body
            // console.log(password, name, email,phone, role ,education)
            if (
                  !name ||
                  !email ||
                  !password ||
                  !role ||
                  !avatar ||
                  !education ||
                  !phone
            ) {
                  throw new Error("All the Details are Not present!");
            }
            const cloudinaryResponse = await cloudinary.uploader.upload(
                  avatar.tempFilePath
            );
            if (!cloudinaryResponse || cloudinaryResponse.error) {
                  console.error(
                        "Cloudinary error:",
                        cloudinaryResponse.error || "Unknown cloudinary error!"
                  );
            }


            const passwordHash = await bcrypt.hash(password, 10)

            const detailsSave = new User({
                  name,
                  password: passwordHash,
                  email,
                  role,
                  avatar: {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                  },
                  education
            })

            const saved = await detailsSave.save()
            // console.log(saved)
            if (!saved) {
                  throw new Error("SignUp Again !")
            }
            res.json({message:"Signup sucessfull."})
      }
      catch (err) {
            res.status(400).send("Bad request " + err.message)
      }

})
authRouter.post("/user/login", async (req, res) => {
      try {
            const { email, password } = req.body
            // console.log(email,password)
            if (!validator.isEmail(email)) {
                  throw new Error("Invalid emailId !")
            }
            const details = await User.findOne({ email: email })
            // console.log("etak")
            if (!details) {
                  throw new Error("Invalid EmailId !")
            }
            // console.log("etask nai ", details)
            const validPassword = await bcrypt.compare(password, details.password)
            if (!validPassword) {
                  throw new Error("Invalid Password !")
            }
            const token = await jwt.sign({ _id: details._id }, "Secret@123", { expiresIn: "1d" })
            res.cookie("token", token)
            res.json({
                  message: "Login Sucessfull !",
                  details
            })
      }
      catch (err) { 
            res.status(400).send("Invalid Credentials !" + err.message)
      } 

})
authRouter.post('/user/logout', async (req, res) => {
      try {
            res.cookie("token", "")
            res.send("Logout Sucessfull !")
      }
      catch (err) {
            res.status(400).send("Error " + err.message);
      }
})

module.exports = { authRouter }