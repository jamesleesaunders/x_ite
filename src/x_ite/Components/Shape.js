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

import SupportedNodes          from "../Configuration/SupportedNodes.js";
import AcousticProperties      from "./Shape/AcousticProperties.js";
import Appearance              from "./Shape/Appearance.js";
import FillProperties          from "./Shape/FillProperties.js";
import LineProperties          from "./Shape/LineProperties.js";
import Material                from "./Shape/Material.js";
import PhysicalMaterial        from "./Shape/PhysicalMaterial.js";
import PointProperties         from "./Shape/PointProperties.js";
import Shape                   from "./Shape/Shape.js";
import TwoSidedMaterial        from "./Shape/TwoSidedMaterial.js";
import UnlitMaterial           from "./Shape/UnlitMaterial.js";
import X3DAppearanceChildNode  from "./Shape/X3DAppearanceChildNode.js";
import X3DAppearanceNode       from "./Shape/X3DAppearanceNode.js";
import X3DMaterialNode         from "./Shape/X3DMaterialNode.js";
import X3DOneSidedMaterialNode from "./Shape/X3DOneSidedMaterialNode.js";
import X3DShapeNode            from "./Shape/X3DShapeNode.js";

const Types =
{
   AcousticProperties: AcousticProperties,
   Appearance:         Appearance,
   FillProperties:     FillProperties,
   LineProperties:     LineProperties,
   Material:           Material,
   PhysicalMaterial:   PhysicalMaterial,
   PointProperties:    PointProperties,
   Shape:              Shape,
   TwoSidedMaterial:   TwoSidedMaterial,
   UnlitMaterial:      UnlitMaterial,
};

const AbstractTypes =
{
   X3DAppearanceChildNode:  X3DAppearanceChildNode,
   X3DAppearanceNode:       X3DAppearanceNode,
   X3DMaterialNode:         X3DMaterialNode,
   X3DOneSidedMaterialNode: X3DOneSidedMaterialNode,
   X3DShapeNode:            X3DShapeNode,
};

for (const typeName in Types)
   SupportedNodes .addType (typeName, Types [typeName]);

for (const typeName in AbstractTypes)
   SupportedNodes .addAbstractType (typeName, AbstractTypes [typeName]);

export default undefined;
