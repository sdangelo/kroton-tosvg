/*
 * Copyright (C) 2017 Stefano D'Angelo <zanga.mail@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

module.exports = function (Kroton) {
	Kroton.LayoutText.toSVG = function (classPrefix) {
		function encode(charCode) {
			return String.fromCharCode(charCode)
				     .replace(/&/, "&amp;")
				     .replace(/"/, "&quot;")
				     .replace(/'/, "&#39;")
				     .replace(/</, "&lt;")
				     .replace(/>/, "&gt;");
		}

		var s = '<text';
		if (this.expression && this.expression.id)
			s += ' id="' + this.expression.id + '"';
		if (this.expression
		    && (this.expression.class || this.expression.italic
			|| this.expression.bold)) {
			classPrefix = classPrefix ? classPrefix + "-" : "math-";
			s += ' class="';
			var k = '';
			if (this.expression.class)
				k += this.expression.class;
			if (this.expression.italic)
				k += (k ? ' ' : '') + classPrefix + 'italic';
			if (this.expression.bold)
				k += (k ? ' ' : '') + classPrefix + 'bold';
			s += k + '"';
		}
		s += ' y="' + (-this.y / this.scaleY) + '"';
		if (this.scaleX != 1 || this.scaleY != 1)
			s += ' transform="scale(' + this.scaleX + ' '
			     + this.scaleY + ')"';
		s += '>';
		for  (var i = 0; i < this.children.length; i++)
			s += '<tspan x="'
			     + (this.children[i].x / this.scaleX)
			     + '">' + encode(this.children[i].charCode)
			     + '</tspan>';
		return s + '</text>';
	};

	Kroton.LayoutExpression.toSVG = function (classPrefix) {
		if (this.lineNumber)
			return '';
		var g = '';
		if (!Kroton.Text.isPrototypeOf(this.expression)
		    && !this.expression.definitions // == is root element
		    && (this.expression.id || this.expression.class)) {
			g += '<g';
			if (this.expression.id)
				g += ' id="' + this.expression.id + '"';
			if (this.expression.class)
				g += ' class="' + this.expression.class + '"';
			g += '>';
		}
		var s = '';
		for (var i = 0; i < this.children.length; i++) {
			var l = this.children[i];
			for (var j = 0; j < l.children.length; j++)
				s += l.children[j].toSVG(classPrefix);
		}
		return g ? g + s + '</g>' : s;
	};

	Kroton.LayoutPlaceholder.toSVG = function (classPrefix) {
		var s = '';
		var x = this.x;
		if ((this.delimiterLeft || this.delimiterRight)
		    && (this.expression.id || this.expression.class))
		{
			s += '<g';
			if (this.expression.id)
				s += ' id="' + this.expression.id + '"';
			if (this.expression.class)
				s += ' class="' + this.expression.class + '"';
			s += '>';
			if (this.delimiterLeft) {
				s += this.delimiterLeft.toSVG(classPrefix);
				x += this.delimiterLeft.xAdvance;
			}
			s += '<use';
		}
		else {
			if (this.delimiterLeft) {
				s += this.delimiterLeft.toSVG(classPrefix);
				x += this.delimiterLeft.xAdvance;
			}
			s += '<use';
			if (this.expression.id || this.expression.class) {
				if (this.expression.id)
					s += ' id="' + this.expression.id + '"';
				if (this.expression.class)
					s += ' class="' + this.expression.class + '"';
			}
		}
		s += ' x="' + (x / this.scaleX)
		     + '" y="' + (-this.y / this.scaleY) + '"';
		if (this.scaleX != 1 || this.scaleY != 1)
			s += ' transform="scale(' + this.scaleX + ' '
			     + this.scaleY + ')"';
		s += ' xlink:href="#' + this.expression.definition.id + '" />';
		if (this.delimiterRight)
			s += this.delimiterRight.toSVG(classPrefix);
		if ((this.delimiterLeft || this.delimiterRight)
		    && (this.expression.id || this.expression.class)) {
			s += '</g>';
		}
		return s;
	};
};
