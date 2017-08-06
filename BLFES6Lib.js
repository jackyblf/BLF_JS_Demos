"use strict";

class BLFUtil {
    static toRadian(degree) {
        return degree * Math.PI / 180.0;
    }

    static toDegree(radian) {
        return radian * 180.0 / Math.PI;
    }
}

class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}


class Size {
    constructor(width = 100, height = 100) {
        this.width = width;
        this.height = height;
    }
}


//圆心+半径确定一个圆
class Circle {
    constructor(x = 0, y = 0, radius = 50) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}

//原点+尺寸确定一个矩形
class Rect {
    constructor(x = 0, y = 0, width = 100, height = 100) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class Arc {
    //以角度而非弧度为输入参数
    constructor(x = 0, y = 0, radius = 50, startAngle = 0, endAngle = 180.0, closed = true, ccw = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.isClosed = closed; //是否封闭圆弧，default为true
        this.isCCW = ccw; //是否逆时针方向绘制，default为false，使用顺时针方向绘制
    }
}

class BLFRender {
    constructor(ctx) {
        this.context = ctx;
    }

    getCanvasWidth() {
        return (this.context.canvas.width);
    }

    getCanvasHeight() {
        return (this.context.canvas.height);
    }

    clear(rect = new Rect(0, 0, this.getCanvasWidth(), this.getCanvasHeight())) {
        this.context.clearRect(rect.x, rect.y, rect.width, rect.height);
    }

    //context.strokeRect/fillRect不需要beginPath进行渲染状态清除
    //是一个简便方法
    drawRect(rc, style = "red", isFill = true) {

        let ctx = this.context;

        ctx.save();

        ctx.beginPath();

        if (isFill) {
            ctx.fillStyle = style;
            ctx.fillRect(rc.x, rc.y, rc.width, rc.height);
        } else {
            ctx.strokeStyle = style;
            ctx.strokeRect(rc.x, rc.y, rc.width, rc.height);
        }

        ctx.restore();
    }

    drawCircle(circle, style = "red", isFill = true) {

        let ctx = this.context;

        ctx.save();

        ctx.beginPath(); //清除当前路径列表中的所有子路径
        ctx.arc(circle.x, circle.y, circle.radius, 0.0, Math.PI * 2.0, true);
        //设置样式
        if (isFill) {
            ctx.fillStyle = style;
            ctx.fill();
        } else {
            ctx.strokeStyle = style;
            ctx.stroke();
        }

        ctx.restore();
    }

    drawArc(arc, style = "red", isFill = true) {

        let ctx = this.context;

        ctx.save();

        ctx.beginPath(); //清除当前路径列表中的所有子路径

        ctx.arc(arc.x, arc.y, arc.radius, BLFUtil.toRadian(arc.startAngle), BLFUtil.toRadian(arc.endAngle), arc.isCCW);
        if (arc.isClosed)
            ctx.closePath();

        //设置样式
        if (isFill) {
            ctx.fillStyle = style;
            ctx.fill();
        } else {
            ctx.strokeStyle = style;
            ctx.stroke();
        }

        ctx.restore();
    }

    drawGrid(backcolor, color, stepx, stepy) {
        let context = this.context;

        /*渲染状态套路用法:
        1. 凡是调用context进行绘制的函数(本代码中,以draw和render开头的函数)，
        在绘制前先save()，保存当前的渲染状态。
        在退出绘制函数前，调用一下restore()函数，将渲染状态恢复到最近一次save()后的状态
        在save()/restore()中间的代码，你可以任意设置渲染状态，进行绘制
        2. 之所以这样，是因为所有的renderAPI(例如gl/dx/gdi/skia/cairo/quartz等)都是基于状态机实现
        所有的renderAPI进行渲染提交时，使用的是当前设置的渲染状态。
        如果不进行save/restore，下一次绘制时候还是延续上一次的渲染状态，这会导致你状态混乱。
        3. save/restore可以嵌套使用，但必须是配对的(实际内部就是一个stack<RenderState>堆栈)
           save
                save
                    save
                    restore
                restore
            restore
        4. 哪些渲染状态会被记录到RenderState中去呢? 我们碰到一个添加一个，本类中目前我们用到的渲染状态属性如下:
           strokeStyle
           fillStyle
           lineWidth
           其他未用到的渲染状态都是default状态
           随着代码越来越多，我们会知道所有的渲染状态，这一点蛮重要的！
        */

        context.save()

        context.strokeStyle = color;
        context.fillStyle = backcolor;
        context.lineWidth = 0.5;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

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

    /*
    文字的fill/stroke大家可以切换看看,会发现文字绘制效果完全不同
    矢量图形绘制包括两部分:描边(stroke)和(fill)
    stroke使用strokeStyle提供的样式进行绘制
    fill使用fillStyle提供的央视进行绘制
    为什么称为style而不是color? 因为style不单单支持color，还支持渐变色、贴图等样式
    */
    drawText(x, y, color, str) {
        let context = this.context;

        context.save();

        context.fillStyle = color;
        context.fillText(str, x, y);

        //context.strokeStyle = color;
        //context.strokeText(str, x, y);

        context.restore();
    }

    drawImage(image, srcRect = null, destRect = null) {

        //如果image不存在，直接退出函数
        if (image == null)
            return;

        //如果srcRect为null,则设置srcRect为输入参数image的width/height
        if (srcRect == null) {
            srcRect = new Rect(0, 0, image.width, image.height);
        }

        //如果destRect为null,则设置destRect为画布本身的width/height
        if (destRect == null) {
            destRect = new Rect(0, 0, this.getCanvasWidth(), this.getCanvasHeight());
        }

        let context = this.context;

        //进行bitblt操作(位块传输)，根据src/dest的rect的大小，自动进行缩放或拉伸
        context.drawImage(image, srcRect.x, srcRect.y, srcRect.width, srcRect.height, destRect.x, destRect.y, destRect.width, destRect.height);
    }

    //type='repeat'/'repeat-x'/'repeat-y'/'no-repeat'
    //目前来说，很多浏览器只支持repeat方式
    createPattern(image, type = "repeat") {
        if (image == null)
            return null;

        let ret = this.context.createPattern(image, type);

        return ret;
    }
}

class BLFSprite {
    constructor() {
        this.typeName = "BASE";
    }

    render(render) {
        render.clear();
        render.drawGrid('white', 'black', 20, 20);
    }
}

/*
关于es6中的super关键字一个前提，两个用法有:
一个前提:
       只有使用了extends的子类才能使用super关键字
两个用法:
       1. 函数调用形式：
               super([基类构造函数参数列表]),必须在子类构造函数中调用super()
               this调用父类的成员属性必须在super()调用后才ok！！！！
       2. 非函数调用形式:
               在子类的成员函数中调用基类类方法时使用super关键字而不是super()函数，切记！
*/
class BLFRectSprite extends BLFSprite {
    constructor() {
        //super([基类构造函数参数列表])
        super();

        //this调用父类的成员属性必须在super()调用后才ok！！！！
        this.typeName = "RECT";
    }

    render(render) {
        //调用基类方法绘制背景
        super.render(render);

        //rect比基类增加了文字绘制功能
        //render.drawText(10, 100, 'red', "随风而行之青衫磊落险峰行来测试一下渲染表面");

        //render.drawRect(new Rect());
        //render.drawCircle(new Circle(100, 100, 100), 'green', false);
        render.drawArc(new Arc(100, 100, 50), 'blue', false);
        render.drawArc(new Arc(200, 100, 50), 'red', true);
    }
}