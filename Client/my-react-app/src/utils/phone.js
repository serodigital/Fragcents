// Accepts 072 043 1327, 0720431327, +27720431327 or 27720431327.
// Returns the number as 0720431327, or null if it isn't valid.
export const normalizePhone = (value) => {
  if (!value) return null;
  let digits = String(value).replace(/[\s\-().]/g, "");
  if (digits.startsWith("+27")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("0027")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("27") && digits.length === 11)
    digits = "0" + digits.slice(2);
  return /^0\d{9}$/.test(digits) ? digits : null;
};
