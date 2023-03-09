const {Schema, model} = require('mongoose')

const GradeModel = new Schema({
    game:{type:String},
    grades:{type:Object},
})

module.exports = model('grades', GradeModel)