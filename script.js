
async function loadData() {
    const response = await fetch(
        "https://raw.githubusercontent.com/Alphalaneous/Tinker/refs/heads/main/mod.json"
    );

    return await response.json();
}

const sectionsToSkip = [
    "Debug",
    "Keybinds",
    "EditTools"
];

const keysToSkip = [
    ""
];

function getSectionKey(key) {
    const split = key.split("-");
    split.pop();
    return split.join("-");
}

function generateInnerInfo(sectionKey, sections) {
    var html = "";

    var started = false;
    for (const [key, value] of Object.entries(sections)) {
        if (key === sectionKey + "-title") {
            started = true;
            continue;
        }
        if (!started) continue;

        if (key.endsWith("-description") 
            || value["type"] == "button" 
            || value["type"] == "keybind" 
            || value["name"] == "Enabled"
        ) {
            continue;
        }

        if (key.endsWith("-title")) {
            break;
        }

        var name = value["name"];
        const split = name.split(" ");
        if (split[0] === "Enable") {
            split.shift();
        }
        name = split.join(" ");

        const description = value["description"] ? value["description"] : "No Description Provided"

        const settingInfo = `
        <div class="setting-info">
            <h2 class="big-font">${name}</h2>
            <p><img src="assets/info-icon.png" alt="info" class="inline-icon">${description}</p>
        </div>
        `;
        
        html += settingInfo;
    }

    return html;
}

function selectSection(name, sections) {
    const section = sections[name];
    const sectionKey = getSectionKey(name);

    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const content = document.getElementById("content");
    const sidebar = document.getElementById("sidebar");

    if (!section || sectionsToSkip.includes(sectionKey)) {
        title.textContent = "Whoops";
        description.textContent = "<p>Section not found!</p>";
        content.innerHTML = "";
        return;
    }

    const descriptionKey = sectionKey + "-description";

    title.textContent = section["name"];
    description.textContent = sections[descriptionKey]["description"];

    content.innerHTML = generateInnerInfo(sectionKey, sections);

    history.pushState(null, "", `#${sectionKey}`);

    for (const child of sidebar.querySelectorAll('*')) {
        child.classList.remove('selected');

        if (child.getAttribute('href') === `#${sectionKey}`) {
            child.classList.add('selected');
        }
    }
}

function setupSite(data) {
    const sections = data.settings;

    const sidebar = document.getElementById("sidebar");

    for (const [key, value] of Object.entries(sections)) {
        const split = key.split("-");
        const ending = split.at(-1);
        if (ending !== "title") continue;

        split.pop();
        const remaining = split.join("-");

        if (sectionsToSkip.includes(remaining)) {
            continue;
        }

        const link = document.createElement("a");
        link.classList.add("big-font");
        link.classList.add("CCMenuItemSpriteExtra");
        link.draggable = false;

        link.href = `#${remaining}`;
        link.textContent = value["name"];

        link.addEventListener("click", event => {
            event.preventDefault();
            selectSection(key, sections);
        });

        sidebar.appendChild(link);
    }

    window.addEventListener("popstate", () => {
        const name = location.hash.slice(1) + "-title";
        selectSection(name, sections);
    });

    const name = location.hash.slice(1) + "-title";
    selectSection(name, sections);
}

const data = loadData().then(data => {
    setupSite(data);
});

