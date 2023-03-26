document.addEventListener("DOMContentLoaded", function () {
    const showTextButton = document.getElementById("show-text-btn");
    const textContainer = document.getElementById("text-container");
    const textModal = document.getElementById("text-modal");
    const closeButton = document.querySelector(".close");
    const searchField = document.getElementById("search-field");
    const searchButton = document.getElementById("search-btn");
    const saveButton = document.getElementById("save-btn");
    const cancelButton = document.getElementById("cancel-btn");
    const editButton = document.getElementById("edit-btn");
    const editPanel = document.getElementById("edit-panel");
    const editWord = document.getElementById("edit-word");
    const editDefinition = document.getElementById("edit-definition");
    const addWordButton = document.getElementById("add-word-btn");
    const deleteWordButton = document.getElementById("delete-word-btn");

    let originalLines = [];
    let currentAction = "edit";

    // Event listeners
    showTextButton.addEventListener("click", handleShowTextClick);
    closeButton.addEventListener("click", handleCloseButtonClick);
    searchButton.addEventListener("click", handleSearchButtonClick);
    editButton.addEventListener("click", handleEditClick);
    saveButton.addEventListener("click", handleSaveClick);
    cancelButton.addEventListener("click", handleCancelClick);
    addWordButton.addEventListener("click", handleAddWordClick);
    deleteWordButton.addEventListener("click", handleDeleteWordClick);

    function handleShowTextClick() {
        fetch("english.txt")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then((text) => {
                originalLines = text.split("\n").sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })); // Sort case-insensitively
                const tableRows = originalLines
                    .map((line) => {
                        const [word, definition] = line.split(" - ");
                        return `<tr class="editable"><td>${word}</td><td>${definition}</td></tr>`;
                    })
                    .join("");
                textContainer.innerHTML = `<table><tbody>${tableRows}</tbody></table>`;
                textModal.style.display = "block";
            })
            .catch((error) => {
                console.log("Error fetching text file:", error);
                textContainer.textContent = "Error loading text file.";
            });
    }    

    function handleCloseButtonClick() {
        textModal.style.display = "none";
    }

    function handleSearchButtonClick() {
        const searchTerm = searchField.value.trim().toLowerCase();
        const highlightedClass = "highlighted";
        const wordsOnly = originalLines.map((line) => line.split(" - ")[0].toLowerCase());

        const foundIndex = wordsOnly.indexOf(searchTerm);
        if (foundIndex !== -1) {
            const updatedLines = [...originalLines];
            const lineToHighlight = updatedLines[foundIndex];
            const searchTermRegExp = new RegExp(`(${searchTerm})`, "i");
            const highlightedLine = lineToHighlight.replace(searchTermRegExp, `<span class="${highlightedClass}">$1</span>`);
            updatedLines[foundIndex] = highlightedLine;

            const tableRows = updatedLines
                .map((line) => {
                    const [word, definition] = line.split(" - ");
                    return `<tr><td>${word}</td><td>${definition}</td></tr>`;
                })
                .join("");

            textContainer.innerHTML = `<table><tbody>${tableRows}</tbody></table>`;

            const firstHighlightedElement = document.querySelector(`.${highlightedClass}`);
            firstHighlightedElement.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            alert("Word not found.");
        }
    }

    function handleEditClick() {
        const highlighted = document.querySelector('.highlighted');
        if (highlighted) {
            const selectedRow = highlighted.closest('tr');
            const cells = selectedRow.querySelectorAll('td');
            editWord.value = cells[0].textContent;
            editDefinition.value = cells[1].textContent;
            editPanel.style.display = 'block';
        } else {
            alert('Please select a word to edit by searching for it first.');
        }
    }

    function handleSaveClick() {
        if (currentAction === "edit") {
            // Existing save functionality (edit)
            const editedWord = editWord.value;
            const editedDefinition = editDefinition.value;
    
            if (editedWord && editedDefinition) {
                const wordsOnly = originalLines.map((line) => line.split(" - ")[0]);
                const foundIndex = wordsOnly.indexOf(highlightedWord);
    
                if (foundIndex !== -1) {
                    originalLines[foundIndex] = `${editedWord} - ${editedDefinition}`;
    
                    const tableRows = originalLines
                        .map((line) => {
                            const [word, definition] = line.split(" - ");
                            return `<tr class="editable"><td>${word}</td><td>${definition}</td></tr>`;
                        })
                        .join("");
    
                    textContainer.innerHTML = `<table><tbody>${tableRows}</tbody></table>`;
                }
            }
        } else if (currentAction === "add") {
            // New save functionality (add)
            const newWord = editWord.value;
            const newDefinition = editDefinition.value;
    
            if (newWord && newDefinition) {
                originalLines.push(`${newWord} - ${newDefinition}`);
                originalLines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    
                const tableRows = originalLines
                    .map((line) => {
                        const [word, definition] = line.split(" - ");
                        return `<tr class="editable"><td>${word}</td><td>${definition}</td></tr>`;
                    })
                    .join("");
    
                textContainer.innerHTML = `<table><tbody>${tableRows}</tbody></table>`;
            }
        }
    
        editPanel.style.display = "none";
    }

    function handleCancelClick() {
        editPanel.style.display = 'none';
    }

    function handleAddWordClick() {
        editWord.value = "";
        editDefinition.value = "";
        editPanel.style.display = "block";
        currentAction = "add";
    }

    function handleDeleteWordClick() {
        const highlightedElements = document.querySelectorAll(".highlighted");
        if (highlightedElements.length > 0) {
            const highlightedWord = highlightedElements[0].textContent;
            const wordsOnly = originalLines.map((line) => line.split(" - ")[0]);
            const foundIndex = wordsOnly.indexOf(highlightedWord);
    
            if (foundIndex !== -1) {
                originalLines.splice(foundIndex, 1);
    
                const tableRows = originalLines
                    .map((line) => {
                        const [word, definition] = line.split(" - ");
                        return `<tr class="editable"><td>${word}</td><td>${definition}</td></tr>`;
                    })
                    .join("");
    
                textContainer.innerHTML = `<table><tbody>${tableRows}</tbody></table>`;
            }
        } else {
            alert("No word is highlighted. Highlight a word to delete it.");
        }
    }
});

