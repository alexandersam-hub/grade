const ProgressModel = require('../../models/GameProgressModel')
const ProgressDto = require('../../dtos/GameProgressDto')
// game:{type:String, unique:true, required:true},
// location:{type:Number},

class ProgressService{

    async getGameProgress(gameId){
        try{
            const progressBd = await ProgressModel.findOne({game:gameId})
            if (progressBd){
                return new ProgressDto(progressBd)
            }else{
                const newProgress = await ProgressModel.create({game:gameId, location:0})
                return new ProgressDto(newProgress)
            }
        }catch (e){
            return null
        }
    }

    async setGameProgress(gameId, valueLocation){
        try{
            const progressBd = await ProgressModel.findOne({game:gameId})
            if (progressBd){
                progressBd.location = valueLocation
                await progressBd.save()
                return true
            }else{
                return false
            }
        }catch (e){
            return false
        }
    }

}

module.exports = new ProgressService()