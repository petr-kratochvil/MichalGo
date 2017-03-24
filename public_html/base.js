initGame = function() {
    game = new Game({width: 19, height: 19});
    view = new View({width: 19, height: 19, game: game});
    document.getElementById("infBasic").value = Game.params.basicInfluence;
    document.getElementById("infDirect").value = Game.params.directInfluence;
    document.getElementById("infDiagonal").value = Game.params.diagonalInfluence;
    document.getElementById("whiteScore").innerHTML = this.game.score[Game.Players.White];
    document.getElementById("blackScore").innerHTML = this.game.score[Game.Players.Black];
    document.getElementById("neutralScore").innerHTML = this.game.score[Game.Players.Empty];
};

changeParams = function() {
    Game.params.basicInfluence = Number(document.getElementById("infBasic").value);
    Game.params.directInfluence = Number(document.getElementById("infDirect").value);
    Game.params.diagonalInfluence = Number(document.getElementById("infDiagonal").value);
    game.recalculateInfluences();
}