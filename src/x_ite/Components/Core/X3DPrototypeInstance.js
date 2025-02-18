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

import X3DChildObject      from "../../Base/X3DChildObject.js";
import X3DNode             from "./X3DNode.js";
import X3DExecutionContext from "../../Execution/X3DExecutionContext.js";
import X3DConstants        from "../../Base/X3DConstants.js";

const
   _protoNode        = Symbol (),
   _protoFields      = Symbol (),
   _fieldDefinitions = Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions"),
   _body             = Symbol ();

function X3DPrototypeInstance (executionContext, protoNode)
{
   this [_protoNode]        = protoNode;
   this [_protoFields]      = new Map (protoNode .getFields () .map (f => [f, f .getName ()]));
   this [_fieldDefinitions] = protoNode .getFieldDefinitions ();
   this [_body]             = null;

   X3DNode .call (this, executionContext);

   this .addType (X3DConstants .X3DPrototypeInstance);
}

X3DPrototypeInstance .prototype = Object .assign (Object .create (X3DNode .prototype),
{
   constructor: X3DPrototypeInstance,
   create: function (executionContext)
   {
      return new X3DPrototypeInstance (executionContext, this [_protoNode]);
   },
   getTypeName: function ()
   {
      return this [_protoNode] .getName ();
   },
   getComponentName: function ()
   {
      return "Core";
   },
   getContainerField: function ()
   {
      // Determine container field from proto.

      // const proto = this [_protoNode];

      // if (! proto .isExternProto)
      // {
      //    const rootNodes = proto .getBody () .getRootNodes ();

      //    if (rootNodes .length)
      //    {
      //       const rootNode = rootNodes [0];

      //       if (rootNode)
      //          return rootNode .getValue () .getContainerField ();
      //    }
      // }

      return "children";
   },
   initialize: function ()
   {
      X3DNode .prototype .initialize .call (this);

      this .setProtoNode (this [_protoNode]);
   },
   construct: function ()
   {
      if (this [_body])
         this [_body] .dispose ();

      const proto = this [_protoNode] .getProtoDeclaration ();

      if (! proto)
      {
         this [_body] = new X3DExecutionContext (this .getExecutionContext ());
         this [_body] .setOuterNode (this);
         this [_body] .setup ();

         if (this .isInitialized ())
            X3DChildObject .prototype .addEvent .call (this);

         return;
      }

      // If there is a proto the externproto is completely loaded.

      if (this [_protoNode] .isExternProto)
      {
         for (const protoField of proto .getUserDefinedFields ())
         {
            try
            {
               const field = this .getField (protoField .getName ());

               // Continue if something is wrong.
               if (field .getAccessType () !== protoField .getAccessType ())
                  continue;

               // Continue if something is wrong.
               if (field .getType () !== protoField .getType ())
                  continue;

               // Continue if field is eventIn or eventOut.
               if (! field .isInitializable ())
                  continue;

               // Is set during parse.
               if (field .getModificationTime ())
                  continue;

               // Has IS references.
               if (field .hasReferences ())
                  continue;

               if (field .equals (protoField))
                  continue;

               // If default value of protoField is different from field, thus update default value for field.
               field .assign (protoField);
            }
            catch (error)
            {
               // Definition exists in proto but does not exist in extern proto.
               this .addField (proto .getFieldDefinitions () .get (protoField .getName ()));
            }
         }
      }

      // Create execution context.

      this [_body] = new X3DExecutionContext (proto .getExecutionContext ());
      this [_body] .setOuterNode (this);

      // Copy proto.

      this .importExternProtos (proto .getBody () .externprotos);
      this .importProtos       (proto .getBody () .protos);
      this .copyRootNodes      (proto .getBody () .rootNodes);
      this .copyImportedNodes  (proto .getBody (), proto .getBody () .getImportedNodes ());
      this .copyRoutes         (proto .getBody (), proto .getBody () .routes);

      this [_body] .setup ();

      if (this .isInitialized ())
         X3DChildObject .prototype .addEvent .call (this);

      this [_protoNode] ._updateInstances .removeInterest ("construct", this);
      this [_protoNode] ._updateInstances .addInterest ("update", this);
   },
   update: function ()
   {
      // Remove old fields.

      const
         oldProtoFields = this [_protoFields],
         oldFields      = new Map (this .getFields () .map (f => [f .getName (), f]));

      for (const field of oldFields .values ())
         this .removeField (field .getName ());

      // Add new fields.

      this [_protoFields] = new Map (this [_protoNode] .getFields () .map (f => [f, f .getName ()]));

      for (const fieldDefinition of this .getFieldDefinitions ())
         this .addField (fieldDefinition);

      // Reuse old fields, and therefor routes.

      for (const protoField of this [_protoFields] .keys ())
      {
         const oldFieldName = oldProtoFields .get (protoField);

         if (! oldFieldName)
            continue;

         const
            newField = this .getFields () .get (protoField .getName ()),
            oldField = oldFields .get (oldFieldName);

         oldField .addParent (this);
         oldField .setAccessType (newField .getAccessType ());
         oldField .setName (newField .getName ());

         this .getPredefinedFields () .update (newField .getName (), newField .getName (), oldField);
         this .getFields ()           .update (newField .getName (), newField .getName (), oldField);

         if (! this .isPrivate ())
            oldField .addCloneCount (1);

         oldFields .delete (oldFieldName);
         newField .dispose ();
      }

      for (const oldField of oldFields .values ())
         oldField .dispose ();

      // Construct now.

      this .construct ();
   },
   getExtendedEventHandling: function ()
   {
      return false;
   },
   getProtoNode: function ()
   {
      return this [_protoNode];
   },
   setProtoNode: function (protoNode)
   {
      if (protoNode !== this [_protoNode])
      {
         // Disconnect old proto node.

         if (this [_protoNode])
         {
            const protoNode = this [_protoNode];

            protoNode ._name_changed .removeFieldInterest (this ._typeName_changed);
            protoNode ._updateInstances .removeInterest ("construct", this);
            protoNode ._updateInstances .removeInterest ("update",    this);
         }

         // Get field from new proto node.

         this [_protoFields]      = new Map (protoNode .getFields () .map (f => [f, f .getName ()]));
         this [_fieldDefinitions] = protoNode .getFieldDefinitions ();
      }

      this [_protoNode] = protoNode;

      protoNode ._name_changed .addFieldInterest (this ._typeName_changed);

      const outerNode = this .getExecutionContext () .getOuterNode ();

      if (outerNode && outerNode .getType () .includes (X3DConstants .X3DProtoDeclaration))
         return;

      if (protoNode .isExternProto)
      {
         if (this [_protoNode] .checkLoadState () === X3DConstants .COMPLETE_STATE)
         {
            this .construct ();
         }
         else
         {
            protoNode ._updateInstances .addInterest ("construct", this);
            protoNode .requestImmediateLoad ();
         }
      }
      else
      {
         this .construct ();
      }
   },
   getBody: function ()
   {
      return this [_body];
   },
   getInnerNode: function ()
   {
      const rootNodes = this [_body] .getRootNodes ();

      if (rootNodes .length)
      {
         const rootNode = rootNodes [0];

         if (rootNode)
            return rootNode .getValue () .getInnerNode ();
      }

      throw new Error ("Root node not available.");
   },
   importExternProtos: function (externprotos1)
   {
      const externprotos2 = this [_body] .externprotos;

      for (const externproto of externprotos1)
         externprotos2 .add (externproto .getName (), externproto);
   },
   importProtos: function (protos1)
   {
      const protos2 = this [_body] .protos;

      for (const proto of protos1)
         protos2 .add (proto .getName (), proto);
   },
   copyRootNodes: function (rootNodes1)
   {
      const rootNodes2 = this [_body] .getRootNodes ();

      for (const node of rootNodes1)
         rootNodes2 .push (node .copy (this));
   },
   copyImportedNodes: function (executionContext, importedNodes)
   {
      for (const importedNode of importedNodes)
      {
         try
         {
            const
               inlineNode   = this [_body] .getNamedNode (importedNode .getInlineNode () .getName ()),
               importedName = importedNode .getImportedName (),
               exportedName = importedNode .getExportedName ();

            this [_body] .addImportedNode (inlineNode, exportedName, importedName);
         }
         catch (error)
         {
            console .error ("Bad IMPORT specification in copy: ", error);
         }
      }
   },
   copyRoutes: function (executionContext, routes)
   {
      for (const route of routes)
      {
         try
         {
            const
               sourceNode      = this [_body] .getLocalNode (executionContext .getLocalName (route .sourceNode)),
               destinationNode = this [_body] .getLocalNode (executionContext .getLocalName (route .destinationNode));

            this [_body] .addRoute (sourceNode, route .sourceField, destinationNode, route .destinationField);
         }
         catch (error)
         {
            console .error (error);
         }
      }
   },
   toXMLStream: function (generator)
   {
      const sharedNode = generator .IsSharedNode (this);

      generator .EnterScope ();

      const name = generator .Name (this);

      if (name .length)
      {
         if (generator .ExistsNode (this))
         {
            generator .string += generator .Indent ();
            generator .string += "<ProtoInstance";
            generator .string += generator .Space ();
            generator .string += "name='";
            generator .string += generator .XMLEncode (this .getTypeName ());
            generator .string += "'";
            generator .string += generator .Space ();
            generator .string += "USE='";
            generator .string += generator .XMLEncode (name);
            generator .string += "'";

            const containerField = generator .ContainerField ();

            if (containerField)
            {
               if (containerField .getName () !== this .getContainerField ())
               {
                  generator .string += generator .Space ();
                  generator .string += "containerField='";
                  generator .string += generator .XMLEncode (containerField .getName ());
                  generator .string += "'";
               }
            }

            generator .string += "/>";

            generator .LeaveScope ();
            return;
         }
      }

      generator .string += generator .Indent ();
      generator .string += "<ProtoInstance";
      generator .string += generator .Space ();
      generator .string += "name='";
      generator .string += generator .XMLEncode (this .getTypeName ());
      generator .string += "'";

      if (name .length)
      {
         generator .AddNode (this);

         generator .string += generator .Space ();
         generator .string += "DEF='";
         generator .string += generator .XMLEncode (name);
         generator .string += "'";
      }

      const containerField = generator .ContainerField ();

      if (containerField)
      {
         if (containerField .getName () !== this .getContainerField ())
         {
            generator .string += generator .Space ();
            generator .string += "containerField='";
            generator .string += generator .XMLEncode (containerField .getName ());
            generator .string += "'";
         }
      }

      const fields = this .getChangedFields ();

      if (fields .length === 0)
      {
         generator .string += "/>";
      }
      else
      {
         generator .string += ">";
         generator .string += generator .TidyBreak ();

         generator .IncIndent ();

         const references = [ ];

         for (const field of fields)
         {
            // If the field is a inputOutput and we have as reference only inputOnly or outputOnly we must output the value
            // for this field.

            let mustOutputValue = false;

            if (generator .ExecutionContext ())
            {
               if (field .getAccessType () === X3DConstants .inputOutput && field .getReferences () .size !== 0)
               {
                  let initializableReference = false;

                  field .getReferences () .forEach (function (fieldReference)
                  {
                     initializableReference = initializableReference || fieldReference .isInitializable ();
                  });

                  if (!initializableReference)
                     mustOutputValue = !this .isDefaultValue (field);
               }
            }

            // If we have no execution context we are not in a proto and must not generate IS references the same is true
            // if the node is a shared node as the node does not belong to the execution context.

            if (field .getReferences () .size === 0 || !generator .ExecutionContext () || sharedNode || mustOutputValue)
            {
               if (mustOutputValue)
                  references .push (field);

               switch (field .getType ())
               {
                  case X3DConstants .MFNode:
                  {
                     generator .string += generator .Indent ();
                     generator .string += "<fieldValue";
                     generator .string += generator .Space ();
                     generator .string += "name='";
                     generator .string += generator .XMLEncode (field .getName ());
                     generator .string += "'";

                     if (field .length === 0)
                     {
                        generator .string += "/>";
                        generator .string += generator .TidyBreak ();
                     }
                     else
                     {
                        generator .PushContainerField (field);

                        generator .string += ">";
                        generator .string += generator .TidyBreak ();

                        generator .IncIndent ();

                        field .toXMLStream (generator);

                        generator .string += generator .TidyBreak ();

                        generator .DecIndent ();

                        generator .string += generator .Indent ();
                        generator .string += "</fieldValue>";
                        generator .string += generator .TidyBreak ();

                        generator .PopContainerField ();
                     }

                     break;
                  }
                  case X3DConstants .SFNode:
                  {
                     if (field .getValue () !== null)
                     {
                        generator .PushContainerField (field);

                        generator .string += generator .Indent ();
                        generator .string += "<fieldValue";
                        generator .string += generator .Space ();
                        generator .string += "name='";
                        generator .string += generator .XMLEncode (field .getName ());
                        generator .string += "'";
                        generator .string += ">";
                        generator .string += generator .TidyBreak ();

                        generator .IncIndent ();

                        field .toXMLStream (generator);

                        generator .string += generator .TidyBreak ();

                        generator .DecIndent ();

                        generator .string += generator .Indent ();
                        generator .string += "</fieldValue>";
                        generator .string += generator .TidyBreak ();

                        generator .PopContainerField ();
                        break;
                     }

                     // Proceed with next case.
                  }
                  default:
                  {
                     generator .string += generator .Indent ();
                     generator .string += "<fieldValue";
                     generator .string += generator .Space ();
                     generator .string += "name='";
                     generator .string += generator .XMLEncode (field .getName ());
                     generator .string += "'";
                     generator .string += generator .Space ();
                     generator .string += "value='";

                     field .toXMLStream (generator);

                     generator .string += "'";
                     generator .string += "/>";
                     generator .string += generator .TidyBreak ();
                     break;
                  }
               }
            }
            else
            {
               references .push (field);
            }
         }

         if (references .length && ! sharedNode)
         {
            generator .string += generator .Indent ();
            generator .string += "<IS>";
            generator .string += generator .TidyBreak ();

            generator .IncIndent ();

            for (const field of references)
            {
               const protoFields = field .getReferences ();

               protoFields .forEach (function (protoField)
               {
                  generator .string += generator .Indent ();
                  generator .string += "<connect";
                  generator .string += generator .Space ();
                  generator .string += "nodeField='";
                  generator .string += generator .XMLEncode (field .getName ());
                  generator .string += "'";
                  generator .string += generator .Space ();
                  generator .string += "protoField='";
                  generator .string += generator .XMLEncode (protoField .getName ());
                  generator .string += "'";
                  generator .string += "/>";
                  generator .string += generator .TidyBreak ();
               });
            }

            generator .DecIndent ();

            generator .string += generator .Indent ();
            generator .string += "</IS>";
            generator .string += generator .TidyBreak ();
         }

         generator .DecIndent ();

         generator .string += generator .Indent ();
         generator .string += "</ProtoInstance>";
      }

      generator .LeaveScope ();
   },
   dispose: function ()
   {
      this [_protoNode] ._updateInstances .removeInterest ("construct", this);
      this [_protoNode] ._updateInstances .removeInterest ("update",    this);

      if (this [_body])
         this [_body] .dispose ();

      X3DNode .prototype .dispose .call (this);
   },
});

export default X3DPrototypeInstance;
