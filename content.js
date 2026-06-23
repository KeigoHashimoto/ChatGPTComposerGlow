(function initChatGlowExtension() {
  if (window.__chatGlowLoaded) {
    return;
  }
  window.__chatGlowLoaded = true;

  const CLASS = {
    composer: "chatglow-composer",
    hasInput: "chatglow-has-input",
    sendReady: "chatglow-send-ready",
    assistantWaiting: "chatglow-assistant-waiting",
    assistantComplete: "chatglow-assistant-complete",
    sidebarActive: "chatglow-sidebar-active"
  };

  const SELECTOR = {
    composerInput: [
      "#prompt-textarea",
      'textarea[name="prompt-textarea"]',
      '[contenteditable="true"]',
      ".ProseMirror"
    ].join(","),
    sendButton: [
      'button[data-testid="send-button"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      'button[aria-label*="送信"]',
      'button[type="submit"]'
    ].join(","),
    stopButton: [
      'button[data-testid="stop-button"]',
      'button[aria-label*="Stop"]',
      'button[aria-label*="stop"]',
      'button[aria-label*="停止"]',
      'button[aria-label*="中止"]'
    ].join(","),
    assistantMessage: '[data-message-author-role="assistant"]',
    sidebarLinks: ':where(aside, nav, [data-testid="history-sidebar"]) a[href]'
  };

  const state = {
    composer: null,
    sendButton: null,
    assistantMessage: null,
    sidebarItem: null,
    lastWaitingAssistantMessage: null,
    wasWaitingForAssistant: false,
    completionTimer: null
  };

  function isVisible(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function getComposer(input) {
    if (!input) {
      return null;
    }

    return input.closest('[data-testid="composer"]') || input.closest('form[data-type="unified-composer"]') || null;
  }

  function getComposerInput() {
    const inputs = Array.from(document.querySelectorAll(SELECTOR.composerInput)).filter((input) => {
      return isVisible(input) && Boolean(getComposer(input));
    });

    return inputs[inputs.length - 1] || null;
  }

  function getInputText(input) {
    if (!input) {
      return "";
    }

    return "value" in input ? input.value || "" : input.textContent || "";
  }

  function getSendButton(composer) {
    const button = (composer || document).querySelector(SELECTOR.sendButton);
    return isVisible(button) ? button : null;
  }

  function isWaitingForAssistant() {
    return Array.from(document.querySelectorAll(SELECTOR.stopButton)).some(isVisible);
  }

  function getLatestAssistantMessage() {
    const messages = Array.from(document.querySelectorAll(SELECTOR.assistantMessage));
    return messages[messages.length - 1] || null;
  }

  function getSidebarItemForLink(link) {
    return (
      link.closest("li") ||
      link.closest('[role="listitem"]') ||
      link.closest('[role="treeitem"]') ||
      link.closest('[role="button"]') ||
      link
    );
  }

  function normalizePath(href) {
    try {
      return new URL(href, window.location.origin).pathname.replace(/\/$/, "");
    } catch (_error) {
      return href.replace(/\/$/, "");
    }
  }

  function getActiveSidebarItem() {
    const currentPath = window.location.pathname.replace(/\/$/, "");

    if (!/^\/c\/[^/]+/.test(currentPath)) {
      return null;
    }

    const links = Array.from(document.querySelectorAll(SELECTOR.sidebarLinks));
    const activeLink = links.find((link) => normalizePath(link.getAttribute("href") || "") === currentPath);
    return activeLink ? getSidebarItemForLink(activeLink) : null;
  }

  function replaceClass(previous, next, className) {
    if (previous && previous !== next) {
      previous.classList.remove(className);
    }

    if (next) {
      next.classList.add(className);
    }
  }

  function clearStaleClasses(nextComposer, nextSendButton, nextAssistantMessage, nextSidebarItem) {
    if (state.composer && state.composer !== nextComposer) {
      state.composer.classList.remove(CLASS.composer, CLASS.hasInput);
    }

    if (state.sendButton && state.sendButton !== nextSendButton) {
      state.sendButton.classList.remove(CLASS.sendReady);
    }

    if (state.assistantMessage && state.assistantMessage !== nextAssistantMessage) {
      state.assistantMessage.classList.remove(CLASS.assistantWaiting);
    }

    if (state.sidebarItem && state.sidebarItem !== nextSidebarItem) {
      state.sidebarItem.classList.remove(CLASS.sidebarActive);
    }
  }

  function showCompletion(message) {
    if (!message || !document.documentElement.contains(message)) {
      return;
    }

    if (state.completionTimer) {
      window.clearTimeout(state.completionTimer);
    }

    message.classList.remove(CLASS.assistantWaiting);
    message.classList.add(CLASS.assistantComplete);

    state.completionTimer = window.setTimeout(() => {
      message.classList.remove(CLASS.assistantComplete);
      state.completionTimer = null;
    }, 1150);
  }

  function updateState() {
    const input = getComposerInput();
    const composer = getComposer(input);
    const sendButton = getSendButton(composer);
    const hasInput = getInputText(input).trim().length > 0;
    const isWaiting = isWaitingForAssistant();
    const assistantMessage = isWaiting ? getLatestAssistantMessage() : null;
    const sidebarItem = getActiveSidebarItem();

    clearStaleClasses(composer, sendButton, assistantMessage, sidebarItem);

    if (state.wasWaitingForAssistant && !isWaiting) {
      showCompletion(state.lastWaitingAssistantMessage);
    }

    if (composer) {
      composer.classList.add(CLASS.composer);
      composer.classList.toggle(CLASS.hasInput, hasInput);
    }

    if (sendButton) {
      sendButton.classList.toggle(CLASS.sendReady, hasInput && !sendButton.disabled && !isWaiting);
    }

    replaceClass(null, assistantMessage, CLASS.assistantWaiting);
    replaceClass(null, sidebarItem, CLASS.sidebarActive);
    document.documentElement.classList.toggle("chatglow-awaiting-response", isWaiting);

    state.composer = composer;
    state.sendButton = sendButton;
    state.assistantMessage = assistantMessage;
    state.sidebarItem = sidebarItem;
    state.lastWaitingAssistantMessage = isWaiting ? assistantMessage : state.lastWaitingAssistantMessage;
    state.wasWaitingForAssistant = isWaiting;
  }

  document.addEventListener("input", updateState, true);
  document.addEventListener("keyup", updateState, true);
  document.addEventListener("click", () => window.setTimeout(updateState, 50), true);

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(updateState);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "aria-label", "data-testid", "href"]
  });

  window.setInterval(updateState, 500);
  updateState();
})();
