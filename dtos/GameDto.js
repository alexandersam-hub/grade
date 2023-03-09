class GameDto{

    id
    name
    locations
    isActive



    constructor(model) {
        this.id = model.id?model.id.toString():''
        this.name = model.name;
        this.locations = model.locations;
        this.isActive = model.isActive;
    }

}

module.exports = GameDto