#!/usr/bin/env bash
jshint $1 && ../../mocha-chrome-app-test-runner/run-test.sh $(pwd)/test/platform/io-provider-it.js
