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
   "x_ite/Components/Texturing/X3DTextureNode",
   "x_ite/Bits/X3DConstants",
   "x_ite/Bits/X3DCast",
   "x_ite/Browser/Texturing/MultiTextureModeType",
   "x_ite/Browser/Texturing/MultiTextureSourceType",
   "x_ite/Browser/Texturing/MultiTextureFunctionType",
],
function (X3DTextureNode,
          X3DConstants,
          X3DCast,
          ModeType,
          SourceType,
          FunctionType)
{
"use strict";

   function X3DSingleTextureNode (executionContext)
   {
      X3DTextureNode .call (this, executionContext);

      this .addType (X3DConstants .X3DSingleTextureNode);
   }

   X3DSingleTextureNode .prototype = Object .assign (Object .create (X3DTextureNode .prototype),
   {
      constructor: X3DSingleTextureNode,
      initialize: function ()
      {
         X3DTextureNode .prototype .initialize .call (this);

         this .textureProperties_ .addInterest ("set_textureProperties__", this);

         const gl = this .getBrowser () .getContext ();

         this .texture = gl .createTexture ();

         this .set_textureProperties__ ();
      },
      set_textureProperties__: function ()
      {
         if (this .texturePropertiesNode)
            this .texturePropertiesNode .removeInterest ("updateTextureProperties", this);

         this .texturePropertiesNode = X3DCast (X3DConstants .TextureProperties, this .textureProperties_);

         if (! this .texturePropertiesNode)
            this .texturePropertiesNode = this .getBrowser () .getDefaultTextureProperties ();

         this .texturePropertiesNode .addInterest ("updateTextureProperties", this);

         this .updateTextureProperties ();
      },
      getTexture: function ()
      {
         return this .texture;
      },
      updateTextureProperties: (function ()
      {
         // Anisotropic Filtering in WebGL is handled by an extension, use one of getExtension depending on browser:

         const ANISOTROPIC_EXT = [
            "EXT_texture_filter_anisotropic",
            "MOZ_EXT_texture_filter_anisotropic",
            "WEBKIT_EXT_texture_filter_anisotropic",
         ];

         return function (target, haveTextureProperties, textureProperties, width, height, repeatS, repeatT, repeatR)
         {
            const gl = this .getBrowser () .getContext ();

            gl .bindTexture (target, this .getTexture ());

            if (Math .max (width, height) < this .getBrowser () .getMinTextureSize () && ! haveTextureProperties)
            {
               // Dont generate mipmaps.
               gl .texParameteri (target, gl .TEXTURE_MIN_FILTER, gl .NEAREST);
               gl .texParameteri (target, gl .TEXTURE_MAG_FILTER, gl .NEAREST);
            }
            else
            {
               if (textureProperties .generateMipMaps_ .getValue ())
                  gl .generateMipmap (target);

               gl .texParameteri (target, gl .TEXTURE_MIN_FILTER, gl [textureProperties .getMinificationFilter ()]);
               gl .texParameteri (target, gl .TEXTURE_MAG_FILTER, gl [textureProperties .getMagnificationFilter ()]);
            }

            if (haveTextureProperties)
            {
               gl .texParameteri (target, gl .TEXTURE_WRAP_S, gl [textureProperties .getBoundaryModeS ()]);
               gl .texParameteri (target, gl .TEXTURE_WRAP_T, gl [textureProperties .getBoundaryModeT ()]);

               if (gl .getVersion () >= 2)
                  gl .texParameteri (target, gl .TEXTURE_WRAP_R, gl [textureProperties .getBoundaryModeR ()]);
            }
            else
            {
               gl .texParameteri (target, gl .TEXTURE_WRAP_S, repeatS ? gl .REPEAT : gl .CLAMP_TO_EDGE);
               gl .texParameteri (target, gl .TEXTURE_WRAP_T, repeatT ? gl .REPEAT : gl .CLAMP_TO_EDGE);

               if (gl .getVersion () >= 2)
                  gl .texParameteri (target, gl .TEXTURE_WRAP_R, repeatR ? gl .REPEAT : gl .CLAMP_TO_EDGE);
            }

            //gl .texParameterfv (target, gl .TEXTURE_BORDER_COLOR, textureProperties .borderColor_ .getValue ());
            //gl .texParameterf  (target, gl .TEXTURE_PRIORITY,     textureProperties .texturePriority_ .getValue ());

            for (const extension of ANISOTROPIC_EXT)
            {
               const ext = gl .getExtension (extension);

               if (ext)
               {
                  gl .texParameterf (target, ext .TEXTURE_MAX_ANISOTROPY_EXT, textureProperties .anisotropicDegree_ .getValue ());
                  break;
               }
            }
         };
      })(),
      setShaderUniforms: function (gl, shaderObject, renderObject)
      {
         this .setShaderUniformsToChannel (gl, shaderObject, renderObject, 0);

         gl .uniform1i (shaderObject .x3d_NumTextures, 1);
         gl .uniform1i (shaderObject .x3d_MultiTextureMode [0],      ModeType .MODULATE);
         gl .uniform1i (shaderObject .x3d_MultiTextureAlphaMode [0], ModeType .MODULATE);
         gl .uniform1i (shaderObject .x3d_MultiTextureSource [0],    SourceType .DEFAULT);
         gl .uniform1i (shaderObject .x3d_MultiTextureFunction [0],  FunctionType .DEFAULT);
      },
   });

   return X3DSingleTextureNode;
});
