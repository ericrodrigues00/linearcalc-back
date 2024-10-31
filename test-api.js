const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
    try {
        // Limpa todos os dados
        console.log('Limpando dados...');
        await axios.delete(`${API_URL}/data-points`);

        // Adiciona alguns pontos
        console.log('Adicionando pontos...');
        const points = [
            { x: 1, y: 2 },
            { x: 2, y: 4 },
            { x: 3, y: 5 },
            { x: 4, y: 4 },
            { x: 5, y: 5 }
        ];

        for (const point of points) {
            await axios.post(`${API_URL}/data-points`, point);
        }

        // Busca a regressão
        console.log('Buscando regressão...');
        const response = await axios.get(`${API_URL}/regression`);
        console.log('Resultado:', response.data);

        console.log('Teste concluído com sucesso!');
    } catch (error) {
        console.error('Erro no teste:', error.response?.data || error.message);
    }
}

testAPI();