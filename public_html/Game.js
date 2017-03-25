Game = function (params) {
    Reactor.call(this);
    this.registerEvent("fieldChange");
    this.registerEvent("curPlayerChange");
    
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
    
    // It's Black's turn at the beginning
    this.curPlayer = Game.Players.Black;

    this.resetScore();
};

Game.prototype = Object.create(Reactor.prototype);

Game.Players = {
    Black: "Black",
    White: "White",
    Empty: "Empty" // Empty is a special player, who owns all neutral fields; GField.State == Empty means that no stone is placed there
};

Game.PlayerNames = {
    Black: "Černý",
    White: "Bílý",
    Empty: "Neutrální"
};

Game.params = {
    basicInfluence: 1,
    directInfluence: 0.5,
    diagonalInfluence: 0.25
};

// Set all players score to zero, "Empty" has it all
Game.prototype.resetScore = function() {
    this.score = {};
    for (var key in Game.Players) {
        this.score[key] = 0;
    }
    this.score[Game.Players.Empty] = this.width * this.height;
};

// Remove all influences and field ownership (stones remain placed),
// useful when recalculating influences
Game.prototype.resetInfluence = function() {
    for (var i = 0; i < this.width; i++)
        for (var j = 0; j < this.height; j++) {
            this.board[i][j].owner = Game.Players.Empty;
            for (var key in Game.Players)
                this.board[i][j].influence[key] = 0;
        }
};

// Pass the turn to the next player
Game.prototype.switchCurPlayer = function() {
    if (this.curPlayer === Game.Players.Black)
        this.curPlayer = Game.Players.White;
    else
        this.curPlayer = Game.Players.Black;
    this.dispatchEvent("curPlayerChange", this.curPlayer);
};

// Make a move at (x,y), current player is default
Game.prototype.move = function (x, y, player) {
    if (typeof player === "undefined")
        player = this.curPlayer;
    if (this.board[x][y].state !== Game.Players.Empty)
        return false;
    else {
        this.board[x][y].state = player;
        this.addStoneInfluence(x,y, player);
        this.dispatchEvent("fieldChange", x, y, this.board[x][y]);
        this.switchCurPlayer();
        return true;
    }
};

// Adds amount of influence for given player at (x, y), recalculates field owner
Game.prototype.addInfluence = function(x, y, amount, player) {
    // coordinates off the board...
    if (x < 0 || y < 0 || x >= this.width || y >= this.height)
        return;
    
    // add the amount to player's influence
    this.board[x][y].influence[player] += amount;
    
    // check if player became new field owner
    if (this.board[x][y].owner !== player && this.board[x][y].influence[player] > this.board[x][y].influence[this.board[x][y].owner])
    {
        this.score[player] += 1;
        this.score[this.board[x][y].owner] -= 1;
        this.board[x][y].owner = player;
    }
    // check if the field became neutral (field owner Empty)
    else if (this.board[x][y].owner !== Game.Players.Empty
            && this.board[x][y].owner !== player
            && this.board[x][y].influence[player] === this.board[x][y].influence[this.board[x][y].owner])
    {
        this.score[Game.Players.Empty] += 1;
        this.score[this.board[x][y].owner] -= 1;
        this.board[x][y].owner = Game.Players.Empty;
    }
    
    this.dispatchEvent("fieldChange", x, y, this.board[x][y]);
};

// Computes influence change after placing a player's stone at (x,y)
Game.prototype.addStoneInfluence = function(x, y, player) {
    this.addInfluence(x, y, Game.params.basicInfluence, player);
    
    this.addInfluence(x-1, y, Game.params.directInfluence, player);
    this.addInfluence(x+1, y, Game.params.directInfluence, player);
    this.addInfluence(x, y-1, Game.params.directInfluence, player);
    this.addInfluence(x, y+1, Game.params.directInfluence, player);
    
    this.addInfluence(x-1, y-1, Game.params.diagonalInfluence, player);
    this.addInfluence(x-1, y+1, Game.params.diagonalInfluence, player);
    this.addInfluence(x+1, y-1, Game.params.diagonalInfluence, player);
    this.addInfluence(x+1, y+1, Game.params.diagonalInfluence, player);
};

// Recalculates all influences and score - useful when the rules change
Game.prototype.recalculateInfluences = function() {
    this.resetScore();
    this.resetInfluence();
    
    // Add all influence for placed stones
    for (var i = 0; i < this.width; i++)
        for (var j = 0; j < this.height; j++)
            if (this.board[i][j].state !== Game.Players.Empty)
                this.addStoneInfluence(i, j, this.board[i][j].state);
};

// Game Field - one field in the game
GField = function () {
    // what stone is there
    this.state = Game.Players.Empty;
    // who is the maximum influence over it
    this.owner = Game.Players.Empty;
    // the influences themselves
    this.influence = {};
    for (var key in Game.Players) {
        this.influence[key] = 0;
    }
};