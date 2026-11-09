(() => {
  const meals = [
    { name: "滷肉飯", category: "飯麵" },
    { name: "雞肉飯", category: "飯麵" },
    { name: "牛肉麵", category: "飯麵" },
    { name: "豬腳飯", category: "飯麵" },
    { name: "控肉飯", category: "飯麵" },
    { name: "米粉炒", category: "飯麵" },
    { name: "蚵仔煎", category: "小吃" },
    { name: "鹽酥雞", category: "小吃" },
    { name: "肉圓", category: "小吃" },
    { name: "蚵仔麵線", category: "小吃" },
    { name: "大腸包小腸", category: "小吃" },
    { name: "臭豆腐", category: "小吃" },
    { name: "虱目魚肚湯", category: "湯品" },
    { name: "貢丸湯", category: "湯品" },
    { name: "四神湯", category: "湯品" },
    { name: "蛤蜊湯", category: "湯品" },
    { name: "刈包", category: "其他" },
    { name: "蔥油餅", category: "其他" },
    { name: "蘿蔔糕", category: "其他" },
    { name: "豆花", category: "其他" }
  ];

  const selectedMeals = new Set();
  const customMeals = [];
  let mode = "all";
  let filter = "全部";
  let previousPick = "";

  const mealList = document.querySelector("#meal-list");
  const menuCount = document.querySelector("#menu-count");
  const candidateList = document.querySelector("#candidate-list");
  const candidateCount = document.querySelector("#candidate-count");
  const drawButton = document.querySelector("#draw-button");
  const drawFeedback = document.querySelector("#draw-feedback");
  const customFeedback = document.querySelector("#custom-feedback");
  const pickName = document.querySelector("#pick-name");
  const pickCaption = document.querySelector("#pick-caption");
  const pickCard = document.querySelector(".pick-card");
  const customInput = document.querySelector("#custom-input");

  function getPool() {
    return [
      ...meals.filter((meal) => selectedMeals.has(meal.name)).map((meal) => meal.name),
      ...customMeals
    ];
  }

  function renderMeals() {
    const visibleMeals = meals.filter((meal) => filter === "全部" || meal.category === filter);
    mealList.replaceChildren();

    if (!visibleMeals.length) {
      const empty = document.createElement("div");
      empty.className = "list-empty";
      empty.textContent = "這個分類目前沒有菜色。";
      mealList.append(empty);
    } else {
      visibleMeals.forEach((meal) => {
        const label = document.createElement("label");
        label.className = "meal-option";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = meal.name;
        checkbox.checked = selectedMeals.has(meal.name);
        checkbox.setAttribute("aria-label", `將${meal.name}加入口袋名單`);
        checkbox.addEventListener("change", () => {
          checkbox.checked ? selectedMeals.add(meal.name) : selectedMeals.delete(meal.name);
          renderCandidates();
          syncDrawState();
        });
        const text = document.createElement("span");
        text.className = "meal-name";
        text.append(document.createTextNode(meal.name));
        const category = document.createElement("span");
        category.className = "meal-category";
        category.textContent = meal.category;
        text.append(category);
        label.append(checkbox, text);
        mealList.append(label);
      });
    }
    menuCount.textContent = `共 ${meals.length} 道`;
    document.querySelector("#select-all").textContent =
      selectedMeals.size === meals.length ? "清除勾選" : "全選";
  }

  function renderCandidates() {
    const pool = getPool();
    candidateList.replaceChildren();
    candidateCount.textContent = `${pool.length} 道`;

    if (!pool.length) {
      const empty = document.createElement("div");
      empty.className = "candidate-empty";
      empty.textContent = "名單還空空的。勾選上方菜色，或加一道私房菜，再從這裡抽籤。";
      candidateList.append(empty);
      return;
    }

    pool.forEach((name) => {
      const chip = document.createElement("div");
      chip.className = "candidate-chip";
      const text = document.createElement("span");
      text.textContent = name;
      const remove = document.createElement("button");
      remove.className = "remove-candidate";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `從口袋名單移除${name}`);
      remove.addEventListener("click", () => {
        if (customMeals.includes(name)) {
          customMeals.splice(customMeals.indexOf(name), 1);
        } else {
          selectedMeals.delete(name);
        }
        renderMeals();
        renderCandidates();
        syncDrawState();
        setCustomFeedback(`已移除「${name}」。`, "success");
      });
      chip.append(text, remove);
      candidateList.append(chip);
    });
  }

  function setMode(nextMode) {
    mode = nextMode;
    document.querySelector("#all-mode").setAttribute("aria-pressed", String(mode === "all"));
    document.querySelector("#pool-mode").setAttribute("aria-pressed", String(mode === "pool"));
    syncDrawState();
  }

  function syncDrawState() {
    const poolEmpty = getPool().length === 0;
    const disabled = mode === "pool" && poolEmpty;
    drawButton.disabled = disabled;
    drawButton.querySelector("span").textContent = mode === "all" ? "從全部菜色抽一個" : "從口袋名單抽一個";
    drawFeedback.classList.toggle("is-error", disabled);
    drawFeedback.textContent = disabled ? "口袋名單目前是空的，先勾選菜色或加入自訂菜名吧。" : "";
  }

  function setCustomFeedback(message, tone = "") {
    customFeedback.textContent = message;
    customFeedback.classList.toggle("is-error", tone === "error");
    customFeedback.classList.toggle("is-success", tone === "success");
  }

  function drawMeal() {
    const pool = mode === "all" ? meals.map((meal) => meal.name) : getPool();
    if (!pool.length) {
      syncDrawState();
      return;
    }
    const available = pool.length > 1 && previousPick ? pool.filter((name) => name !== previousPick) : pool;
    const chosen = available[Math.floor(Math.random() * available.length)];
    previousPick = chosen;
    pickName.textContent = chosen;
    pickCaption.textContent = mode === "all" ? "從全部台灣好味道裡，替你挑出這一道。" : "從你的口袋名單裡，替你挑出這一道。";
    drawFeedback.textContent = "";
    pickCard.classList.remove("is-drawing");
    void pickCard.offsetWidth;
    pickCard.classList.add("is-drawing");
  }

  document.querySelector("#all-mode").addEventListener("click", () => setMode("all"));
  document.querySelector("#pool-mode").addEventListener("click", () => setMode("pool"));
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      renderMeals();
    });
  });

  document.querySelector("#select-all").addEventListener("click", () => {
    if (selectedMeals.size === meals.length) selectedMeals.clear();
    else meals.forEach((meal) => selectedMeals.add(meal.name));
    renderMeals();
    renderCandidates();
    syncDrawState();
  });

  document.querySelector("#custom-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const names = customInput.value
      .split(/[、,，;\n]/)
      .map((name) => name.trim())
      .filter(Boolean);

    if (!names.length) {
      setCustomFeedback("先寫下想吃的菜名，再加入名單喔。", "error");
      customInput.focus();
      return;
    }

    const existing = new Set([...meals.map((meal) => meal.name), ...customMeals]);
    const added = [];
    const duplicates = [];
    names.forEach((name) => {
      if (existing.has(name)) {
        duplicates.push(name);
      } else {
        customMeals.push(name);
        existing.add(name);
        added.push(name);
      }
    });

    renderCandidates();
    syncDrawState();
    customInput.value = "";
    if (added.length) {
      const suffix = duplicates.length ? `（${duplicates.join("、")}已在名單中）` : "";
      setCustomFeedback(`已加入 ${added.length} 道菜色${suffix}`, "success");
    } else {
      setCustomFeedback("這些菜色已經在名單裡了，不用重複加入。", "error");
    }
    customInput.focus();
  });

  drawButton.addEventListener("click", drawMeal);

  renderMeals();
  renderCandidates();
  syncDrawState();
})();
