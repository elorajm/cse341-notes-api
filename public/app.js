let currentUser = null;
let editingId    = null;

const navUser      = document.getElementById("nav-user");
const hero         = document.getElementById("hero");
const dashboard    = document.getElementById("dashboard");
const noteFormCard = document.getElementById("note-form-card");
const formTitle    = document.getElementById("form-title");
const editIdInput  = document.getElementById("edit-id");
const fTitle       = document.getElementById("f-title");
const fContent     = document.getElementById("f-content");
const fSummary     = document.getElementById("f-summary");
const fTags        = document.getElementById("f-tags");
const fPinned      = document.getElementById("f-pinned");
const saveBtn      = document.getElementById("save-btn");
const cancelBtn    = document.getElementById("cancel-btn");
const formError    = document.getElementById("form-error");
const newNoteBtn   = document.getElementById("new-note-btn");
const pinnedSection = document.getElementById("pinned-section");
const pinnedGrid   = document.getElementById("pinned-grid");
const allLabel     = document.getElementById("all-label");
const notesGrid    = document.getElementById("notes-grid");
const emptyMsg     = document.getElementById("empty-msg");

(async function init() {
  try {
    const res = await fetch("/auth/profile");
    if (res.ok) {
      currentUser = await res.json();
      showDashboard();
    } else {
      showHero();
    }
  } catch {
    showHero();
  }
})();

function showHero() {
  hero.classList.remove("hidden");
  dashboard.classList.add("hidden");
  navUser.innerHTML = `<a href="/auth/github" class="btn btn-github" style="padding:0.3rem 0.9rem;font-size:0.85rem;">Sign in with GitHub</a>`;
}

function showDashboard() {
  hero.classList.add("hidden");
  dashboard.classList.remove("hidden");

  navUser.innerHTML = `
    <img class="avatar" src="${currentUser.avatarUrl || ''}" alt="${currentUser.displayName}" />
    <span class="nav-name">${currentUser.displayName || currentUser.username}</span>
    <a href="/auth/logout" class="btn btn-logout" id="logout-btn">Log out</a>
  `;

  loadNotes();
}

async function loadNotes() {
  try {
    const res   = await fetch("/notes");
    const notes = await res.json();
    renderNotes(notes);
  } catch {
    notesGrid.innerHTML = `<p style="color:#e84646">Failed to load notes.</p>`;
  }
}

async function saveNote() {
  hideError();
  const title   = fTitle.value.trim();
  const content = fContent.value.trim();

  if (!title)   return showError("Title is required.");
  if (!content) return showError("Content is required.");

  const tags = fTags.value.trim()
    ? fTags.value.split(",").map(t => t.trim()).filter(Boolean)
    : [];

  const body = {
    title,
    content,
    summary:  fSummary.value.trim() || null,
    tags,
    isPinned: fPinned.checked
  };

  try {
    const url    = editingId ? `/notes/${editingId}` : "/notes";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      return showError(err.error || "Failed to save note.");
    }

    closeForm();
    loadNotes();
  } catch {
    showError("Network error — please try again.");
  }
}

async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  try {
    const res = await fetch(`/notes/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Failed to delete note.");
    loadNotes();
  } catch {
    alert("Network error.");
  }
}

function renderNotes(notes) {
  const pinned = notes.filter(n => n.isPinned);
  const rest   = notes.filter(n => !n.isPinned);

  if (pinned.length > 0) {
    pinnedSection.classList.remove("hidden");
    pinnedGrid.innerHTML = pinned.map(noteCard).join("");
  } else {
    pinnedSection.classList.add("hidden");
    pinnedGrid.innerHTML = "";
  }

  notesGrid.innerHTML = rest.map(noteCard).join("");

  allLabel.textContent = pinned.length > 0 ? "Other Notes" : "Notes";

  if (notes.length === 0) {
    emptyMsg.classList.remove("hidden");
  } else {
    emptyMsg.classList.add("hidden");
  }

  attachCardListeners();
}

function noteCard(note) {
  const date = new Date(note.updatedAt || note.createdAt).toLocaleDateString(
    "en-US", { month: "short", day: "numeric", year: "numeric" }
  );
  const tags = (note.tags || [])
    .map(t => `<span class="tag">${escHtml(t)}</span>`)
    .join("");
  const summary = note.summary
    ? `<p class="note-summary">${escHtml(note.summary)}</p>`
    : "";
  const actions = currentUser
    ? `<div class="note-actions">
        <button class="btn-icon" data-edit="${note._id}" title="Edit">&#9998;</button>
        <button class="btn-icon danger" data-delete="${note._id}" title="Delete">&#128465;</button>
       </div>`
    : "";

  return `
    <div class="note-card ${note.isPinned ? "pinned" : ""}" id="card-${note._id}">
      <div class="note-header">
        <span class="note-title">${escHtml(note.title)}</span>
        ${actions}
      </div>
      ${summary}
      <p class="note-content">${escHtml(note.content)}</p>
      ${tags ? `<div class="note-tags">${tags}</div>` : ""}
      <p class="note-footer">${note.isPinned ? "📌 &nbsp;" : ""}${date}</p>
    </div>`;
}

function attachCardListeners() {
  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => openEditForm(btn.dataset.edit));
  });
  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => deleteNote(btn.dataset.delete));
  });
}

newNoteBtn.addEventListener("click", openCreateForm);
saveBtn.addEventListener("click", saveNote);
cancelBtn.addEventListener("click", closeForm);

function openCreateForm() {
  editingId = null;
  formTitle.textContent = "New Note";
  fTitle.value = fContent.value = fSummary.value = fTags.value = "";
  fPinned.checked = false;
  hideError();
  noteFormCard.classList.remove("hidden");
  fTitle.focus();
  noteFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function openEditForm(id) {
  try {
    const res  = await fetch(`/notes/${id}`);
    if (!res.ok) return alert("Could not load note.");
    const note = await res.json();

    editingId            = id;
    formTitle.textContent = "Edit Note";
    fTitle.value          = note.title || "";
    fContent.value        = note.content || "";
    fSummary.value        = note.summary || "";
    fTags.value           = (note.tags || []).join(", ");
    fPinned.checked       = !!note.isPinned;
    hideError();
    noteFormCard.classList.remove("hidden");
    fTitle.focus();
    noteFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    alert("Network error.");
  }
}

function closeForm() {
  noteFormCard.classList.add("hidden");
  editingId = null;
  hideError();
}

function showError(msg) {
  formError.textContent = msg;
  formError.classList.remove("hidden");
}
function hideError() {
  formError.classList.add("hidden");
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
