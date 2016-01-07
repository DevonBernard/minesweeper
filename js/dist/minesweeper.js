function Grid(width, height, numMines, stopCallback)
{
    this.dims = {x:width, y:height};
    this.numMines = numMines;
    this.numFlags = 0;
    this.numOpenTiles = 0;
    this.stopCallback = stopCallback;
    this.tiles = [];
};

Grid.prototype.GenerateTiles = function()
{
    var row;
    for(var y = 0; y < this.dims.y; y++)
    {
        row = [];
        for(var x = 0; x < this.dims.x; x++)
        {
            row.push(new Tile(x, y));
        }
        this.tiles.push(row);
    }
};

Grid.prototype.SetMines = function()
{
    var numMinesRemaining = this.numMines,
        randomX,
        randomY;

    if(this.numMinesRemaining >= this.dims.x * this.dims.y)
    {
        alert('Invalid Game: Too many mines');
        return;
    }

    while(numMinesRemaining > 0)
    {
        randomX = Math.floor((Math.random() * this.dims.x));
        randomY = Math.floor((Math.random() * this.dims.y));

        if(this.tiles[randomY][randomX].isMine === false)
        {
            this.SetMine(randomX, randomY);
            numMinesRemaining--;
        }
    }
};

Grid.prototype.SetMine = function(x, y)
{
    this.tiles[y][x].isMine = true;
    this.IncrementAdjacentTiles(x,y);
};

Grid.prototype.ToggleFlag = function(x, y)
{
    this.numFlags += this.tiles[y][x].isFlagged ? -1 : +1;
    this.tiles[y][x].ToggleFlag();
};

Grid.prototype.OpenTile = function(x, y)
{
    var tile = this.tiles[y][x];

    if(tile.isOpen === false)
    {
        this.numFlags += tile.isFlagged ? -1 : 0;
        this.numOpenTiles++;
        tile.Open();

        if(tile.isMine === true)
        {
            alert('BOOM: You lose.')
            this.stopCallback();
        }
    }
};

Grid.prototype.IncrementAdjacentTiles = function(x_0, y_0)
{
    for(var y = y_0 - 1; y <= y_0 + 1; y++)
    {
        for(var x = x_0 - 1; x <= x_0 + 1; x++)
        {
            if(this.InRange(x, y) && !(x === x_0 && y === y_0))
            {
                this.tiles[y][x].numAdjMines++;
            }
        }
    }
};

Grid.prototype.InRange = function(x, y)
{
    return (x >= 0 && x < this.dims.x)
        && (y >= 0 && y < this.dims.y);
};

Grid.prototype.LogBoard = function()
{
    var rowString;
    for(var y = 0; y < this.dims.y; y++)
    {
        rowString = "";
        for(var x = 0; x < this.dims.x; x++)
        {
            rowString += this.tiles[y][x].isMine ? "x " : this.tiles[y][x].numAdjMines + " ";
        }
        console.log(rowString);
    }
};

Grid.prototype.ProcessClick = function(e)
{
    var target, // DOM Element in focus
        tileList, // List of tiles to be opened
        x, y; // Coordinates for tile currently being processed
    
    target = $(e.target).hasClass('tile') 
        ? e.target : 
        $(e.target.parentElement).hasClass('tile')
            ? e.target.parentElement : null; 

    if(target !== null)
    {
        x = $(target).data('x');
        y = $(target).data('y');

        if(this.tiles[y][x].numAdjMines !== 0)
        {
            this.OpenTile(x, y);
        }
        else
        {
            tileList = [[x,y]];

            while(tileList.length != 0)
            {
                x = tileList[0][0];
                y = tileList[0][1];

                if(this.InRange(x, y) && this.tiles[y][x].isOpen === false)
                {
                    if(this.tiles[y][x].numAdjMines === 0)
                    {
                        tileList.push.apply(tileList, [
                            [x-1, y-1],
                            [x,   y-1],
                            [x+1, y-1],
                            [x-1, y],
                            [x+1, y],
                            [x-1, y+1],
                            [x,   y+1],
                            [x+1, y+1]
                        ]);
                    }

                    this.OpenTile(x, y);
                }

                tileList.shift();
            }
        }
    }
};

Grid.prototype.ProcessRightClick = function(e)
{
    var target, // DOM Element in focus
        x, y; // Coordinates for tile currently being processed
    
    target = $(e.target).hasClass('tile') 
        ? e.target : 
        $(e.target.parentElement).hasClass('tile')
            ? e.target.parentElement : null;

    if(target !== null)
    {
        x = $(target).data('x');
        y = $(target).data('y');

        if(this.tiles[y][x].isOpen === false)
        {
            this.ToggleFlag(x, y);
        }
    }
};function Minesweeper(ele, settings)
{
    // Settings
    this.settings = settings || {};
    this.settings.dims = this.settings.dims || {x:8, y:8};
    this.settings.numMines = this.settings.numMines || 10;

    // Mode
    this.mode = {};
    this.mode.play = true;
    this.mode.cheat = false;

    // DOM Elements
    this.$container = $(ele).addClass('minesweeper');
    this.$gameBoard = $('<div/>', {'class' : 'board mask'});
};

Minesweeper.prototype.Start = function()
{
    this.grid = new Grid(
        this.settings.dims.x,
        this.settings.dims.y,
        this.settings.numMines,
        this.Stop.bind(this)
    );

    this.grid.GenerateTiles();
    this.grid.SetMines();

    this.RenderHeader();
    this.RenderBoard();
    this.RenderFooter();

    this.$gameBoard.click((function(e){
        if(this.CheckPlayMode() === true)
        {
            this.grid.ProcessClick(e);
            this.UpdateHeader();
        }
    }).bind(this));

    this.$gameBoard.bind('contextmenu',(function(e){
        e.preventDefault();

        if(this.CheckPlayMode() === true)
        {
            this.grid.ProcessRightClick(e);
            this.UpdateHeader();
        }
    }).bind(this));

    this.mode.play = true;
};

Minesweeper.prototype.Stop = function()
{
    this.mode.play = false;
};

Minesweeper.prototype.CheckPlayMode = function()
{
    if(this.mode.play === true)
    {
        return true;
    }
    else
    {
        alert('This game is already over... Start a new game to play again.');
        return false;
    }
}

Minesweeper.prototype.ProcessButton = function(type)
{
    switch(type)
    {
        case 'validate':
            if(this.CheckPlayMode() === true)
            {
                if(this.grid.numOpenTiles == ((this.settings.dims.x * this.settings.dims.y) - this.settings.numMines))
                {
                    alert('Valid Grid: You Win!');
                }
                else
                {
                    alert('Invalid Grid: You lose.');
                }
                this.mode.play = false;
            }
            break;
        case 'reset':
            if(this.cheatModeOn)
                this.ToggleCheat();
            
            this.$container.empty();
            this.$gameBoard.empty();
            this.Start();
            break;
        case 'cheat':
            this.ToggleCheat();
            break;
    }
};

Minesweeper.prototype.ToggleCheat = function()
{
    var btn = $('#ms-btn-cheat');

    if($(btn).hasClass('active'))
        $(btn).text('Cheat (OFF)');
    else
        $(btn).text('Cheat (ON)');

    $(btn).toggleClass('active');
    this.$gameBoard.toggleClass('mask');
    this.cheatModeOn = !this.cheatModeOn;
};

Minesweeper.prototype.RenderHeader = function()
{
    var $div, $icon, $value;
    var $header = $('<div/>', {'class':'header row'});
    var $innerHeader = $('<div/>', {'class':'col-xs-12 col-sm-10 col-sm-offset-1'});

    for(var i = 1; i < 5; i++)
    {
        $div = $('<div/>', {'class':'col-xs-3'});
        switch(i)
        {
            case 1:
                $icon = $('<span/>', {'class':'fa fa-th'});
                $value = $('<span/>', {'id':'ms-grid'});
                break;
            case 2:
                $icon = $('<span/>', {'class':'fa fa-bomb'});
                $value = $('<span/>', {'id':'ms-mines'});
                break;
            case 3:
                $icon = $('<span/>', {'class':'fa fa-flag'});
                $value = $('<span/>', {'id':'ms-flags'});
                break;
            case 4:
                $icon = $('<span/>', {'class':'fa fa-check-circle-o'});
                $value = $('<span/>', {'id':'ms-tiles'});
                break;
        }
        $div.append($icon).append($value);
        $innerHeader.append($div);
    }

    $header.append($innerHeader);
    this.$container.append($header);
    this.UpdateHeader();
};

Minesweeper.prototype.RenderBoard = function()
{
    var $row;
    var $boardContainer = $('<div/>', {'class':'board-container row'});

    for(var y = 0; y < this.grid.dims.y; y++)
    {
        $row = $('<div/>', {'class':'board-row'});
        for(var x = 0; x < this.grid.dims.x; x++)
        {
            $row.append(this.grid.tiles[y][x].Render(x, y));
        }
        this.$gameBoard.append($row);
    }

    $boardContainer.append(this.$gameBoard);
    this.$container.append($boardContainer);
};

Minesweeper.prototype.RenderFooter = function()
{
    var $btn, $div;
    var $footer = $('<div/>', {'class':'footer row'});
    var $innerFooter = $('<div/>', {'class':'col-xs-12 col-sm-8 col-sm-offset-2'});

    for(var i = 1; i < 4; i++)
    {
        $btn = $('<div/>', {'class':'ms-btn'});
        $div = $('<div/>', {'class':'col-xs-6 col-xs-offset-3 col-sm-4 col-sm-offset-0'});
        switch(i)
        {
            case 1:
                $btn.text('Validate');
                $btn.click((function(){
                    this.ProcessButton('validate');
                }).bind(this));
                break;
            case 2:
                $btn.text('New Game');
                $btn.click((function(){
                    this.ProcessButton('reset');
                }).bind(this));
                break;
            case 3:
                $btn.text('Cheat (OFF)').attr('id', 'ms-btn-cheat');
                $btn.click((function(){
                    this.ProcessButton('cheat');
                }).bind(this));
                break;
        }
        $innerFooter.append($div.append($btn));
    }

    $footer.append($innerFooter);
    this.$container.append($footer);
};

Minesweeper.prototype.UpdateHeader = function(){
    $('#ms-grid').text(this.settings.dims.x + " x " + this.settings.dims.y);
    $('#ms-mines').text(this.settings.numMines);
    $('#ms-flags').text(this.grid.numFlags);
    $('#ms-tiles').text(this.grid.numOpenTiles + " / " + ((this.settings.dims.x * this.settings.dims.y) - this.settings.numMines));
};var Tile = function(x, y)
{
    this.pos = {x:x, y:y};
    this.isOpen = false;
    this.isFlagged = false;
    this.isMine = false;
    this.numAdjMines = 0;
};

Tile.prototype.Render = function()
{
    var $innerContent = $('<span/>');

    this.$div = $('<div/>', {
        'class' : 'tile',
        'data-x' : this.pos.x,
        'data-y' : this.pos.y
    });

    if(this.isMine)
    {
        $innerContent.addClass('fa fa-bomb');
    }
    else if(this.numAdjMines > 0)
    {
        $innerContent.text(this.numAdjMines);
    }        

    this.$div.append($innerContent);

    return this.$div;
};

Tile.prototype.Open = function()
{
    this.isOpen = true;

    if(this.isFlagged)
    {
        this.ToggleFlag();
    }

    if(this.isMine)
    {
        this.$div.addClass('open');
    }
    else
    {
        this.$div.addClass('open box'+this.numAdjMines);
    }
};

Tile.prototype.ToggleFlag = function()
{
    if(this.isFlagged === false)
    {
        this.$div.append(
            $('<span/>', {
                'class' : 'fa fa-flag'
            })
        );
    }
    else
    {
        this.$div.children().remove('.fa-flag');
    }

    this.isFlagged = !this.isFlagged;
    this.$div.toggleClass('flag');
};