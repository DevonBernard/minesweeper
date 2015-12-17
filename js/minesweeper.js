var Minesweeper = function(ele)
{
    this.container = $(ele);
    this.dimensions = {x: 8, y:8};
    this.mines = 10;
    this.tilesOpened = 0;
    this.board = [];
};

Minesweeper.prototype.start = function()
{
    this.gameBoard = $("<div class='mask row'></div>");
    this.container.addClass('minesweeper');
    this.createBoard();
    this.setMines();

    this.renderHeader();
    this.renderBoard();
    this.renderFooter();
};

Minesweeper.prototype.createBoard = function()
{
    for(var y = 0; y < this.dimensions.y; y++)
    {
        var row = [];
        for(var x = 0; x < this.dimensions.x; x++)
        {
            row.push(new Tile());
        }
        this.board.push(row);
    }
};

Minesweeper.prototype.setMines = function()
{
    var minesSet = 0;
    while(minesSet < this.mines)
    {
        var x = Math.floor((Math.random() * this.dimensions.x));
        var y = Math.floor((Math.random() * this.dimensions.y));

        if(this.board[y][x].isMine === false)
        {
            this.setMine(x,y);
            minesSet++;
        }
    }
};

Minesweeper.prototype.setMine = function(x, y)
{
    this.board[y][x].isMine = true;
    for(var y2 = y-1; y2 <= y+1; y2++)
    {
        if(y2 >= 0 && y2 < this.dimensions.y)
        {
            for(var x2 = x-1; x2 <= x+1; x2++)
            {
                if(x2 >= 0 && x2 < this.dimensions.y && !(x2 === x && y2 === y))
                {
                    this.board[y2][x2].count++;
                }
            }
        }
    }
};

Minesweeper.prototype.logBoard = function()
{
    for(var y = 0; y < this.dimensions.y; y++)
    {
        var output = "";
        for(var x = 0; x < this.dimensions.x; x++)
        {
            if(this.board[y][x].isMine)
            {
                output += "x ";
            }
            else
            {
                output += this.board[y][x].count + " ";
            }
        }
        console.log(output);
    }
};

Minesweeper.prototype.renderBoard = function()
{
    for(var y = 0; y < this.dimensions.y; y++)
    {
        var row = $("<div class='board-row' />");
        for(var x = 0; x < this.dimensions.x; x++)
        {
            row.append(this.board[y][x].render());
        }
        this.gameBoard.append(row);
    }
    this.container.append(this.gameBoard);
};

Minesweeper.prototype.renderFooter = function()
{
    var footer = $("<div class='footer row' />");
    var innerFooter = $("<div class='col-xs-12 col-sm-8 col-sm-offset-2' />")

    innerFooter.append("<div class='col-xs-4'><div class='ms-btn'>Validate</div></div>");
    innerFooter.append("<div class='col-xs-4'><div class='ms-btn'>Reset</div></div>");
    innerFooter.append("<div class='col-xs-4'><div class='ms-btn'>Cheat</div></div>");

    footer.append(innerFooter);
    this.container.append(footer);
};

Minesweeper.prototype.renderHeader = function()
{
    var header = $("<div class='header row' />");
    var innerHeader = $("<div class='col-xs-12 col-sm-10 col-sm-offset-1' />")

    innerHeader.append("<div class='col-xs-3'><i class='fa fa-th'></i><span id='ms-grid'>8x8</span></div>");
    innerHeader.append("<div class='col-xs-3'><i class='fa fa-bomb'></i><span id='ms-mines'>10</span></div>");
    innerHeader.append("<div class='col-xs-3'><i class='fa fa-flag'></i><span id='ms-flags'>0/10</span></div>");
    innerHeader.append("<div class='col-xs-3'><i class='fa fa-check-circle-o'></i><span id='ms-tiles'>36/36</tiles></div>");

    header.append(innerHeader);
    this.container.append(header);
};

var Tile = function()
{
    this.opened = false;
    this.flagged = false;
    this.isMine = false;
    this.count = 0;
};

Tile.prototype.render = function()
{
    var value;

    this.div = $("<div class='tile'></div>");

    if(this.isMine)
        this.div.append("<img src='img/explosion.png'>");
    else if(this.count > 0)
        this.div.append("<span>"+this.count+"</span>");
    else
        this.div.append("<span></span>");

    $(this.div).click((function(){
        this.open();
    }).bind(this));

    return this.div;
}

Tile.prototype.open = function()
{
    $(this.div).addClass('box'+this.count)
    $(this.div).addClass('open');
}