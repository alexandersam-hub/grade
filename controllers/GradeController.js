const GradeService = require('../services/GradeService')

class GradeController{
    async gradePut(req, res){
        try {
            const {userid, grade, game, location} = req.body
            if(!userid)
                return {warning:true, message:'Не заполнено поле userId'}
            if(grade<0)
                return {warning:true, message:'Не заполнено поле userId'}
            const res = await GradeService.gradePut(userid, grade, game, location)
        }catch (e){
            return {warning:true, message:'Ошибка базы данных'}
        }
    }
}

module.exports = new GradeController()