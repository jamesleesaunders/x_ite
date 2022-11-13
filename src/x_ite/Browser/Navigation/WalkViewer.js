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


import Fields               from "../../Fields.js";
import X3DFieldDefinition   from "../../Base/X3DFieldDefinition.js";
import FieldDefinitionArray from "../../Base/FieldDefinitionArray.js";
import X3DFlyViewer         from "./X3DFlyViewer.js";
import X3DConstants         from "../../Base/X3DConstants.js";
import Vector3              from "../../../standard/Math/Numbers/Vector3.js";
import Rotation4            from "../../../standard/Math/Numbers/Rotation4.js";

function WalkViewer (executionContext)
{
   X3DFlyViewer .call (this, executionContext);
}

WalkViewer .prototype = Object .assign (Object .create (X3DFlyViewer .prototype),
{
   constructor: WalkViewer,
   [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
      new X3DFieldDefinition (X3DConstants .outputOnly, "isActive", new Fields .SFBool ()),
   ]),
   initialize: function ()
   {
      X3DFlyViewer .prototype .initialize .call (this);

      this .getBrowser () .addCollision (this);
   },
   getStraightenHorizon: function ()
   {
      return true;
   },
   getFlyDirection: function (fromVector, toVector, direction)
   {
      return direction .assign (toVector) .subtract (fromVector);
   },
   getTranslationOffset: (function ()
   {
      const
         localYAxis      = new Vector3 (0, 0, 0),
         userOrientation = new Rotation4 (0, 0, 1, 0),
         rotation        = new Rotation4 (0, 0, 1, 0);

      return function (velocity)
      {
         const
            viewpoint = this .getActiveViewpoint (),
            upVector  = viewpoint .getUpVector ();

         userOrientation .assign (viewpoint .getUserOrientation ());
         userOrientation .multVecRot (localYAxis .assign (Vector3 .yAxis));
         rotation        .setFromToVec (localYAxis, upVector);

         const orientation = userOrientation .multRight (rotation);

         return orientation .multVecRot (velocity);
      };
   })(),
   constrainPanDirection: function (direction)
   {
      if (direction .y < 0)
         direction .y = 0;

      return direction;
   },
   dispose: function ()
   {
      this .getBrowser () .removeCollision (this);

      X3DFlyViewer .prototype .dispose .call (this);
   },
});

export default WalkViewer;
