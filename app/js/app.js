'use strict';

// **
// App: Circular silder module
var circularSlider = (function() {

    // ** CORE METHODS and PROPS

    // private props
    var options,
        sliderEl,
        sliderValue

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
        sliderValue = 0;

        // setup default sliderEl object structure
        sliderEl = {
            container: null,
            origin: null,
            dragger: null,
            slider: null,
            label: null
        };

    }

    // overwrites default values and vars
    config = function(_options) {
        if (_options) options = extendObj(options,_options)
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
            slider: createEl('div', 'slider'),
            scale: createCircularScale(),
            dragger: createEl('div', 'dragger'),
            label: createEl('div', options.id)
        }

        // glue slider DOM elements to container el
        sliderEl.origin.appendChild(sliderEl.slider)
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
        sliderEl.slider.style.top = -r + 'px';
        sliderEl.slider.style.left = -r + 'px';

        // add radius to slider
        sliderEl.slider.style.width = r * 2 + 'px';
        sliderEl.slider.style.height = r * 2 + 'px';

        // position the dragger
        sliderEl.dragger.style.top = (0+cx) + 'px';
        sliderEl.dragger.style.left = (r+cy) + 'px';



    }

    // updates DOM elements
    update = function() {

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
            slider = sliderEl.slider,
            label = sliderEl.label,
            track = false

        // register events
        on(dragger, 'mousedown', startTracking, false)
        on(dragger, 'touchstart', startTracking, false)

        on(document, 'mouseup', stopTracking, false)
        on(document, 'touchend', stopTracking, false)

        on(listener, 'mousemove', trackPosition, false)
        on(dragger, 'touchmove', trackPosition, false)

        function startTracking(e) {
            track = true;
            dragger.style.zIndex = '1'
        }
        function stopTracking(e) {
            track = false;
            dragger.style.zIndex = '2'
        }
        function trackPosition(e) {
            if (!track) return
            // console.log(e);
            updateDragger(getXYFromEvent(e))
        }


    }






    // ** SHARED LIB - shared by core methods
    var updateLabel,
        updateScale,
        updateDragger,
        getTouchOffset,
        getXYFromEvent,
        createCircularScale,
        rotateSlice

    // update dragger location based on mouse/touch angle against origin
    updateDragger = function(point) {
        var x = point.x,
            y = point.y,
            r = parseInt(options.radius,10), // radius
            cx = parseInt(options.offset.x,10), // offset x
            cy = parseInt(options.offset.y,10), // offset y
            a = Math.atan2(y-cy, x-cx) // angle

        // offset xy
        var nx = r + r * Math.cos(a)
        var ny = r + r * Math.sin(a)

        // update dragger position
        sliderEl.dragger.style.left = nx + cx + 'px'
        sliderEl.dragger.style.top = ny + cy + 'px'

        // convert angle in radian to degrees + make it full 360 from -180/180
        a = a * (180/Math.PI) + (a > 0 ? 0 : 360)

        // shift 0° by -90°
        a = (a + 90) % 360


        // pass angle as a sliderValue
        sliderValue = a

        // update dragger label
        update()

    }

    // update circular scale
    updateScale = function() {

        var r = parseInt(options.radius, 10),
            cx = parseInt(options.offset.x, 10),
            cy = parseInt(options.offset.y, 10),
            arc = childByClass(sliderEl.container,'arc');

        // get arc svg string: (start xy, start_angle, end_angle)
        arc.setAttribute('d',getArc((r+cx), (r+cy), 0, sliderValue))

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
        sliderEl.label.innerText = sliderValue.toFixed(2)+'°' || '';
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

        // normalize
        point.x -= r
        point.y -= r

        // cap min, max values
        // if (point.x < 0) point.x = 0;
        // if (point.x > sliderEl.slider.offsetWidth) point.x = sliderEl.slider.offsetWidth;
        // if (point.y < 0) point.y = 0;
        // if (point.y > sliderEl.slider.offsetHeight) point.y = sliderEl.slider.offsetHeight;

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
            cy = parseInt(options.offset.y, 10)

        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

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
    max: 1,
    min: 0,
    step: 0.01,
    radius: '80px',
    offset: {
        x: '36px',
        y: '36px'
    }
});
