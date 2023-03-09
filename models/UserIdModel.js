const {Schema, model} = require('mongoose')

const UserIdModel = new Schema({
    user:{type:Number, unique:true, required:true},
    currentNumber:{type:Number,required:true}
})

module.exports = model('userid', UserIdModel)