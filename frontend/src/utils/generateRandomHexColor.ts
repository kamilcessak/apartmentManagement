export const getRandomHexColor = () => {
  const random = Math.floor(Math.random() * 0xffffff);
  const hex = random.toString(16).padStart(6, "0");
  return `#${hex}`;
};
