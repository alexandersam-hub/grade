const {Schema, model} = require('mongoose')

const GameModel = new Schema({
    name:{type:String, unique:true, required:true},
    locations:{type:[[Object]]},
    isActive:{type:String, default:true},

})

module.exports = model('games', GameModel)