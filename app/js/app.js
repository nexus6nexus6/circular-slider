'use strict';

/*
* Circular silder module
* author: grega@webshocker.net
*/

var circularSlider = function(opt) {


    // ** CORE

    // core vars and objects
    var options,            // configuration object
        sliderEl,           // slider DOM nodes
        sliderValue,         // slider output
        track = false,       // slider locking mechanism
        t = 10              // border thickness



    // core methods
    var initialize,
        defaults,
        config,
        render,
        update,
        events

    // init, invoked at the bottom
    initialize = function(options) {

        // set default values
        defaults()

        // overwrite defaults
        config(options)

        // render slider elements
        render()

        // update UI with default values
        update()

        // listen to DOM and app events
        events()

    }

    // configures default values
    defaults = function() {

        // set default options and parse 'px' values into numbers
        options = parseOptions({
            container: getById('#container'),
            id: 'slider',
            color: 'red',
            max: 1,
            min: 0,
            step: 0.01,
            radius: '100px',
            offset: {
                x: '0px',
                y: '0px'
            }
        })


        // set default slider value
        sliderValue = options.min;

        // set default sliderEl object values
        sliderEl = {
            slider: null,
            scale: null,
            origin: null,
            dragger: null,
            bg: null,
            label: null
        };

    }

    // overwrites default values
    config = function(_options) {

        if (_options) {
            // extend default options object and parse 'px' values into numbers
            options = parseOptions(extendObj(options,_options))
            // set sliderValue to options.min
            sliderValue = options.min
        }

    }

    // renders slider DOM nodes
    render = function() {

        // get container nodes
        var container = options.container;
        var labels = getByClass('.labels')

        // create slider DOM nodes,  attach them to shared sliderEl
        sliderEl = {
            slider: createEl('div', options.id),
            listener: createEl('div', 'listener'),
            origin: createEl('div', 'origin'),
            bg: createEl('div', 'bg'),
            scale: createCircularScale(),
            dragger: createEl('div', 'dragger'),
            label: createEl('div', options.id)
        }

        // glue slider DOM nodes and append them to container
        sliderEl.slider.appendChild(sliderEl.origin)
        sliderEl.slider.appendChild(sliderEl.bg)
        sliderEl.slider.appendChild(sliderEl.dragger)
        sliderEl.slider.appendChild(sliderEl.scale)
        sliderEl.slider.appendChild(sliderEl.listener)

        // append two main elements to conatiner nodes
        container.appendChild(sliderEl.slider)
        labels.appendChild(sliderEl.label)

        // set sliders class namespace
        sliderEl.slider.className += ' circular-slider'

        // position and style slider nodes
        var r = options.radius_,
            cx = options.offset.x_,
            cy = options.offset.y_

        // position the origin
        sliderEl.scale.style.width = (r*2+t) + 'px';
        sliderEl.scale.style.height = (r*2+t) + 'px';
        sliderEl.scale.style.top = (cx-t/2) + 'px';
        sliderEl.scale.style.left = (cy-t/2) + 'px';

        // position the origin
        sliderEl.origin.style.top = (r+cx) + 'px';
        sliderEl.origin.style.left = (r+cy) + 'px';

        // position the slider bg
        sliderEl.bg.style.top = (cx)-(t/2) + 'px';
        sliderEl.bg.style.left = (cx)-(t/2) + 'px';
        sliderEl.bg.style.width = r*2+t + 'px';
        sliderEl.bg.style.height = r*2+t + 'px';

        // style & position the dragger to default position
        sliderEl.dragger.style.backgroundColor = options.color
        sliderEl.dragger.style.boxShadow = '0 0 3px rgba(0,0,0,0.4)'
        setInitialDraggerPosition()

    }

    // updates DOM nodes
    update = function(e) {

        // update dragger position
        e && updateDragger(getXYFromEvent(e))

        // set scale angle value
        updateScale()

        // set label inner text to slider value
        updateLabel()

    }

    // handle events
    events = function() {

        // prevent iPad document move on touchmove
        document.ontouchmove = function(e) {
            e.preventDefault();
        }

        // shorthand slider nodes
        var slider = sliderEl.slider,
            dragger = sliderEl.dragger,
            listener = sliderEl.listener,
            origin = sliderEl.origin,
            bg = sliderEl.bg,
            label = sliderEl.label,
            scale = sliderEl.scale

        // register DOM event handlers
        on(dragger, 'mousedown', startTracking, false)
        on(dragger, 'touchstart', startTracking, false)

        on(document, 'mouseup', stopTracking, false)
        on(document, 'touchend', stopTracking, false)

        on(listener, 'mousemove', trackPosition, false)
        on(dragger, 'touchmove', trackPosition, false)

        on(scale, 'mousedown', changePosition, false)

    }





    // ** SHARED methods
    var updateLabel,
        updateScale,
        updateDragger,
        getTouchOffset,
        getXYFromEvent,
        createCircularScale,
        setInitialDraggerPosition,
        startTracking,
        stopTracking,
        trackPosition,
        changePosition,
        parseOptions,
        getNearestStep


    // start tracking mouse/touch position
    startTracking = function(e) {
        track = true;
        sliderEl.slider.style.zIndex = 100 // set position of this slider to the high level to catch mouse events
        sliderEl.dragger.style.zIndex = 10 // swap position below .listener to catch mousemove on listener
        sliderEl.listener.style.zIndex = 11 // swap position below .listener to catch mousemove on listener
    }

    // stop tracking mouse/touch position
    stopTracking = function(e) {
        track = false;
        sliderEl.slider.style.zIndex = 'auto' // return position of this slider to the default value to let other sliders catch events
        sliderEl.dragger.style.zIndex = 11 // swap position back to top x-index to catch mousedown on dragger
        sliderEl.listener.style.zIndex = 9 // swap position below .listener to catch mousemove on listener
    }

    // if track==true, track mouse/touch position
    trackPosition = function(e) {
        if (!track || !e) return
        update(e)  // update UI
    }

    // change dragger position & sliderValue based on track mouse/touch event
    changePosition = function(e) {
        update(e)  // update UI
    }

    // set initial dragger position at options.min
    setInitialDraggerPosition = function() {

        var r = options.radius_, // radius
            min = options.min, // min value 0-1
            max = options.max, // max value 0-1
            cx = options.offset.x_, // offset x
            cy = options.offset.y_ // offset y


        // ** if options min set to 0,0 and exit
        if (options.min <= 0 ) {
            // position to the top of the scale circle
            sliderEl.dragger.style.top = (0+cx) + 'px';
            sliderEl.dragger.style.left = (r+cy) + 'px';
            return;
        }


        // ** else get angle out of min value
        var  p = polarToCartesian(cx+r, cy+r, r, (270-(options.min*360)))  // shift angle value by -90 (top circle start point)
        // position to the top of the scale circle
        sliderEl.dragger.style.top = p.x + 'px';
        sliderEl.dragger.style.left = p.y + 'px';

    }

    // update dragger location based on mouse/touch angle against origin
    updateDragger = function(point) {
        var v, // 0-1 value of the dragger position
            x = point.x, // mouse/touch x position
            y = point.y, // mouse/touch y position
            r = options.radius_, // radius
            min = options.min, // min value 0-1
            max = options.max, // max value 0-1
            cx = options.offset.x_, // offset x
            cy = options.offset.y_, // offset y
            a = Math.atan2(y-cy, x-cx) // get origin angle out of mouse/touch:x,y

        // point position + offset xy
        var nx = r + r * Math.cos(a)
        var ny = r + r * Math.sin(a)

        // normalize to 0-1 value
        v = a * (0.5/Math.PI) + (a > 0 ? 0 : 1);
        // shift by -90deg, so we can start on the top of the circle
        v = (v + 0.25) % 1;

        // jump to nearest step value
        v = getNearestStep(v)

        // update dragger position
        if (min <= v && v <= max) {
            // pass angle as a sliderValue
            sliderValue = v;
            // update dragger position
            var point = polarToCartesian(cx+r, cy+r, r, v*360)
            sliderEl.dragger.style.left = point.x + 'px';
            sliderEl.dragger.style.top = point.y + 'px';
        }
        else {
            // stop tracking mouse/touch events
            // stopTracking();
        }

    }

    // get the nearest step value of the current sliderValue (angle)
    getNearestStep = function(v) {

        var step = options.step,
            start = options.min

        return  Math.round((v - start) / step ) * step + start;

    }

    // update circular scale
    updateScale = function() {

        var r = options.radius_,
            cx = options.offset.x_,
            cy = options.offset.y_,
            arc = childByClass(sliderEl.slider,'arc');

        // get arc svg string: (start xy, start_angle, end_angle)
        arc.setAttribute('d',getArc((r+t/2), (r+t/2), options.min, sliderValue)) // sliderValue 0-1
        arc.setAttribute('style','stroke:'+options.color) // sliderValue 0-1

    }

    // update slider label value
    updateLabel = function() {
        // update slider label
        var val = sliderValue.toFixed(2) || ''
        var label = sliderEl.label
        label.style.backgroundColor = options.color;
        label.innerHTML = '<b>value:</b> '+ val +' | '+
                            '<b>min:</b> '+ options.min.toFixed(2) +'| '+
                            '<b>max:</b> '+ options.max.toFixed(2) +' | '+
                            '<b>step:</b> '+ options.step.toFixed(2) +' | '+
                            '<b>radius:</b> '+ options.radius
    }

    // sum up all offsets up the DOM tree for touch event
    getTouchOffset = function(e) {

        var offset = {
            x:0,
            y:0
        }

        if (e && e.target) {
            var el = e.target;
            while (el.parentNode) {
                el = el.parentNode;
                if (el.offsetLeft && el.offsetTop) {
                    offset.x += el.offsetLeft
                    offset.y += el.offsetTop
                }
            }
        }

        return offset

    }

    // get normalized xy point from mouse/touch event
    getXYFromEvent = function(e) {
        if (!e || e == null) return null;

        var r = options.radius_,
            cx = options.offset.x_,
            cy = options.offset.y_

        var point = {
            x : 0,
            y : 0
        }


        // mouse event
        if (e.offsetX) {
            point.x = e.offsetX
            point.y = e.offsetY
        }
        // touch event
        else if (e.touches && e.touches.length > 0) {
            var offset = getTouchOffset(e)
            point.x = e.touches[0].pageX - offset.x
            point.y = e.touches[0].pageY - offset.y
        }

        // offset xy point
        point.x -= r
        point.y -= r

        // different offset: clicked vs. dragged << because of different container
        if (e.target.className != 'listener') {
            point.x += e.target.parentNode.offsetLeft
            point.y += e.target.parentNode.offsetTop
        }

        return point
    }

    // create scale: circular HTML element
    createCircularScale = function() {

        var el = createEl('div','scale_wrap'),
            r = options.radius_,        // slider radius
            cx = options.offset.x_,     // slider offset
            cy = options.offset.y_,     // slider offset
            step = options.step,        // slider step between 0..1
            svg                         // svg string

        svg = ''+
        '<svg xmlns="http://www.w3.org/2000/svg" class="scale">'+
            '<path class="arc" />'+                                     // sliderValue arc
            '<defs>'+                                                   // dashed slider scale bg
                '<g id="lines-'+ options.id+'" class="lines">'+
                    '<line y1="-'+ (r-t/2) +'" y2="-'+ (r+t/2) +'" />'+
                '</g>'+
            '</defs>'+
            '<g transform="translate('+ (r+t/2) +' '+ (r+t/2) +')">'

        // transform dashes: get quater angles (0..90deg) out of step (0..1)
        var steps = 1 / step;
        // divide quater with steps to get tranform anglees
        var a = 1 / steps;

        // build svg transfromations
        for (var i=0; i <= steps; i++) {
            svg += '<use xlink:href="#lines-'+options.id+'" transform="rotate('+ (i * a * 360) +')"/>'
        }

        svg += ''+
            '</g>'+
        '</svg>';

        // set node attrs and values
        el.innerHTML = svg;

        return el;

    }

    // parse known 'px' options values into numbers
    parseOptions = function(o) {
        if (o && o.radius) o.radius_ = parseInt(o.radius, 10)
        if (o && o.offset && o.offset.x && o.offset.y) {
            o.offset.x_ = parseInt(o.offset.x, 10)
            o.offset.y_ = parseInt(o.offset.y, 10)
        }
        return o
    }




    // ** UTILITY methods
    var getById,
        getByClass,
        childByClass,
        extendObj,
        createEl,
        degToCSS,
        polarToCartesian,
        getArc,
        on,
        off,
        debug

    // convert polar (r,θ) to cartesian (x,y) coordinates
    polarToCartesian =function(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    // generate svg arc description string from passedin attributes: start xy, start angle, end angle
    getArc = function(x, y, startAngle, endAngle) {

        // graphic trick to show max value
        if (endAngle == options.max) endAngle -= 0.001

        // .. continue
        var radius = options.radius_,
            cx = options.offset.x_,
            cy = options.offset.y_,
            sa = startAngle * 360,
            ea = endAngle * 360

        var start = polarToCartesian(x, y, radius, ea);
        var end = polarToCartesian(x, y, radius, sa);

        var largeArcFlag = ea - sa <= 180 ? '0' : '1';

        var d = [
            'M', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(' ');

        return d;
    }

    // convert degrees to CSS rotation
    degToCSS = function(degree) {
        return 'rotate(' + degree + 'deg)'
    }

    // listens to DOM event
    on = function(el, type, callback) {
        el.addEventListener(type, callback, false);
    }

    // removes DOM el listener
    off = function(el, type, callback) {
        el.removeEventListener(type, callback, false);
    }

    // get DOM element by id
    getById = function(_id) {

        // sanatize args
        _id = _id.replace('#','');

        // returns
        return document.getElementById(_id)

    }

    // get DOM element by class name
    getByClass = function(_class) {

        // sanatize args
        _class = _class.replace('.','');

        // locals
        var elems = document.getElementsByTagName('*'),
            i = 0

        // loop through childs and return
        for (i in elems) {
            if ((' '+ elems[i].className +' ').indexOf(' '+ _class +' ') > -1) return elems[i]
        }
    }

    // get a child element by class names
    childByClass = function(_root, _class) {

        // sanatize args
        _class = _class.replace('.','');

        // locals
        var elems = _root.getElementsByTagName('*'),
            i = 0

        // loop through childs and return
        for (i in elems) {
            // search for SVG nodes
            if (elems[i].className && elems[i].className.animVal && (' '+elems[i].className.animVal+' ').indexOf(' '+_class+' ')!=-1) {
                return elems[i]
            }
            // search for HTML nodes
            else if ((' '+ elems[i].className +' ').indexOf(' '+_class+' ') > -1) {
                return elems[i]
            }
        }
    }

    // extends js object
    extendObj = function(_orig, _new) {
        for (var key in _new) {
            if (_new.hasOwnProperty(key)) _orig[key] = _new[key];
        }
        return _orig;
    }

    // create DOM element
    createEl = function(_tag, _class) {
        if (_tag && _class) {
            var el = document.createElement(_tag)
            el.setAttribute('class',_class)
            return el
        }
    }

    // alternative debug console
    debug = function(msg) {
        var debug = getByClass('.debug')
        if (!debug) {
            debug = createEl('div','debug')
            document.body.appendChild(debug)
        }
        debug.innerHTML = '['+ msg +'] ' + debug.innerHTML;
    }




    // ** START things off
    initialize(opt)



}



// construct  3 sliders globaly

var slider_1 = new circularSlider({
    container: document.getElementById('container'),
    id: 'slider-1',
    color: 'rgba(0,125,125,1)',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    radius: '110px',
    offset: {
        x: '30px',
        y: '30px'
    }
})

var slider_2 = new circularSlider({
    container: document.getElementById('container'),
    id: 'slider-2',
    color: 'rgba(0,205,0,1)',
    min: 0.1,
    max: 0.6,
    step: 0.05,
    radius: '80px',
    offset: {
        x: '60px',
        y: '60px'
    }
})


var slider_3 = new circularSlider({
    container: document.getElementById('container'),
    id: 'slider-3',
    color: 'rgba(200,0,100,1)',
    min: 0.0,
    max: 0.9,
    step: 0.1,
    radius: '50px',
    offset: {
        x: '90px',
        y: '90px'
    }
})
