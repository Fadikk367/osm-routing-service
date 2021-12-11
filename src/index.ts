import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());

app.get("/",(req, res) =>{
  res.json({message: 'Hello there'});
});

app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));
