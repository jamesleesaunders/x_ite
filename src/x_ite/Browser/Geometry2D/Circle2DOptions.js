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


import X3DBaseNode     from "../../Base/X3DBaseNode.js";
import Fields          from "../../Fields.js";
import X3DGeometryNode from "../../Components/Rendering/X3DGeometryNode.js";
import Complex         from "../../../standard/Math/Numbers/Complex.js";

function Circle2DOptions (executionContext)
{
   X3DBaseNode .call (this, executionContext);

   this .addChildObjects ("dimension", new Fields .SFInt32 (40))

   this .vertices = X3DGeometryNode .createArray ();
}

Circle2DOptions .prototype = Object .assign (Object .create (X3DBaseNode .prototype),
{
   constructor: Circle2DOptions,
   getTypeName: function ()
   {
      return "Circle2DOptions";
   },
   getComponentName: function ()
   {
      return "X_ITE";
   },
   getContainerField: function ()
   {
      return "circle2DOptions";
   },
   initialize: function ()
   {
      this .addInterest ("build", this);

      this .build ();
   },
   getVertices: function ()
   {
      return this .vertices;
   },
   build: function ()
   {
      const
         dimension = this ._dimension .getValue (),
         angle     = Math .PI * 2 / dimension,
         vertices  = this .vertices;

      vertices .length = 0;

      for (let n = 0; n < dimension; ++ n)
      {
         const
            point1 = Complex .Polar (1, angle * n),
            point2 = Complex .Polar (1, angle * (n + 1));

         vertices .push (point1 .real, point1 .imag, 0, 1);
         vertices .push (point2 .real, point2 .imag, 0, 1);
      }

      vertices .shrinkToFit ();
   },
});

export default Circle2DOptions;
