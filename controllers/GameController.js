const GameService = require('../services/games/GameService')
const ErrorService = require("../services/ErrorService");
const UserIdService = require('../services/UserIdService')
const GameSocket = require('../sockets/GameSocket')

class GameController{

    async createGame(req,res){
        try{
            const {game} = req.body

            if(game){
                const result = await GameService.createGame(game)
                return res.json(result)
            }else
                return res.json({warning:true, message:'Поля game не заполнены'})

        }catch (e){
            await ErrorService.saveErrorMessage('GameController/createGame', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }

    async getGames(req,res){
        try{
            const result = await GameService.getGames()
            // console.log(result)
            return res.json(result)
        }catch (e){
            await ErrorService.saveErrorMessage('GameController/getGames', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }

    async getGame(req,res){
        try{
            let {id, userid, location} = req.body
            if(id && location){
                if(!userid){
                    userid = await UserIdService.getNewId()
                    console.log(userid)
                    if(userid.warning){
                        return res.json({warning:true, message:'Ошибка сервера'})
                    }
                    userid = userid.number
                }
                const result = await GameService.getGame(id)
                console.log({...result, userid})
                return res.json({...result, userid})
            }else
                return res.json({warning:true, message:'Поля id или location не заполнены'})

        }catch (e){
            await ErrorService.saveErrorMessage('GameController/getGame', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }

    async updateGame(req,res){
        try{
            const {game} = req.body
            if(game && game.id){
                const result = await GameService.updateGame(game.id, game)
                if (!result.warning){
                    GameSocket.updateGame(game)
                }
                return res.json(result)
            }else
                return res.json({warning:true, message:'Поля game не заполнены'})

        }catch (e){
            await ErrorService.saveErrorMessage('GameController/updateGame', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }

    async removeGame(req,res){
        try{
            const {id} = req.body
            if(id){
                const result = await GameService.removeGame(id)
                return res.json(result)
            }else
                return res.json({warning:true, message:'Поле id не заполнено'})
        }catch (e){
            await ErrorService.saveErrorMessage('GameController/removeGame', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }

}

module.exports = new GameController()