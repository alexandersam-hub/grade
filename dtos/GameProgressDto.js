
class GameProgressDto{

    id
    game
    location
    question
    count

    constructor(model) {
        this.id = model.id?model.id.toString():''
        this.game = model.game;
        this.location = model.location;
        this.isActive = model.isActive;
    }
}

module.exports = GameProgressDto