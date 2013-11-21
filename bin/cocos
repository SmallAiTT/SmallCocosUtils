#! /usr/bin/env node

var path = require("path");
var argsParser = require("../src/argsParser.js");
var opts = argsParser.getOpts();
var name = opts.name;
var func = require(path.join(__dirname, "../src/plugins", name));
func.apply(func, opts.args);