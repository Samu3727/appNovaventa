const express = require('express');
const router = express.Router();
const { runMigration } = require('../controllers/migration.controller');

// Endpoint temporal para ejecutar migraciones
router.get('/run', runMigration);

module.exports = router;
