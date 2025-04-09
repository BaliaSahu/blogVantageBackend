const { trim, lowerCase } = require('lodash')
const mongoose = require('mongoose')
const { type } = require('os')
const validator = require('validator')
const cloudinary=require('cloudinary')

const userSchema = new mongoose.Schema(
      {
            name: {
                  type: String,
                  required: true,
                  minLength: 3,
                  maxLength: 50,
                  trim: 0,
            },
            email: {
                  type: String,
                  required: true,
                  index: true,
                  unique: true,
                  lowerCase: true,
                  validate(value) {
                        if (!validator.isEmail(value)) {
                              throw new Error("Not a valid Email !")
                        }
                  }
            },
            education: {
                  type: String,
                  maxLength: 25
            },
            age: {
                  type: Number,
                  min: 15
            },
            password: {
                  type: String,
                  required: true,
                  validate(value) {
                        if (!validator.isStrongPassword(value)) {
                              throw new Error("Not a Strong Password !")
                        }
                  }
            },
            phone:{
                  type:String
            },
            role: {
                  type: String,
                  required: true,
                  enum: {
                        values: ["user", "author"],
                        message: "Not a valid role"
                  }
            },
            avatar: {
                  public_id: {
                        type: String,
                        required: true
                  },
                  url: {
                        type: String,
                        required: true
                  },
            }
      },
      {
            timestamps: true
      }
)
userSchema.index({ role: 1, email: 1 })
const User = mongoose.model('User', userSchema)

module.exports = { User }