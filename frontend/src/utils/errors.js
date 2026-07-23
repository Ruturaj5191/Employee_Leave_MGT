export function extractErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;
  if (!data) return fallback;

  if (data.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const firstVal = data.errors[firstKey];
    const msg = Array.isArray(firstVal) ? firstVal[0] : firstVal;
    if (msg) return msg;
  }

  if (data.detail) return data.detail;
  return fallback;
}
