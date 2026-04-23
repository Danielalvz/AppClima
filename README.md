# Weather App

## Resumen

Aplicación simple en JavaScript que permite al usuario ingresar el nombre de una ciudad y obtiene datos meteorológicos usando la API de Open-Meteo. La app consulta primero la API de geocodificación para obtener latitud y longitud, luego obtiene el pronóstico actual y muestra temperatura, viento, humedad y un Pokémon asociado según la temperatura.

## Estructura del proyecto

```
weather-app
├── src
│   ├── index.html
│   ├── index.js
│   ├── api
│   │   └── weatherService.js
│   ├── styles
│   │   └── style.css
│   └── images
│       └── pokopia.jpeg
├── tests
│   ├── weatherService.test.js
│   └── index.test.js
├── package.json
├── package-lock.json
└── README.md
```

## Instalación

1. Abre la terminal en el directorio del proyecto:
   ```bash
   cd c:\Users\danus\Documents\Generation\IA\app-clima\weather-app
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación:
   ```bash
   npm start
   ```

4. Abre el navegador en la URL que muestre `live-server` (por ejemplo `http://127.0.0.1:8080`).

## Uso

1. En el navegador, escribe el nombre de una ciudad en el campo de búsqueda.
2. Presiona `Buscar` o la tecla `Enter`.
3. La aplicación:
   - consulta la API de geocodificación de Open-Meteo para obtener latitud y longitud,
   - consulta la API de pronóstico de Open-Meteo con esas coordenadas,
   - muestra temperatura, velocidad del viento, humedad y un Pokémon según la temperatura.

## Ejemplo de resultados

- Ciudad: `Manizales`
- Resultado esperado:
  - `Manizales, Colombia`
  - `22°C`
  - `Viento: 5 km/h`
  - `Humedad: 72%` (o valor similar)
  - Pokémon correspondiente a la temperatura mostrada

## Funcionalidades

- Entrada de ciudad por parte del usuario
- Consulta de coordenadas con Open-Meteo Geocoding
- Consulta de pronóstico con Open-Meteo Forecast
- Manejo de errores para ciudad inválida o fallo de API
- Visualización de resultados en formato amigable
- Fondo local de Poképolis (`pokopia.jpeg`)
- Pokémon mostrado según temperatura:
  - menos de 15°C → Pokémon de agua
  - entre 15°C y 20°C → Pokémon de viento
  - más de 20°C → Pokémon de fuego

## Pruebas

Para ejecutar las pruebas con Jest:

```bash
npm test
```

## Mejoras futuras

- Validar mejor la entrada de la ciudad (espacios, acentos, nombres largos)
- Mostrar más datos del clima: descripción, presión, probabilidad de lluvia
- Añadir animación o spinner durante la carga
- Implementar cache local para reducir llamadas a la API
- Usar módulos ES6 (`import` / `export`)
- Hacer la interfaz completamente responsive
- Mostrar varias coincidencias de ciudad y permitir elegir la correcta
```# Weather App

## Resumen

Aplicación simple en JavaScript que permite al usuario ingresar el nombre de una ciudad y obtiene datos meteorológicos usando la API de Open-Meteo. La app consulta primero la API de geocodificación para obtener latitud y longitud, luego obtiene el pronóstico actual y muestra temperatura, viento, humedad y un Pokémon asociado según la temperatura.

## Estructura del proyecto

```
weather-app
├── src
│   ├── index.html
│   ├── index.js
│   ├── api
│   │   └── weatherService.js
│   ├── styles
│   │   └── style.css
│   └── images
│       └── pokopia.jpeg
├── tests
│   ├── weatherService.test.js
│   └── index.test.js
├── package.json
├── package-lock.json
└── README.md
```

## Instalación

1. Abre la terminal en el directorio del proyecto:
   ```bash
   cd c:\Users\danus\Documents\Generation\IA\app-clima\weather-app
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación:
   ```bash
   npm start
   ```

4. Abre el navegador en la URL que muestre `live-server` (por ejemplo `http://127.0.0.1:8080`).

## Uso

1. En el navegador, escribe el nombre de una ciudad en el campo de búsqueda.
2. Presiona `Buscar` o la tecla `Enter`.
3. La aplicación:
   - consulta la API de geocodificación de Open-Meteo para obtener latitud y longitud,
   - consulta la API de pronóstico de Open-Meteo con esas coordenadas,
   - muestra temperatura, velocidad del viento, humedad y un Pokémon según la temperatura.

## Ejemplo de resultados

- Ciudad: `Manizales`
- Resultado esperado:
  - `Manizales, Colombia`
  - `22°C`
  - `Viento: 5 km/h`
  - `Humedad: 72%` (o valor similar)
  - Pokémon correspondiente a la temperatura mostrada

## Funcionalidades

- Entrada de ciudad por parte del usuario
- Consulta de coordenadas con Open-Meteo Geocoding
- Consulta de pronóstico con Open-Meteo Forecast
- Manejo de errores para ciudad inválida o fallo de API
- Visualización de resultados en formato amigable
- Fondo local de Poképolis (`pokopia.jpeg`)
- Pokémon mostrado según temperatura:
  - menos de 15°C → Pokémon de agua
  - entre 15°C y 20°C → Pokémon de viento
  - más de 20°C → Pokémon de fuego

## Pruebas

Para ejecutar las pruebas con Jest:

```bash
npm test
```

## Mejoras futuras

- Validar mejor la entrada de la ciudad (espacios, acentos, nombres largos)
- Mostrar más datos del clima: descripción, presión, probabilidad de lluvia
- Añadir animación o spinner durante la carga
- Implementar cache local para reducir llamadas a la API
- Usar módulos ES6 (`import` / `export`)
- Hacer la interfaz completamente responsive
- Mostrar varias coincidencias de ciudad y permitir elegir la correcta
