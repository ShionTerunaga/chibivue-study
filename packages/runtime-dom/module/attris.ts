export function patchAttr(el: Element, rawName: string, value: unknown) {
  const name = rawName.toLowerCase();

  if (value == null) {
    el.removeAttribute(name);
  } else {
    const parsedValue = parseObject(value);
    el.setAttribute(name, parsedValue);
  }
}

function parseObject(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  let response: string = "";

  if (value === undefined) {
    return response;
  }

  if (typeof value !== "object") {
    return String(value);
  }

  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    console.log("key,val", key, val);

    const newKey = camelToKebab(key);

    response += `${newKey}:${val}; `;
  }

  return response;
}

export function camelToKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
