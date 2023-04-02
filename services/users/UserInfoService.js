const UserInfoModel = require('../../models/UserInfoModel')

class UserInfoService{
    async getInfo(userId){
        try{
            const user = await UserInfoModel.findOne({user:userId})
            if (user)
                return {age:user.age, gender:user.gender }
            else
                return null
        }

     catch (e){
        console.log(e)
        return null
    }
}

    async isUserInfo(userId){
        try{
            const user = await UserInfoModel.findOne({user:userId})
            return !user
        } catch (e){
            console.log(e)
            return true
        }
    }
    async addInfo(userId, age, gender){
       try{
           const user = await UserInfoModel.findOne({user:userId})
           if (user){
               user.age = age
               user.gender = gender
               await user.save()
               return {warning:false}
           }else{
               await UserInfoModel.create({user:userId, age, gender})
               return {warning:false}
           }


       } catch (e){
           console.log(e)
           return {warning:true, message:e.message}
       }
    }
}


module.exports = new UserInfoService()