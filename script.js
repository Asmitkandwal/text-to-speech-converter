const textInput = document.getElementById("textToConvert");
const convertButton = document.getElementById("convertBtn");
const voiceDropDown = document.getElementById("voiceSelect");
const pitchSlider = document.getElementById("pitchRange");
const rateSlider = document.getElementById("rateRange");
const errorDisplay = document.querySelector(".error-message");

const speechSynthesis = window.speechSynthesis;
let availableVoices = [];

// Check for browser support
if (!('speechSynthesis' in window)) {
    displayError("Sorry, your browser does not support speech synthesis.");
}

// Load available voices into the dropdown
function loadVoices() {
    availableVoices = speechSynthesis.getVoices();
    
    if (availableVoices.length === 0) {
        displayError("No voices available. Please try again later.");
        return; // Exit early if no voices are available
    }

    voiceDropDown.innerHTML = availableVoices.map(voice =>
        `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`
    ).join('');
}

// Retry loading voices if not available
function retryLoadVoices() {
    setTimeout(() => {
        loadVoices();
    }, 1000); // Retry after 1 second
}

// Play the input text as speech
function playTextAsSpeech() {
    const inputText = textInput.value.trim();

    if (!inputText) {
        displayError("Please enter some text to convert!");
        return;
    }

    clearError();
    speakText(inputText);
}

// Speak the text in chunks
function speakText(text) {
    const chunkSize = 200; // Adjust this size as needed
    const chunks = splitTextIntoChunks(text, chunkSize);
    
    if (chunks.length > 0) {
        let index = 0;

        const speakNextChunk = () => {
            if (index < chunks.length) {
                const utterance = new SpeechSynthesisUtterance(chunks[index]);
                setUtteranceVoice(utterance);
                setUtteranceParameters(utterance);

                utterance.onend = () => {
                    index++;
                    speakNextChunk(); // Speak the next chunk when the current one ends
                };

                utterance.onerror = () => displayError("An error occurred while converting text to speech.");
                speechSynthesis.speak(utterance); // Speak the current chunk
            }
        };

        speakNextChunk(); // Start speaking the first chunk
    }
}

// Split text into manageable chunks
function splitTextIntoChunks(text, size) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        let end = start + size;
        if (end >= text.length) {
            chunks.push(text.substring(start));
            break;
        }

        // Find the last space within the chunk size
        const lastSpace = text.lastIndexOf(' ', end);
        end = lastSpace > start ? lastSpace : end; // If there's no space, don't split in the middle of a word

        chunks.push(text.substring(start, end).trim());
        start = end + 1; // Move past the space
    }

    return chunks;
}

// Set the selected voice for the utterance
function setUtteranceVoice(utterance) {
    const selectedVoice = availableVoices.find(voice => voice.name === voiceDropDown.value);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
}

// Set pitch and rate for the utterance
function setUtteranceParameters(utterance) {
    utterance.pitch = pitchSlider.value;
    utterance.rate = rateSlider.value;
}

// Display an error message
function displayError(message) {
    errorDisplay.textContent = message;
}

// Clear the error message
function clearError() {
    errorDisplay.textContent = "";
}

// Initialize voices on change
speechSynthesis.onvoiceschanged = () => {
    loadVoices();
    if (availableVoices.length === 0) {
        retryLoadVoices(); // Retry if no voices are loaded
    }
};

// Load voices initially
loadVoices();

// Add event listener to the convert button
convertButton.addEventListener("click", playTextAsSpeech);