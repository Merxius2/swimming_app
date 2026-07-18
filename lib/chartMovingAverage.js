/** Append a simple moving average column to chart rows. */
export function addMovingAverage(data, valueKey, windowSize = 3, outputKey = `${valueKey}Ma`) {
  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map((point, index) => {
    const window = data.slice(Math.max(0, index - windowSize + 1), index + 1);
    const values = window
      .map((entry) => entry[valueKey])
      .filter((value) => value != null && !Number.isNaN(value));

    const average = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;

    return { ...point, [outputKey]: average };
  });
}
