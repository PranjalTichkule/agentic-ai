const getCurrentTime = () => {
  return {
    currentTime: new Date().toISOString(),
  };
};

export default getCurrentTime;