import { Game } from './core/Game';
import { ExampleSystem } from './systems/ExampleSystem';

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Missing #app root element.');
}

const game = new Game(rootElement);
game.registerSystem(new ExampleSystem());
game.start();
