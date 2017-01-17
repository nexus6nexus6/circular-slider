'use strict';

// **
// App: Circular silder module
var circularSlider = (function() {

    // ** Core methods and props

    // private props
    var options,
        sliderValue

    // private methods definition list
    var config,
        render,
        control,
        defaults,
        update

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
        var container = createEl('div', options.id)
        var slider = createEl('div', 'slider')
        var dragger = createEl('div', 'dragger')
        var scale = createEl('div', 'scale')
        var label = createEl('div', options.id)

        // glue slider DOM elements to container el
        slider.appendChild(scale)
        slider.appendChild(dragger)
        container.appendChild(slider)

        // append two main elements to DOM parents
        sliders.appendChild(container)
        labels.appendChild(label)

    }

    // updates DOM elements
    update = function() {
        // set label inner text to slider value
        updateLabel()
    }

    // controls DOM elements
    control = function() {}





    // ** Shared lib - shared by core methods
    var updateLabel

    // update slider label value
    updateLabel = function() {
        var label = getByClass(options.id);
        label.innerText = 'slider: ' + sliderValue;
    }





    // ** Facade - abstracts vanilla JS
    // methods deifnition list
    var getById,
        getByClass,
        childByClass,
        extendObj,
        createEl

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

            // all good, continue..
            // render the DOM elements
            render()

            // update
            update()

            // control the app
            control()

        }
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
