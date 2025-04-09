const express = require('express')
const { auth } = require('../middlewares/auth')
const { User } = require('../models/user')
const bcrypt = require('bcrypt')
const userRouter = express.Router()
const validator = require('validator')
const cloudinary = require('cloudinary')

userRouter.get('/profile/view/:id', async (req, res) => {
      try {
            const authentic = await auth(req, res)
            const _id = req._id
            if (!authentic.success) {
                  throw new Error("you are Not authorized Please Login");
            }
            const id = req.params.id;
            const details = await User.findOne({ _id: id })
            if (details) {
                  res.json({
                        message: "You profile",
                        ProfileDetails: details
                  })
            }
            else {
                  throw new Error("No Details !")
            }
      } catch (err) {
            return res.status(400).send("No profile" + err.message)
      }

})
userRouter.patch('/profile/edit', async (req, res) => {
      try {
            const authen = await auth(req, res);
            if (!authen.success) throw new Error("Please Login");

            const id = req._id; 
            const { name, age, education, password, phone } = req.body;

            let updateFields = { name, age, education, phone };

            if (password && password.length > 0) {
                  updateFields.password = await bcrypt.hash(password, 10);
            }

            if (req.files && req.files.avatar) {
                  const avatar = req.files.avatar;
                  const uploadRes = await cloudinary.uploader.upload(avatar.tempFilePath);

                  if (!uploadRes) throw new Error("No Response from Cloudinary");

                  updateFields.avatar = {
                        public_id: uploadRes.public_id,
                        url: uploadRes.secure_url
                  };
            }

            const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });

            res.json(updatedUser);
      } catch (err) {
            res.status(400).json({ error: "You cannot edit! " + err.message });
      }
});
userRouter.patch('/passwordChange', async (req, res) => {
      try {
            await auth(req, res)
            const _id = req._id
            // const{oldPasssword,newPassword,confirmPassword}=req.body
            const oldPassword = req.body.oldPassword
            const newPassword = req.body.newPassword
            const confirmPassword = req.body.confirmPassword

            const details = await User.findOne({ _id: _id })
            // console.log(details)
            // console.log(oldPassword)
            const validPassword = await bcrypt.compare(oldPassword, details.password)
            // console.log("lkc ", validPassword)
            if (!validPassword) {
                  throw new Error("Invalid Password !")
            }
            else if (newPassword === confirmPassword && validator.isStrongPassword(newPassword)) {
                  const hashPassword = await bcrypt.hash(newPassword, 10)
                  const det = await User.findByIdAndUpdate(
                        { _id: _id },
                        { password: hashPassword },
                        { returnDocument: "after" }
                  )
                  res.json({
                        message: "Password changed Sucessfull !",
                        details: det
                  })
            }
            else {
                  throw new Error("Invalid Credentials")
            }
      } catch (err) {
            res.status(400).send("Could not change password ! " + err.message)
      }
})
module.exports = { userRouter } 