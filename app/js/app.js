'use strict';

// **
// App: Circular silder module
var circularSlider = (function() {

    // ** Core methods and props

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

    // configures default values and env vars, constants
    defaults = function() {

        // set default options
        options = {
            id: 'slider',
            color: 'red',
            max: 1,
            min: 0,
            step: 0.01,
            radius: '200px'
        }

        // set default slider value
        sliderValue = 0;

        // setup default sliderEl object structure
        sliderEl = {
            container: null,
            dragger: null,
            scale: null,
            slider: null,
            label: null
        };

    }

    // overwrites default values and env vars, constants
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


        // create slider DOM elements
        // attach them to shared sliderEl object for future reference
        sliderEl = {
            container: createEl('div', options.id),
            dragger: createEl('div', 'dragger'),
            scale: createEl('div', 'scale'),
            slider: createEl('div', 'slider'),
            label: createEl('div', options.id)
        }

        // glue slider DOM elements to container el
        sliderEl.slider.appendChild(sliderEl.scale)
        sliderEl.slider.appendChild(sliderEl.dragger)
        sliderEl.container.appendChild(sliderEl.slider)

        // append two main elements to DOM parents
        sliders.appendChild(sliderEl.container)
        labels.appendChild(sliderEl.label)


    }

    // updates DOM elements
    update = function() {
        // set label inner text to slider value
        updateLabel()
    }

    // handle events
    events = function() {

        // listen mouse position while dragging
        trackDragger()

    }

    // controls DOM elements
    control = function() {}


    // ** Business Logic
    var trackDragger

    // listen to mouse position while dragging
    trackDragger = function() {

        var dragger = sliderEl.dragger,
            slider = sliderEl.slider,
            container = sliderEl.container,
            label = sliderEl.label,
            track = false

        // register events
        on(slider, 'mousedown', startTracking, false)
        on(slider, 'touchstart', startTracking, false)

        on(container, 'mouseup', stopTracking, false)
        on(container, 'mouseleave', stopTracking, false)
        on(container, 'touchend', stopTracking, false)

        on(container, 'mousemove', trackPosition, false)
        on(container, 'touchmove', trackPosition, false) // BUG .. doesnt track the touch move

        function startTracking(e) {
            track = true;
            updateDragger(getXFromEvent(e))
        }
        function stopTracking(e) {
            track = false;
        }
        function trackPosition(e) {
            if (!track) return
            updateDragger(getXFromEvent(e))
        }
        function updateDragger(x) {
            // pass the value to global param
            sliderValue = x;
            // update dragger position
            dragger.style.left = x+'px';
            // update dragger label
            updateLabel('x='+x);
        }

    }



    // ** Shared lib - shared by core methods
    var updateLabel,
        getTouchOffsetX,
        getXFromEvent

    // update slider label value
    updateLabel = function(text) {
        sliderEl.label.innerText = text || 'x=' + sliderValue;
    }

    // sum up all offsets up the DOM tree for touch event
    getTouchOffsetX = function(e) {
        var offsetX = 0;
        if (e && e.path && e.path.length > 0) {
            for (var i = 0; i < e.path.length; i++) {
                if (e.path[i].offsetLeft) {
                    offsetX += e.path[i].offsetLeft
                }
            }
        }
        return offsetX
    }

    // get normalized x from mouse or touch event
    getXFromEvent = function(e) {
        if (!e || e == null) return null;

        var x = 0;

        // mouse event
        if (e.offsetX) {
            x = e.offsetX
        }
        // touch event
        else if (e.touches && e.touches.length > 0) {
            var offsetX = getTouchOffsetX(e)
            x = e.touches[0].pageX - offsetX
        }

        // normalize: min, max values
        if (x < 0) x = 0;
        if (x > sliderEl.slider.offsetWidth) x = sliderEl.slider.offsetWidth;

        return x
    }

    // ** Facade - abstracts DOM related methods for vanilla JS
    // methods deifnition list
    var getById,
        getByClass,
        childByClass,
        extendObj,
        createEl,
        on,
        off

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
            if ((' '+ elems[i].className +' ').indexOf(' '+ _class +' ') > -1) return elems[i]
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



    // **
    // API - public interface: methods and vars
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

            // control the app
            control()

        }
        // TODO  destroy()
    }


})()


circularSlider.init({
    id: 'slider-1',
    color: 'rgba(255,0,0,0.1)',
    max: 1,
    min: 0,
    step: 0.01,
    radius: '200px'
});
