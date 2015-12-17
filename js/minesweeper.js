var Minesweeper = function(ele)
{
    this.container = $(ele);
    this.dimensions = {x: 8, y:8};
    this.mines = 10;
    this.board = [];
};

var Tile = function()
{
    this.opened = false;
    this.flagged = false;
    this.isMine = false;
    this.count = 0;
};