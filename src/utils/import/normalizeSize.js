const normalizeSize = (
  size = ""
) => {

  return String(size)
    .trim()
    .toUpperCase()

    .replace(/MONTHS/g, "M")

    .replace(/YEARS/g, "Y")

    .replace(/\s+/g, "")

    .replace(/[^A-Z0-9\-]/g, "");
};

export default normalizeSize;