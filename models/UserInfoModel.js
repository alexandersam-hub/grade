const {Schema, model} = require('mongoose')

const UserInfoModel = new Schema({
    user:{type:String, unique:true, required:true},
    age:{type:String},
    gender:{type:String}
})

module.exports = model('userinfo', UserInfoModel)