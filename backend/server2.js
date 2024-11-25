const express = require('express');
const app = express();
const port = 3000;

// Define the /charan route
app.get('/charan', (req, res) => {
    res.send('<b>Hello World</b>');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
