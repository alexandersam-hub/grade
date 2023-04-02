const { WebSocketServer } = require('ws');
const GameService = require('../services/games/GameService')
const UserIdService = require('../services/UserIdService')
const ProgressService = require('../services/games/ProgressService')
const GradeService = require('../services/GradeService')
const UserInfoService = require('../services/users/UserInfoService')

class GameSocket{

    ws
    games = {}
    usersList = {}
    adminsList = {}

    updateGame(game){
        if (  this.games[game.id]){
            this.games[game.id].name = game.name
            this.games[game.id].locations = game.locations
        }
    }

    async init(server, isLocalServer) {
        try {
            if (isLocalServer)
                this.ws = new WebSocketServer({port: 8100});
            else
                this.ws = new WebSocketServer({server});

            this.ws.on('connection', (ws) => {

                let user
                let role
                let gameId

                ws.on('message', async (data) => {
                    const messageData = JSON.parse(data)

                    switch (messageData.action) {
                        case 'login':
                            gameId = messageData.gameId
                            if(!gameId){
                                return this.sendMessage(ws, {warning: true, action: 'login', message: 'bad token'})
                            }
                            if (!this.games[gameId]){
                                const currentGame = await GameService.getGame(gameId)
                                if(currentGame.warning)
                                    return this.sendMessage(ws, {warning: true, action: 'login', message: 'bad game'})
                                this.games[gameId] = currentGame.data.game
                                const progress = await ProgressService.getGameProgress(gameId)
                                if(progress) {
                                    this.games[gameId].process = progress
                                }
                                else
                                    this.games[gameId].process = {location:0, game:gameId}
                            }
                            if (!messageData.token){
                                role='user'
                                if (messageData.userId && messageData.userId>=0){user = messageData.userId}
                                else{
                                    const newUserId = await UserIdService.getNewId()
                                    if(newUserId.warning){
                                        return this.sendMessage(ws, {warning: true, action: 'login', message: 'bad game'})
                                    }
                                    user = newUserId.number
                                }
                                const currentLocation = this.games[gameId].locations[this.games[gameId].process?this.games[gameId].process.location:0]
                                const lastAnswerByLocation = await GradeService.getGradeUserByLocation(gameId,this.games[gameId].process?this.games[gameId].process.location:0, user)
                                if(! this.usersList[gameId])
                                    this.usersList[gameId] = []
                                this.usersList[gameId].push({id:user, ws})

                                return this.sendMessage(ws, {
                                    warning:false,
                                    gameName:this.games[gameId].name,
                                    action: 'login',
                                    answer:lastAnswerByLocation,
                                    isUserInfo:this.games[gameId].isUserInfo && await UserInfoService.isUserInfo(user), location:currentLocation,
                                    userId:user, role, isAnswer: lastAnswerByLocation && lastAnswerByLocation.length>0
                                })

                            }else{
                                role = 'admin'
                                if(! this.adminsList[gameId])
                                    this.adminsList[gameId] = []
                                const grades = await GradeService.getGradeByGameId(gameId)
                                const userInfo = {}
                                if(grades && this.games[gameId].isUserInfo &&  grades.grades)
                                    for (const grade in grades.grades) {
                                        userInfo[grade] = await UserInfoService.getInfo(grade)
                                    }
                                user =this.adminsList[gameId].length
                                this.adminsList[gameId].push({gameId, ws, userId: user})

                                return this.sendMessage(ws, {
                                    warning:false,
                                    userInfo,
                                    action: 'login',grades,
                                    game:this.games[gameId]})

                            }
                                // return ws.send(JSON.stringify({warning: true, action: 'login', message: 'bad token'}))

                        case 'putGrade':
                            await GradeService.gradePut(messageData.grade, gameId, this.games[gameId].process.location, user)
                            this.games[gameId].process.count++
                            if (this.adminsList[gameId]) {
                                const grades = await GradeService.getGradeByGameId(gameId)
                                const userInfo = {}
                                if(grades && this.games[gameId].isUserInfo &&  grades.grades)
                                    for (const grade in grades.grades) {
                                        userInfo[grade] = await UserInfoService.getInfo(grade)
                                    }
                                this.adminsList[gameId].forEach(admin => this.sendMessage(admin.ws, {
                                    warning: false,
                                    grades,userInfo,
                                    action: 'login',
                                    game: this.games[gameId]
                                }))
                            }
                            const currentLocation = this.games[gameId].locations[this.games[gameId].process.location]
                            const lastAnswerByLocation = await GradeService.getGradeUserByLocation(gameId, this.games[gameId].process.location, user)

                            return this.sendMessage(ws, {warning:false,
                                answer:lastAnswerByLocation,
                                location:currentLocation,
                                gameName:this.games[gameId].name, action: 'reportPutGrade'})

                        case 'putUserInfo':
                            // console.log(messageData)
                            const res = await UserInfoService.addInfo(user,messageData.age, messageData.gender )
                            this.sendMessage(ws,{  action: 'reportUserInfo',warning:!res})
                            return

                        case 'nextAnswer':
                            this.games[messageData.gameId].process.location = messageData.numberLocation
                            await ProgressService.setGameProgress(gameId, messageData.numberLocation)
                            if (this.adminsList[gameId]) {
                                const grades = await GradeService.getGradeByGameId(gameId)
                                const userInfo = {}
                                if(grades && this.games[gameId].isUserInfo &&  grades.grades)
                                    for (const grade in grades.grades) {
                                        userInfo[grade] = await UserInfoService.getInfo(grade)
                                    }
                                this.adminsList[gameId].forEach(admin => this.sendMessage(admin.ws, {
                                    warning: false,
                                    grades,userInfo,
                                    action: 'login',
                                    game: this.games[gameId]
                                }))
                            }
                            if (this.usersList[gameId]) {
                                const currentLocation = this.games[gameId].locations[this.games[gameId].process.location]
                                for (let u of this.usersList[gameId]) {
                                    const lastAnswerByLocation =await GradeService.getGradeUserByLocation(gameId, messageData.numberLocation, u.id)
                                    this.sendMessage(u.ws, {
                                        warning:false,
                                        isAnswer: lastAnswerByLocation && lastAnswerByLocation.length>0,
                                        gameName:this.games[gameId].name, action: 'login', answer:lastAnswerByLocation,
                                        location:currentLocation, userId:u.id, role:'user'})
                                }
                            }
                            break
                            //
                            // this.usersList[gameId].forEach(u=>{
                            //     const lastAnswerByLocation = GradeService.getGradeUserByLocation(gameId, messageData.numberLocation, user).
                            //     return this.sendMessage(ws, {warning:false,
                            //         gameName:this.games[gameId].name, action: 'login', answer:lastAnswerByLocation,
                            //         location:currentLocation, userId:u., role})
                            // })



                            // this.sendMessageAll(this.adminsList[gameId],this.usersList[gameId], {
                            //     warning:false,
                            //     gameName:this.games[gameId].name, action: 'login', answer:lastAnswerByLocation,
                            //     location:currentLocation, userId:user,
                            // } )
                        case 'removeProgress':
                            this.games[messageData.gameId].process.location = 0
                            await GradeService.removeGradesUsers(gameId)
                            await ProgressService.setGameProgress(gameId, 0)
                            if (this.adminsList[gameId]) {
                                const grades = await GradeService.getGradeByGameId(gameId)
                                const userInfo = {}
                                if(grades && this.games[gameId].isUserInfo &&  grades.grades)
                                    for (const grade in grades.grades) {
                                        userInfo[grade] = await UserInfoService.getInfo(grade)
                                    }

                                this.adminsList[gameId].forEach(admin => this.sendMessage(admin.ws, {
                                    warning: false,
                                    grades,userInfo,
                                    action: 'login',
                                    game: this.games[gameId]
                                }))
                            }
                            if (this.usersList[gameId]){
                                const currentLocation = this.games[gameId].locations[this.games[gameId].process.location]
                                for (let u of this.usersList[gameId]) {
                                    const lastAnswerByLocation =await GradeService.getGradeUserByLocation(gameId, messageData.numberLocation, u.id)
                                    this.sendMessage(u.ws, {
                                        warning:false,
                                        gameName:this.games[gameId].name, action: 'login', answer:lastAnswerByLocation,
                                        location:currentLocation, userId:u.id, role:'user'})
                                }
                            }
                            //
                            break
                        default:
                            break
                    }})
                ws.on('close', ()=> {
                    if (role === 'admin'){
                        this.adminsList[gameId] =  this.adminsList[gameId]?this.adminsList[gameId].filter(l=>l.userId !== user):[]
                    }else{
                        this.usersList[gameId] = this.usersList[gameId]?this.usersList[gameId].filter(u=>u.id !== user):[]
                    }
                    // if (game)
                        // if (user.role === 'admin')
                        //     this.currentGame[game].adminsSockets = this.currentGame[game].adminsSockets.filter(u=>u.user.id!==user.id)
                        // else
                        //     this.currentGame[game].usersSockets = this.currentGame[game].usersSockets.filter(u=>u.user.id!==user.id)
                })
            })
        }catch (e){
            console.log(e)
        }
    }

    sendMessage(ws, data){
        ws.send(JSON.stringify(data))
    }

    getUserInfo(){

    }

}

module.exports = new GameSocket()