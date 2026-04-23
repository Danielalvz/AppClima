/**
 * Módulo de servicios para interactuar con la API de Open-Meteo.
 * Proporciona funciones para geocodificación y obtención de datos climáticos.
 * Maneja errores de red, respuestas HTTP y datos inválidos.
 */

// URLs de la API de Open-Meteo
const API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Obtiene las coordenadas (latitud, longitud) y detalles de una ciudad usando la API de geocodificación.
 * @param {string} city - Nombre de la ciudad a buscar.
 * @returns {Promise<Object>} Objeto con latitude, longitude, name y country de la primera coincidencia.
 * @throws {Error} Si la ciudad no se encuentra o hay un error de red/API.
 * @example
 * getCoordinates('Manizales'); // { latitude: 5.07, longitude: -75.52, name: 'Manizales', country: 'Colombia' }
 */
async function getCoordinates(city) {
    try {
        // Codifica el nombre de la ciudad para evitar problemas con caracteres especiales
        const response = await fetch(`${API_URL}?name=${encodeURIComponent(city)}&count=1&language=es`);
        const data = await response.json();
        
        // Verifica si hay resultados válidos
        if (!data.results || data.results.length === 0) {
            throw new Error('Ciudad no encontrada');
        }
        
        // Extrae y devuelve los datos de la primera coincidencia
        return {
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude,
            name: data.results[0].name,
            country: data.results[0].country
        };
    } catch (error) {
        // Propaga el error con un mensaje más descriptivo
        throw new Error(`Error al obtener coordenadas: ${error.message}`);
    }
}

/**
 * Obtiene datos climáticos actuales para unas coordenadas específicas usando la API de pronóstico.
 * @param {number} latitude - Latitud de la ubicación.
 * @param {number} longitude - Longitud de la ubicación.
 * @returns {Promise<Object>} Objeto con datos climáticos actuales (temperature_2m, weather_code, wind_speed_10m).
 * @throws {Error} Si hay un error de red/API o los datos no están disponibles.
 * @example
 * getWeather(5.07, -75.52); // { temperature_2m: 22, weather_code: 0, wind_speed_10m: 5 }
 */
async function getWeather(latitude, longitude) {
    try {
        // Construye la URL con parámetros para datos actuales
        const response = await fetch(
            `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
        );
        const data = await response.json();
        
        // Verifica que los datos climáticos existan
        if (!data.current_weather) {
            throw new Error('Datos de clima no disponibles');
        }
        
        // Devuelve solo los datos actuales (current_weather)
        return data.current_weather;
    } catch (error) {
        // Propaga el error con un mensaje más descriptivo
        throw new Error(`Error al obtener el clima: ${error.message}`);
    }
}

/**
 * Combina geocodificación y obtención de clima para una ciudad.
 * Primero obtiene coordenadas, luego datos climáticos.
 * @param {string} city - Nombre de la ciudad.
 * @returns {Promise<Object>} Objeto combinado con coordenadas y clima.
 * @throws {Error} Si falla la geocodificación o el clima.
 * @example
 * getWeatherByCity('Manizales'); // { latitude: 5.07, longitude: -75.52, name: 'Manizales', country: 'Colombia', temperature_2m: 22, ... }
 */
async function getWeatherByCity(city) {
    // Obtiene coordenadas primero
    const coordinates = await getCoordinates(city);
    // Luego obtiene clima con esas coordenadas
    const weather = await getWeather(coordinates.latitude, coordinates.longitude);
    // Combina ambos objetos usando spread operator
    return { ...coordinates, ...weather };
}


/**
 * Obtiene el pronóstico del clima para 5 días usando la API de Open-Meteo.
 * @param {number} latitude - Latitud de la ubicación.
 * @param {number} longitude - Longitud de la ubicación.
 * @returns {Promise<Array>} Array de objetos con pronóstico diario (fecha, temp_max, temp_min, weather_code).
 * @throws {Error} Si hay un error de red/API o los datos no están disponibles.
 */
async function get5DayForecast(latitude, longitude) {
    try {
        const response = await fetch(
            `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
        );
        
        if (!response.ok) {
            throw new Error(`Error HTTP en pronóstico: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.daily) {
            throw new Error('Datos de pronóstico no disponibles');
        }
        
        // Procesar los primeros 5 días
        const forecast = [];
        for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
            forecast.push({
                date: data.daily.time[i],
                temp_max: data.daily.temperature_2m_max[i],
                temp_min: data.daily.temperature_2m_min[i],
                weather_code: data.daily.weather_code[i]
            });
        }
        
        return forecast;
    } catch (error) {
        throw new Error(`Error al obtener pronóstico de 5 días: ${error.message}`);
    }
}

/**
 * Combina geocodificación, clima actual y pronóstico de 5 días para una ciudad.
 * @param {string} city - Nombre de la ciudad.
 * @returns {Promise<Object>} Objeto con coordenadas, clima actual y array de pronóstico.
 * @throws {Error} Si falla la geocodificación, clima o pronóstico.
 */
async function getWeatherAndForecastByCity(city) {
    const coordinates = await getCoordinates(city);
    
    // Obtener clima actual y pronóstico en paralelo
    const [weather, forecast] = await Promise.all([
        getWeather(coordinates.latitude, coordinates.longitude),
        get5DayForecast(coordinates.latitude, coordinates.longitude)
    ]);
    
    // Combinar: coordenadas + clima actual + forecast
    return { ...coordinates, ...weather, forecast };
}

// Export para tests en Node/Jest (no afecta el navegador)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        getCoordinates,
        getWeather,
        getWeatherByCity,
        get5DayForecast,
        getWeatherAndForecastByCity
    };
}

