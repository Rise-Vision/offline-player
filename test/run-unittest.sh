#!/usr/bin/env bash
jshint $1 && istanbul cover -- _mocha -t 5000 test/*-test.js test/**/*-test.js
