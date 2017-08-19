"use strict";

//为了防止和jquery名字发生冲突，增加name后缀
//例如jquery中是addClass,这里就变成了addClassName
Element.prototype.hasClassName = function(a) {
    return new RegExp("(?:^|\\s+)" + a + "(?:\\s+|$)").test(this.className);
};

Element.prototype.addClassName = function(a) {
    if (!this.hasClassName(a)) {
        this.className = [this.className, a].join(" ");
    }
};

Element.prototype.removeClassName = function(b) {
    if (this.hasClassName(b)) {
        var a = this.className;
        this.className = a.replace(new RegExp("(?:^|\\s+)" + b + "(?:\\s+|$)", "g"), " ");
    }
};

Element.prototype.toggleClassName = function(a) {
    this[this.hasClassName(a) ? "removeClassName" : "addClassName"](a);
};

//上面代码都很简单，下面这个是加强版的函数
Element.prototype.changeClassName = function(remove, add) {
    if (this.hasClassName(remove))
        this.removeClassName(remove);
    if (add)
        this.addClassName(add);
}

//辅助类，定义静态辅助方法
class BLFUtil {
    static toRadian(degree) {
        return degree * Math.PI / 180.0;
    }

    static toDegree(radian) {
        return radian * 180.0 / Math.PI;
    }
}

//基本几何shape数据结构
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

//三角形
class Triangle {
    constructor(p0 = new Point(0, 0), p1 = new Point(100, 0), p2 = new Point(100, 100)) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
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

    getCenterX() {
        (this.x + this.width) * 0.5;
    }

    getCenterY() {
        (this.y + this.height) * 0.5;
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


//渲染器
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

    pushStates() {
        this.context.save();
    }

    popStates() {
        this.context.restore();
    }

    /*
    ctx.lineWidth = value;  canvas2d default 1.0

    ctx.lineCap = "butt";   canvas2d default
    ctx.lineCap = "round";
    ctx.lineCap = "square";

    ctx.lineJoin = "bevel";
    ctx.lineJoin = "round";
    ctx.lineJoin = "miter";  canvas2d defaule

    ctx.miterLimit = value;  canvas2d default 10.0
    */
    setLineState(lineWidth = 2.0, lineCap = 'butt', lineJoin = 'round', miterLimit = 10.0) {
        let ctx = this.context;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = lineCap;
        ctx.lineJoin = lineJoin;
        ctx.miterLimit = miterLimit;
    }

    /*
    ctx.shadowColor = color;      canvas2d default rgba(0,0,0,0)
    ctx.shadowOffsetX = offset;   canvas2d default 0.0
    ctx.shadowOffsetY = offset;   canvas2d default 0.0
    ctx.shadowBlur = level;       canvas2d default 0.0
    */
    setShadowState(shadowColor = 'rgba(0,0,0,0.5)', shadowOffsetX = 2, shadowOffsetY = 2, shadowBlur = 2) {
        let ctx = this.context;
        ctx.shadowColor = shadowColor;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
        ctx.shadowBlur = shadowBlur;
    }

    /*
    ctx.textAlign = "left" || "right" ||
                    "center" || "start" ||
                     "end";             
                     canvas2d default start

    ctx.textBaseline = "top" || "hanging" ||
                       "middle" || "alphabetic" ||
                       "ideographic" || "bottom";
                       canvas2d default alphabetic
                       
    ctx.font = value;  canvas2d default 10px sans-serif 
    */
    setTextState(textAlign = 'center', textBaseLine = 'middle', font = '14px sans-serif') {
        let ctx = this.context;
        ctx.textAlign = textAlign;
        ctx.textBaseLine = textBaseLine;
        ctx.font = font;
    }

    clear(rect = new Rect(0, 0, this.getCanvasWidth(), this.getCanvasHeight())) {
        this.context.clearRect(rect.x, rect.y, rect.width, rect.height);
    }


    drawLine(x0, y0, x1, y1, style = 'red') {
        let ctx = this.context;
        ctx.save();
        ctx.strokeStyle = style;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.restore();
    }

    //dir = 'x'|'y'
    drawAxis(x, y, len, dir = 'x', space = 10, style = 'red') {
        if (dir == 'x')
            this.drawLine(x, y, x + len, y, style);
        else
            this.drawLine(x, y, x, y + len, style);

        let delta;
        let numTicks = len / space;
        let ctx = this.context;
        ctx.save();
        ctx.strokeStyle = style;
        for (let i = 1; i < numTicks; ++i) {

            ctx.beginPath();

            if (i % 5 === 0)
                delta = 10;
            else
                delta = 10 / 2;

            if (dir == 'x') {
                ctx.moveTo(x + i * space, y - delta);
                ctx.lineTo(x + i * space, y + delta);
                ctx.stroke();
            } else {
                context.moveTo(x - delta, y + i * space);
                context.lineTo(x + delta, y + i * space);
                context.stroke();
            }
        }
        ctx.restore();
    }


    drawCoords(rect, space = 10, style = 'red') {
        this.drawAxis(rect.x, rect.y, rect.width, 'x', space, style);
        this.drawAxis(rect.x, rect.y, rect.height, 'y', space, style);
    }

    //通用函数，可以绘制点线面，是否封闭，是否填充
    //其他绘制函数，都是该函数的特殊形式
    drawPoints(points = [], style = 'red', isClosed = true, isFill = true, compsiteOp = '') {

        //必须要大与等于2个点
        if (points.length < 2)
            return;

        let ctx = this.context;

        ctx.save();

        if (compsiteOp != null && compsiteOp.length != 0)
            ctx.globalCompositeOperation = compsiteOp;


        ctx.beginPath();

        //移动到第一个点位置
        ctx.moveTo(points[0].x, points[0].y);

        //从1-(n-1)循环绘制线段
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        //如果需要，封闭路径
        if (isClosed == true) {
            ctx.closePath();
        }


        //填充还是描边绘制
        if (isFill == true) {
            ctx.fillStyle = style;
            ctx.fill();
        } else {
            ctx.strokeStyle = style;
            ctx.stroke();
        }


        ctx.restore();
    }

    //context.strokeRect/fillRect不需要beginPath进行渲染状态清除
    //是一个简便方法
    drawRect(rc, style = "red", isFill = true, isClip = false, compsiteOp = '') {

        let ctx = this.context;

        if (isClip == true) {
            ctx.beginPath();
            ctx.rect(rc.x, rc.y, rc.width, rc.height);
            ctx.clip();
            return;
        }


        ctx.save();

        if (compsiteOp != null && compsiteOp.length != 0)
            ctx.globalCompositeOperation = compsiteOp;

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

    drawCircle(circle, style = "red", isFill = true, compsiteOp = '') {

        let ctx = this.context;

        ctx.save();

        if (compsiteOp != null && compsiteOp.length != 0) {
            ctx.globalCompositeOperation = compsiteOp;
        }

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

    drawArc(arc, style = "red", isFill = true, compsiteOp = '') {

        let ctx = this.context;

        ctx.save();

        if (compsiteOp != null && compsiteOp.length != 0)
            ctx.globalCompositeOperation = compsiteOp;


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

    drawGrid(backcolor, color, stepx, stepy, compsiteOp = '') {
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

        if (compsiteOp != null && compsiteOp.length != 0)
            ctx.globalCompositeOperation = compsiteOp;

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
    drawText(x = 0, y = 0, str = '随风而行之青衫磊落险峰行', style = 'black', compsiteOp = '') {
        let context = this.context;

        context.save();

        if (compsiteOp != null && compsiteOp.length != 0)
            ctx.globalCompositeOperation = compsiteOp;

        context.fillStyle = style;
        context.fillText(str, x, y);

        //context.strokeStyle = color;
        //context.strokeText(str, x, y);

        context.restore();
    }

    drawImage(image, srcRect = null, destRect = null, compsiteOp = '') {

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

        context.save();

        if (compsiteOp != null && compsiteOp.length != 0)
            ctx.globalCompositeOperation = compsiteOp;
        //进行bitblt操作(位块传输)，根据src/dest的rect的大小，自动进行缩放或拉伸
        context.drawImage(image, srcRect.x, srcRect.y, srcRect.width, srcRect.height, destRect.x, destRect.y, destRect.width, destRect.height);
        context.restore();
    }

    //type='repeat'/'repeat-x'/'repeat-y'/'no-repeat'
    //目前来说，很多浏览器只支持repeat方式
    createPattern(image, type = "repeat") {
        if (image == null)
            return null;

        let ret = this.context.createPattern(image, type);

        return ret;
    }

    createGradient(params, colors = [{ weight: 0, color: 'red' }, { weight: 1, color: 'blue' }]) {
        //坐标参数params必须要有内容
        if (params == null)
            return null;

        let g = null;
        let len = params.length;

        //坐标参数个数为0，退出
        if (len == 0)
            return null;

        //坐标参数params必须是4个或6个
        if (len != 4 && len != 6)
            return null;

        let ctx = this.context;

        if (len == 4) {
            //线性
            g = ctx.createLinearGradient(params[0], params[1], params[2], params[3]);
        } else {
            //放射性
            g = ctx.createRadialGradient(params[0], params[1], params[2], params[3], params[4], params[5]);
        }

        //渐变色不仅仅是2个，还可以多个
        //但是有一个条件:必须weight之和为1.0
        for (let i = 0; i < colors.length; i++) {
            g.addColorStop(colors[i].weight, colors[i].color);
        }

        return g;
    }

    //transform

    resetTransform() {
        this.context.resetTransform();
    }

    translate(dx, dy) {
        this.context.translate(dx, dy);
    }

    //绕default原点旋转
    //参数为角度而不是弧度表示
    rotate(degree) {
        let radian = BLFUtil.toRadian(degree);
        this.context.rotate(radian);
    }

    //绕任意点旋转
    rotateAt(dx, dy, degree) {
        this.context.translate(dx, dy);
        this.rotate(degree);
        this.context.translate(-dx, -dy);
    }

    scale(sx, sy) {
        this.context.scale(sx, sy);
    }

    //以任意点为中心缩放
    scaleAt(dx, dy, sx, sy) {
        this.context.translate(dx, dy);
        this.scale(sx, sy);
        this.context.translate(-dx, -dy);
    }

    //true为水平反转，false为垂直反转
    //反转镜像只是scale的特殊形式
    mirror(horizontal = true) {
        if (horizontal == true)
            this.context.scale(-1, 1);
        else
            this.context.scale(1, -1);
    }

    //错切矩阵，输入为角度
    skew(x = 0, y = 0) {

        if (x == 0 && y == 0)
            return;

        let tanX = 0;
        let tanY = 0;

        if (x != 0)
            tanX = Math.tan(BLFUtil.toRadian(x));

        if (y != 0)
            tanY = Math.tan(BLFUtil.toRadian(y));

        //矩阵参数a,b,c,d,e,f
        //b决定Y轴倾斜程度，c决定X轴倾斜程度
        this.context.transform(1, tanY, tanX, 1, 0, 0);
    }

    transformTo(a, b, c, d, e, f) {
        this.context.setTransform(a, b, c, d, e, f);
    }

    transformBy(a, b, c, d, e, f) {
        this.context.transform(a, b, c, d, e, f);
    }

}


class BLFSprite {
    constructor(name = '') {
        this.typeName = "BASE";
        this.name = name;
        this.color = "rgba(255,0,0,1)";

        this.x = 0;
        this.y = 0;

        this.rotation = 0;

        this.centerX = 0;
        this.centerY = 0;
    }

    //虚函数，如有需要，子类需override
    //default实现:目前暂时返回false
    //todo：后面会实现绑定盒/圈系统，再重新实现default基类行为
    hitTest(x, y) {
        return false;
    }

    //虚函数，如有需要，子类需override
    //default实现，啥都不干
    update(msec) {
        //console.log("update BLESprite");
        console.log("update sprite:" + this.name + " with type:" + this.typeName);
    }


    beginRender(render) {
        render.resetTransform();

        if (this.x != 0 || this.y != 0)
            render.translate(this.x, this.y);

        if (this.rotation != 0)
            if (this.centerX != 0 || this.centerY != 0) {
                render.rotateAt(this.centerX, this.centerY, this.rotation);
            } else
                render.rotate(this.rotation);
    }

    //虚函数，如有需要，子类需override
    //default实现:原本绘制背景，现改成纯虚方法
    render(render) {

    }

    endRender(render) {
        render.resetTransform();
    }

    //虚函数，如有需要，子类需要override
    //default实现: 返回背景大小
    getSize() {
        return new Size(render.getCanvasWidth(), render.getCanvasHeight());
    }

}

class BLFSpriteManager {

    constructor() {
        this.sprites = [];
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
    }

    //动态类型语言的好处
    //根据参数类型有针对性处理
    removeSprite(sprite) {
        let idx = -1;
        if (typeof(sprite) === "number")
            idx = sprite;
        else
            idx = this.sprites.indexOf(sprite);

        if (idx === -1)
            return false;

        this.sprites.splice(idx, 1);
        return true;
    }

    getSprite(idx) {
        if (idx < 0 || idx >= this.sprites.length)
            return;

        return this.sprites[idx];
    }

    getCount() {
        return this.sprites.length;
    }
}

class BLFEngine2D {
    constructor(context) {
        this.render = new BLFRender(context);
        this.sprMgr = new BLFSpriteManager();
    }

    //依次调用所有精灵的update方法
    //各个精灵的更新都在精灵的update中进行
    updateAll(msec) {
        for (let i = 0; i < this.sprMgr.getCount(); i++) {
            this.sprMgr.getSprite(i).update(msec);
        }
    }

    renderAll() {
        this.render.clear();
        for (let i = 0; i < this.sprMgr.getCount(); i++) {
            this.sprMgr.getSprite(i).beginRender(this.render);
            this.sprMgr.getSprite(i).render(this.render);
            this.sprMgr.getSprite(i).endRender(this.render);
        }
    }

    printAll() {
        let arr = [];
        for (let i = 0; i < this.sprMgr.getCount(); i++) {
            arr.push(this.sprMgr.getSprite(i).name);
        }

        console.log(JSON.stringify(arr, null, ""));
    }

    run(msec) {
        this.updateAll(msec);
        this.renderAll();
        requestAnimationFrame((msec) => { this.run(msec) });

        /*
        let self = this;
        requestAnimationFrame(function(msec) {
            self.run(msec);
        });
        */
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
    constructor(rect = new Rect(0, 0, 100, 50), name = '') {
        //super([基类构造函数参数列表])
        super(name);

        //this调用父类的成员属性必须在super()调用后才ok！！！！
        this.typeName = "RECT";
        this.rect = rect;
        this.x = 100;
        this.y = 100;
        this.centerX = rect.width * 0.5;
        this.centerY = rect.height * 0.5;
    }

    render(render) {
        render.drawRect(this.rect, this.color);
    }

    getSize() {
        return new Size(this.rect.with, this.rect.height);
    }

    update(msec) {
        this.rotation += 1.0;
    }
}


class BLFGridSprite extends BLFSprite {
    constructor(name = '') {
        //super([基类构造函数参数列表])
        super(name);

        //this调用父类的成员属性必须在super()调用后才ok！！！！
        this.typeName = "GridBackgroud";
    }

    render(render) {
        render.drawGrid('black', 'white', 20, 20);
    }
}


class BLFDemoSprite extends BLFSprite {
    constructor(center = false, name = '') {
        //super([基类构造函数参数列表])
        super(name);

        //this调用父类的成员属性必须在super()调用后才ok！！！！
        this.typeName = "DemoSprite";

        this.x = 250;
        this.y = 250;

        this.rotateSpeed = 1;

        this.rect = new Rect(0, 0, 100, 50);
        this.lines = [new Point(100, 25), new Point(150, 25)];

        //如果center = true
        //旋转中心为rect的中心点，否则为rect的左上角
        if (center) {
            this.centerX = this.rect.width * 0.5;
            this.centerY = this.rect.height * 0.5;
        }
    }

    //渲染rect
    //粗线渲染朝向标记线
    //细线渲染坐标轴
    render(render) {
        render.drawRect(this.rect, 'blue');
        render.pushStates();
        render.setLineState(3.0);
        render.drawLine(this.lines[0].x, this.lines[0].y, this.lines[1].x, this.lines[1].y, 'green');
        render.popStates();
        render.drawCoords(this.rect);
    }

    update(msec) {
        this.rotation += this.rotateSpeed;
    }
}