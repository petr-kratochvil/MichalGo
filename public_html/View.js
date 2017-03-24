View = function(params) {
    this.width = params.width;
    this.height = params.height;
    this.game = params.game;
    this.board = [];
    this.domElement = document.getElementById("gameDiv");
    
    // The board is Empty
    for (var i = 0; i < this.width; i++) {
        this.board[i] = [];
        for (var j = 0; j < this.height; j++) {
            this.board[i][j] = new VField(this.domElement, i, j);
            this.board[i][j].addEventListener("clicked", this.handleClicked.bind(this));
        }
    }
    
    this.game.addEventListener("fieldChange", this.handleFieldChange.bind(this));
    this.game.addEventListener("curPlayerChange", this.handlePlayerChange.bind(this));
    this.handlePlayerChange(this.game.curPlayer);
};

View.prototype.handleClicked = function(x, y) {
    this.game.move(x,y);
};

View.prototype.handleFieldChange = function(x, y, field) {
    this.board[x][y].changeState(field);
    document.getElementById("whiteScore").innerHTML = this.game.score[Game.Players.White];
    document.getElementById("blackScore").innerHTML = this.game.score[Game.Players.Black];
    document.getElementById("neutralScore").innerHTML = this.game.score[Game.FieldState.Empty];
};

View.prototype.handlePlayerChange = function(player) {
    document.getElementById("curPlayer").innerHTML = Game.PlayerNames[player];
};

VField = function(parent, x, y) {
    Reactor.call(this);
    this.registerEvent("clicked");
    this.x = x;
    this.y = y;
    this.domElement = document.createElement('div');
    this.domElement.className = "field";
    this.domElement.style.left = (x * 35 + 5) + 'px';
    this.domElement.style.top = (y * 35 + 5) + 'px';
    this.domElement.onclick = function() { this.dispatchEvent("clicked", this.x, this.y); }.bind(this);
    //this.changeState(Game.FieldState.Empty);
    parent.appendChild(this.domElement);
};

VField.prototype = Object.create(Reactor.prototype);

VField.prototype.changeState = function(field) {
    var score = field.influence[Game.Players.Black]-field.influence[Game.Players.White];
    switch (field.state) {
        case Game.FieldState.Empty:
            if (score > 0)
                this.domElement.style.backgroundColor = '#ffd780';
            else if (score < 0)
                this.domElement.style.backgroundColor = 'lightgoldenrodyellow';
            else
                this.domElement.style.backgroundColor = 'blanchedalmond';
            break;
            this.domElement.style.color = 'rgba(0,0,0,0.5);'
        case Game.FieldState.Black:
            this.domElement.style.backgroundColor = '#808080';
            this.domElement.style.borderRadius = '8px';
            this.domElement.style.color = 'black';
            this.domElement.style.borderColor = 'black';
            this.domElement.style.borderWidth = '2px';
            this.domElement.style.borderStyle = 'solid';
            if (score < 0) {
                this.domElement.style.color = 'darkred';
                this.domElement.style.borderStyle = 'dashed'
            }
            break;
        case Game.FieldState.White:
            this.domElement.style.backgroundColor = '#FFFFFF';
            this.domElement.style.borderRadius = '8px';
            this.domElement.style.color = 'black';
            this.domElement.style.borderColor = 'black';
            this.domElement.style.borderWidth = '2px';
            this.domElement.style.borderStyle = 'solid';
            if (score > 0) {
                this.domElement.style.color = 'red';
                this.domElement.style.borderStyle = 'dashed'
            }
            break;
    }
    this.state = field.state;
    if (score !== 0 || this.state !== Game.FieldState.Empty)
        this.domElement.innerHTML = Math.abs(score);
    else
        this.domElement.innerHTML = '';
};