const express = require('express');
const app = express();
const port = 3000;

// Kho "lý do" của chúng ta
const excuses = [
    "It works on my machine.",
    "That's weird, I've never seen that before.",
    "It must be a caching issue.",
    "It's a hardware problem.",
    "That's already fixed in the next release.",
    "Did you clear your cache?",
    "It's not a bug, it's an undocumented feature."
];

// Endpoint chính
app.get('/', (req, res) => {
    const randomExcuse = excuses[Math.floor(Math.random() * excuses.length)];
    res.status(200).send(`<h1>${randomExcuse}</h1>`);
});

// Xuất server để test và chạy
module.exports = app.listen(port, () => {
    console.log(`Dev Excuse App listening on port ${port}`);
});