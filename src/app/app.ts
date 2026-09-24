import { Component, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <h1>Hello, {{ $title() }}</h1>

    <router-outlet />
  `,
  imports: [RouterOutlet]
})
export class App {
  readonly $data = input({ alias: 'data' });

  readonly $title = signal('y');
}
