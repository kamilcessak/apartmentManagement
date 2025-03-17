export const getApartmentIdFromAddress = (address: string) => {
  const cleanAddress = address.replace(/^ul\.\s+/i, "");

  const parts = cleanAddress.split(",")[0].trim();

  const matches = parts.match(/([^\d]+)(\d+(?:\/\d+)?)/);

  if (!matches) return "";

  const streetName = matches[1].trim();
  const streetNumber = matches[2];

  const words = streetName.split(" ");
  const lastWord = words[words.length - 1];

  return (lastWord + streetNumber).toLowerCase();
};
