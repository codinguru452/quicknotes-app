
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");

const STORAGE_KEY = "quicknotes-app-notes";

let notes = loadNotes();

// Load notes saved in the browser.
function loadNotes() {
    try {
        const savedNotes = localStorage.getItem(STORAGE_KEY);

        if (savedNotes === null) {
            return [];
        }

        const parsedNotes = JSON.parse(savedNotes);

        // Use the saved data only if it is an array.
        return Array.isArray(parsedNotes) ? parsedNotes : [];
    } catch (error) {
        console.error("Could not load saved notes:", error);
        return [];
    }
}

// Save the current notes array.
function saveNotes() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
        console.error("Could not save notes:", error);
        errorMessage.textContent =
            "Your notes could not be saved in this browser.";
    }
}

// Update the note count.
function updateCount() {
    if (notes.length === 0) {
        noteCount.textContent = "You have no notes yet.";
    } else if (notes.length === 1) {
        noteCount.textContent = "You have 1 note.";
    } else {
        noteCount.textContent = `You have ${notes.length} notes.`;
    }
}

// Create and display the note cards.
function render() {
    notesList.replaceChildren();

    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredNotes = notes.filter((note) =>
        note.text.toLowerCase().includes(searchTerm)
    );

    updateCount();

    if (filteredNotes.length === 0) {
        const message = document.createElement("li");
        message.classList.add("empty-message");

        message.textContent = searchTerm
            ? "No notes match your search."
            : "No notes to display. Add your first note above.";

        notesList.appendChild(message);
        return;
    }

    filteredNotes.forEach((note) => {
        const listItem = document.createElement("li");
        listItem.classList.add(
            "note-card",
            `category-${note.category}`
        );

        const text = document.createElement("p");
        text.classList.add("note-text");
        text.textContent = note.text;

        const meta = document.createElement("div");
        meta.classList.add("note-meta");

        const details = document.createElement("div");

        const category = document.createElement("span");
        category.classList.add(
            "category-label",
            `category-${note.category}`
        );
        category.textContent =
            note.category.charAt(0).toUpperCase() +
            note.category.slice(1);

        const date = document.createElement("time");
        date.dateTime = note.createdAt;
        date.textContent = new Date(note.createdAt).toLocaleString();

        details.append(category, document.createTextNode(" · "), date);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.classList.add("delete-btn");
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete note: ${note.text}`
        );

        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        meta.append(details, deleteButton);
        listItem.append(text, meta);
        notesList.appendChild(listItem);
    });
}

// Add a new note.
function addNote(text, category) {
    const note = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text: text,
        category: category,
        createdAt: new Date().toISOString()
    };

    notes.unshift(note);
    saveNotes();
    render();
}

// Delete a note using its unique ID.
function deleteNote(id) {
    notes = notes.filter((note) => note.id !== id);
    saveNotes();
    render();
}

// Handle form submission and validation.
noteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = noteInput.value.trim();
    const category = noteCategory.value;

    if (text.length === 0) {
        errorMessage.textContent = "Please type a note first.";
        noteInput.focus();
        return;
    }

    if (text.length > 200) {
        errorMessage.textContent =
            "Notes must be 200 characters or fewer.";
        noteInput.focus();
        return;
    }

    errorMessage.textContent = "";

    addNote(text, category);

    noteInput.value = "";
    noteInput.focus();
});

// Search notes as the user types.
searchInput.addEventListener("input", () => {
    render();
});

// Initial display when the page opens.
render();
