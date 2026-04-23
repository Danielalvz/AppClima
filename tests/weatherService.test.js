const { getCoordinates, getWeather, getWeatherByCity } = require('../src/api/weatherService');

// Mock global de fetch
global.fetch = jest.fn();

describe('weatherService', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe('getCoordinates', () => {
        it('debería devolver coordenadas para una ciudad válida', async () => {
            fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    results: [{
                        latitude: 5.07,
                        longitude: -75.52,
                        name: 'Manizales',
                        country: 'Colombia'
                    }]
                })
            });

            const result = await getCoordinates('Manizales');
            expect(result).toEqual({
                latitude: 5.07,
                longitude: -75.52,
                name: 'Manizales',
                country: 'Colombia'
            });
        });

        it('debería lanzar error para ciudad inexistente', async () => {
            fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({ results: [] })
            });

            await expect(getCoordinates('CiudadInventada')).rejects.toThrow('Ciudad no encontrada');
        });

        it('debería manejar errores de red', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(getCoordinates('Manizales')).rejects.toThrow('Error al obtener coordenadas: Network error');
        });
    });

    describe('getWeather', () => {
        it('debería devolver datos climáticos para coordenadas válidas', async () => {
            fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    current: {
                        temperature_2m: 22,
                        weather_code: 0,
                        wind_speed_10m: 5
                    }
                })
            });

            const result = await getWeather(5.07, -75.52);
            expect(result).toEqual({
                temperature_2m: 22,
                weather_code: 0,
                wind_speed_10m: 5
            });
        });

        it('debería lanzar error para coordenadas inválidas', async () => {
            fetch.mockRejectedValueOnce(new Error('Invalid coordinates'));

            await expect(getWeather(999, 999)).rejects.toThrow('Error al obtener el clima: Invalid coordinates');
        });
    });

    describe('getWeatherByCity', () => {
        it('debería devolver datos combinados para ciudad válida', async () => {
            fetch
                .mockResolvedValueOnce({
                    json: () => Promise.resolve({
                        results: [{
                            latitude: 5.07,
                            longitude: -75.52,
                            name: 'Manizales',
                            country: 'Colombia'
                        }]
                    })
                })
                .mockResolvedValueOnce({
                    json: () => Promise.resolve({
                        current: {
                            temperature_2m: 22,
                            weather_code: 0,
                            wind_speed_10m: 5
                        }
                    })
                });

            const result = await getWeatherByCity('Manizales');
            expect(result).toEqual({
                latitude: 5.07,
                longitude: -75.52,
                name: 'Manizales',
                country: 'Colombia',
                temperature_2m: 22,
                weather_code: 0,
                wind_speed_10m: 5
            });
        });

        it('debería propagar error de ciudad inexistente', async () => {
            fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({ results: [] })
            });

            await expect(getWeatherByCity('CiudadInventada')).rejects.toThrow('Ciudad no encontrada');
        });
    });
});