import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'BarberiApp';

  constructor(private router: Router) {
    console.log('[AppComponent] Aplicación iniciada');
  }

  ngOnInit(): void {
    // Log de navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        console.log('[AppComponent] Navegación completada:', event.url);
      });
  }
}

