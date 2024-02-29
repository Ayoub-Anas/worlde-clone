// Get all elements with class "word-letter" and set initial variables
const keystrokes = document.getElementsByClassName("word-letter");
const WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1";
const WORD_VALIDATE = "https://words.dev-apis.com/validate-word";
const loading = document.querySelector(".loading-bar");
let word = ``;
let gameInProgress = true;
let counter = 0;
let keyPressed = "";
let currentDiv;
let currentIndex;
let nextIndex;
let previousIndex;
let combinedText = "";

// Initialize the game
async function init() {
    // Set focus on the first keystroke element and show loading bar
    keystrokes[0].focus();
    loading.classList.add(`visible`);

    try {
        // Fetch a random word from the API
        const promise = await fetch(WORD_URL);

        if (!promise.ok) {
            throw new Error(`HTTP Error occurred: ${promise.status}`);
        }

        // Process the API response and set the word
        const processedResponse = await promise.json();
        word = processedResponse.word;
    } catch (error) {
        // Log any errors that occur during fetching or processing
        console.error('Error occurred:', error.message);
    } finally {
        // Hide the loading bar
        loading.classList.remove('visible');
    }

    // Add event listeners for keydown and pointerdown events
    for (let i = 0; i < keystrokes.length; i++) {
        keystrokes[i].addEventListener("keydown", handleKeyPress);
        keystrokes[i].addEventListener("keydown", handleBackSpace);
        keystrokes[i].addEventListener("keydown", handleEnter);
        document.addEventListener('pointerdown', function(event) {
            event.preventDefault();
        }, true);
    }
};

// Handle key press event
function handleKeyPress(event) {
    if (gameInProgress === true) {
        keyPressed = event.key;
        currentDiv = event.currentTarget;
        currentIndex = Array.from(keystrokes).indexOf(currentDiv);
        nextIndex = currentIndex + 1;

        // Check if the pressed key is a valid letter
        if (!isLetter(keyPressed)) {
            handleWrongInput(event);
        } else {
            handleUserGuess(event);
        };
    };
}

// Handle user's correct key press
function handleUserGuess(event) {
    if (gameInProgress === true) {
        // Update variables based on the key press
        keyPressed = event.key;
        currentDiv = event.currentTarget;
        currentIndex = Array.from(keystrokes).indexOf(currentDiv);
        nextIndex = currentIndex + 1;

        // Move focus to the next input or the same input if it's a multiple of 5
        if (nextIndex < keystrokes.length) {
            if ((currentIndex + 1) % 5 === 0) {
                keystrokes[currentIndex].focus();
            } else {
                keystrokes[nextIndex].focus();
            }
        };
        // Set the pressed key as the content of the current input
        currentDiv.innerText = keyPressed;
    };
}

// Handle backspace key press event
function handleBackSpace(event) {
    if (gameInProgress === true) {
        // Update variables based on the key press
        currentIndex = Array.from(keystrokes).indexOf(currentDiv);
        previousIndex = currentIndex - 1;
        keyPressed = event.key;
        currentDiv = event.currentTarget;

        // Check if the pressed key is backspace and there is a previous input
        if (keyPressed === "Backspace" && previousIndex >= -1) {
            if (currentDiv.innerText !== "") {
                // If current input is not empty, clear it
                currentDiv.innerText = "";
                keystrokes[currentIndex].focus();
            } else {
                if (currentIndex % 5 === 0) {
                    // If current input is empty and multiple of 5, move focus to the same input
                    keystrokes[currentIndex].focus();
                } else {
                    // If current input is empty, clear the previous input and move focus to it
                    keystrokes[previousIndex].innerText = "";
                    keystrokes[previousIndex].focus();
                };
            };
        };
    };
}

// Handle enter key press event
async function handleEnter(event) {
    if (gameInProgress === true) {
        // Update variables based on the key press
        keyPressed = event.key;
        currentIndex = Array.from(keystrokes).indexOf(currentDiv);

        // Check if the pressed key is enter and the current input is not empty and is a multiple of 5
        if (keyPressed === "Enter" && currentDiv.innerText !== "" && (currentIndex + 1) % 5 === 0) {
            // Combine the previous 5 inputs to form a word
            combinePreviousDivs();

            // Move focus to the next input if available
            const nextIndex = currentIndex + 1;
            if (nextIndex < keystrokes.length) {
                keystrokes[nextIndex].focus();
            }

            // Validate the entered word using the API
            const response = await fetch(WORD_VALIDATE, {
                method: "POST",
                body: JSON.stringify({
                    "word": combinedText.toLowerCase()
                })
            });

            const json = await response.json();

            // Check if the entered word is valid and matches the random word
            if (json.validWord === true && combinedText.toLowerCase() === word) {
                validateLetter();
                for (let i = 4; i >= 0; i--) {
                    keystrokes[currentIndex - i].style.borderColor = 'grey';
                }
                // Display success message and end the game
                gameSuccess();
                gameInProgress = false;
            } else if (json.validWord === false) {
                // If entered word is not valid, flash the border of the current input
                keystrokes[currentIndex].focus();
                borderFlash();
                combinedText = ``;
            } else {
                // If entered word is not correct, validate the entered letters and display a message
                validateLetter();
                for (let i = 4; i >= 0; i--) {
                    keystrokes[currentIndex - i].style.borderColor = 'grey';
                }
            }
        }
    };
}

// Adds classname to the navbar activating the rainbow animation on the words
function gameSuccess() {
    const gameHeader = document.querySelector(`.navbar`);
    gameHeader.classList.add(`rainbow`);
}

// Flash the border of the incorrect input letters
function borderFlash() {
    for (let i = 4; i >= 0; i--) {
        keystrokes[currentIndex - i].classList.add(`flash`);
    }
}

// Combine the content of the previous 5 inputs to form a word
function combinePreviousDivs() {
    for (let i = 0; i < 5; i++) {
        combinedText += keystrokes[currentIndex - i].innerText;
    }
    combinedText = combinedText.split(``).reverse().join(``);
}

// Validate the entered letters by comparing them with the correct word
function validateLetter() {
    for (let i = 0; i < combinedText.length; i++) {
        const enteredLetter = combinedText[i].toLowerCase();
        const currentLetter = word[i].toLowerCase();

        // Set background color based on the correctness of the entered letter
        if (enteredLetter === currentLetter) {
            keystrokes[counter].style.backgroundColor = '#538d4e';
        } else if (word.includes(enteredLetter)) {
            keystrokes[counter].style.backgroundColor = '#b59f3b';
        } else {
            keystrokes[counter].style.backgroundColor = '#3a3a3c';
        }

        counter++;
    }
    combinedText = ``;
}

// Prevent default behavior for wrong key input
function handleWrongInput(event) {
    event.preventDefault();
}

// Check if a given character is a letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

// Call the init function to start the game
init();
