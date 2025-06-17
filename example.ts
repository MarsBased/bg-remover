import http from "k6/http";
import { check, group, sleep } from "k6";

/* ───────────── Opciones de prueba ───────────── */
export const options = {
  stages: [
    { duration: "1m", target: 10 }, // Smoke
    { duration: "5m", target: 100 }, // Carga nominal
    { duration: "10m", target: 300 }, // Pico esperado
    // { duration: "5m", target: 1000 }, // Sobrecarga
    // { duration: "5m", target: 0 }, // Enfriamiento
  ],
  thresholds: {
    http_req_duration: ["p(95)<400"], // p95 ≤ 300 ms
    http_req_failed: ["rate<0.001"], // < 0,1 % errores
  },
};

/* ───────────── Configuración global ───────────── */
const BASE_URL = __ENV.BASE_URL || "https://api.nievesenergia.com/v1";

// Se ejecuta una vez.
export async function setup() {
  const r = http.post(
    `${BASE_URL}/auth/validate`,
    JSON.stringify({
      phone: "+34666110000",
      verificationCode: "666666",
      bypassSms: true,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  const accessToken = r.json("accessToken");
  return { data: { accessToken } };
}

/* ───── Escenario principal ───── */
export default function ({ data }) {
  const params = {
    headers: {
      Authorization: `Bearer ${data.accessToken}`,
      ["X-Rate-Limit-Bypass"]: "true",
    },
  };

  // group("Listar estaciones", () => {
  //   const r = http.post(`${BASE_URL}/stations`, undefined, params);
  //   check(r, { "200": (res) => res.status === 200 });
  // });

  group("Obtener otp", () => {
    const CARD_ID = "7005812187170053";
    const r = http.get(`${BASE_URL}/cards/${CARD_ID}/otp`, params);
    check(r, { "200": (res) => res.status === 200 });
  });

  sleep(1); // pequeña pausa entre iteraciones
}