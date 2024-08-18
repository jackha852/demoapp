import axios from "axios";

const GOOGLE_MAP_ROUTE_API_HOST = process.env.GOOGLE_MAP_ROUTE_API_HOST;
const GOOGLE_MAP_ROUTE_API_KEY = process.env.GOOGLE_MAP_ROUTE_API_KEY;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRouteDistance = async (origin, destination) => {
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": GOOGLE_MAP_ROUTE_API_KEY,
  };

  const data = {
    origin: {
      location: {
        latLng: {
          latitude: origin[0],
          longitude: origin[1],
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destination[0],
          longitude: destination[1],
        },
      },
    },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false,
    },
    languageCode: "en-US",
    units: "IMPERIAL",
  };

  if (process.env.NODE_ENV === "test" || GOOGLE_MAP_ROUTE_API_KEY !== "demogoogleapikey") {
    const response = await axios.post(GOOGLE_MAP_ROUTE_API_HOST, data, { headers });
    if (response.status >= 200 && response.status < 300) {
      return response.data.routes[0].distanceMeters;
    } else {
      return null;
    }
  } else {
    return randomInt(1000, 10000);
  }
};

export default getRouteDistance;
