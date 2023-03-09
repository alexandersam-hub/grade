class GradeDto{

    id
    game
    grades

    constructor(model) {
        this.id = model.id?model.id.toString():''
        this.game = model.game;
        this.grades = model.grades?model.grades:{};
    }

}

module.exports = GradeDto