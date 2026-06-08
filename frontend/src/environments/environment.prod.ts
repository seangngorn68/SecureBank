export const environment = {
  production: true,
  apiUrl: '',          // nginx proxy handles /api/* → api-gateway:8080
  keycloakUrl: 'http://localhost:8181',
  wsUrl: ''            // nginx proxy handles /ws → notification-service:8085
};
