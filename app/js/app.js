'use strict';

// **
// App: Circular silder module
var circularSlider = (function() {

    // ** Core methods and props

    // private vars
    var options

    // private methods definition list
    var config,
        render,
        control,
        defaults

    // configures default values and env vars, constants
    defaults = function() {
        options = {
            container: getById('slider'),
            color: 'red',
            max: 1,
            min: 0,
            step: 0.01,
            radius: '200px'
        }
    }

    // overwrites default values and env vars, constants
    config = function(_options) {
        if (_options) options = extendObj(options,_options)
    }

    // renders DOM elements
    render = function() {

        // append app elements to options.container child > .slider
        // get .slider
        var slider = childByClass(options.container, '.slider')

        // create, append // <div class="dragger"></div>
        var dragger = createEl('div', 'dragger')
        slider.appendChild(dragger)

        // create, append // <div class="scale"></div>
        var scale = createEl('div', 'scale')
        slider.appendChild(scale)

    }

    // controls DOM elements
    control = function() {}


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
            // render the DOM elements
            render()
            // control the app
            control()
        }
    }


})()


circularSlider.init({
    container: document.getElementById('slider-1'),
    color: 'rgba(255,0,0,0.1)',
    max: 1,
    min: 0,
    step: 0.01,
    radius: '200px'
});
