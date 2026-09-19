import type { KeyboardEvent } from 'react';

const SELECTOR = 'input:not([type="hidden"]), select, textarea';

/**
 * Avanza con Enter al siguiente campo del mismo formulario (o contenedor
 * marcado con `data-campos`). En el último campo no evita el comportamiento
 * por defecto, por lo que un formulario real se puede enviar con Enter.
 * En textareas Enter conserva su función de salto de línea.
 */
export function siguienteCampo(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== 'Enter' || e.shiftKey) return;
  const actual = e.target as HTMLElement;
  if (actual.tagName === 'TEXTAREA') return;

  const contenedor = actual.closest('form, [data-campos]') ?? document.body;
  const campos = Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR))
    .filter(el => !(el as HTMLInputElement).disabled);

  const idx = campos.indexOf(actual);
  if (idx >= 0 && idx < campos.length - 1) {
    e.preventDefault();
    campos[idx + 1].focus();
  }
}