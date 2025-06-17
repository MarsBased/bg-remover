# Pruebas de Rendimiento - Background Remover

Este directorio contiene las pruebas de rendimiento para el servicio de eliminación de fondos.

## Requisitos

- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) instalado globalmente
- Node.js y npm

## Configuración

1. Instala las dependencias:
```bash
npm install
```

## Ejecución de pruebas

Para ejecutar las pruebas, usa el siguiente comando:

```bash
k6 run load-test.ts -e BASE_URL=http://tu-api.com -e IMAGE_URL=http://tu-imagen.com/imagen.jpg
```

### Parámetros

- `BASE_URL`: URL base de la API (por defecto: http://localhost:3000)
- `IMAGE_URL`: URL de la imagen a procesar

## Resultados

Los resultados de las pruebas se guardan en el directorio `/performance/results/[timestamp]` con el siguiente formato:

```json
{
  "timestamp": "2024-03-21T10:00:00.000Z",
  "duration": 1234,
  "status": 200,
  "processedImage": "url-de-la-imagen-procesada"
}
```

## Escenarios de prueba

Las pruebas incluyen las siguientes etapas:

1. Smoke test (1 minuto, 10 usuarios)
2. Carga nominal (5 minutos, 50 usuarios)
3. Pico de carga (10 minutos, 100 usuarios)
4. Enfriamiento (5 minutos, 0 usuarios)

### Umbrales

- 95% de las peticiones deben completarse en menos de 5 segundos
- Tasa de error debe ser menor al 1% 