const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8300;

app.use(bodyParser.json());

app.post('/interactions', (req, res) => {
  const interaction = req.body;

  // Handle the interaction (e.g., parse data, execute command, etc.)

  // Send a response back to Discord
  res.status(200).json({ type: 1 }); // Placeholder response for now
});

app.listen(port, () => {
  console.log(`Local server listening at http://localhost:${port}`);
});
