const GradeModel = require('../models/GradeModel')
const ErrorService = require("./ErrorService");
const GradeDto = require('../dtos/GradeDto')
// id
// game
// grades

class GradeService{

    async getGrades(){
        try {

        }catch (e){
            ErrorService.saveErrorMessage('GradeService/getGrades', e.message)
            return {warning:true, message:'Ошибка доступа к базе данных'}
        }
    }

    async removeGradesUsers(gameId){
        try{
            const gradeDb = await GradeModel.findOne({game:gameId})
            gradeDb.grades = {}
            await gradeDb.save()
        }catch (e) {
            return false
        }
    }

    async removeGradeByGameId(gameId){
        try{
            await GradeModel.findByIdAndDelete({game:gameId})
            return true
        }catch (e) {
            return false
        }
    }

    async getGradeUserByLocation(gameId, localId, userId){
        try {
            const gradeDb = await GradeModel.findOne({game:gameId})
            if (!gradeDb)
                return null
            const userGrade = gradeDb.grades[userId]
            const gradeByLocation = userGrade.filter(loc => loc.localId === localId)
            return gradeByLocation
        }catch (e){
            return null
        }
    }

    async getGradeByGameId(gameId){
        try {
            const gradeDb = await GradeModel.findOne({game:gameId})
            return new GradeDto(gradeDb)
        }catch (e){
            return null
        }
    }

    async gradePut(grade, gameId, textQuestion, localId, questionId, userId){
        // try {
            const gradeDb = await GradeModel.findOne({game:gameId})
            if(gradeDb){
                if(!gradeDb.grades[userId])
                    gradeDb.grades[userId] = []
                gradeDb.grades[userId].push({localId, question:questionId, textQuestion, grade, date:Date.now()})
                await GradeModel.findOneAndUpdate(gradeDb.id, gradeDb)
            }else{
                // const newGrade = {}
                // newGrade[gameId] = {}
                // newGrade[gameId][userId] = {}
                // newGrade[gameId][userId][local] = grade
                const newGrade = {}
                newGrade[userId] = [{localId, question:questionId, textQuestion, grade, date:Date.now()}]
                await GradeModel.create({game:gameId, grades:newGrade})
            }
            return true
        // }catch (e){
        //     return false
        // }
    }

}

module.exports = new GradeService()