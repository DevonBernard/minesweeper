function Minesweeper(ele, settings)
{
    // Settings
    this.container = $(ele);
    this.settings = settings || {};
    this.settings.dimensions = this.settings.dimensions || {x:8, y:8};
    this.settings.numMines = this.settings.numMines || 10;

    // Status
    this.flags = 0;
    this.tilesOpened = 0;
    this.cheatModeOn = false;
    this.gameBoard = $("<div class='board mask'></div>");
};

function Grid(width, height, numMines)
{
    this.dimensions = {x:width, y:height};
    this.numMines = numMines;
    this.numFlags = 0;
    this.numOpenTiles = 0;
    this.tiles = [];
};

Minesweeper.prototype.Start = function()
{
    this.grid = new Grid(this.settings.dimensions.x, this.settings.dimensions.y, this.settings.numMines);
    this.container.addClass('minesweeper');
    this.grid.createBoard();
    this.grid.setMines();

    this.renderHeader();
    this.renderBoard();
    this.renderFooter();
    $(this.gameBoard).click((function(e){
        var target = e.target;
        var isTile = $(target).hasClass('tile');

        if(!isTile)
        {
            target = target.parentElement;
            isTile = $(target).hasClass('tile');
        }

        if(isTile)
        {
            var x = $(target).data('x');
            var y = $(target).data('y');

            if(this.grid.tiles[y][x].count == 0)
            {
                var tileList = [[x,y]];

                while(tileList.length != 0)
                {
                    var tX = tileList[0][0];
                    var tY = tileList[0][1];
                    if(tY < this.grid.dimensions.y && tY >= 0 && tX >= 0 && tX < this.grid.dimensions.x)
                    {
                        if(this.grid.tiles[tY][tX].flagged === true)
                            this.grid.numFlags -= 1;

                        var res = this.grid.tiles[tY][tX].open();

                        if(res === 0)
                        {
                            this.grid.numOpenTiles++;
                            tileList.push([tX-1,tY-1]);
                            tileList.push([tX,tY-1]);
                            tileList.push([tX+1,tY-1]);
                            tileList.push([tX-1,tY]);
                            tileList.push([tX+1,tY]);
                            tileList.push([tX-1,tY+1]);
                            tileList.push([tX,tY+1]);
                            tileList.push([tX+1,tY+1]);
                        }
                        else if(res != false)
                        {
                            this.grid.numOpenTiles++;
                        }
                    }
                    tileList.shift();
                }
            }
            else
            {
                if(this.grid.tiles[y][x].flagged === true)
                            this.grid.numFlags -= 1;
                this.grid.tiles[y][x].open();
                this.grid.numOpenTiles++;
            }

            this.updateHeader();
        }
    }).bind(this));

    $(this.gameBoard).bind("contextmenu",(function(e){
        e.preventDefault();

        var target = e.target;
        var isTile = $(target).hasClass('tile');

        if(!isTile)
        {
            target = target.parentElement;
            isTile = $(target).hasClass('tile');
        }

        if(isTile)
        {
            var x = $(target).data('x');
            var y = $(target).data('y');
            var tf = this.grid.tiles[y][x].toggleFlag();
            this.grid.numFlags += tf;
            this.updateHeader();
        }
        
    }).bind(this));


};

Minesweeper.prototype.restart = function()
{
    if(this.cheatModeOn)
        this.toggleCheat();

    $(this.container).empty();
    $(this.gameBoard).empty();
    this.Start();
};

Minesweeper.prototype.validate = function()
{
    if(this.grid.numOpenTiles == ((this.settings.dimensions.x * this.settings.dimensions.y) - this.settings.numMines))
    {
        alert("WIN");
    }
    else
    {
        alert("LOSE");
    }
};

Grid.prototype.createBoard = function()
{
    for(var y = 0; y < this.dimensions.y; y++)
    {
        var row = [];
        for(var x = 0; x < this.dimensions.x; x++)
        {
            row.push(new Tile());
        }
        this.tiles.push(row);
    }
};

Grid.prototype.setMines = function()
{   
    if(this.numMines >= this.dimensions.x * this.dimensions.y)
    {
        alert("Too many mines");
        return;
    }

    var minesSet = 0;
    while(minesSet < this.numMines)
    {
        var x = Math.floor((Math.random() * this.dimensions.x));
        var y = Math.floor((Math.random() * this.dimensions.y));

        if(this.tiles[y][x].isMine === false)
        {
            this.setMine(x,y);
            minesSet++;
        }
    }
};

Grid.prototype.setMine = function(x, y)
{
    this.tiles[y][x].isMine = true;
    for(var y2 = y-1; y2 <= y+1; y2++)
    {
        if(y2 >= 0 && y2 < this.dimensions.y)
        {
            for(var x2 = x-1; x2 <= x+1; x2++)
            {
                if(x2 >= 0 && x2 < this.dimensions.x && !(x2 === x && y2 === y))
                {
                    this.tiles[y2][x2].count++;
                }
            }
        }
    }
};

Grid.prototype.logBoard = function()
{
    for(var y = 0; y < this.dimensions.y; y++)
    {
        var output = "";
        for(var x = 0; x < this.dimensions.x; x++)
        {
            if(this.tiles[y][x].isMine)
            {
                output += "x ";
            }
            else
            {
                output += this.tiles[y][x].count + " ";
            }
        }
        console.log(output);
    }
};

Minesweeper.prototype.renderBoard = function()
{
    var boardContainer = $("<div class='board-container row'>");
    for(var y = 0; y < this.grid.dimensions.y; y++)
    {
        var row = $("<div class='board-row' />");
        for(var x = 0; x < this.grid.dimensions.x; x++)
        {
            row.append(this.grid.tiles[y][x].render(x, y));
        }
        this.gameBoard.append(row);
    }

    boardContainer.append(this.gameBoard);
    this.container.append(boardContainer);
};

Minesweeper.prototype.renderFooter = function()
{
    var footer = $("<div class='footer row' />");
    var innerFooter = $("<div class='col-xs-12 col-sm-8 col-sm-offset-2' />");

    var button1 = $("<div class='ms-btn'>Validate</div>");
    var button2 = $("<div class='ms-btn' id='ms-btn-reset'>Reset</div>");
    var button3 = $("<div class='ms-btn' id='ms-btn-cheat'>Cheat (OFF)</div>");

    $(button1).click((function(){
        this.validate();
    }).bind(this));

    $(button2).click((function(){
        this.restart();
    }).bind(this));

    $(button3).click((function(){
        this.toggleCheat();
    }).bind(this));

    innerFooter.append($("<div class='col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0'></div>").append(button1));
    innerFooter.append($("<div class='col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0'></div>").append(button2));
    innerFooter.append($("<div class='col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0'></div>").append(button3));

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
    $('#ms-grid').text(this.settings.dimensions.x + " x " + this.settings.dimensions.y);
    $("#ms-mines").text(this.settings.numMines);
    $("#ms-flags").text(this.grid.numFlags);
    $("#ms-tiles").text(this.grid.numOpenTiles + " / " + ((this.settings.dimensions.x * this.settings.dimensions.y) - this.settings.numMines));
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

Tile.prototype.render = function(x, y)
{
    var value;

    this.div = $("<div class='tile' data-x='"+x+"' data-y='"+y+"'></div>");

    if(this.isMine)
        this.div.append("<i class='fa fa-bomb'></i>");
    else if(this.count > 0)
        this.div.append("<span>"+this.count+"</span>");
    else
        this.div.append("<span></span>");

    return this.div;
};

Tile.prototype.open = function()
{
    if(this.opened == true)
    {
        return false;
    }

    if(this.flagged)
    {
        this.toggleFlag();
    }

    this.opened = true;
    $(this.div).addClass('open');

    if(this.isMine)
    {
        alert("You lose");
    }
    else
    {
        $(this.div).addClass('box'+this.count)
    }
    return this.count;
};

Tile.prototype.toggleFlag = function()
{
    if(!this.opened)
    {
        if(!this.flagged)
        {
            this.div.append("<span class='fa fa-flag'></span>");
        }
        else
        {
            this.div.children().remove(".fa-flag");
        }

        this.flagged = !this.flagged;
        $(this.div).toggleClass("flag");
        return this.flagged ? 1 : -1;
    }
    return 0;
};