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
   "x_ite/Base/X3DEventObject",
   "x_ite/Base/Events",
   "x_ite/Base/X3DFieldDefinition",
   "x_ite/Base/FieldDefinitionArray",
   "x_ite/Base/FieldArray",
   "x_ite/Fields",
   "x_ite/Base/X3DConstants",
],
function (X3DEventObject,
          Events,
          X3DFieldDefinition,
          FieldDefinitionArray,
          FieldArray,
          Fields,
          X3DConstants)
{
"use strict";

   const
      _executionContext  = Symbol (),
      _type              = Symbol (),
      _fieldDefinitions  = Symbol .for ("X3DBaseNode.fieldDefinitions"),
      _fields            = Symbol (),
      _predefinedFields  = Symbol (),
      _aliases           = Symbol (),
      _userDefinedFields = Symbol (),
      _initialized       = Symbol (),
      _live              = Symbol (),
      _set_live__        = Symbol ("X3DBaseNode.set_live__"),
      _private           = Symbol (),
      _cloneCount        = Symbol ();

   function X3DBaseNode (executionContext)
   {
      if (this [_executionContext])
         return;

      X3DEventObject .call (this, executionContext .getBrowser ());

      this [_executionContext]  = executionContext;
      this [_type]              = [ X3DConstants .X3DBaseNode ];
      this [_fields]            = new FieldArray ();
      this [_predefinedFields]  = new FieldArray ();
      this [_aliases]           = new Map ();
      this [_userDefinedFields] = new FieldArray ();
      this [_live]              = true;
      this [_initialized]       = false;
      this [_private]           = false;
      this [_cloneCount]        = 0;

      // Setup fields.

      if (this .canUserDefinedFields ())
         this [_fieldDefinitions] = new FieldDefinitionArray (this [_fieldDefinitions]);

      for (const fieldDefinition of this [_fieldDefinitions])
         this .addField (fieldDefinition);

      this .addChildObjects ("name_changed",     new Fields .SFTime (),
                             "typeName_changed", new Fields .SFTime ())
   }

   X3DBaseNode .prototype = Object .assign (Object .create (X3DEventObject .prototype),
   {
      constructor: X3DBaseNode,
      [_fieldDefinitions]: new FieldDefinitionArray ([ ]),
      setName: function (value)
      {
         X3DEventObject .prototype .setName .call (this, value)

         this ._name_changed = this .getBrowser () .getCurrentTime ();
      },
      getMainScene: function ()
      {
         let scene = this [_executionContext] .getScene ();

         while (!scene .isMainScene ())
            scene = scene .getScene ();

         return scene;
      },
      getScene: function ()
      {
         const X3DScene = require ("x_ite/Execution/X3DScene");

         let executionContext = this [_executionContext];

         while (!(executionContext instanceof X3DScene))
            executionContext = executionContext .getExecutionContext ();

         return executionContext;
      },
      getExecutionContext: function ()
      {
         return this [_executionContext];
      },
      setExecutionContext: function (value)
      {
         // Currently only useful for Scene.
         this [_executionContext] = value;
      },
      addType: function (value)
      {
         this [_type] .push (value);
      },
      getType: function ()
      {
         return this [_type];
      },
      getInnerNode: function ()
      {
         return this;
      },
      isLive: (function ()
      {
         function isLive ()
         {
            return this ._isLive;
         }

         return function ()
         {
            ///  Returns the live event of this node.

            // Change function.

            Object .defineProperty (this, "isLive",
            {
               value: isLive,
               enumerable: false,
               configurable: true,
            });

            // Add isLive event.

            this .addChildObjects ("isLive", new Fields .SFBool (this .getLiveState ()));

            // Event processing is done manually and immediately, so:
            this ._isLive .removeParent (this);

            // Connect to execution context.

            if (this [_executionContext] !== this)
               this [_executionContext] .isLive () .addInterest (_set_live__, this);

            // Return field

            return this .isLive ();
         };
      })(),
      setLive: function (value)
      {
         ///  Sets the own live state of this node.  Setting the live state to false
         ///  temporarily disables this node completely.

         this [_live] = value .valueOf ();

         this [_set_live__] ();
      },
      getLive: function ()
      {
         ///  Returns the own live state of this node.

         return this [_live];
      },
      getLiveState: function ()
      {
         ///  Determines the live state of this node.

         if (this !== this [_executionContext])
            return this .getLive () && this [_executionContext] .isLive () .getValue ();

         return this .getLive ();
      },
      [_set_live__]: function ()
      {
         const
            live   = this .getLiveState (),
            isLive = this .isLive ();

         if (live)
         {
            if (isLive .getValue ())
               return;

            isLive .setValue (true);
            isLive .processEvent (Events .create (isLive));
         }
         else
         {
            if (isLive .getValue ())
            {
               isLive .setValue (false);
               isLive .processEvent (Events .create (isLive));
            }
         }
      },
      setup: function ()
      {
         if (this [_initialized])
            return;

         this [_initialized] = true;

         for (const field of this [_fields])
            field .setTainted (false);

         this .initialize ();
      },
      setInitialized: function (value)
      {
         this [_initialized] = value;
      },
      isInitialized: function ()
      {
         return this [_initialized];
      },
      initialize: function () { },
      create: function (executionContext)
      {
         return new (this .constructor) (executionContext);
      },
      flatCopy: function (executionContext)
      {
         const copy = this .create (executionContext || this .getExecutionContext ());

         for (const field of this [_fields])
            copy .getField (field .getName ()) .assign (field);

         copy .setup ();

         return copy;
      },
      addChildObjects: function (name, field)
      {
         for (let i = 0, length = arguments .length; i < length; i += 2)
            this .addChildObject (arguments [i], arguments [i + 1]);
      },
      addChildObject: function (name, field)
      {
         field .addParent (this);
         field .setName (name);

         Object .defineProperty (this, "_" + name,
         {
            get: function () { return field; },
            set: function (value) { field .setValue (value); },
            enumerable: false,
            configurable: false,
         });
      },
      getFieldDefinitions: function ()
      {
         return this [_fieldDefinitions];
      },
      getFieldsAreEnumerable: function ()
      {
         return false;
      },
      addField: function (fieldDefinition)
      {
         const
            accessType = fieldDefinition .accessType,
            name       = fieldDefinition .name,
            field      = fieldDefinition .value .copy ();

         field .setTainted (true);
         field .addParent (this);
         field .setName (name);
         field .setAccessType (accessType);

         this [_fields]           .add (name, field);
         this [_predefinedFields] .add (name, field);

         Object .defineProperty (this, "_" + name,
         {
            get: function () { return field; },
            set: function (value) { field .setValue (value); },
            enumerable: this .getFieldsAreEnumerable (),
            configurable: true, // false : non deletable
         });

         if (!this .getPrivate ())
            field .addCloneCount (1);
      },
      getField: (function ()
      {
         const
            set_field     = /^set_(.*?)$/,
            field_changed = /^(.*?)_changed$/;

         return function (name)
         {
            const field = this [_fields] .get (name) || this [_aliases] .get (name);

            if (field)
               return field;

            const match = name .match (set_field);

            if (match)
            {
               const field = this [_fields] .get (match [1]) || this [_aliases] .get (match [1]);

               if (field && field .getAccessType () === X3DConstants .inputOutput)
                  return field;
            }
            else
            {
               const match = name .match (field_changed);

               if (match)
               {
                  const field = this [_fields] .get (match [1]) || this [_aliases] .get (match [1]);

                  if (field && field .getAccessType () === X3DConstants .inputOutput)
                     return field;
               }
            }

            throw new Error ("Unknown field '" + name + "' in node class " + this .getTypeName () + ".");
         };
      })(),
      addAlias: function (alias, field)
      {
         this [_aliases] .set (alias, field);

         Object .defineProperty (this, "_" + alias,
         {
            get: function () { return field; },
            set: function (value) { field .setValue (value); },
            enumerable: true,
            configurable: false,
         });
      },
      removeField: function (name)
      {
         const field = this [_predefinedFields] .get (name);

         if (field)
         {
            this [_fields]           .remove (name);
            this [_predefinedFields] .remove (name);

            delete this ["_" + field .getName ()];

            if (!this .getPrivate ())
               field .removeCloneCount (1);
         }
      },
      canUserDefinedFields: function ()
      {
         return false;
      },
      addUserDefinedField: function (accessType, name, field)
      {
         if (this [_userDefinedFields] .has (name))
            this .removeUserDefinedField (name);

         field .setTainted (true);
         field .addParent (this);
         field .setName (name);
         field .setAccessType (accessType);

         this [_fieldDefinitions]  .add (name, new X3DFieldDefinition (accessType, name, field));
         this [_fields]            .add (name, field);
         this [_userDefinedFields] .add (name, field);

         if (!this .getPrivate ())
            field .addCloneCount (1);
      },
      removeUserDefinedField: function (name)
      {
         const field = this [_userDefinedFields] .get (name);

         if (field)
         {
            this [_fields]            .remove (name);
            this [_userDefinedFields] .remove (name);
            this [_fieldDefinitions]  .remove (name);

            if (!this .getPrivate ())
               field .removeCloneCount (1);
         }
      },
      getUserDefinedFields: function ()
      {
         return this [_userDefinedFields];
      },
      getPredefinedFields: function ()
      {
         return this [_predefinedFields];
      },
      getChangedFields: function (extended)
      {
         /* param routes: also return fields with routes */

         const changedFields = [ ];

         if (extended)
         {
            for (const field of this [_userDefinedFields])
               changedFields .push (field);
         }

         for (const field of this [_predefinedFields])
         {
            if (extended)
            {
               if (field .getInputRoutes () .size || field .getOutputRoutes () .size)
               {
                  changedFields .push (field);
                  continue;
               }
            }

            if (field .getReferences () .size === 0)
            {
               if (!field .isInitializable ())
                  continue;

               if (this .isDefaultValue (field))
                  continue;
            }

            changedFields .push (field);
         }

         return changedFields;
      },
      isDefaultValue: function (field)
      {
         const fieldDefinition = this .getFieldDefinitions () .get (field .getName ());

         if (fieldDefinition)
            return fieldDefinition .value .equals (field);

         return !field .getModificationTime ();
      },
      getFields: function ()
      {
         return this [_fields];
      },
      getSourceText: function ()
      {
         return null;
      },
      hasRoutes: function ()
      {
         ///  Returns true if there are any routes from or to fields of this node otherwise false.

         for (const field of this [_fields])
         {
            if (field .getInputRoutes () .size)
               return true;

            if (field .getOutputRoutes () .size)
               return true;
         }

         return false;
      },
      getPrivate: function ()
      {
         return this [_private];
      },
      setPrivate: function (value)
      {
         this [_private] = value;

         if (value)
         {
            for (const field of this [_fields])
               field .removeCloneCount (1);
         }
         else
         {
            for (const field of this [_fields])
               field .addCloneCount (1);
         }
      },
      getCloneCount: function ()
      {
         return this [_cloneCount];
      },
      addCloneCount: function (count)
      {
         if (count === 0)
            return;

         this [_cloneCount] += count;
      },
      removeCloneCount: function (count)
      {
         if (count === 0)
            return;

         this [_cloneCount] -= count;
      },
   });

   for (const key of Reflect .ownKeys (X3DBaseNode .prototype))
      Object .defineProperty (X3DBaseNode .prototype, key, { enumerable: false });

   return X3DBaseNode;
});
