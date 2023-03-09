const ErrorService = require("./ErrorService");
const UserIdModel = require('../models/UserIdModel')

class UserIdService{

    async createEmptyUser(){
        try {
            await UserIdModel.create({user:0, currentNumber:1})
            return true
        }catch (e){
            ErrorService.saveErrorMessage('UserIdService/getNewId', e.message)
            return false
        }
    }

    async getNewId(){
        try {
            const user = await UserIdModel.findOne({user:0})
            if(!user){
                if(await this.createEmptyUser())
                    return {warning:false, number:1}
                else new Error('Не удалось создать пользователя')
            }
            user.currentNumber++
            const number = user.currentNumber
            user.save()
            return {warning:false, number}

        }catch (e){
            ErrorService.saveErrorMessage('UserIdService/getNewId', e.message)
            return {warning:true, message:'Ошибка доступа к базе данных'}
        }
    }
}

module.exports = new UserIdService()