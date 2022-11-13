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
import X3DGroupingNode      from "../Grouping/X3DGroupingNode.js";
import X3DPickableObject    from "./X3DPickableObject.js";
import MatchCriterion       from "../../Browser/Picking/MatchCriterion.js";
import X3DConstants         from "../../Base/X3DConstants.js";
import TraverseType         from "../../Rendering/TraverseType.js";

function PickableGroup (executionContext)
{
   X3DGroupingNode   .call (this, executionContext);
   X3DPickableObject .call (this, executionContext);

   this .addType (X3DConstants .PickableGroup);
}

PickableGroup .prototype = Object .assign (Object .create (X3DGroupingNode .prototype),
   X3DPickableObject .prototype,
{
   constructor: PickableGroup,
   [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
      new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",       new Fields .SFNode ()),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "pickable",       new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "objectType",     new Fields .MFString ("ALL")),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "visible",        new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "bboxDisplay",    new Fields .SFBool ()),
      new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxSize",       new Fields .SFVec3f (-1, -1, -1)),
      new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxCenter",     new Fields .SFVec3f ()),
      new X3DFieldDefinition (X3DConstants .inputOnly,      "addChildren",    new Fields .MFNode ()),
      new X3DFieldDefinition (X3DConstants .inputOnly,      "removeChildren", new Fields .MFNode ()),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "children",       new Fields .MFNode ()),
   ]),
   getTypeName: function ()
   {
      return "PickableGroup";
   },
   getComponentName: function ()
   {
      return "Picking";
   },
   getContainerField: function ()
   {
      return "children";
   },
   initialize: function ()
   {
      X3DGroupingNode   .prototype .initialize .call (this);
      X3DPickableObject .prototype .initialize .call (this);

      this ._pickable .addInterest ("set_pickable__", this);

      this .set_pickable__ ();
   },
   set_pickableObjects__: function ()
   {
      this .set_pickable__ ();
   },
   set_pickable__: function ()
   {
      this .setPickableObject (Boolean (this ._pickable .getValue () || this .getTransformSensors () .size));
   },
   traverse: (function ()
   {
      const pickSensorNodes = new Set ();

      return function (type, renderObject)
      {
         if (type === TraverseType .PICKING)
         {
            if (this ._pickable .getValue ())
            {
               if (this .getObjectType () .has ("NONE"))
                  return;

               const
                  browser       = this .getBrowser (),
                  pickableStack = browser .getPickable ();

               if (this .getObjectType () .has ("ALL"))
               {
                  pickableStack .push (true);
                  X3DGroupingNode .prototype .traverse .call (this, type, renderObject);
                  pickableStack .pop ();
               }
               else
               {
                  // Filter pick sensors.

                  const pickSensorStack = browser .getPickSensors ();

                  for (const pickSensorNode of pickSensorStack .at (-1))
                  {
                     if (! pickSensorNode .getObjectType () .has ("ALL"))
                     {
                        let intersection = 0;

                        for (const objectType of this .getObjectType ())
                        {
                           if (pickSensorNode .getObjectType () .has (objectType))
                           {
                              ++ intersection;
                              break;
                           }
                        }

                        switch (pickSensorNode .getMatchCriterion ())
                        {
                           case MatchCriterion .MATCH_ANY:
                           {
                              if (intersection === 0)
                                 continue;

                              break;
                           }
                           case MatchCriterion .MATCH_EVERY:
                           {
                              if (intersection !== pickSensor .getObjectType () .size)
                                 continue;

                              break;
                           }
                           case MatchCriterion .MATCH_ONLY_ONE:
                           {
                              if (intersection !== 1)
                                 continue;

                              break;
                           }
                        }
                     }

                     pickSensorNodes .add (pickSensorNode);
                  }

                  pickableStack   .push (true);
                  pickSensorStack .push (pickSensorNodes);

                  X3DGroupingNode .prototype .traverse .call (this, type, renderObject);

                  pickSensorStack .pop ();
                  pickableStack   .pop ();

                  pickSensorNodes .clear ();
               }
            }
         }
         else
         {
            X3DGroupingNode .prototype .traverse .call (this, type, renderObject);
         }
      };
   })(),
});

export default PickableGroup;
