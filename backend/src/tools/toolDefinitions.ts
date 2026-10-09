export const getCurrentTimeTool = {
  type: "function",
  name: "get_current_time",

  description:
    "Gets the current date and time from the application server.",

  parameters: {
    type: "object",
    properties: {},
  },
};

export const getWeatherTool = {
  type: "function",
  name: "get_weather",

  description:
    "Gets the current weather information for a city.",

  parameters: {
    type: "object",

    properties: {
      city: {
        type: "string",
        description: "The name of the city.",
      },
    },

    required: ["city"],
  },
};