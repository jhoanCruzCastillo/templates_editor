import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook que implementa scroll-spy bidireccional para el índice de secciones.
 * Usa IntersectionObserver para detectar qué sección está visible
 * y permite hacer scroll suave al hacer clic en el índice.
 */
export function useScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;

        // Encontrar la sección cuyo encabezado esté más cerca del tope del viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.getAttribute('data-section-id'));
        }
      },
      {
        root: container,
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = container.querySelector(`[data-section-id="${id}"]`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const container = containerRef.current;
      if (!container) return;

      const el = container.querySelector(`[data-section-id="${sectionId}"]`);
      if (!el) return;

      isClickScrolling.current = true;
      setActiveId(sectionId);

      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Liberar el bloqueo tras terminar la animación de scroll
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    },
    []
  );

  return { activeId, containerRef, scrollToSection };
}
