var intervalID, globalCounter, ccm, globalUp;
var spaceDown = false,
	keyDown = false,
	lastKey = "",
	inserted = false,
	moved = false,
	sameKey = false,
	shouldRepeat = false,
	repeated = false,
	keyCount = 0,
	editor,	doc, currentCursor,	timer;
var LEFT, RIGHT, UP, DOWN, HOME, END, SCROLLUP, SCROLLDN,
	DOCHOME, DOCEND, DOWN10, UP10, CENTER, FOCUS, TEST,
	LINEUP, LINEDOWN, NEWLINEBEFORE;
var CommandManager,	EditorManager,	Menus, KeyBindingManager;

define(function (require, exports, module) {
	"use strict";
	require([require.toUrl('./commands.js')]);
	console.log("vii is running");
	CommandManager = brackets.getModule("command/CommandManager");
	EditorManager  = brackets.getModule("editor/EditorManager");
	Menus          = brackets.getModule("command/Menus");
	KeyBindingManager = brackets.getModule("command/KeyBindingManager");
//	console.log(KeyBindingManager);

	function setColemak() {
		LEFT = 78;
		RIGHT = 73;
		UP = 85;
		DOWN = 69;
		HOME = 72;
		END = 79;
		SCROLLUP = 70;
		SCROLLDN = 83;
		DOCHOME = 74;
		DOCEND = 186;
		UP10 = 76;
		DOWN10 = 89;
		CENTER = 67;
		FOCUS = 77;
		TEST = 49;
		LINEUP = 87;
		LINEDOWN = 82;
		NEWLINEBEFORE = 222;
	}
	setColemak();

	function j(){ joinLines(); }
	CommandManager.register("Join Lines", "vii.joinLines", j);
	var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
	KeyBindingManager.removeBinding("Ctrl-J");
	KeyBindingManager.removeBinding("Cmd-J");
  	menu.addMenuDivider();
  	menu.addMenuItem("vii.joinLines", "Ctrl-J");

	function command(key) {
		switch(key){
			case LEFT:
			case RIGHT: moveCursor(key); break;
			case UP: ccm.moveV(-1, "line"); break;
			case DOWN: ccm.moveV(1, "line"); break;
			case HOME: CodeMirror.commands["goLineStartSmart"](ccm); break;
			case END: CodeMirror.commands["goLineEnd"](ccm); break;
			case SCROLLUP: scroll(true); break;
			case SCROLLDN: scroll(false); break;
			case DOCHOME: CodeMirror.commands["goDocStart"](ccm); break;
			case DOCEND: CodeMirror.commands["goDocEnd"](ccm); break;
			case UP10: moveCursor10(true); break;
			case DOWN10: moveCursor10(false); break;
			case CENTER: centerCursor(); break;
			case FOCUS: focusAtCenter(); break;
			case TEST: testCommand(); break;
			case LINEUP: CommandManager.execute('edit.lineUp'); break;
			case LINEDOWN: CommandManager.execute('edit.lineDown'); break
			case NEWLINEBEFORE: insertLineBefore(); break;
		}
	}

    document.onkeydown = function (e) {
		editor = EditorManager.getFocusedEditor();
		if (!editor) return true;
		e = e || window.event;

		if (e.keyCode === 32) { // space down
			spaceDown = true;
			return false;
		}

		else if ((e.keyCode >= 65 && e.keyCode <= 90) ||
				 (e.keyCode >= 48 && e.keyCode <= 57) ||
				 (e.keyCode >= 186 && e.keyCode <= 192) ||
				 (e.keyCode >= 219 && e.keyCode <= 222)) { // key down
			var k;
			switch(e.keyCode){
				case 187: k = "="; break;
				case 189: k = "-"; break;
				case 219: k = "["; break;
				case 221: k = "]"; break;
				case 220: k = "\\"; break;
				case 186: k = ";"; break;
				case 222: k = "\'"; break;
				case 188: k = ","; break;
				case 190: k = "."; break;
				case 191: k = "/"; break;
				default: k = String.fromCharCode(e.keyCode).toLowerCase();
			}
			if (k != lastKey) {
				keyCount += 1;
				lastKey = k;
			} else shouldRepeat = true;

			if (spaceDown) {
				keyDown = true;
				inserted = false;
				if (moved) shouldRepeat = true;
				if (shouldRepeat) {
					repeated = true;
					command(e.keyCode);
				}
				return false;
			} else {
				inserted = true;
				return true;
			}
		}
		return true;
	};

	document.onkeyup = function (e) {
		editor = EditorManager.getFocusedEditor();
		if (!editor) {
			return true;
		}
		e = e || window.event;
		currentCursor = editor.getCursorPos();
        ccm = editor._codeMirror;
		doc = ccm.getDoc();

		if (e.keyCode != 32 &&
			((e.keyCode >= 65 && e.keyCode <= 90) ||
				 (e.keyCode >= 48 && e.keyCode <= 57) ||
				 (e.keyCode >= 186 && e.keyCode <= 192) ||
				 (e.keyCode >= 219 && e.keyCode <= 222)))
			keyCount -= 1;

		if (e.keyCode === 32) { // space up
			if (spaceDown) {
				spaceDown = false;
				shouldRepeat = false;
				repeated = false;
				if (moved) moved = false;
				else if (keyDown) {
					insert(" " + lastKey);
					inserted = true;
				} else {
					insert(" ");
					inserted = false;
				}
				return false;
			} else {
				console.error("vii: space is already up");
				return true;
			}
			return true;
		}

		else if ((e.keyCode >= 65 && e.keyCode <= 90) ||
				 (e.keyCode >= 48 && e.keyCode <= 57) ||
				 (e.keyCode >= 186 && e.keyCode <= 192) ||
				 (e.keyCode >= 219 && e.keyCode <= 222)) { // key up
			if (spaceDown && keyDown && !inserted && !repeated) {
				command(e.keyCode);
				moved = true;
			}
			if (keyCount < 1) {
				keyDown = false;
				lastKey = '';
				keyCount = 0; // prevent problem with hot key
			}
			return false;
		}
		return true;
	}
});