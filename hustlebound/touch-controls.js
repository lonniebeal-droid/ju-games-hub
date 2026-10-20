/*
 * HUSTLEBOUND touch controls — on-screen joystick + action buttons for the
 * Godot web export. Shows ONLY on touch devices; desktop mouse/keyboard
 * input is completely untouched.
 *
 * How it works: touch input is translated into synthetic KeyboardEvents
 * (keydown/keyup) dispatched on `document`. The Godot web runtime listens
 * for these and feeds them into its InputMap, so the game responds exactly
 * as if the physical keys were pressed.
 *
 * KEY MAP — matches ju-atl-game InputMap (WASD + arrows for movement).
 * If a button ever stops matching the game, edit ONLY this object.
 */
(function () {
	'use strict';

	var KEYMAP = {
		forward:  { code: 'KeyW',      key: 'w', keyCode: 87 },
		back:     { code: 'KeyS',      key: 's', keyCode: 83 },
		left:     { code: 'KeyA',      key: 'a', keyCode: 65 },
		right:    { code: 'KeyD',      key: 'd', keyCode: 68 },
		jump:     { code: 'Space',     key: ' ', keyCode: 32 },
		sprint:   { code: 'ShiftLeft', key: 'Shift', keyCode: 16 },
		interact: { code: 'KeyE',      key: 'e', keyCode: 69 }
	};

	// Only activate on real touch devices. Desktop keeps native input.
	var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
	if (!isTouch) { return; }

	/* ---------- synthetic keyboard ---------- */

	var pressed = {}; // code -> true while held

	function keyEvent(type, m) {
		var e;
		try {
			e = new KeyboardEvent(type, {
				code: m.code, key: m.key, keyCode: m.keyCode, which: m.keyCode,
				bubbles: true, cancelable: true, composed: true
			});
		} catch (err) {
			e = document.createEvent('KeyboardEvent');
			e.initKeyboardEvent(type, true, true, window, m.key, 0, '', false, '');
		}
		// Godot reads e.code; some handlers want keyCode — patch it on.
		try { Object.defineProperty(e, 'keyCode', { value: m.keyCode }); } catch (err) {}
		try { Object.defineProperty(e, 'which', { value: m.keyCode }); } catch (err) {}
		(document.activeElement || document).dispatchEvent(e);
	}

	function press(name) {
		var m = KEYMAP[name];
		if (!m || pressed[m.code]) { return; }
		pressed[m.code] = true;
		keyEvent('keydown', m);
	}

	function release(name) {
		var m = KEYMAP[name];
		if (!m || !pressed[m.code]) { return; }
		delete pressed[m.code];
		keyEvent('keyup', m);
	}

	function releaseAll() {
		Object.keys(KEYMAP).forEach(release);
	}

	/* ---------- DOM ---------- */

	var css = [
		'#ju-touch{position:fixed;inset:0;z-index:50;pointer-events:none;',
		'font-family:system-ui,sans-serif;-webkit-user-select:none;user-select:none;}',
		'#ju-touch .zone{position:absolute;bottom:0;pointer-events:none;}',
		'#ju-touch .zone.left{left:0;width:45%;height:55%;}',
		'#ju-touch .zone.right{right:0;width:45%;height:55%;}',
		'#ju-joy{position:absolute;left:36px;bottom:36px;width:124px;height:124px;',
		'border-radius:50%;background:#ffffff14;border:2px solid #ffffff38;',
		'pointer-events:auto;touch-action:none;}',
		'#ju-knob{position:absolute;left:50%;top:50%;width:56px;height:56px;',
		'border-radius:50%;background:#ffd45cdd;border:2px solid #fff8;',
		'transform:translate(-50%,-50%);box-shadow:0 4px 14px #000a;}',
		'.ju-btn{position:absolute;pointer-events:auto;touch-action:none;',
		'border-radius:50%;border:2px solid #ffffff55;color:#fff;font-weight:800;',
		'display:flex;align-items:center;justify-content:center;}',
		'.ju-btn small{font-size:10px;letter-spacing:.08em;}',
		'#ju-b-jump{right:36px;bottom:120px;width:84px;height:84px;',
		'background:#ff7b3955;font-size:13px;}',
		'#ju-b-act{right:136px;bottom:44px;width:68px;height:68px;',
		'background:#36d17e44;font-size:12px;}',
		'#ju-b-run{right:44px;bottom:36px;width:68px;height:68px;',
		'background:#4aa3ff44;font-size:12px;}',
		'.ju-btn.on{background:#ffd45c99;color:#111;}',
		'#ju-hint{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);',
		'color:#ffffffaa;font-size:11px;letter-spacing:.14em;pointer-events:none;',
		'transition:opacity 1s;}'
	].join('\n');

	var style = document.createElement('style');
	style.textContent = css;
	document.head.appendChild(style);

	var root = document.createElement('div');
	root.id = 'ju-touch';
	root.innerHTML =
		'<div class="zone left"><div id="ju-joy"><div id="ju-knob"></div></div></div>' +
		'<div class="zone right">' +
		'<div class="ju-btn" id="ju-b-jump"><small>JUMP</small></div>' +
		'<div class="ju-btn" id="ju-b-act"><small>ACT</small></div>' +
		'<div class="ju-btn" id="ju-b-run"><small>RUN</small></div>' +
		'</div>' +
		'<div id="ju-hint">TOUCH CONTROLS</div>';
	document.body.appendChild(root);

	setTimeout(function () {
		var h = document.getElementById('ju-hint');
		if (h) { h.style.opacity = '0'; }
	}, 3500);

	/* ---------- joystick ---------- */

	var joy = document.getElementById('ju-joy');
	var knob = document.getElementById('ju-knob');
	var joyId = null, joyCX = 0, joyCY = 0;
	var JOY_R = 44; // px travel
	var DEAD = 12;  // px deadzone
	var joyDirs = { forward: false, back: false, left: false, right: false };

	function joyCenter() {
		var r = joy.getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	}

	function setJoy(dx, dy) {
		var want = { forward: false, back: false, left: false, right: false };
		if (Math.hypot(dx, dy) > DEAD) {
			// deg: 0 = east(right), -90 = north(up/forward), 90 = south(down/back)
			var deg = Math.atan2(dy, dx) * 180 / Math.PI;
			if (deg < -22.5 && deg > -157.5) { want.forward = true; }
			if (deg > 22.5 && deg < 157.5) { want.back = true; }
			if (deg > 112.5 || deg < -112.5) { want.left = true; }
			if (deg > -67.5 && deg < 67.5) { want.right = true; }
		}
		Object.keys(want).forEach(function (d) {
			if (want[d] && !joyDirs[d]) { press(d); }
			if (!want[d] && joyDirs[d]) { release(d); }
			joyDirs[d] = want[d];
		});
	}

	function joyReset() {
		joyId = null;
		knob.style.transform = 'translate(-50%,-50%)';
		setJoy(0, 0);
	}

	joy.addEventListener('touchstart', function (ev) {
		ev.preventDefault();
		if (joyId !== null) { return; }
		var t = ev.changedTouches[0];
		joyId = t.identifier;
		var c = joyCenter(); joyCX = c.x; joyCY = c.y;
	}, { passive: false });

	joy.addEventListener('touchmove', function (ev) {
		ev.preventDefault();
		for (var i = 0; i < ev.changedTouches.length; i++) {
			var t = ev.changedTouches[i];
			if (t.identifier !== joyId) { continue; }
			var dx = t.clientX - joyCX, dy = t.clientY - joyCY;
			var len = Math.hypot(dx, dy);
			if (len > JOY_R) { dx = dx / len * JOY_R; dy = dy / len * JOY_R; }
			knob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
			setJoy(dx, dy);
		}
	}, { passive: false });

	function joyEnd(ev) {
		for (var i = 0; i < ev.changedTouches.length; i++) {
			if (ev.changedTouches[i].identifier === joyId) { joyReset(); }
		}
	}
	joy.addEventListener('touchend', joyEnd);
	joy.addEventListener('touchcancel', joyEnd);

	/* ---------- buttons ---------- */

	function bindButton(id, action) {
		var el = document.getElementById(id);
		var tid = null;
		el.addEventListener('touchstart', function (ev) {
			ev.preventDefault();
			if (tid !== null) { return; }
			tid = ev.changedTouches[0].identifier;
			el.classList.add('on');
			press(action);
		}, { passive: false });
		function end(ev) {
			for (var i = 0; i < ev.changedTouches.length; i++) {
				if (ev.changedTouches[i].identifier === tid) {
					tid = null;
					el.classList.remove('on');
					release(action);
				}
			}
		}
		el.addEventListener('touchend', end);
		el.addEventListener('touchcancel', end);
	}

	bindButton('ju-b-jump', 'jump');
	bindButton('ju-b-act', 'interact');
	bindButton('ju-b-run', 'sprint');

	/* ---------- safety ---------- */

	window.addEventListener('blur', releaseAll);
	document.addEventListener('visibilitychange', function () {
		if (document.hidden) { releaseAll(); }
	});

	// Exposed for automated tests.
	window.__juTouch = {
		KEYMAP: KEYMAP,
		pressed: pressed,
		press: press,
		release: release,
		isTouch: isTouch
	};
})();
