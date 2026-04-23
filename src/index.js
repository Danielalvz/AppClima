/**
 * Archivo principal de la aplicación del clima.
 * Maneja la interacción del usuario, llamadas a la API y renderizado de resultados.
 * Incluye lógica para seleccionar Pokémon según la temperatura.
 */

// Función para obtener coordenadas y clima de una ciudad
async function getWeatherByCity(city) {
    const coordinates = await getCoordinates(city);
    const weather = await getWeather(coordinates.latitude, coordinates.longitude);
    return { ...coordinates, ...weather };
}

/**
 * Selecciona un Pokémon basado en la temperatura.
 * @param {number} temp - La temperatura en grados Celsius.
 * @returns {Object} Objeto con nombre, id y tipo del Pokémon.
 * @example
 * getPokemonByTemperature(10); // { name: 'Squirtle', id: 7, type: 'water' }
 */
function getPokemonByTemperature(temp) {
    if (temp < 15) {
        return { name: 'Squirtle', id: 7, type: 'water' };
    } else if (temp >= 15 && temp < 20) {
        return { name: 'Pidgeot', id: 18, type: 'wind' };
    } else {
        return { name: 'Charizard', id: 6, type: 'fire' };
    }
}

/**
 * Genera la URL de la imagen de un Pokémon desde PokeAPI.
 * @param {number} pokemonId - El ID del Pokémon en PokeAPI.
 * @returns {string} URL de la imagen oficial del Pokémon.
 */
function getPokemonImageUrl(pokemonId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

/**
 * Almacena datos en caché (multiplataforma: localStorage en browser, Map en Node).
 * @param {string} key - Clave para el cache.
 * @param {Object} data - Datos a almacenar.
 */
function setCachedWeather(key, data) {
    const cacheData = { data, timestamp: Date.now() };
    if (typeof localStorage !== 'undefined') {
        // Browser: usa localStorage
        localStorage.setItem(key, JSON.stringify(cacheData));
    } else {
        // Node.js o entornos sin localStorage: usa Map global
        if (!global.weatherCache) global.weatherCache = new Map();
        global.weatherCache.set(key, cacheData);
    }
}

/**
 * Obtiene datos del caché si son válidos (menos de 1 hora).
 * @param {string} key - Clave para el cache.
 * @returns {Object|null} Datos cacheados o null si expiraron/no existen.
 */
function getCachedWeather(key) {
    let cached;
    if (typeof localStorage !== 'undefined') {
        // Browser
        const item = localStorage.getItem(key);
        cached = item ? JSON.parse(item) : null;
    } else {
        // Node.js
        if (!global.weatherCache) return null;
        cached = global.weatherCache.get(key) || null;
    }
    
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) { // 1 hora
        return cached.data;
    }
    return null; // Expirado o no encontrado
}

function getWeatherIcon(code) {
    const icons = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
        71: '❄️', 73: '❄️', 75: '❄️', 95: '⛈️'
    };
    return icons[code] || '🌤️';
}


// Elementos del DOM para interactuar con la UI
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');
const pokemonBg = document.querySelector('.pokemon-bg');
const forecastCheck = document.getElementById('forecastCheck'); 

// Event listeners para botones y teclado
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

/**
 * Maneja la búsqueda de clima al hacer clic o presionar Enter.
 * Valida entrada, muestra loading, obtiene datos y renderiza resultados o errores.
 */
async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Por favor ingresa un nombre de ciudad');
        return;
    }
    
    // Verificar cache (puedes extender para incluir forecast)
    const cacheKey = `weather_${city.toLowerCase()}`;
    const cachedData = getCachedWeather(cacheKey);
    if (cachedData && !forecastCheck.checked) { // Solo usa cache si no pide forecast
        const pokemon = getPokemonByTemperature(cachedData.temperature);
        const pokemonImageUrl = getPokemonImageUrl(pokemon.id);
        displayWeather(cachedData, pokemon, pokemonImageUrl);
        return;
    }
    
    weatherResult.innerHTML = '<p class="loading">Cargando...</p>';
    
    try {
        let data;
        if (forecastCheck.checked) {
            // Obtener pronóstico de 5 días
            const result = await getWeatherAndForecastByCity(city);
            data = result;
        } else {
            // Obtener solo clima actual
            data = await getWeatherByCity(city);
        }
        
        // Guardar en cache (solo clima actual)
        if (!forecastCheck.checked) {
            setCachedWeather(cacheKey, data);
        }
        
        const pokemon = getPokemonByTemperature(data.temperature);
        const pokemonImageUrl = getPokemonImageUrl(pokemon.id);
        displayWeather(data, pokemon, pokemonImageUrl);
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Renderiza los datos del clima y el Pokémon en la UI.
 * Si hay forecast, muestra los 5 días.
 * @param {Object} data - Datos combinados de coordenadas y clima.
 * @param {Object} pokemon - Objeto del Pokémon seleccionado.
 * @param {string} pokemonImageUrl - URL de la imagen del Pokémon.
 */
function displayWeather(data, pokemon, pokemonImageUrl) {
    changePokemonBackground(pokemon.type);
    
    let forecastHtml = '';
    if (data.forecast) {
        forecastHtml = `
            <h3>Pronóstico de 5 días:</h3>
            <ul class="forecast-list">
                ${data.forecast.map(day => {
                    const icon = getWeatherIcon(day.weather_code); // Nueva función
                    return `
                        <li>
                            <strong>${new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                            <span class="temp">Máx ${day.temp_max}°C, Mín ${day.temp_min}°C</span>
                            <span class="condition">${icon} ${getWeatherDescription(day.weather_code)}</span>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
    }
    
    const html = `
        <div class="weather-card">
            <h2>${data.name}, ${data.country}</h2>
            <div class="temperature">${data.temperature}°C</div>
            <div class="wind">Viento: ${data.windspeed} km/h</div>
            ${forecastHtml}
            <div class="pokemon-container">
                <img src="${pokemonImageUrl}" alt="${pokemon.name}" class="pokemon-image">
                <p class="pokemon-name">${pokemon.name}</p>
            </div>
        </div>
    `;
    weatherResult.innerHTML = html;
}

/**
 * Obtiene una descripción simple del clima basada en el código.
 * @param {number} code - Código del clima de Open-Meteo.
 * @returns {string} Descripción del clima.
 */
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Despejado',
        1: 'Mayormente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna intensa',
        56: 'Llovizna helada ligera',
        57: 'Llovizna helada intensa',
        61: 'Lluvia ligera',
        63: 'Lluvia moderada',
        65: 'Lluvia intensa',
        66: 'Lluvia helada ligera',
        67: 'Lluvia helada intensa',
        71: 'Nieve ligera',
        73: 'Nieve moderada',
        75: 'Nieve intensa',
        77: 'Granizo',
        80: 'Lluvia ligera intermitente',
        81: 'Lluvia moderada intermitente',
        82: 'Lluvia intensa intermitente',
        85: 'Nieve ligera intermitente',
        86: 'Nieve intensa intermitente',
        95: 'Tormenta',
        96: 'Tormenta con granizo ligero',
        99: 'Tormenta con granizo intenso'
    };
    return descriptions[code] || 'Desconocido';
}
/**
 * Cambia el fondo de la página según el tipo de Pokémon.
 * @param {string} type - Tipo del Pokémon ('water', 'wind', 'fire').
 */
function changePokemonBackground(type) {
    if (type === 'water') {
        pokemonBg.style.backgroundImage = 'url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png")';
        pokemonBg.classList.add('water-bg');
        pokemonBg.classList.remove('wind-bg', 'fire-bg');
    } else if (type === 'wind') {
        pokemonBg.style.backgroundImage = 'url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png")';
        pokemonBg.classList.add('wind-bg');
        pokemonBg.classList.remove('water-bg', 'fire-bg');
    } else if (type === 'fire') {
        pokemonBg.style.backgroundImage = 'url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png")';
        pokemonBg.classList.add('fire-bg');
        pokemonBg.classList.remove('water-bg', 'wind-bg');
    }
}

/**
 * Muestra un mensaje de error en la UI y limpia el fondo.
 * @param {string} message - Mensaje de error a mostrar.
 */
function showError(message) {
    weatherResult.innerHTML = `<p class="error">❌ ${message}</p>`;
    pokemonBg.style.backgroundImage = 'none';
    pokemonBg.classList.remove('water-bg', 'wind-bg', 'fire-bg');
}

// Export para tests (solo si se usa Node/Jest)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        handleSearch,
        showError,
        displayWeather,
        getPokemonByTemperature
    };
}