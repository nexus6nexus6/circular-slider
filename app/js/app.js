'use strict';

// **
// App: Circular silder module
var circularSlider = (function() {

    // ** CORE METHODS and PROPS

    // private props
    var options,
        sliderEl,
        sliderValue,
        track = false

    // private methods definition list
    var config,
        render,
        control,
        defaults,
        update,
        events

    // configures default values and vars
    defaults = function() {

        // set default options
        options = {
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
        }

        // set default slider value
        sliderValue = options.min;

        // setup default sliderEl object structure
        sliderEl = {
            container: null,
            scale: null,
            origin: null,
            dragger: null,
            bg: null,
            label: null
        };

    }

    // overwrites default values and vars
    config = function(_options) {

        if (_options) {
            // extend default options object
            options = extendObj(options,_options)
            // set sliderValue to options.min
            sliderValue = options.min
        }

    }

    // renders DOM elements
    render = function() {

        // ** render slider elements
        // append app elements to options.container child > .slider

        // get container elements
        var sliders = getByClass('.sliders')
        var labels = getByClass('.labels')

        // ** create slider DOM elements
        // attach them to shared sliderEl object for future reference
        sliderEl = {
            container: createEl('div', options.id),
            listener: createEl('div', 'listener'),
            origin: createEl('div', 'origin'),
            bg: createEl('div', 'bg'),
            scale: createCircularScale(),
            dragger: createEl('div', 'dragger'),
            label: createEl('div', options.id)
        }

        // glue slider DOM elements to container el
        sliderEl.origin.appendChild(sliderEl.bg)
        sliderEl.listener.appendChild(sliderEl.origin)
        sliderEl.container.appendChild(sliderEl.dragger)
        sliderEl.container.appendChild(sliderEl.scale)
        sliderEl.container.appendChild(sliderEl.listener)

        // append two main elements to DOM parents
        sliders.appendChild(sliderEl.container)
        labels.appendChild(sliderEl.label)

        // append class namespace
        sliderEl.container.className += ' circular-slider'

        // ** position the elements
        // setup some data first
        var r = parseInt(options.radius, 10),
            cx = parseInt(options.offset.x, 10),
            cy = parseInt(options.offset.y, 10)

        // position the origin
        sliderEl.origin.style.top = (r+cx) + 'px';
        sliderEl.origin.style.left = (r+cy) + 'px';

        // position the slider (circle)
        sliderEl.bg.style.top = -r + 'px';
        sliderEl.bg.style.left = -r + 'px';

        // add radius to slider
        sliderEl.bg.style.width = r * 2 + 'px';
        sliderEl.bg.style.height = r * 2 + 'px';

        // position the dragger to options.min
        setInitialDraggerPosition()

    }

    // updates DOM elements
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

        // prevent iPad document move
        document.ontouchmove = function(e) {
            e.preventDefault();
        }


        // shorthand nodes
        var dragger = sliderEl.dragger,
            container = sliderEl.container,
            listener = sliderEl.listener,
            origin = sliderEl.origin,
            bg = sliderEl.bg,
            label = sliderEl.label

        // register events
        on(dragger, 'mousedown', startTracking, false)
        on(dragger, 'touchstart', startTracking, false)

        on(document, 'mouseup', stopTracking, false)
        on(document, 'touchend', stopTracking, false)

        on(listener, 'mousemove', trackPosition, false)
        on(dragger, 'touchmove', trackPosition, false)

    }






    // ** SHARED LIB - shared by core methods
    var updateLabel,
        updateScale,
        updateDragger,
        getTouchOffset,
        getXYFromEvent,
        createCircularScale,
        rotateSlice,
        setInitialDraggerPosition,
        startTracking,
        stopTracking,
        trackPosition

    // start tracking mouse/touch position
    startTracking = function(e) {
        track = true;
        sliderEl.dragger.style.zIndex = '1'
    }

    // stop tracking mouse/touch position
    stopTracking = function(e) {
        track = false;
        sliderEl.dragger.style.zIndex = '2'
    }

    // if track==true, track mouse/touch position
    trackPosition = function(e) {
        if (!track || !e) return
        update(e)  // update UI
    }

    // set initial dragger position at options.min
    setInitialDraggerPosition = function() {

        var r = parseInt(options.radius,10), // radius
            min = options.min, // min value 0-1
            max = options.max, // max value 0-1
            cx = parseInt(options.offset.x,10), // offset x
            cy = parseInt(options.offset.y,10) // offset y


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
            r = parseInt(options.radius,10), // radius
            min = options.min, // min value 0-1
            max = options.max, // max value 0-1
            cx = parseInt(options.offset.x,10), // offset x
            cy = parseInt(options.offset.y,10), // offset y
            a = Math.atan2(y-cy, x-cx) // get origin angle out of mouse/touch:x,y


        console.log(a);

        // point position + offset xy
        var nx = r + r * Math.cos(a)
        var ny = r + r * Math.sin(a)

        // normalize to 0-1 value
        v = a * (0.5/Math.PI) + (a > 0 ? 0 : 1);
        // shift by -90deg, so we can start on the top of the circle
        v = (v + 0.25) % 1;

        console.log(v);

        // update dragger position
        if (min < v && v < max) {
            // pass angle as a sliderValue
            sliderValue = v;
            // update dragger position
            sliderEl.dragger.style.left = nx + cx + 'px';
            sliderEl.dragger.style.top = ny + cy + 'px';
        }
        else {
            // stop tracking mouse/touch events
            // stopTracking();
        }

    }

    // update circular scale
    updateScale = function() {

        var r = parseInt(options.radius, 10),
            cx = parseInt(options.offset.x, 10),
            cy = parseInt(options.offset.y, 10),
            arc = childByClass(sliderEl.container,'arc');

        // get arc svg string: (start xy, start_angle, end_angle)
        arc.setAttribute('d',getArc((r+cx), (r+cy), options.min, sliderValue)) // sliderValue 0-1

    }

    // rotate circular scale's slices
    rotateSlice = function(x, outOf, target) {

        var firstHalfAngle = 180;
        var secondHalfAngle = 0;

        // caluclate the angle
        var drawAngle = x / outOf * 360;

        // calculate the angle to be displayed if each half
        if (drawAngle <= 180) {
            firstHalfAngle = drawAngle;
        }
        else {
            secondHalfAngle = drawAngle - 180;
        }

        if (target == 'slice1') {
            return degToCSS(firstHalfAngle)
        }
        else {
            return degToCSS(secondHalfAngle)

        }

    }

    // update slider label value
    updateLabel = function() {
        // update slider label
        sliderEl.label.innerHTML = '<hr><b>value:</b> '+ sliderValue.toFixed(2) || '';
        // update info label
        var info = getByClass('.info')
        info.innerHTML = '<b>min:</b> '+ options.min.toFixed(2) +'<br>'+
                         '<b>max:</b> '+ options.max.toFixed(2) +'<br>'+
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

    // get normalized x from mouse or touch event
    getXYFromEvent = function(e) {
        if (!e || e == null) return null;

        var r = parseInt(options.radius, 10)

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

        return point
    }

    // create scale: circular HTML element
    createCircularScale = function() {

        var el = document.createElement('div')
        el.setAttribute('class','scale_wrap')
        el.innerHTML += ''+
                    '<svg xmlns="http://www.w3.org/2000/svg" class="scale">'+
                        '<path class="arc" />'+
                    '</svg>';
        return el

    }





    // ** FACADE - abstracts DOM related methods for vanilla JS
    // methods deifnition list
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

        var radius = parseInt(options.radius, 10),
            cx = parseInt(options.offset.x, 10),
            cy = parseInt(options.offset.y, 10),
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




    // ** API - public interface
    return {
        init: function(options) {

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
        // TODO  destroy()
    }


}())


circularSlider.init({
    id: 'slider-1',
    color: 'rgba(255,0,0,0.1)',
    min: 0.1,
    max: 0.6,
    step: 0.01,
    radius: '80px',
    offset: {
        x: '36px',
        y: '36px'
    }
});
