const {Schema, model} = require('mongoose')

const GameProgressModel = new Schema({

    game:{type:String, unique:true, required:true},
    location:{type:Number},
})

module.exports = model('progress', GameProgressModel)