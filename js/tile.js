var Tile = function(x, y)
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