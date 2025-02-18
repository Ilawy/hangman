//@ts-check
import $ from "https://esm.sh/jquery@3.7.1";
import { dataset } from "./dataset.js";
import { GameState } from "./game.js";

export class MainMenu {
  constructor() {
    const menu = $("<main>").addClass("main").append(`<div class="card">
        <h1>Word Guess</h1>
        <p>Choose a category to start playing</p>
        <select id="category">
            ${Object.keys(dataset.words)
              .map(
                (category) => `<option value="${category}">${category}</option>`
              )
              .join("")}
        </select>
        <button id="start">Start</button>
        </div>`);

    menu.find("#start").on("click", () => {
      const category = menu.find("#category").val();
      new GameState(category);
      menu.remove();
    });

    $("body").append(menu);
  }
}
