/*******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, Scheffelstraße 31a, Leipzig, Germany 2011 - 2022.
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
 * Copyright 2011 - 2022, Holger Seelig <holger.seelig@yahoo.de>.
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
 * along with X_ITE.  If not, see <https://www.gnu.org/licenses/gpl.html> for a
 * copy of the GPLv3 License.
 *
 * For Silvio, Joy and Adi.
 *
 ******************************************************************************/

import Shaders from "./Shaders.js";

const include = /^\s*#pragma\s+X3D\s+include\s+".*?([^\/]+)\.glsl"\s*$/;

function ShaderCompiler (gl)
{
   this .includes          = Shaders .includes [gl .getVersion ()];
   this .sourceFileNumbers = { };

   for (const [i, name] of Object .getOwnPropertyNames (this .includes) .entries ())
      this .sourceFileNumbers [name] = i + 1;
}

ShaderCompiler .prototype =
{
   getSourceFileName: function (sourceFileNumber)
   {
      return Object .getOwnPropertyNames (this .includes) [sourceFileNumber - 1];
   },
   process: function (source, parent = 0)
   {
      const lines = source .split ("\n");

      source = "";

      for (let i = 0, length = lines .length; i < length; ++ i)
      {
         const
            line  = lines [i],
            match = line .match (include);

         if (match)
         {
            source += "#line 1 " + this .sourceFileNumbers [match [1]] + "\n";
            source += this .process (this .includes [match [1]], this .sourceFileNumbers [match [1]]);
            source += "\n";
            source += "#line " + (i + 2) + " " + parent + "\n";
         }
         else
         {
            source += line;
            source += "\n";
         }
      }

      return source;
   },
};

export default ShaderCompiler;
