import { Game } from './core/Game';

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Missing #app root element.');
}

const game = new Game(rootElement);
game.start();
