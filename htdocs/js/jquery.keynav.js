/*
 * jQuery Keyboard Navigation Plugin - Current
 *   http://www.amountaintop.com/projects/keynav/
 *
 * To use, download this file to your server, save as keynav.js,
 * and add this HTML into the <head>...</head> of your web page:
 *   <script type="text/javascript" src="keynav.js"></script>
 *
 * Copyright (c) 2006 Mike Hostetler <http://www.amountaintop.com/>
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 */
$.keynav = new Object();

$.fn.keynav = function (onClass,offClass) {
	//Initialization
	var kn = $.keynav;
	if(!kn.init) {
		kn.el = new Array();

		$(document).keydown(function(e) {
			// Handle different browsers
			var key = e == null ? event.keyCode : e.which;

			// Switch for keys
			switch(key) {
				// Left Arrow 37
				case 37: 
					$.keynav.goLeft();
					break;
				// Up Arrow 38
				case 38: 
					$.keynav.goUp();
					break;
				// Right Arrow 39
				case 39: 
					$.keynav.goRight();
					break;
				// Down Arrow 40
				case 40: 
					$.keynav.goDown();
					break;
				// Enter 13
				case 13:
					$.keynav.activate();
					break;
			}
		});

		kn.init = true;
	}

	return this.each(function() {
		$.keynav.reg(this,onClass,offClass);
	});
}

$.fn.keynav_sethover = function(onClass,offClass) {
	return this.each(function() {
		this.onClass = onClass;
		this.offClass = offClass;
	});
}

$.keynav.reset = function() {
	$.keynav.el = new Array();
}

$.keynav.reg = function(e,onClass,offClass) {
	e.pos = $.keynav.getPos(e);
	e.onClass = onClass;
	e.offClass = offClass;
	e.onmouseover = function (e) { $.keynav.setActive(this); };
	
	$.keynav.el.push(e);
}

$.keynav.setActive = function(e) {
	var kn = $.keynav;
	var cur = $.keynav.getCurrent();

	$(cur).trigger('blur');

	for (var i = 0; i < kn.el.length; ++i) {
		var tmp = kn.el[i];
		$(tmp).removeClass(tmp.onClass).addClass(tmp.offClass);
	}

	$(e).removeClass(e.offClass).addClass(e.onClass);
	$(e).trigger('focus');

	kn.currentEl = e;
}

$.keynav.getCurrent = function () {
	return $.keynav.currentEl ? $.keynav.currentEl : $.keynav.el[0];
}

$.keynav.quad = function(cur,fQuad) {
	var kn = $.keynav;
	var quad = Array();

	for (i = 0; i < kn.el.length; ++i) {
		var el = kn.el[i];

		// Skip current element
		if(cur == el) continue;

		if (fQuad((cur.pos.cx - el.pos.cx),(cur.pos.cy - el.pos.cy))) {
			quad.push(el);
		}
	}

	return quad;
}

$.keynav.activateClosest = function(cur,quad) {
	var closest;
	var od = 1000000;
	var nd = 0;
	var found = false;

	for (i = 0; i < quad.length; ++i) {
		var e = quad[i];
		nd = Math.sqrt(Math.pow(cur.pos.cx-e.pos.cx,2)+Math.pow(cur.pos.cy-e.pos.cy,2));

		if(nd < od) {
			closest = e;
			od = nd;
			found = true;
		}
	}

	if(found) $.keynav.setActive(closest);
}

$.keynav.goLeft = function () {
	var cur = $.keynav.getCurrent();
	var quad = $.keynav.quad(cur,function (dx,dy) { 
		return ((dy >= 0) && (Math.abs(dx) - dy) <= 0);
	});

	$.keynav.activateClosest(cur,quad);
}

$.keynav.goRight = function () {
	var cur = $.keynav.getCurrent();
	var quad = $.keynav.quad(cur,function (dx,dy) { 
		return ((dy <= 0) && (Math.abs(dx) + dy) <= 0);
	});

	$.keynav.activateClosest(cur,quad);
}

$.keynav.goUp = function () {
	var cur = $.keynav.getCurrent();
	var quad = $.keynav.quad(cur, function (dx,dy) { 
		return ((dx >= 0) && (Math.abs(dy) - dx) <= 0);
	});

	$.keynav.activateClosest(cur,quad);
}

$.keynav.goDown = function () {
	var cur = $.keynav.getCurrent();
	var quad = $.keynav.quad(cur, function (dx,dy) { 
		return ((dx <= 0) && (Math.abs(dy) + dx) <= 0);
	});

	$.keynav.activateClosest(cur,quad);
}

$.keynav.activate = function () {
	var kn = $.keynav;
	$(kn.currentEl).trigger('click');
}


/**
 * This function was taken from Stefan's exellent interface plugin
 * http://www.eyecon.ro/interface/
 * 
 * I included it in this library's namespace because the functions aren't
 * quite the same.
 */
$.keynav.getPos = function (e) {
	var l = 0;
	var t  = 0;
	var w = $.intval($.css(e,'width'));
	var h = $.intval($.css(e,'height'));

	while (e.offsetParent){
		l += e.offsetLeft + (e.currentStyle?$.intval(e.currentStyle.borderLeftWidth):0);
		t += e.offsetTop  + (e.currentStyle?$.intval(e.currentStyle.borderTopWidth):0);
		e = e.offsetParent;
	}

	l += e.offsetLeft + (e.currentStyle?$.intval(e.currentStyle.borderLeftWidth):0);
	t += e.offsetTop  + (e.currentStyle?$.intval(e.currentStyle.borderTopWidth):0);
	
	var cx = Math.round(t+(h/2));
	var cy = Math.round(l+(w/2));
	
	return {x:l, y:t, w:w, h:h, cx:cx, cy:cy};
};

/**
 * This function was taken from Stefan's exellent interface plugin
 * http://www.eyecon.ro/interface/
 */
$.intval = function (v) {
	v = parseInt(v);
	return isNaN(v) ? 0 : v;
};

