
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const server = new McpServer({
  name: "time-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "get_current_time",
  {
    description:
      "Get the current date and time for a given timezone.",
    inputSchema: {
      timezone: z
        .string()
        .describe(
          "IANA timezone, for example Asia/Kolkata or UTC"
        ),
    },
  },
  async ({ timezone }) => {
    try {
      const now = new Date();

      const formattedTime = new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: timezone,
          dateStyle: "full",
          timeStyle: "long",
        }
      ).format(now);

      return {
        content: [
          {
            type: "text",
            text: `Current time in ${timezone}: ${formattedTime}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Invalid timezone: ${timezone}`,
          },
        ],
      };
    }
  }
);


server.registerTool(
  "get_weather",
  {
    description:
      "Get the current weather information for a given city.",
    inputSchema: {
      city: z
        .string()
        .describe(
          "Name of the city, for example Pune or Mumbai"
        ),
    },
  },
  async ({ city }) => {
    try {
      // Step 1: Find latitude and longitude for the city
      const geocodingUrl =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=en` +
        `&format=json`;

      const geocodingResponse =
        await fetch(geocodingUrl);

      if (!geocodingResponse.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `Failed to find location for ${city}.`,
            },
          ],
        };
      }

      const geocodingData =
        await geocodingResponse.json();

      const location =
        geocodingData.results?.[0];

      if (!location) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `Location not found for ${city}.`,
            },
          ],
        };
      }

      // Step 2: Get current weather
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${location.latitude}` +
        `&longitude=${location.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&timezone=auto`;

      const weatherResponse =
        await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `Failed to retrieve weather for ${city}.`,
            },
          ],
        };
      }

      const weatherData =
        await weatherResponse.json();

      const current =
        weatherData.current;

      if (!current) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `Current weather data is unavailable for ${city}.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              city: location.name,
              country: location.country,
              temperature:
                `${current.temperature_2m}°C`,
              humidity:
                `${current.relative_humidity_2m}%`,
              windSpeed:
                `${current.wind_speed_10m} km/h`,
              weatherCode:
                current.weather_code,
              observedAt:
                current.time,
            }),
          },
        ],
      };
    } catch (error) {
      console.error(
        "Weather API error:",
        error
      );

      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              "Unable to retrieve current weather.",
          },
        ],
      };
    }
  }
);

async function main() {
  await serveStdio(() => server);
}

main().catch((error) => {
  console.error("MCP server failed:", error);
  process.exit(1);
});