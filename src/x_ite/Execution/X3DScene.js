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
   "x_ite/Configuration/SupportedNodes",
   "x_ite/Fields",
   "x_ite/Execution/X3DExecutionContext",
   "x_ite/Configuration/ComponentInfoArray",
   "x_ite/Configuration/UnitInfo",
   "x_ite/Configuration/UnitInfoArray",
   "x_ite/Execution/ExportedNode",
   "x_ite/Bits/X3DConstants",
   "x_ite/InputOutput/Generator",
   "x_ite/Fields/SFNodeCache",
],
function (SupportedNodes,
          Fields,
          X3DExecutionContext,
          ComponentInfoArray,
          UnitInfo,
          UnitInfoArray,
          ExportedNode,
          X3DConstants,
          Generator,
          SFNodeCache)
{
"use strict";

   const
      _specificationVersion = Symbol (),
      _encoding             = Symbol (),
      _profile              = Symbol (),
      _components           = Symbol (),
      _worldURL             = Symbol (),
      _units                = Symbol (),
      _metadata             = Symbol (),
      _exportedNodes        = Symbol ();

   SupportedNodes .addAbstractType ("X3DScene");

   function X3DScene (executionContext)
   {
      X3DExecutionContext .call (this, executionContext);

      this .addType (X3DConstants .X3DScene)

      this [_specificationVersion] = "3.3";
      this [_encoding]             = "SCRIPTED";
      this [_profile]              = null;
      this [_components]           = new ComponentInfoArray ([ ]);
      this [_worldURL]             = location .toString ();
      this [_units]                = new UnitInfoArray ();

      this [_units] .add ("angle",  new UnitInfo ("angle",  "radian",   1));
      this [_units] .add ("force",  new UnitInfo ("force",  "newton",   1));
      this [_units] .add ("length", new UnitInfo ("length", "metre",    1));
      this [_units] .add ("mass",   new UnitInfo ("mass",   "kilogram", 1));

      this [_metadata]      = new Map ();
      this [_exportedNodes] = new Map ();

      this .getRootNodes () .setAccessType (X3DConstants .inputOutput);

      this .setLive (false);
   }

   X3DScene .prototype = Object .assign (Object .create (X3DExecutionContext .prototype),
   {
      constructor: X3DScene,
      getTypeName: function ()
      {
         return "X3DScene";
      },
      isMainScene: function ()
      {
         return this === this .getExecutionContext ();
      },
      setSpecificationVersion: function (specificationVersion)
      {
         this [_specificationVersion] = specificationVersion;
      },
      getSpecificationVersion: function ()
      {
         return this [_specificationVersion];
      },
      setEncoding: function (encoding)
      {
         this [_encoding] = encoding;
      },
      getEncoding: function ()
      {
         return this [_encoding];
      },
      setWorldURL: function (url)
      {
         this [_worldURL] = url;
      },
      getWorldURL: function ()
      {
         return this [_worldURL];
      },
      setProfile: function (profile)
      {
         this [_profile] = profile;
      },
      getProfile: function ()
      {
         return this [_profile];
      },
      addComponent: function (component)
      {
         this [_components] .add (component .name, component);
      },
      getComponents: function ()
      {
         return this [_components];
      },
      updateUnit: function (category, name, conversionFactor)
      {
         // Private function.

         const unit = this [_units] .get (category);

         if (!unit)
            return;

         unit .name             = name;
         unit .conversionFactor = conversionFactor;
      },
      getUnits: function ()
      {
         return this [_units];
      },
      fromUnit: function (category, value)
      {
         switch (category)
         {
            // Base units

            case "angle":
            case "force":
            case "length":
            case "mass":
               return value * this .getUnits () .get (category) .conversionFactor;

            // Derived units

            case "acceleration:":
               return value * this .getUnits () .get ("length") .conversionFactor;
            case "angularRate":
               return value * this .getUnits () .get ("angle") .conversionFactor;
            case "area":
               return value * Math .pow (this .getUnits () .get ("length") .conversionFactor, 2);
            case "speed":
               return value * this .getUnits () .get ("length") .conversionFactor;
            case "volume":
               return value * Math .pow (this .getUnits () .get ("length") .conversionFactor, 3);
         }

         return value;
      },
      toUnit: function (category, value)
      {
         switch (category)
         {
            // Base units

            case "angle":
            case "force":
            case "length":
            case "mass":
               return value / this .getUnits () .get (category) .conversionFactor;

            // Derived units

            case "acceleration:":
               return value / this .getUnits () .get ("length") .conversionFactor;
            case "angularRate":
               return value / this .getUnits () .get ("angle") .conversionFactor;
            case "area":
               return value / Math .pow (this .getUnits () .get ("length") .conversionFactor, 2);
            case "speed":
               return value / this .getUnits () .get ("length") .conversionFactor;
            case "volume":
               return value / Math .pow (this .getUnits () .get ("length") .conversionFactor, 3);
         }

         return value;
      },
      setMetaData: function (name, value)
      {
         if (!name .length)
            return;

         this [_metadata] .set (name, String (value));
      },
      removeMetaData: function (name)
      {
         this [_metadata] .delete (name);
      },
      getMetaData: function (name)
      {
         return this [_metadata] .get (name);
      },
      getMetaDatas: function ()
      {
         return this [_metadata];
      },
      addExportedNode: function (exportedName, node)
      {
         if (this [_exportedNodes] .has (exportedName))
            throw new Error ("Couldn't add exported node: exported name '" + exportedName + "' already in use.");

         this .updateExportedNode (exportedName, node);
      },
      updateExportedNode: function (exportedName, node)
      {
         exportedName = String (exportedName);

         if (exportedName .length === 0)
            throw new Error ("Couldn't update exported node: node exported name is empty.");

         if (!(node instanceof Fields .SFNode))
            throw new Error ("Couldn't update exported node: node must be of type SFNode.");

         if (!node .getValue ())
            throw new Error ("Couldn't update exported node: node IS NULL.");

         //if (node .getValue () .getExecutionContext () !== this)
         //	throw new Error ("Couldn't update exported node: node does not belong to this execution context.");

         const exportedNode = new ExportedNode (exportedName, node .getValue ());

         this [_exportedNodes] .set (exportedName, exportedNode);
      },
      removeExportedNode: function (exportedName)
      {
         this [_exportedNodes] .delete (exportedName);
      },
      getExportedNode: function (exportedName)
      {
         const exportedNode = this [_exportedNodes] .get (exportedName);

         if (exportedNode)
            return SFNodeCache .get (exportedNode .getLocalNode ());

         throw new Error ("Exported node '" + exportedName + "' not found.");
      },
      getExportedNodes: function ()
      {
         return this [_exportedNodes];
      },
      addRootNode: function (node)
      {
         if (node === null)
            node = new Fields .SFNode ();

         if (!(node instanceof Fields .SFNode))
            throw new Error ("Couldn't add root node: node must be of type SFNode.");

         const rootNodes = this .getRootNodes ();

         for (const rootNode of rootNodes)
         {
            if (rootNode .equals (node))
               return;
         }

         rootNodes .push (node);
      },
      removeRootNode: function (node)
      {
         if (node === null)
            node = new Fields .SFNode ();

         if (!(node instanceof Fields .SFNode))
            throw new Error ("Couldn't remove root node: node must be of type SFNode.");

         const
            rootNodes = this .getRootNodes (),
            length    = rootNodes .length;

         rootNodes .erase (rootNodes .remove (0, length, node), length);
      },
      setRootNodes: function (value)
      {
         this .getRootNodes () .setValue (value);
      },
      toVRMLStream: function (stream)
      {
         const generator = Generator .Get (stream);

         let specificationVersion = this .getSpecificationVersion ();

         if (specificationVersion === "2.0")
            specificationVersion = "3.3";

         stream .string += "#X3D V";
         stream .string += specificationVersion;
         stream .string += " ";
         stream .string += "utf8";
         stream .string += " ";
         stream .string += this .getBrowser () .name;
         stream .string += " ";
         stream .string += "V";
         stream .string += this .getBrowser () .version;
         stream .string += "\n";
         stream .string += "\n";

         const profile = this .getProfile ();

         if (profile)
         {
            profile .toVRMLStream (stream);

            stream .string += "\n";
            stream .string += "\n";
         }

         const components = this .getComponents ();

         if (components .length)
         {
            components .toVRMLStream (stream);

            stream .string += "\n";
         }

         // Units
         {
            let empty = true;

            for (const unit of this .getUnits ())
            {
               if (unit .conversionFactor !== 1)
               {
                  empty = false;

                  unit .toVRMLStream (stream);

                  stream .string += "\n";
               }
            }

            if (!empty)
               stream .string += "\n";
         }

         const metadata = this .getMetaDatas ();

         if (metadata .size)
         {
            metadata .forEach (function (value, key)
            {
               stream .string += "META";
               stream .string += " ";
               stream .string += new Fields .SFString (key) .toString ();
               stream .string += " ";
               stream .string += new Fields .SFString (value) .toString ();
               stream .string += "\n";
            });

            stream .string += "\n";
         }

         const exportedNodes = this .getExportedNodes ();

         generator .PushExecutionContext (this);
         generator .EnterScope ();
         generator .ExportedNodes (exportedNodes);

         X3DExecutionContext .prototype .toVRMLStream .call (this, stream);

         if (exportedNodes .size)
         {
            stream .string += "\n";

            exportedNodes .forEach (function (exportedNode)
            {
               try
               {
                  exportedNode .toVRMLStream (stream);

                  stream .string += "\n";
               }
               catch (error)
               {
                  console .log (error);
               }
            });
         }

         generator .LeaveScope ();
         generator .PopExecutionContext ();
      },
      toXMLStream: function (stream)
      {
         const generator = Generator .Get (stream);

         let specificationVersion = this .getSpecificationVersion ();

         if (specificationVersion === "2.0")
            specificationVersion = "3.3";

         stream .string += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
         stream .string += "<!DOCTYPE X3D PUBLIC \"ISO//Web3D//DTD X3D ";
         stream .string += specificationVersion;
         stream .string += "//EN\" \"http://www.web3d.org/specifications/x3d-";
         stream .string += specificationVersion;
         stream .string += ".dtd\">\n";

         stream .string += "<X3D";
         stream .string += " ";
         stream .string += "profile='";
         stream .string += this .getProfile () ? this .getProfile () .name : "Full";
         stream .string += "'";
         stream .string += " ";
         stream .string += "version='";
         stream .string += specificationVersion;
         stream .string += "'";
         stream .string += " ";
         stream .string += "xmlns:xsd='http://www.w3.org/2001/XMLSchema-instance'";
         stream .string += " ";
         stream .string += "xsd:noNamespaceSchemaLocation='http://www.web3d.org/specifications/x3d-";
         stream .string += specificationVersion;
         stream .string += ".xsd'>\n";

         generator .IncIndent ();

         stream .string += generator .Indent ();
         stream .string += "<head>\n";

         generator .IncIndent ();

         // <head>

         this .getComponents () .toXMLStream (stream);

         for (const unit of this .getUnits ())
         {
            if (unit .conversionFactor !== 1)
            {
               unit .toXMLStream (stream);

               stream .string += "\n";
            }
         }

         this .getMetaDatas () .forEach (function (value, key)
         {
            stream .string += generator .Indent ();
            stream .string += "<meta";
            stream .string += " ";
            stream .string += "name='";
            stream .string += generator .XMLEncode (key);
            stream .string += "'";
            stream .string += " ";
            stream .string += "content='";
            stream .string += generator .XMLEncode (value);
            stream .string += "'";
            stream .string += "/>\n";
         });

         // </head>

         generator .DecIndent ();

         stream .string += generator .Indent ();
         stream .string += "</head>\n";
         stream .string += generator .Indent ();
         stream .string += "<Scene>\n";

         generator .IncIndent ();

         // <Scene>

         const exportedNodes = this .getExportedNodes ();

         generator .PushExecutionContext (this);
         generator .EnterScope ();
         generator .ExportedNodes (exportedNodes);

         X3DExecutionContext .prototype .toXMLStream .call (this, stream);

         exportedNodes .forEach (function (exportedNode)
         {
            try
            {
               exportedNode .toXMLStream (stream);

               stream .string += "\n";
            }
            catch (error)
            {
               console .log (error);
            }
         });

         generator .LeaveScope ();
         generator .PopExecutionContext ();

         // </Scene>

         generator .DecIndent ();

         stream .string += generator .Indent ();
         stream .string += "</Scene>\n";

         generator .DecIndent ();

         stream .string += "</X3D>\n";
      },
   });

   return X3DScene;
});
