interface Invoker extends EventListener {
  value: EventValue;
}

type EventValue = Function;

export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
) {
  el.addEventListener(event, handler);
}

export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
) {
  el.removeEventListener(event, handler);
}

export function patchEvent(
  el: Element & { _val?: Record<string, Invoker | undefined> },
  rawName: string,
  value: EventValue | null,
) {
  const invokers = el._val || (el._val = {});
  const existingInvoker = invokers[rawName];

  if (value && existingInvoker) {
    existingInvoker.value = value;
  } else {
    const name = parseName(rawName);

    if (value) {
      const invoker = (invokers[rawName] = createInvoker(value));

      addEventListener(el, name, invoker);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker);
      invokers[rawName] = undefined;
    }
  }
}

function parseName(rawName: string) {
  return rawName.slice(2).toLowerCase();
}

function createInvoker(initialValue: EventValue) {
  const invoker: Invoker = (e: Event) => {
    invoker.value(e);
  };

  invoker.value = initialValue;

  return invoker;
}
