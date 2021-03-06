function Minesweeper(ele, settings)
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
};