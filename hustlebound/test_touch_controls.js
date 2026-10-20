/*
 * Headless test for touch-controls.js — runs in Node with a minimal DOM stub.
 * Verifies: touch gating, key event dispatch, joystick 8-way mapping,
 * button press/release, multi-touch independence, desktop no-op.
 */
'use strict';
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function ok(cond, name) {
	if (cond) { passed++; /* console.log('  ok -', name); */ }
	else { failed++; console.log('  FAIL -', name); }
}

// ---- minimal DOM stub ----
function makeEnv(opts) {
	opts = opts || {};
	const dispatched = [];
	const listeners = {};
	const elements = {};
	function el(id) {
		if (!elements[id]) {
			elements[id] = {
				id, classList: { add() {}, remove() {} },
				style: {},
				_listeners: {},
				addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); },
				getBoundingClientRect() { return { left: 100, top: 400, width: 124, height: 124 }; },
				innerHTML: ''
			};
		}
		return elements[id];
	}
	const documentStub = {
		_listeners: {},
		head: { appendChild() {} },
		body: { appendChild() {} },
		activeElement: null,
		hidden: false,
		createElement(tag) {
			if (tag === 'style') { return { textContent: '' }; }
			const e = el('dyn-' + Math.random());
			e.innerHTML = '';
			return e;
		},
		createEvent() { return { initKeyboardEvent() {} }; },
		getElementById(id) { return el(id); },
		addEventListener(t, fn) { (documentStub._listeners[t] = documentStub._listeners[t] || []).push(fn); },
		dispatchEvent(e) { dispatched.push(e); return true; }
	};
	const windowStub = {
		_listeners: {},
		addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); }
	};
	if (opts.touch) { windowStub.ontouchstart = true; }
	const nav = { maxTouchPoints: opts.touch ? 5 : 0 };
	// pre-create known ids
	['ju-joy', 'ju-knob', 'ju-b-jump', 'ju-b-act', 'ju-b-run', 'ju-hint', 'ju-touch'].forEach(el);
	return { document: documentStub, window: windowStub, navigator: nav, dispatched, el, KeyboardEvent: function (type, init) { this.type = type; Object.assign(this, init); } };
}

function load(env) {
	const src = fs.readFileSync(path.join(__dirname, 'touch-controls.js'), 'utf8');
	const fn = new Function('window', 'document', 'navigator', 'KeyboardEvent', 'setTimeout',
		'window.__env_isTouchHack = 0;\n' + src);
	// stub setTimeout to no-op for hint fade
	fn(env.window, env.document, env.navigator, env.KeyboardEvent, function () {});
	return env.window.__juTouch;
}

function fireTouch(elm, type, touches) {
	const ev = {
		changedTouches: touches.map((t, i) => ({ identifier: t.id, clientX: t.x, clientY: t.y })),
		preventDefault() {}
	};
	(elm._listeners[type] || []).forEach(fn => fn(ev));
}

// ---------- TEST 1: desktop = no-op ----------
(function () {
	const env = makeEnv({ touch: false });
	load(env);
	ok(env.window.__juTouch === undefined, 'desktop: script exits without exposing API');
	ok(env.dispatched.length === 0, 'desktop: no elements created / no events');
})();

// ---------- TEST 2: touch device activates ----------
(function () {
	const env = makeEnv({ touch: true });
	const api = load(env);
	ok(!!api && api.isTouch === true, 'touch: API exposed and isTouch true');
	ok(Object.keys(api.KEYMAP).length === 7, 'touch: 7 mapped actions');
})();

// ---------- TEST 3: button press/release dispatches keydown/keyup ----------
(function () {
	const env = makeEnv({ touch: true });
	const api = load(env);
	const btn = env.el('ju-b-jump');
	fireTouch(btn, 'touchstart', [{ id: 1, x: 0, y: 0 }]);
	const downs = env.dispatched.filter(e => e.type === 'keydown' && e.code === 'Space');
	ok(downs.length === 1, 'jump button: exactly one Space keydown');
	ok(api.pressed['Space'] === true, 'jump button: pressed state tracked');
	// repeat touchstart must not double-fire
	fireTouch(btn, 'touchstart', [{ id: 2, x: 0, y: 0 }]);
	ok(env.dispatched.filter(e => e.type === 'keydown' && e.code === 'Space').length === 1, 'jump button: no double keydown');
	fireTouch(btn, 'touchend', [{ id: 1, x: 0, y: 0 }]);
	const ups = env.dispatched.filter(e => e.type === 'keyup' && e.code === 'Space');
	ok(ups.length === 1, 'jump button: Space keyup on release');
	ok(!api.pressed['Space'], 'jump button: pressed state cleared');
})();

// ---------- TEST 4: multi-touch independence ----------
(function () {
	const env = makeEnv({ touch: true });
	load(env);
	const jump = env.el('ju-b-jump'), run = env.el('ju-b-run');
	fireTouch(jump, 'touchstart', [{ id: 10, x: 0, y: 0 }]);
	fireTouch(run, 'touchstart', [{ id: 11, x: 0, y: 0 }]);
	ok(env.dispatched.some(e => e.type === 'keydown' && e.code === 'Space'), 'multi: jump down');
	ok(env.dispatched.some(e => e.type === 'keydown' && e.code === 'ShiftLeft'), 'multi: sprint down');
	fireTouch(jump, 'touchend', [{ id: 10, x: 0, y: 0 }]);
	ok(env.dispatched.some(e => e.type === 'keyup' && e.code === 'Space'), 'multi: jump up');
	ok(!env.dispatched.some(e => e.type === 'keyup' && e.code === 'ShiftLeft'), 'multi: sprint still held');
	fireTouch(run, 'touchend', [{ id: 11, x: 0, y: 0 }]);
	ok(env.dispatched.some(e => e.type === 'keyup' && e.code === 'ShiftLeft'), 'multi: sprint up after');
})();

// ---------- TEST 5: joystick 8-way mapping ----------
(function () {
	const env = makeEnv({ touch: true });
	const api = load(env);
	const joy = env.el('ju-joy');
	// joystick center from stub: left=100,top=400,w=h=124 -> center (162,462)
	function drag(dx, dy) {
		fireTouch(joy, 'touchstart', [{ id: 20, x: 162, y: 462 }]);
		// touchmove needs changedTouches; simulate via direct handler
		const ev = { changedTouches: [{ identifier: 20, clientX: 162 + dx, clientY: 462 + dy }], preventDefault() {} };
		(joy._listeners['touchmove'] || []).forEach(fn => fn(ev));
	}
	function release() { fireTouch(joy, 'touchend', [{ id: 20, x: 0, y: 0 }]); }
	const codes = () => Object.keys(api.pressed).sort().join(',');

	drag(0, -40); // up
	ok(codes() === 'KeyW', 'joystick up -> W, got: ' + codes());
	release(); ok(codes() === '', 'joystick release clears');

	drag(0, 40); // down
	ok(codes() === 'KeyS', 'joystick down -> S, got: ' + codes());
	release();

	drag(-40, 0); // left
	ok(codes() === 'KeyA', 'joystick left -> A, got: ' + codes());
	release();

	drag(40, 0); // right
	ok(codes() === 'KeyD', 'joystick right -> D, got: ' + codes());
	release();

	drag(30, -30); // up-right diagonal
	ok(codes() === 'KeyD,KeyW', 'joystick up-right -> W+D, got: ' + codes());
	release();

	drag(-30, 30); // down-left diagonal
	ok(codes() === 'KeyA,KeyS', 'joystick down-left -> A+S, got: ' + codes());
	release();

	drag(5, 5); // inside deadzone
	ok(codes() === '', 'joystick deadzone: no keys, got: ' + codes());
	release();
})();

// ---------- TEST 6: key events carry Godot-readable fields ----------
(function () {
	const env = makeEnv({ touch: true });
	const api = load(env);
	api.press('interact');
	const e = env.dispatched.find(x => x.type === 'keydown');
	ok(e && e.code === 'KeyE' && e.keyCode === 69 && e.bubbles === true, 'synthetic event has code/keyCode/bubbles');
	api.release('interact');
})();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
