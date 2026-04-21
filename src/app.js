const sourceList = document.getElementById("sourceList");
const storyTree = document.getElementById("storyTree");
const storyTabs = document.getElementById("storyTabs");
const flowTrack = document.getElementById("flowTrack");
const stepStatus = document.getElementById("stepStatus");
const prevStepButton = document.getElementById("prevStep");
const nextStepButton = document.getElementById("nextStep");
const themeToggle = document.getElementById("themeToggle");
const overviewStages = document.getElementById("overviewStages");
const overviewSources = document.getElementById("overviewSources");
const stageCard = document.getElementById("stageCard");
const stageBadge = document.getElementById("stageBadge");
const stageGroup = document.getElementById("stageGroup");
const stageSourceCount = document.getElementById("stageSourceCount");
const stageTitle = document.getElementById("stageTitle");
const stageTransition = document.getElementById("stageTransition");
const stageDefinition = document.getElementById("stageDefinition");
const stageExample = document.getElementById("stageExample");
const stageWhy = document.getElementById("stageWhy");
const stageVideoWrap = document.getElementById("stageVideoWrap");
const stageVideo = document.getElementById("stageVideo");
const stageVideoCredit = document.getElementById("stageVideoCredit");
const stageIllustration = document.getElementById("stageIllustration");
const stageSources = document.getElementById("stageSources");

async function loadData() {
  try {
    const response = await fetch("content/nodes.json");
    if (!response.ok) {
      throw new Error("Failed to load content/nodes.json");
    }
    return response.json();
  } catch (error) {
    // Fallback for file:// usage where fetch can be blocked by browser security.
    if (window.EMBEDDED_NODES_DATA) {
      return window.EMBEDDED_NODES_DATA;
    }
    throw error;
  }
}

function getGroupLabel(group) {
  const labels = {
    fact: "Fact Base",
    transform: "Distortion Stage",
    impact: "Social Impact",
    correct: "Correction Stage"
  };

  return labels[group] || "Flow Stage";
}

function getEdgeMap(edges) {
  return new Map(edges.map((edge) => [`${edge.source}->${edge.target}`, edge]));
}

function buildFallbackStorylines(nodesById) {
  const fallbackIds = [
    "fact",
    "mishearing",
    "propagation",
    "amplification",
    "public-reaction",
    "correction"
  ].filter((id) => Boolean(nodesById[id]));

  return [
    {
      id: "default-path",
      title: "Default Path",
      description: "Fallback storyline",
      nodes: fallbackIds
    }
  ];
}

function renderSourceList(sources) {
  sourceList.innerHTML = "";

  Object.values(sources).forEach((source) => {
    const li = document.createElement("li");
    li.className = "source-item";

    const title = document.createElement("p");
    title.className = "source-title";
    title.textContent = source.shortCitation;

    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open source";

    const citation = document.createElement("p");
    citation.className = "source-meta";
    citation.textContent = source.fullCitation || "";

    const note = document.createElement("p");
    note.className = "source-note";
    note.textContent = source.annotationSummary || "";

    li.appendChild(title);
    li.appendChild(link);
    if (citation.textContent) {
      li.appendChild(citation);
    }
    if (note.textContent) {
      li.appendChild(note);
    }
    sourceList.appendChild(li);
  });
}

function renderStoryTree(storylines, nodesById, onSelectNode) {
  storyTree.innerHTML = "";

  const rootId = storylines[0]?.nodes?.[0];
  const rootNode = nodesById[rootId];

  if (rootNode) {
    const rootWrap = document.createElement("div");
    rootWrap.className = "tree-root";

    const rootButton = document.createElement("button");
    rootButton.type = "button";
    rootButton.className = "tree-node tree-root-node";
    rootButton.dataset.nodeId = rootNode.id;
    rootButton.textContent = rootNode.title;
    rootButton.setAttribute("role", "treeitem");
    rootButton.setAttribute("aria-label", `Jump to ${rootNode.title}`);
    rootButton.addEventListener("click", () => onSelectNode(rootNode.id));

    rootWrap.appendChild(rootButton);
    storyTree.appendChild(rootWrap);
  }

  const branchesWrap = document.createElement("div");
  branchesWrap.className = "tree-branches";

  storylines.forEach((story) => {
    const branch = document.createElement("div");
    branch.className = "tree-branch";
    branch.dataset.storyId = story.id;

    const label = document.createElement("p");
    label.className = "tree-branch-label";
    label.textContent = story.title;

    const nodeRail = document.createElement("div");
    nodeRail.className = "tree-node-rail";

    story.nodes.slice(1).forEach((nodeId) => {
      const node = nodesById[nodeId];
      if (!node) {
        return;
      }

      const nodeButton = document.createElement("button");
      nodeButton.type = "button";
      nodeButton.className = "tree-node";
      nodeButton.dataset.nodeId = node.id;
      nodeButton.dataset.storyId = story.id;
      nodeButton.textContent = node.title;
      nodeButton.setAttribute("role", "treeitem");
      nodeButton.setAttribute("aria-label", `Jump to ${node.title} in ${story.title}`);
      nodeButton.addEventListener("click", () => onSelectNode(node.id));
      nodeRail.appendChild(nodeButton);
    });

    branch.appendChild(label);
    branch.appendChild(nodeRail);
    branchesWrap.appendChild(branch);
  });

  storyTree.appendChild(branchesWrap);
}

function renderStoryTabs(storylines, activeId, onSelectStory) {
  storyTabs.innerHTML = "";

  storylines.forEach((story) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "story-tab";
    button.dataset.storyId = story.id;
    button.textContent = story.title;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", story.id === activeId ? "true" : "false");
    if (story.id === activeId) {
      button.classList.add("is-active");
    }
    button.addEventListener("click", () => onSelectStory(story.id));
    storyTabs.appendChild(button);
  });
}

function renderFlowTrack(pathIds, nodesById, edgeMap) {
  flowTrack.innerHTML = "";
  pathIds.forEach((id, index) => {
    const li = document.createElement("li");
    li.className = "track-item";
    li.dataset.nodeId = id;
    li.textContent = nodesById[id]?.title || id;
    flowTrack.appendChild(li);

    if (index < pathIds.length - 1) {
      const arrow = document.createElement("li");
      arrow.className = "track-connector";
      const edge = edgeMap.get(`${id}->${pathIds[index + 1]}`);
      arrow.innerHTML = `<span class="track-arrow" aria-hidden="true">→</span><span class="track-edge-label">${edge?.label || "next stage"}</span>`;
      arrow.setAttribute("aria-hidden", "true");
      flowTrack.appendChild(arrow);
    }
  });
}

function getYouTubeEmbedUrl(videoInput) {
  if (!videoInput) {
    return "";
  }

  try {
    const parsed = new URL(videoInput);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
    }
  } catch (_error) {
    return "";
  }

  return "";
}

function getNodeVideoEmbedUrl(node) {
  if (node.videoUrl) {
    return getYouTubeEmbedUrl(node.videoUrl);
  }
  return getYouTubeEmbedUrl(node.videoEmbedUrl);
}

function renderStage(node, sources, currentIndex, pathLength, transitionLabel) {
  stageBadge.textContent = `Step ${currentIndex + 1} of ${pathLength}`;
  stageGroup.textContent = getGroupLabel(node.group);
  stageSourceCount.textContent = `${node.sources.length} source${node.sources.length === 1 ? "" : "s"}`;
  stageTitle.textContent = node.title;
  stageTransition.textContent = transitionLabel;
  stageDefinition.textContent = node.definition;
  stageExample.textContent = node.example;
  stageWhy.textContent = node.whyMatters;

  const videoEmbedUrl = getNodeVideoEmbedUrl(node);
  const hasVideo = Boolean(videoEmbedUrl);
  if (hasVideo) {
    stageVideoWrap.hidden = false;
    stageVideo.src = videoEmbedUrl;
    stageVideo.title = node.videoTitle || `Video for ${node.title}`;
    if (node.videoCreditText && node.videoCreditUrl) {
      stageVideoCredit.textContent = "Video source: ";
      const creditLink = document.createElement("a");
      creditLink.href = node.videoCreditUrl;
      creditLink.target = "_blank";
      creditLink.rel = "noopener noreferrer";
      creditLink.textContent = node.videoCreditText;
      stageVideoCredit.appendChild(creditLink);
    } else {
      stageVideoCredit.textContent = "";
    }
    stageIllustration.hidden = true;
  } else {
    stageVideoWrap.hidden = true;
    stageVideo.src = "";
    stageVideoCredit.textContent = "";
    stageIllustration.hidden = false;
  }

  stageIllustration.src = node.illustration;
  stageIllustration.alt = node.illustrationAlt;

  stageSources.innerHTML = "";
  node.sources.forEach((sourceKey) => {
    const source = sources[sourceKey];
    if (!source) {
      return;
    }
    const li = document.createElement("li");
    li.className = "source-item";

    const title = document.createElement("p");
    title.className = "source-title";
    title.textContent = source.shortCitation;

    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open source";

    const summary = document.createElement("p");
    summary.className = "source-note";
    summary.textContent = source.annotationSummary || "";

    const credibility = document.createElement("p");
    credibility.className = "source-meta";
    credibility.textContent = source.credibility
      ? `Credibility: ${source.credibility}`
      : "";

    const projectUse = document.createElement("p");
    projectUse.className = "source-meta";
    projectUse.textContent = source.projectUse
      ? `Use in project: ${source.projectUse}`
      : "";

    li.appendChild(title);
    li.appendChild(link);
    if (summary.textContent) {
      li.appendChild(summary);
    }
    if (credibility.textContent) {
      li.appendChild(credibility);
    }
    if (projectUse.textContent) {
      li.appendChild(projectUse);
    }
    stageSources.appendChild(li);
  });
}

function updateActiveUi(currentId, activeStoryId) {
  document.querySelectorAll(".tree-node").forEach((button) => {
    const isActive = button.dataset.nodeId === currentId;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll(".tree-branch").forEach((branch) => {
    branch.classList.toggle("is-active", branch.dataset.storyId === activeStoryId);
  });

  document.querySelectorAll(".track-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.nodeId === currentId);
  });
}

function applySavedTheme() {
  const saved = localStorage.getItem("flowchart-theme");
  if (saved === "dark" || saved === "light") {
    document.documentElement.setAttribute("data-theme", saved);
  }
}

function updateThemeToggleLabel() {
  const current = document.documentElement.getAttribute("data-theme");
  themeToggle.textContent = current === "dark" ? "Switch to Light" : "Switch to Dark";
}

function setupThemeToggle() {
  updateThemeToggleLabel();
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("flowchart-theme", next);
    updateThemeToggleLabel();
  });
}

async function start() {
  applySavedTheme();
  setupThemeToggle();

  try {
    const data = await loadData();
    const nodesById = Object.fromEntries(data.nodes.map((node) => [node.id, node]));
    const edgeMap = getEdgeMap(data.edges || []);
    const storylines = (data.storylines && data.storylines.length > 0)
      ? data.storylines.filter((story) => story.nodes.every((id) => Boolean(nodesById[id])))
      : buildFallbackStorylines(nodesById);

    if (storylines.length === 0) {
      throw new Error("No valid storylines found.");
    }

    renderSourceList(data.sources);
    overviewSources.textContent = `${Object.keys(data.sources).length} sources`;
    renderStoryTree(storylines, nodesById, jumpToNode);

    let activeStoryline = storylines[0];
    let currentIndex = 0;

    function updateStorylineTabState() {
      document.querySelectorAll(".story-tab").forEach((tab) => {
        const isActive = tab.dataset.storyId === activeStoryline.id;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    function selectStoryline(storyId, preferredNodeId) {
      const next = storylines.find((story) => story.id === storyId);
      if (!next) {
        return;
      }

      activeStoryline = next;
      overviewStages.textContent = activeStoryline.title;
      renderFlowTrack(activeStoryline.nodes, nodesById, edgeMap);
      updateStorylineTabState();

      const indexFromPreferred = preferredNodeId
        ? activeStoryline.nodes.indexOf(preferredNodeId)
        : -1;
      currentIndex = indexFromPreferred >= 0 ? indexFromPreferred : 0;
      renderCurrentNode();
    }

    function jumpToNode(nodeId) {
      const inCurrent = activeStoryline.nodes.indexOf(nodeId);
      if (inCurrent >= 0) {
        currentIndex = inCurrent;
        renderCurrentNode();
        return;
      }

      const containingStory = storylines.find((story) => story.nodes.includes(nodeId));
      if (containingStory) {
        selectStoryline(containingStory.id, nodeId);
      }
    }

    function renderCurrentNode() {
      const currentId = activeStoryline.nodes[currentIndex];
      if (!currentId) {
        return;
      }
      const currentNode = nodesById[currentId];

      if (!currentNode) {
        return;
      }

      const transitionLabel = currentIndex === 0
        ? `${activeStoryline.title}: ${activeStoryline.description || "starting point"}`
        : `Transition: ${edgeMap.get(`${activeStoryline.nodes[currentIndex - 1]}->${currentId}`)?.label || "next stage"}.`;

      renderStage(currentNode, data.sources, currentIndex, activeStoryline.nodes.length, transitionLabel);
      updateActiveUi(currentId, activeStoryline.id);

      stepStatus.textContent = `${activeStoryline.title} | Step ${currentIndex + 1} of ${activeStoryline.nodes.length}: ${currentNode.title}`;
      prevStepButton.disabled = currentIndex === 0;
      nextStepButton.disabled = currentIndex === activeStoryline.nodes.length - 1;

      stageCard.classList.remove("stage-enter");
      void stageCard.offsetWidth;
      stageCard.classList.add("stage-enter");
      stageCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      stageCard.focus({ preventScroll: true });
    }

    prevStepButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        renderCurrentNode();
      }
    });

    nextStepButton.addEventListener("click", () => {
      if (currentIndex < activeStoryline.nodes.length - 1) {
        currentIndex += 1;
        renderCurrentNode();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevStepButton.click();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextStepButton.click();
      }
      if (event.key === "Home") {
        event.preventDefault();
        currentIndex = 0;
        renderCurrentNode();
      }
      if (event.key === "End") {
        event.preventDefault();
        currentIndex = activeStoryline.nodes.length - 1;
        renderCurrentNode();
      }
    });

    renderStoryTabs(storylines, activeStoryline.id, (storyId) => {
      selectStoryline(storyId);
    });
    selectStoryline(activeStoryline.id);
  } catch (error) {
    sourceList.innerHTML = `<li>Could not load content. ${error.message}</li>`;
    stepStatus.textContent = "Could not initialize flowchart content.";
  }
}

start();
