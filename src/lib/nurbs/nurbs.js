import inferType           from "./src/utils/infer-type.js";
import computeCacheKey     from "./src/utils/cache-key.js";
import isNdarray           from "./src/utils/is-ndarray.js";
import isNdarrayLike       from "./src/utils/is-ndarray-like.js";
import createAccessors     from "./src/utils/create-accessors.js";
import numericalDerivative from "./src/numerical-derivative.js";
import isArrayLike         from "./src/utils/is-array-like.js";
import createEvaluator     from "./src/evaluate.js";
import createTransform     from "./src/transform.js";
import createSupport       from "./src/support.js";
import sample              from "./extras/sample.js";

var BOUNDARY_TYPES = {
   open: "open",
   closed: "closed",
   clamped: "clamped"
};

function isBlank (x) {
   return x === undefined || x === null;
}

function parseNURBS (points, degree, knots, weights, boundary, opts) {
   var i, dflt;

   if (points && !isArrayLike(points) && !isNdarray(points)) {
      opts = points;
      this.debug = points.debug;
      this.checkBounds = !!points.checkBounds;
      this.weights = points.weights;
      this.knots = points.knots;
      this.degree = points.degree;
      this.boundary = points.boundary;
      this.points = points.points;
      Object.defineProperty(this, "size", {value: opts.size, writable: true, configurable: true});
   } else {
      opts = opts || {};
      this.weights = weights;
      this.knots = knots;
      this.degree = degree;
      this.points = points;
      this.boundary = boundary;
      this.debug = opts.debug;
      this.checkBounds = !!opts.checkBounds;
      Object.defineProperty(this, "size", {value: opts.size, writable: true, configurable: true});
   }

   var pointType  = inferType(this.points);
   var weightType = inferType(this.weights);
   var knotType   = inferType(this.knots);

   if (this.points) {
      //
      // Sanitize the points
      //
      switch (pointType) {
         case inferType.GENERIC_NDARRAY:
         case inferType.NDARRAY:
            Object.defineProperties(this, {
               splineDimension: {
                  value: this.points.shape.length - 1,
                  writable: false,
                  configurable: true
               },
               dimension: {
                  value: this.points.shape[this.points.shape.length - 1],
                  writable: false,
                  configurable: true
               },
               size: {
                  get: function () {
                     return this.points.shape.slice(0, this.points.shape.length - 1);
                  },
                  set: function () {
                     throw new Error("Cannot assign to read only property 'size'");
                  },
                  configurable: true
               }
            });
            break;

         case inferType.ARRAY_OF_OBJECTS:
         case inferType.ARRAY_OF_ARRAYS:
            // Follow the zeroth entries until we hit something that"s not an array
            var splineDimension = 0;
            var size = this.size || [];
            size.length = 0;
            for (var ptr = this.points; isArrayLike(ptr[0]); ptr = ptr[0]) {
               splineDimension++;
               size.push(ptr.length);
            }
            if (splineDimension === 0) {
               throw new Error("Expected an array of points");
            }

            Object.defineProperties(this, {
               splineDimension: {
                  value: splineDimension,
                  writable: false,
                  configurable: true
               },
               dimension: {
                  value: ptr.length,
                  writable: false,
                  configurable: true
               },
               size: {
                  get: function () {
                     var size = [];
                     size.length = 0;
                     for (var i = 0, ptr = this.points; i < this.splineDimension; i++, ptr = ptr[0]) {
                        size[i] = ptr.length;
                     }
                     return size;
                  },
                  set: function () {
                     throw new Error("Cannot assign to read only property \"size\"");
                  },
                  configurable: true
               }
            });

            break;
         case inferType.PACKED:
         default:
            throw new Error("Expected either a packed array, array of arrays, or ndarray of points");
      }
   } else {
      if (this.size === undefined || this.size === null) {
         throw new Error("Either points or a control hull size must be provided.");
      }
      if (!isArrayLike(this.size)) {
         Object.defineProperty(this, "size", {
            value: [this.size],
            writable: true,
            configurable: true
         });
      }
      if (this.size.length === 0) {
         throw new Error("`size` must be a number or an array of length at least one.");
      }

      Object.defineProperties(this, {
         splineDimension: {
            value: this.size.length,
            writable: false,
            configurable: true
         },
         dimension: {
            value: 0,
            writable: false,
            configurable: true
         }
      });
   }

   //
   // Sanitize the degree into an array
   //
   if (isArrayLike(this.degree)) {
      for (i = 0; i < this.splineDimension; i++) {
         if (isBlank(this.degree[i])) {
            throw new Error("Missing degree in dimension " + (i + 1));
         }
      }
   } else {
      var hasBaseDegree = !isBlank(this.degree);
      var baseDegree = isBlank(this.degree) ? 2 : this.degree;
      this.degree = [];
      for (i = 0; i < this.splineDimension; i++) {
         if (this.size[i] <= baseDegree) {
            if (hasBaseDegree) {
               throw new Error("Expected at least " + (baseDegree + 1) + " points for degree " + baseDegree + " spline in dimension " + (i + 1) + " but got only " + this.size[i]);
            } else {
               this.degree[i] = this.size[i] - 1;
            }
         } else {
            this.degree[i] = baseDegree;
         }
      }
   }

   //
   // Sanitize boundaries
   //
   dflt = (typeof this.boundary !== "string") ? "open" : this.boundary;
   if (!BOUNDARY_TYPES[dflt]) {
      throw new Error("Boundary type must be one of " + Object.keys(BOUNDARY_TYPES) + ". Got " + dflt);
   }
   this.boundary = isArrayLike(this.boundary) ? this.boundary : [];
   this.boundary.length = this.splineDimension;
   for (i = 0; i < this.splineDimension; i++) {
      this.boundary[i] = isBlank(this.boundary[i]) ? dflt : this.boundary[i];

      if (!BOUNDARY_TYPES[dflt]) {
         throw new Error("Boundary type must be one of " + Object.keys(BOUNDARY_TYPES) + ". Got " + dflt + " for dimension " + (i + 1));
      }
   }

   //
   // Sanitize knots
   //
   switch (knotType) {
      case inferType.ARRAY_OF_ARRAYS:
         // Wrap flat arrays in an array so that curves are more natural
         if (isArrayLike(this.knots) && this.knots.length > 0 && !isArrayLike(this.knots[0])) {
            this.knots = [this.knots];
         }

         for (i = 0; i < this.splineDimension; i++) {
            if (this.size[i] <= this.degree[i]) {
               throw new Error("Expected at least " + (this.degree[i] + 1) + " points in dimension " + (i + 1) + " but got " + this.size[i] + ".");
            }

            if (isArrayLike(this.knots[i])) {
               if (this.boundary[i] !== "closed" && this.knots[i].length !== this.degree[i] + this.size[i] + 1) {
                  throw new Error("Expected " + (this.degree[i] + this.size[i] + 1) + " knots in dimension " + (i + 1) + " but got " + this.knots[i].length + ".");
               } else if (this.boundary[i] === "closed" && this.knots[i].length !== this.size[i] + 1) {
                  // Fudge factor allowance for just ignoring extra knots. This makes some allowance
                  // for passing regular clamped/open spline knots to a closed spline by ignoring extra
                  // knots instead of simply truncating.
                  var canBeFudged = this.knots[i].length === this.size[i] + this.degree[i] + 1;
                  if (!canBeFudged) {
                     throw new Error("Expected " + (this.size[i] + 1) + " knots for closed spline in dimension " + (i + 1) + " but got " + this.knots[i].length + ".");
                  }
               }
            }
         }
         break;
      case inferType.NDARRAY:
         break;
   }

   //
   // Create evaluator
   //
   var newCacheKey = computeCacheKey(this, this.debug, this.checkBounds, pointType, weightType, knotType);

   if (newCacheKey !== this.__cacheKey) {
      this.__cacheKey = newCacheKey;

      var accessors = createAccessors(this);

      this.evaluate = createEvaluator(this.__cacheKey, this, accessors, this.debug, this.checkBounds, false);
      this.transform = createTransform(this.__cacheKey, this, accessors, this.debug);
      this.support = createSupport(this.__cacheKey, this, accessors, this.debug, this.checkBounds);

      this.evaluator = function (derivativeOrder, isBasis) {
         return createEvaluator(this.__cacheKey, this, accessors, this.debug, this.checkBounds, isBasis, derivativeOrder);
      };
   }

   this.numericalDerivative = numericalDerivative.bind(this);

   return this;
}

function domainGetter () {
   var sizeArray;
   var ret = [];

   // If the reference to size is hard-coded, then the size cannot change, or
   // if you change points manually (like by appending a point) without re-running
   // the constructor, then it"ll be incorrect. This aims for middle-ground
   // by querying the size directly, based on the point data type
   //
   // A pointer to the point array-of-arrays:
   var ptr = this.points;

   if (!ptr) {
      // If there are no points, then just use this.size
      sizeArray = this.size;
   } else if (isNdarrayLike(ptr)) {
      // If it"s an ndarray, use the ndarray"s shape property
      sizeArray = ptr.shape;
   }

   for (var d = 0; d < this.splineDimension; d++) {
      var size = sizeArray ? sizeArray[d] : ptr.length;
      var p = this.degree[d];
      var isClosed = this.boundary[d] === "closed";

      if (this.knots && this.knots[d]) {
         var k = this.knots[d];
         ret[d] = [k[isClosed ? 0 : p], k[size]];
      } else {
         ret[d] = [isClosed ? 0 : p, size];
      }

      // Otherwise if it"s an array of arrays, we get the size of the next
      // dimension by recursing into the points
      if (ptr) ptr = ptr[0];
   }
   return ret;
}

// Evaluate Non-Uniform Rational B-Splines (NURBS)
// @param points {Array} - data array
// @param degree {Array} - spline curve degree
// @param knots {Array} - knot vector
// @param weights {Array} - weight vector
// @param opts {object} - additional options
function nurbs (points, degree, knots, weights, boundary, opts)
{
   var ctor = function (points, degree, knots, weights, boundary, opts)
   {
      parseFcn (points, degree, knots, weights, boundary, opts);
      return ctor;
   };

   var parseFcn = parseNURBS .bind (ctor);

   Object .defineProperty (ctor, "domain",
   {
      get: domainGetter
   });

   parseFcn (points, degree, knots, weights, boundary, opts);

   return ctor;
}

nurbs .sample = sample;

export default nurbs;
