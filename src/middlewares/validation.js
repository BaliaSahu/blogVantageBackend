const express = require('express')
const app = express()
const validation = (req) => {

      const details = ["firstName", "lastName", "email", "password", "age", "gender", "role"];
      const reqDetails = Object.keys(req.body)
      for (let i = 0; i < reqDetails.length; i++) {
            if (!details.includes(reqDetails[i])) {
                  throw new Error("Please do fillup as per the form !!")
            }
      }
      return req.body
}
module.exports = {
      validation
}