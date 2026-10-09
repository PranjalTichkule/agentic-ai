const getWeather = async ({ city }: { city: string }) => {
  return {
    city,
    temperature: 28,
    condition: "Partly cloudy",
    humidity: 65,
  };
};

export default getWeather;