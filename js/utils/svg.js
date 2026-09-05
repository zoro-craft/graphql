const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

// Create an SVG element with the given attributes.
export function svgElement(name, attributes) {
  const element = document.createElementNS(SVG_NAMESPACE, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  return element;
}