import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

// Isso substitui o app.use(router) / app.use(pinia) que você faria no main.ts do Vue.
// provideHttpClient() habilita o HttpClient (equivalente ao axios/fetch configurado globalmente)
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
