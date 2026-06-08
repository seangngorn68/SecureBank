// Polyfill for sockjs-client which requires Node.js 'global' in browser
(window as any).global = window;

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ThemeService } from './app/services/theme.service';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    // Init dark mode from localStorage on startup
    appRef.injector.get(ThemeService).init();
  })
  .catch((err) => console.error(err));
