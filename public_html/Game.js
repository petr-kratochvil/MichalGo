Game = function (params) {
    Reactor.call(this);
    
    this.width = params.width;
    this.height = params.height;
    this.board = [];
    
    // The board is Empty
    for (var i = 0; i < this.width; i++) {
        this.board[i] = [];
        for (var j = 0; j < this.height; j++) {
            this.board[i][j] = new GField();
        }
    }
    
    // It's Black's turn
    this.curPlayer = Game.Players.Black;
    
    // Reactor events:
    this.registerEvent("fieldChange");
    this.registerEvent("curPlayerChange");
    
    this.score = {};
    for (var key in Game.Players) {
        this.score[key] = 0;
    }
    this.score[Game.FieldState.Empty] = this.width * this.height;
};

Game.prototype = Object.create(Reactor.prototype);

Game.Players = {
    Black: "Black",
    White: "White"
};

Game.PlayerNames = {
    Black: "Černý",
    White: "Bílý"
};

Game.FieldState = {
    Empty: "Empty"
};

for (var key in Game.Players) {
    Game.FieldState[key] = Game.Players[key];
}

Game.params = {
    basicInfluence: 1,
    directInfluence: 0.5,
    diagonalInfluence: 0.25
};

Game.prototype.switchCurPlayer = function() {
    if (this.curPlayer === Game.Players.Black)
        this.curPlayer = Game.Players.White;
    else
        this.curPlayer = Game.Players.Black;
    this.dispatchEvent("curPlayerChange", this.curPlayer);
};

Game.prototype.move = function (x, y) {
    if (this.board[x][y].state !== Game.FieldState.Empty)
        return false;
    else {
        this.board[x][y].state = this.curPlayer;
        this.addInfluenceStone(x,y, this.curPlayer);
        this.dispatchEvent("fieldChange", x, y, this.board[x][y]);
        this.switchCurPlayer();
        return true;
    }
};

Game.prototype.addInfluenceStone = function(x, y, player) {
    var safelyAdd = function(x,y,amount) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return;
        this.board[x][y].influence[player] += amount;
        if (this.board[x][y].owner !== player && this.board[x][y].influence[player] > this.board[x][y].influence[this.board[x][y].owner])
        {
            this.score[player] += 1;
            this.score[this.board[x][y].owner] -= 1;
            this.board[x][y].owner = player;
        } else if (this.board[x][y].owner !== Game.FieldState.Empty
                && this.board[x][y].owner !== player
                && this.board[x][y].influence[player] === this.board[x][y].influence[this.board[x][y].owner])
        {
            this.score[Game.FieldState.Empty] += 1;
            this.score[this.board[x][y].owner] -= 1;
            this.board[x][y].owner = Game.FieldState.Empty;
        }
        this.dispatchEvent("fieldChange", x, y, this.board[x][y]);
    }.bind(this);
    safelyAdd(x, y, Game.params.basicInfluence);
    
    safelyAdd(x-1, y, Game.params.directInfluence);
    safelyAdd(x+1, y, Game.params.directInfluence);
    safelyAdd(x, y-1, Game.params.directInfluence);
    safelyAdd(x, y+1, Game.params.directInfluence);
    
    safelyAdd(x-1, y-1, Game.params.diagonalInfluence);
    safelyAdd(x-1, y+1, Game.params.diagonalInfluence);
    safelyAdd(x+1, y-1, Game.params.diagonalInfluence);
    safelyAdd(x+1, y+1, Game.params.diagonalInfluence);
};

Game.prototype.recalculateInfluences = function() {
    for (var key in Game.Players)
        this.score[key] = 0;
    this.score[Game.FieldState.Empty] = this.width * this.height;
    
    for (var i = 0; i < this.width; i++)
        for (var j = 0; j < this.height; j++) {
            this.board[i][j].owner = Game.FieldState.Empty;
            for (var key in Game.FieldState)
                this.board[i][j].influence[key] = 0;
        }

    for (var i = 0; i < this.width; i++)
        for (var j = 0; j < this.height; j++)
            if (this.board[i][j].state !== Game.FieldState.Empty)
                this.addInfluenceStone(i, j, this.board[i][j].state);
};

GField = function () {
    this.state = Game.FieldState.Empty;
    this.owner = Game.FieldState.Empty;
    this.influence = {};
    for (var key in Game.FieldState) {
        this.influence[key] = 0;
    }
};