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

import Fields from "../../Fields.js";
import URLs   from "./URLs.js";
import _      from "../../../locale/gettext.js";

const
   _loadingTotal   = Symbol (),
   _loadingObjects = Symbol (),
   _loading        = Symbol (),
   _location       = Symbol (),
   _defaultScene   = Symbol ();

function getBaseURI (element)
{
   let baseURI = element .baseURI;

   // Fix for Edge.
   if (baseURI .startsWith ("about:"))
      baseURI = document .baseURI;

   return baseURI;
}

function X3DNetworkingContext ()
{
   this .addChildObjects ("loadCount", new Fields .SFInt32 ());

   this [_loadingTotal]   = 0;
   this [_loadingObjects] = new Set ();
   this [_loading]        = false;
   this [_location]       = getBaseURI (this .getElement () [0]);
}

X3DNetworkingContext .prototype =
{
   initialize: function ()
   { },
   getProviderUrl: function ()
   {
      return URLs .getProviderUrl ();
   },
   getLocation: function ()
   {
      return this [_location];
   },
   getDefaultScene: function ()
   {
      // Inline node's empty scene.

      this [_defaultScene] = this .createScene ();

      this [_defaultScene] .setPrivate (true);
      this [_defaultScene] .setLive (true);
      this [_defaultScene] .setup ();

      this .getDefaultScene = function () { return this [_defaultScene]; };

      Object .defineProperty (this, "getDefaultScene", { enumerable: false });

      return this [_defaultScene];
   },
   setBrowserLoading: function (value)
   {
      this [_loading] = value;

      this .setLoadCount (0);

      if (value)
      {
         this .resetLoadCount ();

         this .getShadow () .find (".x_ite-private-world-info") .remove ();

         if (this .getBrowserOptions () .getSplashScreen ())
         {
            this .getContextMenu () .hide ();
            this .getCanvas () .hide ();
            this .getSplashScreen () .stop (true, true) .show ();
         }
      }
      else
      {
         if (this .getBrowserOptions () .getSplashScreen ())
         {
            this .getCanvas () .show ();
            this .getSplashScreen () .stop (true, true) .show () .fadeOut (2000);
         }
      }
   },
   getLoading: function ()
   {
      return this [_loading];
   },
   addLoadingObject: function (object)
   {
      if (this [_loadingObjects] .has (object))
         return;

      ++ this [_loadingTotal];

      this [_loadingObjects] .add (object);

      this .setLoadCount (this [_loadingObjects] .size);
      this .setCursor ("DEFAULT");
   },
   removeLoadingObject: function (object)
   {
      if (! this [_loadingObjects] .has (object))
         return;

      this [_loadingObjects] .delete (object);

      this .setLoadCount (this [_loadingObjects] .size);
   },
   setLoadCount: function (value)
   {
      this ._loadCount = value;

      const displayValue = [... this [_loadingObjects]]
         .filter (o => o .isPrivate)
         .reduce ((v, o) => v + ! o .isPrivate (), 0);

      if (value || this [_loading])
      {
         var string = (displayValue == 1
            ? _ ("Loading %1 file")
            : _ ("Loading %1 files")) .replace ("%1", displayValue || 1);
      }
      else
      {
         var string = _("Loading done");
         this .setCursor ("DEFAULT");
      }

      if (! this [_loading])
         this .getNotification () ._string = string;

      this .getSplashScreen () .find (".x_ite-private-spinner-text") .text (string);
      this .getSplashScreen () .find (".x_ite-private-progressbar div")
         .css ("width", (100 - 100 * value / this [_loadingTotal]) + "%");
   },
   resetLoadCount: function ()
   {
      this ._loadCount     = 0;
      this [_loadingTotal] = 0;

      this [_loadingObjects] .clear ();

      for (const object of this .getPrivateScene () .getLoadingObjects ())
         this .addLoadingObject (object);
   },
};

export default X3DNetworkingContext;
