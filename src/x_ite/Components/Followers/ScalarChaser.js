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


import Fields from "../../Fields.js";
import X3DFieldDefinition from "../../Base/X3DFieldDefinition.js";
import FieldDefinitionArray from "../../Base/FieldDefinitionArray.js";
import X3DChaserNode from "./X3DChaserNode.js";
import X3DConstants from "../../Base/X3DConstants.js";
import Algorithm from "../../../standard/Math/Algorithm.js";

function ScalarChaser (executionContext)
{
   X3DChaserNode .call (this, executionContext);

   this .addType (X3DConstants .ScalarChaser);
}

ScalarChaser .prototype = Object .assign (Object .create (X3DChaserNode .prototype),
{
   constructor: ScalarChaser,
   [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
      new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",           new Fields .SFNode ()),
      new X3DFieldDefinition (X3DConstants .inputOnly,      "set_value",          new Fields .SFFloat ()),
      new X3DFieldDefinition (X3DConstants .inputOnly,      "set_destination",    new Fields .SFFloat ()),
      new X3DFieldDefinition (X3DConstants .initializeOnly, "initialValue",       new Fields .SFFloat ()),
      new X3DFieldDefinition (X3DConstants .initializeOnly, "initialDestination", new Fields .SFFloat ()),
      new X3DFieldDefinition (X3DConstants .initializeOnly, "duration",           new Fields .SFTime (1)),
      new X3DFieldDefinition (X3DConstants .outputOnly,     "isActive",           new Fields .SFBool ()),
      new X3DFieldDefinition (X3DConstants .outputOnly,     "value_changed",      new Fields .SFFloat ()),
   ]),
   getTypeName: function ()
   {
      return "ScalarChaser";
   },
   getComponentName: function ()
   {
      return "Followers";
   },
   getContainerField: function ()
   {
      return "children";
   },
   getVector: function ()
   {
      return 0;
   },
   setPreviousValue: function (value)
   {
      this .previousValue = value;
   },
   setDestination: function (value)
   {
      this .destination = value;
   },
   duplicate: function (value)
   {
      return value;
   },
   assign: function (buffer, i, value)
   {
      buffer [i] = value;
   },
   equals: function (lhs, rhs, tolerance)
   {
      return Math .abs (lhs - rhs) < tolerance;
   },
   interpolate: function (source, destination, weight)
   {
      return Algorithm .lerp (source, destination, weight);
   },
   step: function (value1, value2, t)
   {
      this .output += (value1 - value2) * t;
   },
});

export default ScalarChaser;
