// Mock de "ayuda de IA" (Nivel 1) — sin backend ni llamadas HTTP (ver CLAUDE.md), así que la
// "mejora" es una normalización por reglas: no es generativa, pero produce un resultado visible
// y determinístico que demuestra el flujo completo (sugerir → revisar → aplicar).
const SINONIMOS_FORMALES: Record<string, string> = {
  bueno: 'adecuado', buena: 'adecuada', buenos: 'adecuados', buenas: 'adecuadas',
  malo: 'deficiente', mala: 'deficiente', cosa: 'elemento', cosas: 'elementos',
  hacer: 'ejecutar', mucho: 'significativo', mucha: 'significativa',
  muchos: 'numerosos', muchas: 'numerosas', grande: 'considerable', chico: 'reducido',
  chica: 'reducida', arreglar: 'rehabilitar', mejorar: 'optimizar', gente: 'población',
  problema: 'problemática', rapido: 'oportuno', rápido: 'oportuno', importante: 'prioritario',
};

function capitalizarOraciones(texto: string): string {
  return texto.replace(/(^\s*\w)|([.!?]\s+\w)/g, (m) => m.toUpperCase());
}

function reemplazarSinonimos(texto: string): string {
  return texto.replace(/\p{L}+/gu, (palabra) => {
    const reemplazo = SINONIMOS_FORMALES[palabra.toLowerCase()];
    if (!reemplazo) return palabra;
    const esMayuscula = palabra[0] === palabra[0].toUpperCase();
    return esMayuscula ? reemplazo[0].toUpperCase() + reemplazo.slice(1) : reemplazo;
  });
}

export function mejorarTexto(valor: string): string {
  let texto = valor.trim().replace(/\s+/g, ' ');
  if (!texto) return texto;
  texto = reemplazarSinonimos(texto);
  texto = capitalizarOraciones(texto);
  if (!/[.!?]$/.test(texto)) texto += '.';
  return texto;
}
