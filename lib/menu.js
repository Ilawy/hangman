//@ts-check
import $ from "https://esm.sh/jquery@3.7.1";
import { dataset } from "./dataset.js";
import { GameState } from "./game.js";

export class MainMenu {
  constructor() {
    const menu = $("<main>").addClass("main").append(`<div class="card">
        <h1 class=title>Hangman</h1>
        <p class=description>Choose a category to start playing</p>
        <select class=category id="category">
            ${Object.keys(dataset.words)
              .map(
                (category) => `<option value="${category}">${category}</option>`
              )
              .join("")}
        </select>
        <button class=play id="start">Start</button>
        </div>`);

    menu.find("#start").on("click", () => {
      const category = menu.find("#category").val();
      if(!(typeof category !== "string" || category in dataset['words']))throw new Error("Invalid category");
      // @ts-ignore already ensured that categoroy exists
      new GameState(category);
      menu.remove();
    });

    $("body").append(menu);
  }
}
