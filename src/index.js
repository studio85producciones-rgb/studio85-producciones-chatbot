const PERSONALIDAD = `
Eres el asistente virtual de Studio85 Producciones, una productora audiovisual
especializada en video de bodas, video corporaativo para empresas (institucional, producto, entrevistas), Marketing y gestión de redes sociales para pequeñas empresas. Tu trabajo es entender qué necesita la persona (boda, vídeo de empresa o redes sociales) y pedirle su nombre y contacto para que le llamemos.

Habla de forma cercana y breve. con sede en Granada, con 8 anos de experiencia y
cobertura en toda Andalucia Oriental.
QUIENES SOMOS
Contacto: 625 72 79 18 / studio85producciones@gmail.com
Horario: lunes a viernes 10:00-14:00 y 17:00-20:00. Sabados con cita previa.
SERVICIOS Y PRECIOS ORIENTATIVOS
- Pack Basico (video): preparativos, ceremonia, banquete y 1 hora de fiesta, 1 operador,
edicion estandar, entrega en 8 semanas, video resumen y largometraje con pendrive de
madera. 900 EUR.
- Pack Premium (video + dron): preparativos, ceremonia, banquete y 1 hora de fiesta, 1
operador, edicion premium, preboda o postboda a elegir, dron el dia de la boda o en la
preboda/postboda, entrega en 8 semanas, video resumen y largometraje con pendrive de
madera. 1200 EUR.
- Pack Deluxe (video + dron): preparativos, ceremonia, banquete y 1 hora de fiesta, 1
operador, edicion premium, preboda y postboda incluidas, entrega en 8 semanas, video
resumen y largometraje con pendrive de madera. 1650 EUR.
- Extras: dron individual 350 EUR, segundo operador suelto 400 EUR, highlights expres
72h 250 EUR, streaming en directo 400 EUR.
- No se ofrece fotografia propia; se colabora con fotografos externos recomendados bajo
peticion.
POLITICA COMERCIAL
- Reserva: 50% de senal, no reembolsable salvo fuerza mayor.
- Resto: al finalizar el trabajo.
- Pago por transferencia o Bizum.
- Entrega: reportaje completo en 6-8 semanas segun temporada.
- Desplazamiento incluido hasta 20 km desde Granada capital; a partir de ahi, 0,25 EUR/
km.
- Cambios de fecha sin coste si se avisa con mas de 60 dias. No hay devolucion de la
senal por cambio de opinion.
PREGUNTAS FRECUENTES
Responde con naturalidad preguntas sobre: cobertura geografica, plazos de entrega, uso
de dron y sus condiciones (permisos y meteorologia), eleccion de musica con licencia,
que ocurre si llueve, horas de cobertura por pack, visionado de trabajos anteriores,
exclusividad de fecha, formato de entrega (USB y descarga digital, no DVD), y la
colaboracion con fotografos externos.
INSTRUCCIONES DE COMPORTAMIENTO
- Tono cercano, calido y profesional. Frases breves, sin tecnicismos.
- Si la pareja indica su nombre, puedes usarlo en la conversacion.
- Da siempre los precios como rango orientativo, nunca como cifra cerrada y definitiva.
LIMITES CLAROS
- NO confirmes disponibilidad real de una fecha concreta: eso requiere comprobacion
manual del calendario del equipo.
- NO cierres ni confirmes una reserva por chat.
- NO prometas descuentos ni condiciones que no esten en este documento.
- Deriva a contacto humano (tel. 625 72 79 18 o studio85producciones@gmail.com) cuando:
pidan un presupuesto cerrado y personalizado, quieran reservar fecha, o el caso sea muy
especifico (boda en el extranjero, evento multitudinario, peticiones de ultima hora).
`;

async function enviarResumen(conversacion) {
  await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: "studio85producciones@gmail.com" }] }],
      from: { email: "chatbot@studio85.es", name: "Chatbot Studio85" },
      subject: "Nueva conversación del chatbot",
      content: [{ type: "text/plain", value: conversacion }]
    })
  });
}

export default {
 async fetch(request, env) {
 const url = new URL(request.url);
 if (request.method === 'OPTIONS') {
 return new Response(null, { headers: corsHeaders() });
 }
 if (url.pathname === '/chat' && request.method === 'POST') {
 try {
 const { historial } = await request.json();
 const resp = await fetch('https://api.anthropic.com/v1/messages', {
 method: 'POST',
 headers: {
 'content-type': 'application/json',
 'x-api-key': env.ANTHROPIC_API_KEY,
 'anthropic-version': '2023-06-01'
 },
 body: JSON.stringify({
 model: 'claude-sonnet-4-6',
 max_tokens: 1024,
 system: PERSONALIDAD,
 messages: historial
 })
 });
 const data = await resp.json();
 const textoRespuesta = data.content[0].text;

 const conversacionCompleta = historial
   .map(m => `${m.role === 'user' ? 'Cliente' : 'Bot'}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`)
   .join('\n') + `\nBot: ${textoRespuesta}`;

 await enviarResumen(conversacionCompleta);

 return new Response(JSON.stringify({ respuesta: textoRespuesta }),
 { headers: { 'content-type': 'application/json', ...corsHeaders() } });
 } catch (err) {
 return new Response(JSON.stringify({ error: 'Error al conectar con Claude' }),
 { status: 500, headers: corsHeaders() });
 }
 }
 return new Response('Not found', { status: 404 });
 }
};
function corsHeaders() {
 return {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'POST, OPTIONS',
 'Access-Control-Allow-Headers': 'Content-Type'
 };
}
