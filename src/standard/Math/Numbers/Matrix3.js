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

import Vector2             from "./Vector2.js";
import Vector3             from "./Vector3.js";
import Matrix2             from "./Matrix2.js";
import eigen_decomposition from "../Algorithms/eigen_decomposition.js";

function Matrix3 ()
{
   if (arguments .length)
   {
      this [0] = arguments [0];
      this [1] = arguments [1];
      this [2] = arguments [2];
      this [3] = arguments [3];
      this [4] = arguments [4];
      this [5] = arguments [5];
      this [6] = arguments [6];
      this [7] = arguments [7];
      this [8] = arguments [8];
   }
   else
   {
      this .identity ();
   }
}

Matrix3 .prototype =
{
   constructor: Matrix3,
   order: 3,
   length: 9,
   [Symbol .iterator]: function* ()
   {
      const length = this .length;

      for (let i = 0; i < length; ++ i)
         yield this [i];
   },
   copy: function ()
   {
      const copy = Object .create (Matrix3 .prototype);
      copy [0] = this [0];
      copy [1] = this [1];
      copy [2] = this [2];
      copy [3] = this [3];
      copy [4] = this [4];
      copy [5] = this [5];
      copy [6] = this [6];
      copy [7] = this [7];
      copy [8] = this [8];
      return copy;
   },
   assign: function (matrix)
   {
      this [0] = matrix [0];
      this [1] = matrix [1];
      this [2] = matrix [2];
      this [3] = matrix [3];
      this [4] = matrix [4];
      this [5] = matrix [5];
      this [6] = matrix [6];
      this [7] = matrix [7];
      this [8] = matrix [8];
      return this;
   },
   equals: function (matrix)
   {
      return this [0] === matrix [0] &&
             this [1] === matrix [1] &&
             this [2] === matrix [2] &&
             this [3] === matrix [3] &&
             this [4] === matrix [4] &&
             this [5] === matrix [5] &&
             this [6] === matrix [6] &&
             this [7] === matrix [7] &&
             this [8] === matrix [8];
   },
   rotation: function ()
   {
      return math .atan2 (this [1], this [0]);
   },
   set1: function (r, c, value)
   {
      this [r * this .order + c] = value;

      return this;
   },
   get1: function (r, c)
   {
      return this [r * this .order + c];
   },
   set: (function ()
   {
      const invCenter = new Vector2 (0, 0);

      return function (translation, rotation, scale, scaleOrientation, center)
      {
         switch (arguments .length)
         {
            case 0:
            {
               this .identity ();
               break;
            }
            case 1:
            {
               if (translation === null) translation = Vector2 .Zero;

               this .identity ();
               this .translate (translation);
               break;
            }
            case 2:
            {
               if (translation === null) translation = Vector2 .Zero;
               if (rotation    === null) rotation    = 0;

               this .identity ();
               this .translate (translation);

               if (rotation !== 0)
                  this .rotate (rotation);

               break;
            }
            case 3:
            {
               if (translation === null) translation = Vector2 .Zero;
               if (rotation    === null) rotation    = 0;
               if (scale       === null) scale       = Vector2 .One;

               this .identity ();
               this .translate (translation);

               if (rotation !== 0)
                  this .rotate (rotation);

               if (! scale .equals (Vector2 .One))
                  this .scale  (scale);

               break;
            }
            case 4:
            {
               if (translation      === null) translation      = Vector2 .Zero;
               if (rotation         === null) rotation         = 0;
               if (scale            === null) scale            = Vector2 .One;
               if (scaleOrientation === null) scaleOrientation = 0;

               this .identity ();
               this .translate (translation);

               if (rotation !== 0)
                  this .rotate (rotation);

               if (! scale .equals (Vector2 .One))
               {
                  const hasScaleOrientation = scaleOrientation !== 0;

                  if (hasScaleOrientation)
                  {
                     this .rotate (scaleOrientation);
                     this .scale (scale);
                     this .rotate (-scaleOrientation);
                  }
                  else
                     this .scale (scale);
               }

               break;
            }
            case 5:
            {
               if (translation      === null) translation      = Vector2 .Zero;
               if (rotation         === null) rotation         = 0;
               if (scale            === null) scale            = Vector2 .One;
               if (scaleOrientation === null) scaleOrientation = 0;
               if (center           === null) center           = Vector2 .Zero;

               // P' = T * C * R * SR * S * -SR * -C * P
               this .identity ();
               this .translate (translation);

               const hasCenter = ! center .equals (Vector2 .Zero);

               if (hasCenter)
                  this .translate (center);

               if (rotation !== 0)
                  this .rotate (rotation);

               if (! scale .equals (Vector2 .One))
               {
                  if (scaleOrientation !== 0)
                  {
                     this .rotate (scaleOrientation);
                     this .scale (scale);
                     this .rotate (-scaleOrientation);
                  }
                  else
                     this .scale (scale);
               }

               if (hasCenter)
                  this .translate (invCenter .assign (center) .negate ());

               break;
            }
            case 9:
            {
               this [0] = arguments [0];
               this [1] = arguments [1];
               this [2] = arguments [2];
               this [3] = arguments [3];
               this [4] = arguments [4];
               this [5] = arguments [5];
               this [6] = arguments [6];
               this [7] = arguments [7];
               this [8] = arguments [8];
               break;
            }
         }

         return this;
      };
   })(),
   get: (function ()
   {
      const
         dummyTranslation      = new Vector2 (0, 0),
         dummyRotation         = new Vector3 (0, 0, 0),
         dummyScale            = new Vector2 (0, 0),
         dummyScaleOrientation = new Vector3 (0, 0, 0),
         dummyCenter           = new Vector2 (0, 0),
         rotMatrix             = new Matrix2 (),
         soMatrix              = new Matrix2 (),
         c                     = new Vector2 (0, 0);

      return function (translation, rotation, scale, scaleOrientation, center)
      {
         if (translation      === null) translation      = dummyTranslation;
         if (rotation         === null) rotation         = dummyRotation;
         if (scale            === null) scale            = dummyScale;
         if (scaleOrientation === null) scaleOrientation = dummyScaleOrientation;
         if (center           === null) center           = dummyCenter;

         switch (arguments .length)
         {
            case 1:
            {
               translation .set (this [6], this [7]);
               break;
            }
            case 2:
            {
               this .factor (translation, rotMatrix, dummyScale, soMatrix);

               rotation [0] = rotMatrix [0];
               rotation [1] = rotMatrix [1];
               rotation [2] = Math .atan2 (rotMatrix [1], rotMatrix [0]);
               break;
            }
            case 3:
            {
               this .factor (translation, rotMatrix, scale, soMatrix);

               rotation [0] = rotMatrix [0];
               rotation [1] = rotMatrix [1];
               rotation [2] = Math .atan2 (rotMatrix [1], rotMatrix [0]);
               break;
            }
            case 4:
            {
               this .factor (translation, rotMatrix, scale, soMatrix);

               rotation [0] = rotMatrix [0];
               rotation [1] = rotMatrix [1];
               rotation [2] = Math .atan2 (rotMatrix [1], rotMatrix [0]);

               scaleOrientation [0] = soMatrix [0];
               scaleOrientation [1] = soMatrix [1];
               scaleOrientation [2] = Math .atan2 (soMatrix [1], soMatrix [0]);
               break;
            }
            case 5:
            {
               m .set (c .assign (center) .negate ());
               m .multLeft (this);
               m .translate (center);
               m .get (translation, rotation, scale, scaleOrientation);
               break;
            }
         }
      };
   })(),
   factor: (function ()
   {
      const
         si = new Matrix2 (),
         u  = new Matrix2 (),
         b  = new Matrix2 ();

      const eigen = { values: [ ], vectors: [[ ], [ ]] };

      return function (translation, rotation, scale, scaleOrientation)
      {
         // (1) Get translation.
         translation .set (this [6], this [7]);

         // (2) Create 3x3 matrix.
         const a = this .submatrix;

         // (3) Compute det A. If negative, set sign = -1, else sign = 1
         const det      = a .determinant ();
         const det_sign = det < 0 ? -1 : 1;

         // (4) B = A * !A  (here !A means A transpose)
         b .assign (a) .transpose () .multLeft (a);
         const e = eigen_decomposition (b, eigen);

         // Find min / max eigenvalues and do ratio test to determine singularity.

         scaleOrientation .set (e .vectors [0] [0], e .vectors [1] [0],
                                e .vectors [0] [1], e .vectors [1] [1]);

         // Compute s = sqrt(evalues), with sign. Set si = s-inverse

         scale .x = det_sign * Math .sqrt (e .values [0]);
         scale .y = det_sign * Math .sqrt (e .values [1]);

         si [0] = 1 / scale .x;
         si [3] = 1 / scale .y;

         // (5) Compute U = !R ~S R A.
         rotation .assign (u .assign (scaleOrientation) .transpose () .multRight (si) .multRight (scaleOrientation) .multRight (a));
      };
   })(),
   determinant2: function ()
   {
      return this [0] * this [4] -
             this [1] * this [3];
   },
   determinant: function ()
   {
      const
         m0 = this [0], m1 = this [1], m2 = this [2],
         m3 = this [3], m4 = this [4], m5 = this [5],
         m6 = this [6], m7 = this [7], m8 = this [8];

      return m0 * (m4 * m8 - m5 * m7) -
             m1 * (m3 * m8 - m5 * m6) +
             m2 * (m3 * m7 - m4 * m6);
   },
   transpose: function ()
   {
      let tmp;

      tmp = this [1]; this [1] = this [3]; this [3] = tmp;
      tmp = this [2]; this [2] = this [6]; this [6] = tmp;
      tmp = this [5]; this [5] = this [7]; this [7] = tmp;

      return this;
   },
   inverse: function ()
   {
      const
         m0  = this [0],
         m1  = this [1],
         m2  = this [2],
         m3  = this [3],
         m4  = this [4],
         m5  = this [5],
         m6  = this [6],
         m7  = this [7],
         m8  = this [8],
         t4  = m0 * m4,
         t6  = m0 * m7,
         t8  = m3 * m1,
         t10 = m3 * m7,
         t12 = m6 * m1,
         t14 = m6 * m4;

      let d = (t4 * m8 - t6 * m5 - t8 * m8 + t10 * m2 + t12 * m5 - t14 * m2);

      // if (d === 0) ... determinant is zero.

      d = 1 / d;

      const
         b0 =  (m4 * m8 - m7 * m5) * d,
         b1 = -(m1 * m8 - m7 * m2) * d,
         b2 =  (m1 * m5 - m4 * m2) * d,
         b3 = -(m3 * m8 - m6 * m5) * d,
         b4 =  (m0 * m8 - m6 * m2) * d,
         b5 = -(m0 * m5 - m3 * m2) * d;

      this [0] = b0;
      this [1] = b1;
      this [2] = b2;
      this [3] = b3;
      this [4] = b4;
      this [5] = b5;
      this [6] =  (t10 - t14) * d;
      this [7] = -(t6 - t12) * d;
      this [8] =  (t4 - t8) * d;

      return this;
   },
   multLeft: function (matrix)
   {
      const
         a0 = this [0], a1 = this [1], a2 = this [2],
         a3 = this [3], a4 = this [4], a5 = this [5],
         a6 = this [6], a7 = this [7], a8 = this [8],
         b0 = matrix [0], b1 = matrix [1], b2 = matrix [2],
         b3 = matrix [3], b4 = matrix [4], b5 = matrix [5],
         b6 = matrix [6], b7 = matrix [7], b8 = matrix [8];

      this [0] = a0 * b0 + a3 * b1 + a6 * b2;
      this [1] = a1 * b0 + a4 * b1 + a7 * b2;
      this [2] = a2 * b0 + a5 * b1 + a8 * b2;
      this [3] = a0 * b3 + a3 * b4 + a6 * b5;
      this [4] = a1 * b3 + a4 * b4 + a7 * b5;
      this [5] = a2 * b3 + a5 * b4 + a8 * b5;
      this [6] = a0 * b6 + a3 * b7 + a6 * b8;
      this [7] = a1 * b6 + a4 * b7 + a7 * b8;
      this [8] = a2 * b6 + a5 * b7 + a8 * b8;

      return this;
   },
   multRight: function (matrix)
   {
      const
         a0 = this [0], a1 = this [1], a2 = this [2],
         a3 = this [3], a4 = this [4], a5 = this [5],
         a6 = this [6], a7 = this [7], a8 = this [8],
         b0 = matrix [0], b1 = matrix [1], b2 = matrix [2],
         b3 = matrix [3], b4 = matrix [4], b5 = matrix [5],
         b6 = matrix [6], b7 = matrix [7], b8 = matrix [8];

      this [0] = a0 * b0 + a1 * b3 + a2 * b6;
      this [1] = a0 * b1 + a1 * b4 + a2 * b7;
      this [2] = a0 * b2 + a1 * b5 + a2 * b8;
      this [3] = a3 * b0 + a4 * b3 + a5 * b6;
      this [4] = a3 * b1 + a4 * b4 + a5 * b7;
      this [5] = a3 * b2 + a4 * b5 + a5 * b8;
      this [6] = a6 * b0 + a7 * b3 + a8 * b6;
      this [7] = a6 * b1 + a7 * b4 + a8 * b7;
      this [8] = a6 * b2 + a7 * b5 + a8 * b8;

      return this;
   },
   multVecMatrix: function (vector)
   {
      if (vector .length === 2)
      {
         const
            x = vector .x,
            y = vector .y,
            w = x * this [2] + y * this [5] + this [8];

         vector .x = (x * this [0] + y * this [3] + this [6]) / w;
         vector .y = (x * this [1] + y * this [4] + this [7]) / w;

         return vector;
      }

      const
         x = vector .x,
         y = vector .y,
         z = vector .z;

      vector .x = x * this [0] + y * this [3] + z * this [6];
      vector .y = x * this [1] + y * this [4] + z * this [7];
      vector .z = x * this [2] + y * this [5] + z * this [8];

      return vector;
   },
   multMatrixVec: function (vector)
   {
      if (vector .length === 2)
      {
         const
            x = vector .x,
            y = vector .y,
            w = x * this [6] + y * this [7] + this [8];

         vector .x = (x * this [0] + y * this [1] + this [2]) / w;
         vector .y = (x * this [3] + y * this [4] + this [5]) / w;

         return vector;
      }

      const
         x = vector .x,
         y = vector .y,
         z = vector .z;

      vector .x = x * this [0] + y * this [1] + z * this [2];
      vector .y = x * this [3] + y * this [4] + z * this [5];
      vector .z = x * this [6] + y * this [7] + z * this [8];

      return vector;
   },
   multDirMatrix: function (vector)
   {
      const
         x = vector .x,
         y = vector .y;

      vector .x = x * this [0] + y * this [3];
      vector .y = x * this [1] + y * this [4];

      return vector;
   },
   multMatrixDir: function (vector)
   {
      const
         x = vector .x,
         y = vector .y;

      vector .x = x * this [0] + y * this [1];
      vector .y = x * this [3] + y * this [4];

      return vector;
   },
   identity: function ()
   {
      this [0] = 1; this [1] = 0; this [2] = 0;
      this [3] = 0; this [4] = 1; this [5] = 0;
      this [6] = 0; this [7] = 0; this [8] = 1;
   },
   translate: function (translation)
   {
      const
         x = translation .x,
         y = translation .y;

      this [6] += this [0] * x + this [3] * y;
      this [7] += this [1] * x + this [4] * y;

      return this;
   },
   rotate: function (rotation)
   {
      this .multLeft (Matrix3 .Rotation (rotation));

      return this;
   },
   scale: function (scale)
   {
      const
         x = scale .x,
         y = scale .y;

      this [0] *= x;
      this [3] *= y;

      this [1] *= x;
      this [4] *= y;

      return this;
   },
   toString: function ()
   {
      return this [0] + " " + this [1] + " " + this [2] + " " +
             this [3] + " " + this [4] + " " + this [5] + " " +
             this [6] + " " + this [7] + " " + this [8]
   },
};

Object .defineProperty (Matrix3 .prototype, "x",
{
   get: (function ()
   {
      const vector = new Vector3 (0, 0, 0);

      return function () { return vector .set (this [0], this [1], this [2]); };
   })(),
   enumerable: false,
   configurable: false
});

Object .defineProperty (Matrix3 .prototype, "y",
{
   get: (function ()
   {
      const vector = new Vector3 (0, 0, 0);

      return function () { return vector .set (this [3], this [4], this [5]); };
   })(),
   enumerable: false,
   configurable: false
});

Object .defineProperty (Matrix3 .prototype, "z",
{
   get: (function ()
   {
      const vector = new Vector3 (0, 0, 0);

      return function () { return vector .set (this [6], this [7], this [8]); };
   })(),
   enumerable: false,
   configurable: false
});

Object .defineProperty (Matrix3 .prototype, "xAxis",
{
   get: (function ()
   {
      const vector = new Vector2 (0, 0);

      return function () { return vector .set (this [0], this [1]); };
   })(),
   enumerable: false,
   configurable: false
});

Object .defineProperty (Matrix3 .prototype, "yAxis",
{
   get: (function ()
   {
      const vector = new Vector2 (0, 0);

      return function () { return vector .set (this [3], this [4]); };
   })(),
   enumerable: false,
   configurable: false
});

Object .defineProperty (Matrix3 .prototype, "origin",
{
   get: (function ()
   {
      const vector = new Vector2 (0, 0);

      return function () { return vector .set (this [6], this [7]); };
   })(),
   enumerable: false,
   configurable: false
});

Object .defineProperty (Matrix3 .prototype, "submatrix",
{
   get: (function ()
   {
      const matrix = new Matrix2 ();

      return function ()
      {
         matrix [0] = this [0]; matrix [1] = this [1];
         matrix [2] = this [3]; matrix [3] = this [4];
         return matrix;
      };
   })(),
   enumerable: false,
   configurable: false
});

Object .assign (Matrix3,
{
   Identity: new Matrix3 (),
   Rotation: function (rotation)
   {
      const
         sinAngle = Math .sin (rotation),
         cosAngle = Math .cos (rotation);

      return new Matrix3 ( cosAngle, sinAngle, 0,
                          -sinAngle, cosAngle, 0,
                           0, 0, 1);
   },
   Matrix2: function (matrix)
   {
      return new Matrix3 (matrix [0], matrix [1], 0,
                          matrix [2], matrix [3], 0,
                          0, 0, 1);
   },
   transpose: function (matrix)
   {
      return matrix .copy () .transpose ();
   },
   inverse: function (matrix)
   {
      return matrix .copy () .inverse ();
   },
   multLeft: function (lhs, rhs)
   {
      return lhs .copy () .multLeft (rhs);
   },
   multRight: function (lhs, rhs)
   {
      return lhs .copy () .multRight (rhs);
   },
});

const m = new Matrix3 ();

export default Matrix3;
