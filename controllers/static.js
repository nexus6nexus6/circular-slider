/* global app */
'use strict';

var router = require('express').Router()
var path = require('path');
var express = require('express');

// router pathnames
router.get([
    '/'
],function(req,res) {
    res.sendFile(path.resolve('app/index.html'));
})

// assets
router.use('/js',express.static(path.resolve('app/js')));
router.use('/css', express.static(path.resolve('app/css')));

module.exports = router;
