// Extracted from chrisveness/geodesy

// The MIT License (MIT)
//
// Copyright (c) 2014 Chris Veness
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export function inverse(p1: LatLon, p2: LatLon) {
  const φ1 = toRadians(p1[0]), λ1 = toRadians(p1[1]);
  const φ2 = toRadians(p2[0]), λ2 = toRadians(p2[1]);

  // allow alternative ellipsoid to be specified
  const ellipsoid = ellipsoids.WGS84;
  const { a, b, f } = ellipsoid;

  const L = λ2 - λ1;
  const tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
  const tanU2 = (1-f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2*tanU2)), sinU2 = tanU2 * cosU2;

  let sinλ: number, cosλ: number, sinσ = 0, cosσ = 0;
  let cosSqα = 0, cos2σM = 0, σ = 0;

  let λ = L, λʹ, iterations = 0;
  const antimeridian = Math.abs(L) > π;
  do {
      sinλ = Math.sin(λ);
      cosλ = Math.cos(λ);
      let sinSqσ = (cosU2*sinλ) * (cosU2*sinλ) + (cosU1*sinU2-sinU1*cosU2*cosλ) * (cosU1*sinU2-sinU1*cosU2*cosλ);
      if (Math.abs(sinSqσ) < Number.EPSILON) {
        break;  // co-incident points
      }
      sinσ = Math.sqrt(sinSqσ);
      cosσ = sinU1*sinU2 + cosU1*cosU2*cosλ;
      σ = Math.atan2(sinσ, cosσ);
      let sinα = cosU1 * cosU2 * sinλ / sinσ;
      cosSqα = 1 - sinα*sinα;
      cos2σM = (cosSqα != 0) ? (cosσ - 2*sinU1*sinU2/cosSqα) : 0; // on equatorial line cos²α = 0 (§6)
      let C = f/16*cosSqα*(4+f*(4-3*cosSqα));
      λʹ = λ;
      λ = L + (1-C) * f * sinα * (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
      const iterationCheck = antimeridian ? Math.abs(λ)-π : Math.abs(λ);
      if (iterationCheck > π) throw new EvalError('λ > π');
  } while (Math.abs(λ-λʹ) > 1e-12 && ++iterations<1000);
  if (iterations >= 1000) throw new EvalError('Vincenty formula failed to converge');

  const uSq = cosSqα * (a*a - b*b) / (b*b);
  const A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
  const B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
  const Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
      B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));

  const s = b*A*(σ-Δσ);

  const α1 = Math.atan2(cosU2*sinλ,  cosU1*sinU2-sinU1*cosU2*cosλ);
  const α2 = Math.atan2(cosU1*sinλ, -sinU1*cosU2+cosU1*sinU2*cosλ);

  return {
      distance:       s,
      initialBearing: Math.abs(s) < Number.EPSILON ? NaN : wrap360(toDegrees(α1)),
      finalBearing:   Math.abs(s) < Number.EPSILON ? NaN : wrap360(toDegrees(α2)),
      iterations:     iterations,
  };
}

type LatLon = [number, number];

const ellipsoids = {
  WGS84: { a: 6378137, b: 6356752.314245, f: 1/298.257223563 },
};

const π = Math.PI;

function toDegrees(x: number) {
  return x * 180 / Math.PI;
}

function toRadians(x: number) {
  return x * Math.PI / 180;
}

function wrap360(degrees: number) {
  if (0<=degrees && degrees<360) return degrees; // avoid rounding due to arithmetic ops if within range
  return (degrees%360+360) % 360; // sawtooth wave p:360, a:360
}
