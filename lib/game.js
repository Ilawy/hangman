//@ts-check
import $ from "https://esm.sh/jquery@3.7.1"



import { dataset } from './dataset.js';

export class GameState {
    /**@type {string[]} */
    guessedLetters = [];
    /**@type {string} */
    word = '';
    /**@type {keyof typeof dataset['words']} */
    currentCategory;
    /**@type {number | undefined} */
    timer;

    running = true

    letfTries = 5;

    /**
     * @param {keyof typeof dataset['words']} category
     */
    constructor(category) {
        this.currentCategory = category;
        this.word = this.#getRandomWord(category);
        this.initUI()
    }

    destroy() {
        clearInterval(this.timer);
        this.#elements_cache.gameContainer.remove()
    }

    /**@type {{
    gameContainer: JQuery<HTMLElement>;
    hangman: JQuery<HTMLElement>;
    gameStatus: JQuery<HTMLElement>;
    wordContainer: JQuery<HTMLElement>;
    keyboard: JQuery<HTMLElement>;
    letterElements: JQuery<HTMLElement>[];
    keyboardLetters: JQuery<HTMLElement>[];
    progress: JQuery<HTMLElement>;
}} */
    // @ts-ignore (will be initialized in the getter)
    #elements_cache;

    get elements() {
        if (this.#elements_cache) return this.#elements_cache;
        return this.#elements_cache = {
            gameContainer: $('<div>').addClass('game-container'),
            hangman: $(hangmanSVG).addClass('hangman'),
            gameStatus: $('<div>').addClass('game-status'),
            wordContainer: $('<div>').addClass('word-container'),
            keyboard: $('<div>').addClass('keyboard-container'),
            letterElements: this.word.split('').map(() => {
                return $('<div>').addClass('letter')
            }),
            keyboardLetters: 'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => {
                return $('<button>').addClass('key').text(letter)
                    .attr("data-key", letter)
                    .on('click', this.handleLetter.bind(this))
            }),

            progress: $(`<svg width="48" height="48" viewBox="-25 -25 250 250" version="1.1" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)">
                <circle r="90" cx="100" cy="100" fill="transparent" stroke="#e0e0e0" stroke-width="16px"></circle>
                <circle id="timer" r="90" cx="100" cy="100" stroke="black" stroke-width="16px" stroke-linecap="round" stroke-dashoffset="0" fill="transparent" stroke-dasharray="565.48px"></circle>
            </svg>`).addClass("game-progress")
        }
    }



    /**
     * @param {keyof typeof dataset['words']} category
     */
    #getRandomWord(category) {
        const words = dataset.words[category];
        if (!words) {
            throw new Error('Invalid category');
        }
        const index = Math.floor(Math.random() * words.length);
        return words[index];
    }

    initUI() {

        const { gameContainer, hangman, gameStatus, wordContainer, keyboard, letterElements, keyboardLetters } = this.elements;

        gameStatus.append(this.elements.progress)

        wordContainer.append(letterElements);
        keyboard.append(keyboardLetters);
        gameContainer.append(gameStatus, hangman, wordContainer, keyboard);
        $('body').append(gameContainer)
        this.frame()
    }


    /**
     * 
     * @param {JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>} event
     */
    handleLetter(event) {
        const element = $(event.target);
        /**@type {string} */
        // @ts-ignore (data-key is a custom attribute)
        const letter = element.attr("data-key")
        element.off("click")
        const matched = [...this.word.matchAll(new RegExp(letter, 'gi'))]
        if (!matched.length) {
            element.addClass('wrong')
            this.handleFault()
            return
        }

        element.addClass('correct')
        for (const match of matched) {
            this.guessedLetters.push(match[0])
            this.elements.letterElements[match.index].text(match[0])
        }
        if (this.guessedLetters.length === this.word.length) {
            this.elements.gameStatus.text("You Win")
            $("#body,#leg_l,#leg_r,#arm_l,#arm_r,.face_el").show()
            $(".happy_el").show()
            this.elements.keyboardLetters.forEach(element => element.off("click"))
            this.running = false
        }
    }


    showWrongPart() {
        switch (this.letfTries) {
            case 5:
                this.elements.hangman.find('.face_el').show()
                this.elements.hangman.find('#body').show()
                break
            case 4:
                this.elements.hangman.find('#arm_r').show()
                break;
            case 3:
                this.elements.hangman.find('#arm_l').show()
                break;
            case 2:
                this.elements.hangman.find('#leg_r').show()
                break;
            case 1:
                this.elements.hangman.find('#leg_l').show()
                break;
        }
    }

    handleFault(forceGameOver = false) {
        this.#then = +new Date();
        this.showWrongPart()
        this.letfTries--
        if (this.letfTries === 0 || forceGameOver) {
            this.running = false
            this.elements.gameStatus
                .empty()
                .append(
                    $("<div>")
                        .addClass("game-over")
                        .text("Game Over"),
                    $("<div>")
                        .addClass("word")
                        .text(`The word was ${this.word}`),
                    $("<button>")
                        .addClass("play-again")
                        .text("Play Again")
                        .on("click", ev => {
                            this.destroy()
                            new GameState(this.currentCategory)
                        }),
                    $("<select>")
                        .addClass("category")
                        .append(
                            Object.keys(dataset.words).map(category => {
                                return $("<option>")
                                    .text(category)
                                    .val(category)
                                    .attr("selected", `${category === this.currentCategory}`)
                            })
                        ).on("change",
                            (event) => {
                                // @ts-ignore
                                this.currentCategory = event.target.value
                            })
                )
            this.elements.keyboardLetters.forEach(element => element.off("click"))
            $(".sad_el").show()
        }
        if (forceGameOver) {
            $("#body,#leg_l,#leg_r,#arm_l,#arm_r").show()
        }
    }

    #then = +new Date();
    #duration = 1 * 10000;

    #timerProps = {
        start: 0,
        end: 565,
    }

    frame() {
        if (!this.running) return
        const now = +new Date();
        const diff = now - this.#then;
        const timerEl = $("#timer")
        requestAnimationFrame(this.frame.bind(this))
        // const matchResult = window.getComputedStyle(timerEl[0]).strokeDashoffset
        //     .match(/(\d+)px/);


        // const currentOffset = matchResult ? Number(matchResult[1]) : 0;




        const progress = Math.min(diff / this.#duration, 1);
        const currentValue = Math.floor(
            this.#timerProps.start +
            (this.#timerProps.end - this.#timerProps.start) * progress,
        );

        timerEl.css("strokeDashoffset", `${currentValue}px`)


        if (currentValue === this.#timerProps.end) {
            this.handleFault(true)
        }


        // timer_el.style.strokeDashoffset = `${currentValue}px`;

    }

}









const hangmanSVG = `<svg class="human" width="75" height="211" viewBox="0 0 75 211" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect id="leg_l" x="39.6226" y="142.925" width="16.9811" height="67.9245" rx="8.49057" fill="black" />
        <rect id="leg_r" x="18.3962" y="142.925" width="16.9811" height="67.9245" rx="8.49057" fill="black" />
        <path id="arm_l"
            d="M62.2642 49.5283H69.7917C72.6681 49.5283 75 51.8602 75 54.7366V118.054C75 121.63 72.1015 124.528 68.526 124.528V124.528C65.0344 124.528 62.1719 121.76 62.0555 118.27L60.3849 68.1505C60.2492 64.0793 56.9095 60.8491 52.8361 60.8491H50.9434C47.8173 60.8491 45.283 58.3148 45.283 55.1887V55.1887C45.283 52.0625 47.8173 49.5283 50.9434 49.5283H62.2642Z"
            fill="black" />
        <path id="arm_r"
            d="M12.7358 49.5283H5.20833C2.33185 49.5283 -1.90735e-06 51.8602 -1.90735e-06 54.7366V118.054C-1.90735e-06 121.63 2.89852 124.528 6.47403 124.528V124.528C9.96557 124.528 12.8281 121.76 12.9445 118.27L14.6151 68.1505C14.7508 64.0793 18.0905 60.8491 22.1639 60.8491H24.0566C27.1827 60.8491 29.717 58.3148 29.717 55.1887V55.1887C29.717 52.0625 27.1827 49.5283 24.0566 49.5283H12.7358Z"
            fill="black" />
        <path id="body"
            d="M18.3962 56.6038C18.3962 52.6961 21.564 49.5283 25.4717 49.5283H49.5283C53.436 49.5283 56.6038 52.6961 56.6038 56.6038V147.877C56.6038 158.428 48.0507 166.981 37.5 166.981V166.981C26.9493 166.981 18.3962 158.428 18.3962 147.877V56.6038Z"
            fill="black" />
        <rect class="face_el" x="16.2736" y="0.707547" width="39.6226" height="46.6981" rx="19.8113" stroke="black"
            stroke-width="1.41509" />
        <path class="sad_el" d="M22.6415 14.1509C28.3019 14.1509 31.6038 11.3208 32.5472 9.90566" stroke="black"
            stroke-width="1.41509" />
        <path class="sad_el" d="M50.9434 14.1509C45.283 14.1509 41.9811 11.3208 41.0377 9.90566" stroke="black"
            stroke-width="1.41509" />
        <path class="sad_el" d="M25.4717 19.8113H31.8396" stroke="black" stroke-width="1.41509" />
        <path class="sad_el" d="M42.4528 19.8113H48.8208" stroke="black" stroke-width="1.41509" />
        <path class="sad_el" d="M31.1321 34.1099C32.783 32.9306 37.3585 31.2797 42.4528 34.1099" stroke="black"
            stroke-width="1.41509" />

        <path class="happy_el" d="M50.9434 16.2453C51 12.0943 43.5 12 41.0377 12" stroke="black"
            stroke-width="1.41509" />
        <path class="happy_el" d="M23.0003 16.3396C22.9437 12.1887 30.4437 12.0943 32.906 12.0943" stroke="black"
            stroke-width="1.41509" />
        <circle class="happy_el" cx="29" cy="19.0943" r="3" fill="black" />
        <circle class="happy_el" cx="45" cy="19.0943" r="3" fill="black" />
        <path class="happy_el"
            d="M41.5 32.5H31C31 36.9949 32.6837 37.0006 35 37C35.7756 36.9998 37 37 38 37C42 37 41.5 34.5 41.5 32.5Z"
            stroke="black" />
    </svg>


`