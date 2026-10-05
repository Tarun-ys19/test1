const { defineConfig } = require('cypress');
module.exports = defineConfig({ e2e: { baseUrl: 'http://localhost:5173', supportFile: 'cypress/support/e2e.js', video: true, screenshotOnRunFailure: true, specPattern: 'cypress/e2e/**/*.cy.js' }, env: { apiUrl: 'http://localhost:5000/api' } });
