const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tts', require('./routes/tts'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CardFlow Voice IA Service' });
});

app.listen(PORT, () => {
  console.log(`🎙️ Voice IA Service rodando na porta ${PORT}`);
});
