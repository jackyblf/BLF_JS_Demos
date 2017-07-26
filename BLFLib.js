/**
 * Created by kathyBu on 2017/7/26.
 */

// static util function defined here
/*************************************Util Function Begin***************************************************/
var BLFUtil = function() {};
BLFUtil.inherits = function(ctor, superCtor) {
    if (ctor === undefined || ctor === null)
        throw new TypeError('The constructor to "inherits" must not be ' +
            'null or undefined');

    if (superCtor === undefined || superCtor === null)
        throw new TypeError('The super constructor to "inherits" must not ' +
            'be null or undefined');

    if (superCtor.prototype === undefined)
        throw new TypeError('The super constructor to "inherits" must ' +
            'have a prototype');

    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
};
/*************************************Util Function End*****************************************************/

/*************************************Render Begin***************************************************/
function BLFRender(context) {
    if (!(this instanceof BLFRender))
        return new BLFRender();

    this.context = context;
}

BLFRender.prototype.drawGrid = function(backcolor, color, stepx, stepy) {
        context = this.context;

        context.save()

        context.strokeStyle = color;
        context.fillStyle = backcolor;
        context.lineWidth = 0.5;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.globalAlpha = 0.5;

        context.beginPath();
        for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
            context.moveTo(i, 0);
            context.lineTo(i, context.canvas.height);
        }
        context.stroke();

        context.beginPath();
        for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
            context.moveTo(0, i);
            context.lineTo(context.canvas.width, i);
        }
        context.stroke();

        context.restore();
    }
    /*************************************Render End******************************************************/

/*************************************Sprite System Begin***************************************************/
function BLFBaseSprite() {
    if (!(this instanceof BLFBaseSprite))
        return new BLFBaseSprite();

    this.typeName = "BASE";
}

BLFBaseSprite.prototype.getTypeName = function() {
    return this.typeName;
}

BLFBaseSprite.prototype.render = function(render) {
    render.drawGrid('black', 'white', 10, 10);
}

/***************************Sprite System Rect ***********************************/
function BLFRectSprite() {
    if (!(this instanceof BLFRectSprite))
        return new BLFRectSprite();

    BLFBaseSprite.call(this);

    this.typeName = "RECT";
}

BLFUtil.inherits(BLFRectSprite, BLFBaseSprite);

/*************************************Sprite System End*****************************************************/