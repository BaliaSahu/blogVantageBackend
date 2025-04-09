const express=require('express')
const mongoose=require('mongoose')
const { type } = require('os')
const {User}=require('./user')
const { lowerCase, toLower } = require('lodash')

const authorSchema=new mongoose.Schema({
      authorName:{
            type:String,
            required:true,
            lowerCase:true
      },
      photo1:{
            public_id: {
                  type: String,
                  required: true
            },
            url: {
                  type: String,
                  required: true
            },
      },
      title1:{
            type:String,
            required:true,
            minLength:3,
            maxLength:65
      },
      desc1:{
            type:String,
            required:true,
            minLength:100,
            maxLength:1050
      },
      category:{
            type:String,
            required:true,
            minLength:3,
            maxLength:30,
            lowerCase:true
      }, 
      photo2:{ 
            public_id: {
                  type: String,
            },
            url: {
                  type: String,
            },
      },
      title2:{
            type:String,
            minLength:3,
            maxLength:55
      },
      desc2:{
            type:String,
            minLength:100,
            maxLength:1050
      },
      likes:{
            type:Number,
            default:0,
            
      },
      likedBy:{
            type:[String]
      },
      dislikedBy:{
            type:[String]
      },
      reportBy:{
            type:[]
      },
      authorId:{
            type:mongoose.Types.ObjectId,
            ref:User
      }

},{timestamps:true})
const Author=mongoose.model("Author",authorSchema)
module.exports={
      Author
}