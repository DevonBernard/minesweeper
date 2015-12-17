var Minesweeper = function(ele)
{
    this.container = $(ele);
    this.dimensions = {x: 8, y:8};
    this.mines = 10;
    this.board = [];
};

Minesweeper.prototype.start = function()
{
    this.createBoard();
    this.setMines();
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

var Tile = function()
{
    this.opened = false;
    this.flagged = false;
    this.isMine = false;
    this.count = 0;
};