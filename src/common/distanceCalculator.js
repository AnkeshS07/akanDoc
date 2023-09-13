// distanceCalculator.js

const degreesToRadians = (degrees) => {
    return (degrees * Math.PI) / 180;
  };
  
  const calculateDistance = (coords1, coords2) => {
    const earthRadius = 6731;
  
    const latDiff = degreesToRadians(coords2.latitude - coords1.latitude);
    const lonDiff = degreesToRadians(coords2.longitude - coords1.longitude);
  
    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(degreesToRadians(coords1.latitude)) *
        Math.cos(degreesToRadians(coords2.latitude)) *
        Math.sin(lonDiff / 2) *
        Math.sin(lonDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = earthRadius * c;
    // Distance in kilometers
    return distance * 0.621371;
  };
  
  

  const calculateDistanceInMiles = (coords1, coords2) => {
    const earthRadiusKm = 6731;
  
    const latDiff = degreesToRadians(coords2.latitude - coords1.latitude);
    const lonDiff = degreesToRadians(coords2.longitude - coords1.longitude);
  
    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(degreesToRadians(coords1.latitude)) *
        Math.cos(degreesToRadians(coords2.latitude)) *
        Math.sin(lonDiff / 2) *
        Math.sin(lonDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distanceKm = earthRadiusKm * c;
    const distanceMiles = distanceKm * 0.621371; // Conversion factor
  
    // Distance in miles
    return distanceMiles;
  };
  

 module.exports={calculateDistance,calculateDistanceInMiles};
  