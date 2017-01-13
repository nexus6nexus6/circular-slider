'use strict';

// **
// App: Circular silder module
var circularSlider = (function() {

    // **
    // Core methods and vars

    // private vars
    var options

    // private methods
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
    config = function(options) {
        options = extendObj(options,{
            container: getById('slider'),
            color: 'red',
            max: 1,
            min: 0,
            step: 0.01,
            radius: '200px'
        })
    }

    // renders DOM elements
    render = function() {}

    // controls DOM elements
    control = function() {}


    // **
    // Helper facade

    //
    var getById,
        getByClass,
        extendObj

    // private: get DOM element by id
    getById = function(_id) {
        return document.getElementById(_id)
    }

    // get DOM element by class name
    getByClass = function(_class) {
        var elems = document.getElementsByTagName('*'),
            i = 0
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


    // **
    // API - public interface: methods and vars
    return {
        init: function(options) {
            config(options)
            render()
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
