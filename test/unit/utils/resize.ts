export const windowResize = () => {
  global.innerWidth = 572;
  global.dispatchEvent(new Event("resize"));
};

export const windowResizeBack = () => {
  global.innerWidth = 1024;
  global.dispatchEvent(new Event("resize"));
};
