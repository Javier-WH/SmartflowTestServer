import type { ContainerElement } from '../types/componets';

export const sortByOrder = (a: ContainerElement, b: ContainerElement): number => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;

    const isOrderAValid = orderA > 0;
    const isOrderBValid = orderB > 0;

    // Ambos válidos: ordenar ascendente
    if (isOrderAValid && isOrderBValid) {
        return orderA - orderB;
    }

    // Solo A es válido: A va antes (-1)
    if (isOrderAValid && !isOrderBValid) {
        return -1;
    }

    // Solo B es válido: B va antes (1)
    if (!isOrderAValid && isOrderBValid) {
        return 1;
    }

    // Ninguno es válido: mantener orden relativo (0)
    return 0;
};
  