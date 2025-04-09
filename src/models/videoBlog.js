const mongoose = require('mongoose');
const { User } = require('./user');
const { lowerCase } = require('lodash');

const videoBlogSchema = new mongoose.Schema({
      authorName: {
            type: String,
            required: true,
            lowerCase: true
      },
      video1: {
            public_id: {
                  type: String,
                  required: true
            },
            url: {
                  type: String,
                  required: true
            },
      },
      title1: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: 65
      },
      desc1: {
            type: String,
            required: true,
            minLength: 100,
            maxLength: 1050
      },
      category: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: 40,
            lowerCase:true
      },
      video2: {
            public_id: {
                  type: String,
            },
            url: {
                  type: String,
            },
      },
      title2: {
            type: String,
            maxLength: 55,
            required:false,
            validate: {
                  validator: function (value) {
                      return !value || value.length >= 3; // Only validate if value exists
                  },
                  message: "title2 must be at least 3 characters long"
              }
      },
      desc2: {
            type: String,
            maxLength: 1050,
            required:false,
            validate: {
                  validator: function (value) {
                      return !value || value.length >= 3; // Only validate if value exists
                  },
                  message: "title2 must be at least 3 characters long"
              }
      },
      likes: {
            type: Number,
            default: 0,

      },
      likedBy: {
            type: [String]
      },
      dislikedBy: {
            type: [String]
      },
      reportBy: {
            type: []
      },
      authorId: {
            type: mongoose.Types.ObjectId,
            ref: User
      },
      authorAvatar:{
            type:String
      }

}, { timestamps: true })

const VideoBlog=new mongoose.model("VideoBlog",videoBlogSchema);

module.exports={VideoBlog}