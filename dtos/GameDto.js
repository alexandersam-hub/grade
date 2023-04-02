class GameDto{

    id
    name
    locations
    isUserInfo
    isActive



    constructor(model) {
        this.id = model.id?model.id.toString():''
        this.name = model.name;
        this.isUserInfo = model.isUserInfo
        this.locations = model.locations;
        this.isActive = model.isActive;
    }

}

module.exports = GameDto