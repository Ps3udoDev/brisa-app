export const brisaQuotes = [
  "¡Miauu! Hoy mis croquetas están en verde.",
  "¡Ahorra como yo ahorro energía para jugar!",
  "Tus ingresos subieron ¿doble ración de atún?",
  "Controla los egresos, humano. ¡Yo ya escondí tu calcetín!",
  "Presupuesto sano = ronroneo nivel experto.",
  "¡No gastes todo! Necesito juguetes nuevos.",
  "Mi consejo: invierte en siestas y croquetas.",
  "¡Tu saldo me hace mover la cola!",
  "Evita deudas como yo evito el baño.",
  "¡Gasta con cabeza, no como yo con el hilo!",
  "Finanzas en orden = más mimos para mí.",
  "¡Miauu! Sigamos ahorrando para mi palacio de cartón.",
];

export function getRandomBrisaQuote(): string {
  return brisaQuotes[Math.floor(Math.random() * brisaQuotes.length)];
}
