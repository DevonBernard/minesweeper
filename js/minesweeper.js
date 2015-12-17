var Minesweeper = function(ele)
{
    this.container = $(ele);
    this.dimensions = {x: 8, y:8};
    this.mines = 10;
    this.flags = 0;
    this.tilesOpened = 0;
    this.board = [];
    this.cheatModeOn = false;
    this.gameBoard = $("<div class='mask row'></div>");
};

Minesweeper.prototype.start = function()
{
    this.container.addClass('minesweeper');
    this.createBoard();
    this.setMines();

    this.renderHeader();
    this.renderBoard();
    this.renderFooter();
};

Minesweeper.prototype.restart = function()
{
    if(this.cheatModeOn)
        this.toggleCheat();

    $(this.container).empty();
    $(this.gameBoard).empty();
    this.board = [];
    this.start();
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
    var innerFooter = $("<div class='col-xs-12 col-sm-8 col-sm-offset-2' />");

    var button1 = $("<div class='ms-btn'>Validate</div>");
    var button2 = $("<div class='ms-btn' id='ms-btn-reset'>Reset</div>");
    var button3 = $("<div class='ms-btn' id='ms-btn-cheat'>Cheat (OFF)</div>");

    $(button2).click((function(){
        this.restart();
    }).bind(this));

    $(button3).click((function(){
        this.toggleCheat();
    }).bind(this));

    innerFooter.append($("<div class='col-xs-4'></div>").append(button1));
    innerFooter.append($("<div class='col-xs-4'></div>").append(button2));
    innerFooter.append($("<div class='col-xs-4'></div>").append(button3));

    footer.append(innerFooter);
    this.container.append(footer);
};

Minesweeper.prototype.renderHeader = function()
{
    var header = $("<div class='header row' />");
    var innerHeader = $("<div class='col-xs-12 col-sm-10 col-sm-offset-1' />")

    innerHeader.append("<div class='col-xs-3'><i class='fa fa-th'></i><span id='ms-grid'></span></div>");
    innerHeader.append("<div class='col-xs-3'><i class='fa fa-bomb'></i><span id='ms-mines'></span></div>");
    innerHeader.append("<div class='col-xs-3'><i class='fa fa-flag'></i><span id='ms-flags'></span></div>");
    innerHeader.append("<div class='col-xs-3'><i class='fa fa-check-circle-o'></i><span id='ms-tiles'></tiles></div>");

    header.append(innerHeader);
    this.container.append(header);
    this.updateHeader();
};

Minesweeper.prototype.updateHeader = function(){
    $('#ms-grid').text(this.dimensions.x + " x " + this.dimensions.y);
    $("#ms-mines").text(this.mines);
    $("#ms-flags").text(this.flags);
    $("#ms-tiles").text(this.tilesOpened + " / " + ((this.dimensions.x * this.dimensions.y) - this.mines));
};

Minesweeper.prototype.toggleCheat = function(){
    var btn = $('#ms-btn-cheat');

    if($(btn).hasClass("active"))
        $(btn).text("Cheat (OFF)");
    else
        $(btn).text("Cheat (ON)");

    $(btn).toggleClass("active");
    $(this.gameBoard).toggleClass("mask");
    this.cheatModeOn = !this.cheatModeOn;
}

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