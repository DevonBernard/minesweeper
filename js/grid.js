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
};