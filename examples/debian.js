#!/usr/bin/env node
"use strict";

var fs = require("fs");
var V86Starter = require("../build/libv86.js").V86Starter;

function readfile(path) {
    return new Uint8Array(fs.readFileSync(path)).buffer;
}

var bios = readfile(__dirname + "/../bios/seabios.bin");
var linux = readfile(__dirname + "/../images/linux4.iso");

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

console.log("Now booting, please stand by ...");

var emulator = new V86Starter({
    wasm_path: "../build/v86.wasm",
    memory_size: 512 * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    initial_state: { url: "../images/debian-state-base.bin" },
    filesystem: { baseurl: "../images/debian-9p-rootfs-flat/" },
    autostart: true,
});

emulator.add_listener("serial0-output-char", function (chr) {
    if (chr <= "~") {
        process.stdout.write(chr);
    }
});

process.stdin.on("data", function (c) {
    if (c === "\u0003") {
        // ctrl c
        emulator.stop();
        process.stdin.pause();
    } else {
        emulator.serial0_send(c);
    }
});
