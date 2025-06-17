import http from "k6/http";
import { check, group, sleep } from "k6";

/* ───────────── Opciones de prueba ───────────── */
export const options = {
  scenarios: {
    // single_request: {
    //   executor: 'shared-iterations',
    //   vus: 1,
    //   iterations: 1,  // Solo una petición
    //   maxDuration: '10s',
    //   tags: { test_type: 'single' },
    // },
    medium_load: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 10,
      maxDuration: '5m',
      // startTime: '10s',
      tags: { test_type: 'medium' },
    },
    // high_load: {
    //   executor: 'constant-vus',
    //   vus: 100,
    //   duration: '10m',  // 10 minutos para 100 peticiones
    //   startTime: '7m10s',  // Comienza después del segundo test
    //   tags: { test_type: 'high' },
    // },
  },
  thresholds: {
    http_req_duration: ["p(95)<60000"], // p95 ≤ 60 segundos
    http_req_failed: ["rate<0.01"], // < 1% errores
  },
};

/* ───────────── Configuración global ───────────── */
const BASE_URL = "http://localhost:8000";
const IMAGE_URL = "https://e00-expansion.uecdn.es/assets/multimedia/imagenes/2021/05/19/16213755719771.jpg";

// Se ejecuta una vez al inicio
export async function setup() {
  // Verificar que la API está funcionando
  // const healthCheck = http.get(`${BASE_URL}/health`);
  // check(healthCheck, {
  //   "health check passed": (r) => r.status === 200,
  // });

  // // Obtener diagnóstico de la API
  // const diagnostics = http.get(`${BASE_URL}/diagnostics`);
  // console.log("API Diagnostics:", JSON.stringify(diagnostics.json(), null, 2));

  return { 
    data: { 
      testType: __ENV.TEST_TYPE || 'unknown'
    } 
  };
}

/* ───── Escenario principal ───── */
export default function ({ data }) {
  group("Procesar imagen", () => {
const url = `${BASE_URL}/remove-bg?image_url=${IMAGE_URL}`;
      //  const requests = [
      //      { method: 'POST', url: url },
      //      { method: 'POST', url: url },
      //      { method: 'POST', url: url },
      //      { method: 'POST', url: url },
      //      { method: 'POST', url: url },
      //      { method: 'POST', url: url },
      //      { method: 'POST', url: url },
      //      { method: 'POST', url: url },
      //  ];

       // Send them in parallel
      //  const responses = http.batch(requests);
    // const startTime = new Date().getTime();
    const r = http.post(`${BASE_URL}/remove-bg?image_url=${IMAGE_URL}`);
    // const endTime = new Date().getTime();
    // const duration = endTime - startTime;
   check(r, {
       'status is 200': (res) => res.status === 200,
       'response is image': (res) =>
           res.headers['Content-Type']?.includes('image/'),
   });
    
    // for (const r of Object.values(responses)) {  
    //   // console.log(r);
    //   check(r, {
    //     "status is 200": (res) => res.status === 200,
    //     "response is image": (res) => res.headers["Content-Type"]?.includes("image/"),
    //   });
    // }

    // Imprimir tiempo de cada petición
    // console.log(JSON.stringify({
    //   timestamp: new Date().toISOString(),
    //   testType: data.testType,
    //   // duration: duration,
    //   // status: r.status,
    //   responseSize: r.body.length,
    //   requestId: Math.random().toString(36).substring(7)
    // }));
  });

  // sleep(1); // pequeña pausa entre iteraciones
} 