const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const DataPoint = require('./models/DataPoint');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/regression-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
}).catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
});

// Função para calcular a regressão linear
function calculateLinearRegression(points) {
    if (points.length < 2) return null;

    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    points.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumX2 += point.x * point.x;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    const yMean = sumY / n;
    let ssTotal = 0;
    let ssResidual = 0;
    
    points.forEach(point => {
        const yPred = m * point.x + b;
        ssResidual += Math.pow(point.y - yPred, 2);
        ssTotal += Math.pow(point.y - yMean, 2);
    });

    const r2 = 1 - (ssResidual / ssTotal);
    const r = Math.sqrt(r2);

    return {
        slope: m,
        intercept: b,
        r2: r2,
        r: r
    };
}

// Rotas
app.get('/api/regression', async (req, res) => {
    try {
        const points = await DataPoint.find().sort('x');
        const regression = calculateLinearRegression(points);
        
        res.json({
            coefficients: regression,
            points
        });
    } catch (error) {
        console.error('Erro na rota /api/regression:', error);
        res.status(500).json({ 
            message: 'Erro ao buscar dados',
            error: error.message 
        });
    }
});

app.post('/api/data-points', async (req, res) => {
    try {
        const newPoint = new DataPoint(req.body);
        await newPoint.save();
        res.status(201).json(newPoint);
    } catch (error) {
        console.error('Erro na rota POST /api/data-points:', error);
        res.status(400).json({ 
            message: 'Erro ao adicionar ponto',
            error: error.message 
        });
    }
});

app.put('/api/data-points/:id', async (req, res) => {
    try {
        const updatedPoint = await DataPoint.findByIdAndUpdate(
            req.params.id,
            { x: req.body.x, y: req.body.y },
            { new: true, runValidators: true }
        );
        
        if (!updatedPoint) {
            return res.status(404).json({ message: 'Ponto não encontrado' });
        }
        
        res.json(updatedPoint);
    } catch (error) {
        console.error('Erro na rota PUT /api/data-points/:id:', error);
        res.status(400).json({ 
            message: 'Erro ao atualizar ponto',
            error: error.message 
        });
    }
});

app.delete('/api/data-points/:id', async (req, res) => {
    try {
        const deletedPoint = await DataPoint.findByIdAndDelete(req.params.id);
        
        if (!deletedPoint) {
            return res.status(404).json({ message: 'Ponto não encontrado' });
        }
        
        res.json({ message: 'Ponto deletado com sucesso' });
    } catch (error) {
        console.error('Erro na rota DELETE /api/data-points/:id:', error);
        res.status(500).json({ 
            message: 'Erro ao deletar ponto',
            error: error.message 
        });
    }
});

app.delete('/api/data-points', async (req, res) => {
    try {
        await DataPoint.deleteMany({});
        res.status(200).json({ message: 'Todos os pontos foram deletados' });
    } catch (error) {
        console.error('Erro na rota DELETE /api/data-points:', error);
        res.status(500).json({ 
            message: 'Erro ao limpar dados',
            error: error.message 
        });
    }
});

// Inicialização do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});