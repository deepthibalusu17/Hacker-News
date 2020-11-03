const mongoose = require('mongoose');

//News Schema
const NewsSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
   by:{type:String,required:true},
   timestamp:{type:Date,default:new Date()}
});

module.exports=mongoose.model('News', NewsSchema);