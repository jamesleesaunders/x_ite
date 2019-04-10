/* -*- Mode: JavaScript; coding: utf-8; tab-width: 3; indent-tabs-mode: tab; c-basic-offset: 3 -*-
 *******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, Scheffelstraße 31a, Leipzig, Germany 2011.
 *
 * All rights reserved. Holger Seelig <holger.seelig@yahoo.de>.
 *
 * The copyright notice above does not evidence any actual of intended
 * publication of such source code, and is an unpublished work by create3000.
 * This material contains CONFIDENTIAL INFORMATION that is the property of
 * create3000.
 *
 * No permission is granted to copy, distribute, or create derivative works from
 * the contents of this software, in whole or in part, without the prior written
 * permission of create3000.
 *
 * NON-MILITARY USE ONLY
 *
 * All create3000 software are effectively free software with a non-military use
 * restriction. It is free. Well commented source is provided. You may reuse the
 * source in any way you please with the exception anything that uses it must be
 * marked to indicate is contains 'non-military use only' components.
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright 2015, 2016 Holger Seelig <holger.seelig@yahoo.de>.
 *
 * This file is part of the X_ITE Project.
 *
 * X_ITE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License version 3 only, as published by the
 * Free Software Foundation.
 *
 * X_ITE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License version 3 for more
 * details (a copy is included in the LICENSE file that accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version 3
 * along with X_ITE.  If not, see <http://www.gnu.org/licenses/gpl.html> for a
 * copy of the GPLv3 License.
 *
 * For Silvio, Joy and Adi.
 *
 ******************************************************************************/


define ([
	"jquery",
	"x_ite/Components/Text/FontStyle",
	"opentype",
],
function ($,
          FontStyle,
          opentype)
{
"use strict";

	function X3DTextContext ()
	{
		this .fontCache  = new Map ();
		this .glyphCache = new Map (); // [font] [primitveQuality] [glyphIndex]
	}

	X3DTextContext .prototype =
	{
		initialize: function ()
		{ },
		getDefaultFontStyle: function ()
		{
			if (! this .defaultFontStyle)
			{
				this .defaultFontStyle = new FontStyle (this .getPrivateScene ());
				this .defaultFontStyle .setup ();
			}

			return this .defaultFontStyle;
		},
		getFont: function (url)
		{
			url = url .toString ();

			var deferred = this .fontCache .get (url);

			if (deferred === undefined)
			{
				this .fontCache .set (url, deferred = $.Deferred ());

				opentype .load (url, this .setFont .bind (this, deferred));
			}

			return deferred;
		},
		setFont: function (deferred, error, font)
		{
			if (error)
			{
				deferred .reject (error);
			}
			else
			{
//				// Workaround to initialize composite glyphs.
//				for (var i = 0, length = font .numGlyphs; i < length; ++ i)
//					font .glyphs .get (i) .getPath (0, 0, 1);

				// Resolve callbacks.
				deferred .resolve (font);
			}
		},
		getGlyph: function (font, primitveQuality, glyphIndex)
		{
			var cachedFont = this .glyphCache .get (font);

			if (! cachedFont)
				this .glyphCache .set (font, cachedFont = [ ]);

			var cachedQuality = cachedFont [primitveQuality];

			if (! cachedQuality)
				cachedQuality = cachedFont [primitveQuality] = [ ];

			var cachedGlyph = cachedQuality [glyphIndex];

			if (! cachedGlyph)
				cachedGlyph = cachedQuality [glyphIndex] = { };

		   return cachedGlyph;
		},
	};

	return X3DTextContext;
});
