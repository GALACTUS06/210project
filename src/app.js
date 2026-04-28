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
const stageIllustrationCaption = document.getElementById("stageIllustrationCaption");
const stageQuoteCard = document.getElementById("stageQuoteCard");
const stageQuoteText = document.getElementById("stageQuoteText");
const stageQuoteAttribution = document.getElementById("stageQuoteAttribution");
const stageArticleLink = document.getElementById("stageArticleLink");
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

function getDisplayNodeTitle(title) {
  if (!title) {
    return "";
  }
  return title.replace(/\s*\((Mishearing|Manipulation|Fabrication) Story\)$/i, "").trim();
}

function isPlaceholderIllustration(path) {
  return typeof path === "string" && path.startsWith("assets/illustrations/");
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

function renderDagTree(storylines, nodesById, edges, onSelectNode) {
  storyTree.innerHTML = "";

  const NODE_W = 146;
  const NODE_H = 54;
  const COL_W = 160;
  const ROW_H = 84;
  const PAD_X = 18;
  const PAD_Y = 16;

  // Map each node to its column index and which storyline rows it appears in
  const nodeColMap = new Map();
  const nodeStoryRows = new Map();

  storylines.forEach((story, storyRowIdx) => {
    story.nodes.forEach((nodeId, colIdx) => {
      if (!nodeColMap.has(nodeId)) {
        nodeColMap.set(nodeId, colIdx);
      }
      const rows = nodeStoryRows.get(nodeId) || [];
      if (!rows.includes(storyRowIdx)) {
        rows.push(storyRowIdx);
      }
      nodeStoryRows.set(nodeId, rows);
    });
  });

  const maxCol = Math.max(0, ...nodeColMap.values());
  const maxRow = storylines.length - 1;
  const totalW = PAD_X * 2 + maxCol * COL_W + NODE_W;
  const totalH = PAD_Y * 2 + maxRow * ROW_H + NODE_H;

  // Compute centre pixel position for each node
  const nodeCenter = new Map();
  nodeColMap.forEach((col, nodeId) => {
    const rows = nodeStoryRows.get(nodeId) || [0];
    const avgRow = rows.reduce((a, b) => a + b, 0) / rows.length;
    nodeCenter.set(nodeId, {
      cx: PAD_X + col * COL_W + NODE_W / 2,
      cy: PAD_Y + avgRow * ROW_H + NODE_H / 2
    });
  });

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `position:relative;width:${totalW}px;height:${totalH}px;`;

  // SVG overlay for bezier edges
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", totalW);
  svg.setAttribute("height", totalH);
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;overflow:visible;";

  edges.forEach((edge) => {
    const src = nodeCenter.get(edge.source);
    const tgt = nodeCenter.get(edge.target);
    if (!src || !tgt) {
      return;
    }
    const x1 = src.cx + NODE_W / 2;
    const y1 = src.cy;
    const x2 = tgt.cx - NODE_W / 2;
    const y2 = tgt.cy;
    const dx = Math.abs(x2 - x1) * 0.42;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} C ${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--line)");
    path.setAttribute("stroke-width", "1.5");
    svg.appendChild(path);
  });

  wrapper.appendChild(svg);

  // Render node buttons at computed positions
  nodeColMap.forEach((col, nodeId) => {
    const node = nodesById[nodeId];
    if (!node) {
      return;
    }
    const center = nodeCenter.get(nodeId);
    const rows = nodeStoryRows.get(nodeId) || [];
    const isShared = rows.length > 1;
    const isRoot = col === 0;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tree-node dag-node";
    if (isShared) {
      btn.classList.add("dag-node-shared");
    }
    if (isRoot) {
      btn.classList.add("dag-node-root");
    }
    btn.dataset.nodeId = nodeId;
    btn.title = node.title;
    btn.textContent = getDisplayNodeTitle(node.title);
    btn.setAttribute("aria-label", `Go to ${getDisplayNodeTitle(node.title)}${isShared ? " (shared stage)" : ""}`);
    btn.style.cssText = `position:absolute;left:${center.cx - NODE_W / 2}px;top:${center.cy - NODE_H / 2}px;width:${NODE_W}px;height:${NODE_H}px;`;
    btn.addEventListener("click", () => onSelectNode(nodeId));
    wrapper.appendChild(btn);
  });

  storyTree.appendChild(wrapper);
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
    li.textContent = getDisplayNodeTitle(nodesById[id]?.title) || id;
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
  stageTitle.textContent = getDisplayNodeTitle(node.title);
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
    stageQuoteCard.hidden = true;
    stageQuoteText.textContent = "";
    stageQuoteAttribution.textContent = "";
    stageArticleLink.hidden = true;
    stageArticleLink.href = "";
    stageArticleLink.textContent = "";
    if (node.illustrationCaption) {
      stageIllustrationCaption.hidden = false;
      stageIllustrationCaption.textContent = node.illustrationCaption;
    } else {
      stageIllustrationCaption.hidden = true;
      stageIllustrationCaption.textContent = "";
    }
  } else {
    stageVideoWrap.hidden = true;
    stageVideo.src = "";
    stageVideoCredit.textContent = "";
    const canShowIllustration = Boolean(node.illustration) && !isPlaceholderIllustration(node.illustration);
    stageIllustration.hidden = !canShowIllustration;
    if (node.illustrationCaption) {
      stageIllustrationCaption.hidden = false;
      stageIllustrationCaption.textContent = node.illustrationCaption;
    } else {
      stageIllustrationCaption.hidden = true;
      stageIllustrationCaption.textContent = "";
    }
    if (node.illustrationQuote) {
      stageIllustration.hidden = true;
      stageQuoteCard.hidden = false;
      stageQuoteText.textContent = node.illustrationQuote;
      stageQuoteAttribution.textContent = node.illustrationQuoteAttribution || "";
    } else {
      stageQuoteCard.hidden = true;
      stageQuoteText.textContent = "";
      stageQuoteAttribution.textContent = "";
    }
    if (node.illustrationLink) {
      stageArticleLink.hidden = false;
      stageArticleLink.href = node.illustrationLink;
      stageArticleLink.textContent = node.illustrationLinkText || "View article";
    } else {
      stageArticleLink.hidden = true;
      stageArticleLink.href = "";
      stageArticleLink.textContent = "";
    }
  }

  if (!stageIllustration.hidden) {
    stageIllustration.src = node.illustration;
    stageIllustration.alt = node.illustrationAlt;
  } else {
    stageIllustration.removeAttribute("src");
    stageIllustration.alt = "";
  }

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

  if (node.mediaSources && node.mediaSources.length > 0) {
    const divider = document.createElement("li");
    divider.className = "source-media-divider";
    divider.textContent = "Media used in this illustration:";
    stageSources.appendChild(divider);
    node.mediaSources.forEach((ms) => {
      const li = document.createElement("li");
      li.className = "source-item source-media-item";
      const link = document.createElement("a");
      link.href = ms.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = ms.text;
      li.appendChild(link);
      stageSources.appendChild(li);
    });
  }
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
    renderDagTree(storylines, nodesById, data.edges || [], jumpToNode);

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

    function moveStoryline(offset) {
      const currentStoryIndex = storylines.findIndex((story) => story.id === activeStoryline.id);
      if (currentStoryIndex < 0) {
        return;
      }
      const nextIndex = currentStoryIndex + offset;
      if (nextIndex < 0 || nextIndex >= storylines.length) {
        return;
      }
      selectStoryline(storylines[nextIndex].id);
    }

    function jumpToNode(nodeId, preferredStoryId) {
      // If the click originated from a specific branch, honour that branch first
      if (preferredStoryId && preferredStoryId !== activeStoryline.id) {
        const preferredStory = storylines.find((s) => s.id === preferredStoryId);
        if (preferredStory && preferredStory.nodes.includes(nodeId)) {
          selectStoryline(preferredStoryId, nodeId);
          return;
        }
      }

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

      stepStatus.textContent = `${activeStoryline.title} | Step ${currentIndex + 1} of ${activeStoryline.nodes.length}: ${getDisplayNodeTitle(currentNode.title)}`;
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
      const activeEl = document.activeElement;
      const isTypingContext = activeEl && (
        activeEl.tagName === "INPUT"
        || activeEl.tagName === "TEXTAREA"
        || activeEl.isContentEditable
      );
      if (isTypingContext) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "a") {
        event.preventDefault();
        prevStepButton.click();
        return;
      }

      if (key === "d") {
        event.preventDefault();
        nextStepButton.click();
        return;
      }

      if (key === "w") {
        event.preventDefault();
        moveStoryline(-1);
        return;
      }

      if (key === "s") {
        event.preventDefault();
        moveStoryline(1);
        return;
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
