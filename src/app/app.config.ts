import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from "./app.routes";

// configuração global
// provideHttpClient() habilita o HttpClient (equivalente ao axios/fetch configurado globalmente)
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), // axios de forma global
    provideAnimationsAsync(),
  ],
};
