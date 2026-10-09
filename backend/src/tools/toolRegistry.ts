import getCurrentTime from "./timeTool";
import getWeather from "./weatherTool";

const toolRegistry: Record<string, Function> = {
  get_current_time: getCurrentTime,
  get_weather: getWeather,
};

export default toolRegistry;