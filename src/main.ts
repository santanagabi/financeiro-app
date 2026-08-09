import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Isso aqui é o equivalente ao createApp(App).use(router).use(pinia).mount('#app') do Vue.
// Só que no Angular a gente separa os "providers" (equivalente aos .use()) em app.config.ts
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
