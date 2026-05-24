function rgbToHex(rgb) {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) {
    const matchRgba = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
    if (matchRgba && parseFloat(matchRgba[4]) === 0) return null;
    if (matchRgba) return `#${hexPart(matchRgba[1])}${hexPart(matchRgba[2])}${hexPart(matchRgba[3])}`;
    return null;
  }
  return `#${hexPart(match[1])}${hexPart(match[2])}${hexPart(match[3])}`;
}

function hexPart(v) {
  return parseInt(v).toString(16).padStart(2, '0');
}
