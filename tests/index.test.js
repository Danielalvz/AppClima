/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

describe('index.js UI', () => {
    let handleSearch;
    let weatherResult;

    beforeEach(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../src/index.html'), 'utf8');
        document.documentElement.innerHTML = html;

        global.getCoordinates = jest.fn();
        global.getWeather = jest.fn();

        jest.resetModules();
        const app = require('../src/index.js');
        handleSearch = app.handleSearch;
        weatherResult = document.getElementById('weatherResult');
    });

    it('debería tratar el input solo con espacios como vacío', async () => {
        document.getElementById('cityInput').value = '   ';
        await handleSearch();
        expect(weatherResult.textContent).toContain('Por favor ingresa un nombre de ciudad');
    });

    it('debería limpiar el mensaje anterior al buscar otra ciudad', async () => {
        weatherResult.innerHTML = '<p class="error">Error previo</p>';

        global.getCoordinates.mockResolvedValue({
            latitude: 5.07,
            longitude: -75.52,
            name: 'Manizales',
            country: 'Colombia'
        });
        global.getWeather.mockResolvedValue({
            temperature_2m: 22,
            weather_code: 0,
            wind_speed_10m: 5
        });

        document.getElementById('cityInput').value = 'Manizales';
        await handleSearch();

        expect(weatherResult.textContent).not.toContain('Error previo');
        expect(weatherResult.textContent).toContain('Manizales, Colombia');
    });

    it('debería mostrar Squirtle cuando la temperatura es menor a 15°C', async () => {
        global.getCoordinates.mockResolvedValue({
            latitude: 5.07,
            longitude: -75.52,
            name: 'Manizales',
            country: 'Colombia'
        });
        global.getWeather.mockResolvedValue({
            temperature_2m: 10,
            weather_code: 0,
            wind_speed_10m: 5
        });

        document.getElementById('cityInput').value = 'Manizales';
        await handleSearch();

        expect(weatherResult.innerHTML).toContain('Squirtle');
    });

    it('debería mostrar Charizard cuando la temperatura es mayor a 20°C', async () => {
        global.getCoordinates.mockResolvedValue({
            latitude: 5.07,
            longitude: -75.52,
            name: 'Manizales',
            country: 'Colombia'
        });
        global.getWeather.mockResolvedValue({
            temperature_2m: 25,
            weather_code: 0,
            wind_speed_10m: 5
        });

        document.getElementById('cityInput').value = 'Manizales';
        await handleSearch();

        expect(weatherResult.innerHTML).toContain('Charizard');
        });

    it('debería mostrar mensaje de error cuando el input está vacío', async () => {
        document.getElementById('cityInput').value = '';
        await handleSearch();
        expect(weatherResult.textContent).toContain('Por favor ingresa un nombre de ciudad');
    });

    it('debería mostrar el clima cuando getCoordinates y getWeather funcionan', async () => {
        global.getCoordinates.mockResolvedValue({
            latitude: 5.07,
            longitude: -75.52,
            name: 'Manizales',
            country: 'Colombia'
        });

        global.getWeather.mockResolvedValue({
            temperature_2m: 22,
            weather_code: 0,
            wind_speed_10m: 5
        });

        document.getElementById('cityInput').value = 'Manizales';
        await handleSearch();

        expect(global.getCoordinates).toHaveBeenCalledWith('Manizales');
        expect(global.getWeather).toHaveBeenCalledWith(5.07, -75.52);
        expect(weatherResult.textContent).toContain('Manizales, Colombia');
        expect(weatherResult.textContent).toContain('22°C');
    });

    it('debería mostrar error cuando la API falla', async () => {
        global.getCoordinates.mockRejectedValue(new Error('Server error'));
        document.getElementById('cityInput').value = 'Manizales';
        await handleSearch();
        expect(weatherResult.textContent).toContain('Server error');
    });
});