let data = JSON.parse(
  localStorage.getItem("cartoonStudioAI")
) || {
  characters: [],
  scenes: [],
  episodes: [],
  gallery: []
};


const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);


function save() {

  localStorage.setItem(
    "cartoonStudioAI",
    JSON.stringify(data)
  );

}


function id() {

  return Date.now().toString(36) +
    Math.random().toString(36).slice(2);

}


function esc(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================
   NAVIGATION
========================= */

function showPage(page) {

  $$(".nav").forEach(
    x => x.classList.remove("active")
  );

  $$(".page").forEach(
    x => x.classList.remove("active")
  );

  const nav =
    document.querySelector(
      `.nav[data-page="${page}"]`
    );

  if (nav)
    nav.classList.add("active");

  const target =
    document.getElementById(page);

  if (target)
    target.classList.add("active");

}


$$(".nav").forEach(button => {

  button.onclick = () =>
    showPage(button.dataset.page);

});


$$(".feature").forEach(button => {

  button.onclick = () =>
    showPage(button.dataset.open);

});


/* =========================
   IMAGE GENERATOR
========================= */

$("#generateImage").onclick = async () => {

  const prompt =
    $("#imagePrompt").value.trim();

  const style =
    $("#imageStyle").value;

  const ratio =
    $("#imageRatio").value;


  if (!prompt) {

    alert("Enter an image description first.");

    return;
  }


  const finalPrompt =
    `${prompt}, ${style}, cinematic cartoon, high quality`;


  const result =
    $("#imageResult");


  result.innerHTML = `
    <p class="muted">
      ✨ Preparing your AI image...
    </p>
  `;


  /*
    IMPORTANT:

    Do not put a secret sk_ API key
    in this public GitHub file.

    Your backend/proxy should expose:

      /api/image?prompt=...

    and add the provider authentication
    server-side.
  */

  const endpoint =
    `/api/image?prompt=${encodeURIComponent(
      finalPrompt
    )}&ratio=${encodeURIComponent(ratio)}`;


  try {

    const response =
      await fetch(endpoint);


    if (!response.ok)
      throw new Error("Generation failed");


    const blob =
      await response.blob();


    const url =
      URL.createObjectURL(blob);


    result.innerHTML = `
      <img src="${url}" alt="Generated cartoon">

      <div class="actions">

        <button
          class="secondary"
          onclick="saveMedia('${url}','image')">

          💾 Save

        </button>

        <a
          class="secondary"
          href="${url}"
          download="cartoon-image.png">

          ⬇️ Download

        </a>

      </div>
    `;


  } catch (error) {

    result.innerHTML = `
      <div class="card">

        <h3>AI connection not configured</h3>

        <p class="small">
          Connect the /api/image backend to your
          image-generation provider.
        </p>

      </div>
    `;

  }

};


/* =========================
   VIDEO GENERATOR
========================= */

$("#generateVideo").onclick = async () => {

  const prompt =
    $("#videoPrompt").value.trim();

  const duration =
    $("#videoDuration").value;

  const style =
    $("#videoStyle").value;


  if (!prompt) {

    alert("Enter a video description first.");

    return;
  }


  const finalPrompt =
    `${prompt}, ${style}, smooth animation, cinematic cartoon`;


  const result =
    $("#videoResult");


  result.innerHTML = `
    <p class="muted">
      🎥 Preparing your AI video...
    </p>
  `;


  /*
    Backend endpoint:

      /api/video

    The server should send the authenticated
    request to the video provider.
  */

  try {

    const response =
      await fetch("/api/video", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          prompt: finalPrompt,

          duration:
            Number(duration)

        })

      });


    if (!response.ok)
      throw new Error("Video generation failed");


    const resultData =
      await response.json();


    if (!resultData.url)
      throw new Error("No video returned");


    result.innerHTML = `

      <video
        controls
        playsinline
        src="${resultData.url}">
      </video>

      <div class="actions">

        <a
          class="secondary"
          href="${resultData.url}"
          download>

          ⬇️ Download Video

        </a>

      </div>

    `;


  } catch (error) {

    result.innerHTML = `

      <div class="card">

        <h3>AI video connection not configured</h3>

        <p class="small">

          Connect the /api/video backend to your
          video-generation provider.

        </p>

      </div>

    `;

  }

};


/* =========================
   CHARACTERS
========================= */

function renderCharacters() {

  const grid =
    $("#characterGrid");


  if (!data.characters.length) {

    grid.innerHTML = `
      <div class="card">

        <h3>No characters yet</h3>

        <p class="small">
          Add your first cartoon character.
        </p>

      </div>
    `;

    return;
  }


  grid.innerHTML =
    data.characters.map(c => `

      <article class="card">

        <div class="avatar">

          ${
            c.image
              ? `<img src="${c.image}">`
              : "👤"
          }

        </div>

        <h3>${esc(c.name)}</h3>

        <div class="small">
          ${esc(c.role)}
        </div>

        <div class="actions">

          <button
            class="secondary"
            onclick="editCharacter('${c.id}')">

            Edit

          </button>

          <button
            class="danger"
            onclick="removeCharacter('${c.id}')">

            Delete

          </button>

        </div>

      </article>

    `).join("");

}


$("#addCharacter").onclick = () => {

  openModal(

    "Add Character",

    `
      <label>Name</label>

      <input
        name="name"
        required
        placeholder="Tino"
      >

      <label>Role</label>

      <input
        name="role"
        placeholder="Main character"
      >

      <label>Image</label>

      <input
        name="image"
        type="file"
        accept="image/*"
      >
    `,

    async form => {

      let image = "";

      const file =
        form.get("image");

      if (file && file.size)
        image =
          await readFile(file);


      data.characters.push({

        id: id(),

        name:
          form.get("name"),

        role:
          form.get("role"),

        image

      });


      save();

      render();

    }

  );

};


function editCharacter(characterId) {

  const c =
    data.characters.find(
      x => x.id === characterId
    );


  openModal(

    "Edit Character",

    `
      <label>Name</label>

      <input
        name="name"
        value="${esc(c.name)}"
        required
      >

      <label>Role</label>

      <input
        name="role"
        value="${esc(c.role)}"
      >
    `,

    form => {

      c.name =
        form.get("name");

      c.role =
        form.get("role");

      save();

      render();

    }

  );

}


function removeCharacter(characterId) {

  if (!confirm("Delete character?"))
    return;

  data.characters =
    data.characters.filter(
      x => x.id !== characterId
    );

  save();

  render();

}


/* =========================
   SCENES
========================= */

function renderScenes() {

  const list =
    $("#sceneList");


  list.innerHTML =
    data.scenes.length

      ? data.scenes.map(s => `

          <article class="scene">

            <h3>
              🎬 ${esc(s.name)}
            </h3>

            <div class="small">
              📍 ${esc(s.location)}
            </div>

            <p>
              ${esc(s.dialogue)}
            </p>

            <div class="actions">

              <button
                class="secondary"
                onclick="editScene('${s.id}')">

                Edit

              </button>

              <button
                class="danger"
                onclick="removeScene('${s.id}')">

                Delete

              </button>

            </div>

          </article>

        `).join("")

      : `
        <div class="scene">

          <h3>No scenes yet</h3>

          <p class="small">
            Create your first scene.
          </p>

        </div>
      `;

}


$("#addScene").onclick = () => {

  openModal(

    "Add Scene",

    `
      <label>Scene Name</label>

      <input
        name="name"
        required
        placeholder="At the shop"
      >

      <label>Location</label>

      <input
        name="location"
        placeholder="Street"
      >

      <label>Dialogue / Action</label>

      <textarea
        name="dialogue"
      ></textarea>
    `,

    form => {

      data.scenes.push({

        id: id(),

        name:
          form.get("name"),

        location:
          form.get("location"),

        dialogue:
          form.get("dialogue")

      });

      save();

      render();

    }

  );

};


function editScene(sceneId) {

  const s =
    data.scenes.find(
      x => x.id === sceneId
    );


  openModal(

    "Edit Scene",

    `
      <label>Scene Name</label>

      <input
        name="name"
        value="${esc(s.name)}"
        required
      >

      <label>Location</label>

      <input
        name="location"
        value="${esc(s.location)}"
      >

      <label>Dialogue / Action</label>

      <textarea
        name="dialogue"
      >${esc(s.dialogue)}</textarea>
    `,

    form => {

      s.name =
        form.get("name");

      s.location =
        form.get("location");

      s.dialogue =
        form.get("dialogue");

      save();

      render();

    }

  );

}


function removeScene(sceneId) {

  if (!confirm("Delete scene?"))
    return;

  data.scenes =
    data.scenes.filter(
      x => x.id !== sceneId
    );

  save();

  render();

}


/* =========================
   EPISODES
========================= */

function renderEpisodes() {

  const list =
    $("#episodeList");


  list.innerHTML =
    data.episodes.length

      ? data.episodes.map(e => `

          <article class="episode">

            <h3>
              📺 ${esc(e.name)}
            </h3>

            <p>
              ${esc(e.description)}
            </p>

            <div class="small">

              ${e.scenes.length}
              scene(s)

            </div>

            <div class="actions">

              <button
                class="danger"
                onclick="removeEpisode('${e.id}')">

                Delete

              </button>

            </div>

          </article>

        `).join("")

      : `
        <div class="episode">

          <h3>No episodes yet</h3>

          <p class="small">
            Create your first episode.
          </p>

        </div>
      `;

}


$("#addEpisode").onclick = () => {

  const options =
    data.scenes.map(s => `

      <option value="${s.id}">
        ${esc(s.name)}
      </option>

    `).join("");


  openModal(

    "Create Episode",

    `
      <label>Episode Title</label>

      <input
        name="name"
        required
        placeholder="Episode 1"
      >

      <label>Description</label>

      <textarea
        name="description"
      ></textarea>

      <label>Scenes</label>

      <select
        name="scenes"
        multiple
      >

        ${options}

      </select>
    `,

    form => {

      data.episodes.push({

        id: id(),

        name:
          form.get("name"),

        description:
          form.get("description"),

        scenes:
          form.getAll("scenes")

      });

      save();

      render();

    }

  );

};


function removeEpisode(episodeId) {

  if (!confirm("Delete episode?"))
    return;

  data.episodes =
    data.episodes.filter(
      x => x.id !== episodeId
    );

  save();

  render();

}


/* =========================
   GALLERY
========================= */

function renderGallery() {

  const gallery =
    $("#galleryGrid");


  if (!data.gallery.length) {

    gallery.innerHTML = `
      <div class="card">

        <h3>Gallery is empty</h3>

        <p class="small">
          Your saved AI images and videos will appear here.
        </p>

      </div>
    `;

    return;

  }


  gallery.innerHTML =
    data.gallery.map(item => {

      if (item.type === "image") {

        return `
          <article class="galleryItem">

            <img src="${item.url}">

            <div class="galleryInfo">
              🎨 AI Image
            </div>

          </article>
        `;

      }


      return `
        <article class="galleryItem">

          <video
            controls
            src="${item.url}">
          </video>

          <div class="galleryInfo">
            🎥 AI Video
          </div>

        </article>
      `;

    }).join("");

}


function saveMedia(url, type) {

  data.gallery.push({

    id: id(),

    url,

    type,

    created:
      new Date().toISOString()

  });


  save();

  renderGallery();

}


/* =========================
   MODAL
========================= */

function openModal(
  title,
  fields,
  callback
) {

  $("#modalTitle").textContent =
    title;


  $("#form").innerHTML = `

    ${fields}

    <div class="formButtons">

      <button
        type="button"
        class="secondary"
        id="cancelModal">

        Cancel

      </button>

      <button type="submit">

        Save

      </button>

    </div>

  `;


  $("#modal")
    .classList
    .remove("hidden");


  $("#cancelModal").onclick =
    closeModal;


  $("#form").onsubmit =
    async event => {

      event.preventDefault();

      await callback(
        new FormData(event.target)
      );

      closeModal();

    };

}


function closeModal() {

  $("#modal")
    .classList
    .add("hidden");

}


$("#closeModal").onclick =
  closeModal;


/* =========================
   FILE READER
========================= */

function readFile(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload =
        () => resolve(reader.result);

      reader.onerror =
        reject;

      reader.readAsDataURL(file);

    }
  );

}


/* =========================
   NEW PROJECT
========================= */

$("#newProject").onclick = () => {

  if (!confirm(
    "Start a new project? This clears the current browser project."
  ))
    return;


  data = {

    characters: [],

    scenes: [],

    episodes: [],

    gallery: []

  };


  save();

  render();

};


/* =========================
   RENDER EVERYTHING
========================= */

function render() {

  renderCharacters();

  renderScenes();

  renderEpisodes();

  renderGallery();

}


render();
