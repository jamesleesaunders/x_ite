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
	"standard/Math/Numbers/Vector3",
],
function (Vector3)
{
"use strict";

	var NURBS = {
		getUClosed: (function ()
		{
			var
				firstPoint = new Vector3 (0, 0, 0),
				lastPoint  = new Vector3 (0, 0, 0);

			return function (uOrder, uDimension, vDimension, uKnot, weight, controlPointNode)
			{
				var haveWeights = weight .length === controlPointNode .getSize ();
			
				for (var v = 0, length = vDimension; v < length; ++ v)
				{
					var
						first = v * uDimension,
						last  = v * uDimension + uDimension - 1;
			
					// Check if first and last weights are unitary.
			
					if (haveWeights)
					{
						if (weight [first] !== weight [last])
							return false;
					}
			
					// Check if first and last point are coincident.
			
					if (! controlPointNode .get1Point (first, firstPoint) .equals (controlPointNode .get1Point (last, lastPoint)))
						return false;
				}

				// Check if knots are periodic.

				if (! this .isPeriodic (uOrder, uDimension, uKnot))
					return false;
			
				return true;
			};
		})(),
		getVClosed: (function ()
		{
			var
				firstPoint = new Vector3 (0, 0, 0),
				lastPoint  = new Vector3 (0, 0, 0);

			return function (vOrder, uDimension, vDimension, vKnot, weight, controlPointNode)
			{
				var haveWeights = weight .length === controlPointNode .getSize ();
			
				for (var u = 0, size = uDimension; u < size; ++ u)
				{
					var
						first = u,
						last  = (vDimension - 1) * uDimension + u;
			
					// Check if first and last weights are unitary.
			
					if (haveWeights)
					{
						if (weight [first] !== weight [last])
							return false;
					}
			
					// Check if first and last point are coincident.
			
					if (! controlPointNode .get1Point (first, firstPoint) .equals (controlPointNode .get1Point (last, lastPoint)))
						return false;
				}
			
				// Check if knots are periodic.
			
				if (! this .isPeriodic (vOrder, vDimension, vKnot))
					return false;
	
				return true;
			};
		})(),
		isPeriodic: function (order, dimension, knot)
		{
			// Check if knots are periodic.

			if (knot .length === dimension + order)
			{
				{
					var count = 1;

					for (var i = 1, size = order; i < size; ++ i)
					{
						count += knot [i] == knot [0];
					}

					if (count === order)
						return false;
				}

				{
					var count = 1;

					for (var i = knot .length - order, size = knot .length - 1; i < size; ++ i)
					{
						count += knot [i] == knot [size];
					}

					if (count === order)
						return false;
				}
			}

			return true;
		}
	};

	return NURBS;
});
