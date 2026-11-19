const SUPABASE_URL = "https://pjefuqlcnauluvfeunkw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_e7kD3a75k-2FjMyCyURsPg_Kp-SBzpi";

// Completely unique global reference to avoid any variable re-declaration errors
window.supabaseClient =
  window.supabaseClient ||
  window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const mealNameInput = document.querySelector("#mealName");
const mealDateInput = document.querySelector("#mealDate");
const mealDescInput = document.querySelector("#mealDesc");
const mealLinkInput = document.querySelector("#mealLink");
const mealsContainer = document.querySelector("#meals");

const shopInput = document.querySelector("#shopListInput");
const shopList = document.querySelector(".shopListEntries");
const shopFormQtyMinus = document.querySelector("#shopFormQtyMinus");
const shopFormQtyPlus = document.querySelector("#shopFormQtyPlus");
const shopFormQtyDisplay = document.querySelector("#shopFormQtyDisplay");

let newShopQuantity = 1;

// Add-Shop Form Quantity Stepper Handlers
if (shopFormQtyMinus && shopFormQtyPlus && shopFormQtyDisplay) {
  shopFormQtyMinus.addEventListener("click", () => {
    if (newShopQuantity > 1) {
      newShopQuantity--;
      shopFormQtyDisplay.textContent = newShopQuantity;
    }
  });

  shopFormQtyPlus.addEventListener("click", () => {
    newShopQuantity++;
    shopFormQtyDisplay.textContent = newShopQuantity;
  });
}

const inventoryInput = document.querySelector("#inventoryInput");
const inventoryContainer = document.querySelector("#inventoryContainer");
const invFormQtyMinus = document.querySelector("#invFormQtyMinus");
const invFormQtyPlus = document.querySelector("#invFormQtyPlus");
const invFormQtyDisplay = document.querySelector("#invFormQtyDisplay");

let newInvQuantity = 1;

// Add-Inventory Form Quantity Stepper Handlers
if (invFormQtyMinus && invFormQtyPlus && invFormQtyDisplay) {
  invFormQtyMinus.addEventListener("click", () => {
    if (newInvQuantity > 1) {
      newInvQuantity--;
      invFormQtyDisplay.textContent = newInvQuantity;
    }
  });

  invFormQtyPlus.addEventListener("click", () => {
    newInvQuantity++;
    invFormQtyDisplay.textContent = newInvQuantity;
  });
}

// Location Radio Toggle References
const mainLocRadios = document.querySelectorAll('input[name="mainLocation"]');
const kitchenSubGroup = document.querySelector("#kitchenSubGroup");
const downstairsSubGroup = document.querySelector("#downstairsSubGroup");

// Modal Location Radio Toggle References
const modalMainLocRadios = document.querySelectorAll(
  'input[name="modalMainLocation"]',
);
const modalKitchenSubGroup = document.querySelector("#modalKitchenSubGroup");
const modalDownstairsSubGroup = document.querySelector(
  "#modalDownstairsSubGroup",
);

// Modal Send Quantity Stepper references
const modalSendQtyMinus = document.querySelector("#modalSendQtyMinus");
const modalSendQtyPlus = document.querySelector("#modalSendQtyPlus");
const modalSendQtyDisplay = document.querySelector("#modalSendQtyDisplay");

let modalSendQuantity = 1;

if (modalSendQtyMinus && modalSendQtyPlus && modalSendQtyDisplay) {
  modalSendQtyMinus.addEventListener("click", () => {
    if (modalSendQuantity > 1) {
      modalSendQuantity--;
      modalSendQtyDisplay.textContent = modalSendQuantity;
    }
  });

  modalSendQtyPlus.addEventListener("click", () => {
    modalSendQuantity++;
    modalSendQtyDisplay.textContent = modalSendQuantity;
  });
}

modalMainLocRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "Kitchen") {
      modalKitchenSubGroup.style.display = "flex";
      modalDownstairsSubGroup.style.display = "none";
      document
        .querySelectorAll('input[name="modalKitchenSub"]')
        .forEach((r) => (r.required = true));
      document
        .querySelectorAll('input[name="modalDownstairsSub"]')
        .forEach((r) => {
          r.required = false;
          r.checked = false;
        });
    } else if (value === "Downstairs") {
      modalDownstairsSubGroup.style.display = "flex";
      modalKitchenSubGroup.style.display = "none";
      document
        .querySelectorAll('input[name="modalDownstairsSub"]')
        .forEach((r) => (r.required = true));
      document
        .querySelectorAll('input[name="modalKitchenSub"]')
        .forEach((r) => {
          r.required = false;
          r.checked = false;
        });
    }
  });
});

// Profile and View State Elements
const loginContainer = document.querySelector("#loginContainer");
const appContainer = document.querySelector("#appContainer");
const loginForm = document.querySelector("#loginForm");
const userNameInput = document.querySelector("#userNameInput");
const profileList = document.querySelector("#profileList");
const logoutBtn = document.querySelector("#logoutBtn");
const homeLink = document.querySelector("#homeLink");
const appHeaderTitle = document.querySelector("#appHeaderTitle");

let realtimeChannel = null;

// Dynamic Toggle Handlers for Kitchen vs Downstairs Options
mainLocRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "Kitchen") {
      kitchenSubGroup.style.display = "flex";
      downstairsSubGroup.style.display = "none";
      document
        .querySelectorAll('input[name="kitchenSub"]')
        .forEach((r) => (r.required = true));
      document.querySelectorAll('input[name="downstairsSub"]').forEach((r) => {
        r.required = false;
        r.checked = false;
      });
    } else if (value === "Downstairs") {
      downstairsSubGroup.style.display = "flex";
      kitchenSubGroup.style.display = "none";
      document
        .querySelectorAll('input[name="downstairsSub"]')
        .forEach((r) => (r.required = true));
      document.querySelectorAll('input[name="kitchenSub"]').forEach((r) => {
        r.required = false;
        r.checked = false;
      });
    }
  });
});

// Target Helper for Categorized Inventory Sub-Sections
function getInvTargetList(location, subLocation) {
  const target = document.querySelector(
    `.inv-main-section[data-location="${location}"] .inv-sub-section[data-sub="${subLocation}"] ul`,
  );
  if (target) return target;

  const fallback = document.querySelector(
    '.inv-main-section[data-location="Kitchen"] .inv-sub-section[data-sub="Dry"] ul',
  );
  return fallback;
}

// Clear all nested Inventory Lists
function clearInventoryLists() {
  const invLists = document.querySelectorAll("#inventoryContainer ul");
  invLists.forEach((ul) => (ul.innerHTML = ""));
}

// Check active session on load
async function checkSession() {
  const activeUser = localStorage.getItem("tasty_active_user");
  if (activeUser) {
    if (loginContainer) loginContainer.style.display = "none";
    if (appContainer) appContainer.style.display = "block";
    if (appHeaderTitle) {
      appHeaderTitle.textContent = `${activeUser}'s Meal Planner`;
    }
    await loadUserData(activeUser);
    setupRealtimeSync(activeUser);
  } else {
    if (loginContainer) loginContainer.style.display = "flex";
    if (appContainer) appContainer.style.display = "none";
    if (appHeaderTitle) {
      appHeaderTitle.textContent = "Meal Planner";
    }
    mealsContainer.innerHTML = "";
    shopList.innerHTML = "";
    clearInventoryLists();
    if (realtimeChannel) window.supabaseClient.removeChannel(realtimeChannel);
  }
  renderProfiles();
}

// Load user-specific data from Supabase
async function loadUserData(username) {
  mealsContainer.innerHTML = "";
  shopList.innerHTML = "";
  clearInventoryLists();

  // 1. Load Meals
  const { data: meals, error: mealsErr } = await window.supabaseClient
    .from("meals")
    .select("*")
    .eq("profile_name", username);
  if (mealsErr) console.error("Error loading meals:", mealsErr);
  if (meals) {
    meals.forEach((meal) => createMealCardElement(meal, false));
  }

  // 2. Load Shop List
  const { data: shopItems, error: shopErr } = await window.supabaseClient
    .from("shopping_list")
    .select("*")
    .eq("profile_name", username)
    .order("text", { ascending: true });
  if (shopErr) console.error("Error loading shop list:", shopErr);
  if (shopItems) {
    shopItems.forEach((item) => createShopLiElement(item, false));
  }

  // 3. Load Inventory
  const { data: invItems, error: invErr } = await window.supabaseClient
    .from("inventory")
    .select("*")
    .eq("profile_name", username)
    .order("text", { ascending: true });
  if (invErr) console.error("Error loading inventory:", invErr);
  if (invItems) {
    invItems.forEach((item) => createInvLiElement(item, false));
  }
}

// Helper to populate label text and glowing green qty span
function setInventoryLabelContent(label, checkbox, text, qty) {
  label.textContent = text;
  if (qty > 1) {
    const qtySpan = document.createElement("span");
    qtySpan.className = "inv-qty-glow";
    qtySpan.textContent = `qty: ${qty}`;
    label.append(qtySpan);
  }
  if (checkbox) label.prepend(checkbox);
}

// Helper to normalize meal fields consistently
function normalizeMealData(raw) {
  const name = (raw.name || "").trim();
  const rawDate = (raw.date || "").trim();
  const isValidDate =
    rawDate !== "" && rawDate !== "Pending" && !isNaN(Date.parse(rawDate));
  const date = isValidDate ? rawDate : "Pending";

  const rawDesc = (raw.description || "").trim();
  const description = rawDesc !== "" ? rawDesc : "Mystery food?";

  const rawLink = (raw.link || "").trim();
  const link =
    rawLink !== ""
      ? rawLink
      : "https://michansohanson-prog.github.io/odin-recipes/";

  return { name, date, description, link };
}

// Helper to apply updated fields and re-sort a meal card in the DOM
function applyMealCardUpdate(mealCard, data) {
  const mealTitle = mealCard.querySelector("h2");
  const mealDateP = mealCard.querySelector(".date");
  const mealDescP = mealCard.querySelector(".meal-description");
  const recipeLink = mealCard.querySelector("a");

  if (mealTitle) mealTitle.textContent = data.name;
  if (mealDateP) mealDateP.textContent = data.date;
  if (mealDescP) mealDescP.textContent = data.description;
  if (recipeLink) {
    recipeLink.href = data.link;
    recipeLink.textContent = data.link.includes("odin-recipes")
      ? "Recipe Website"
      : "Link to Recipe";
  }

  mealCard.remove();
  insertMealCardSorted(mealCard, data.date);
}

function insertMealCardSorted(mealCard, dateStr) {
  const dateValue = dateStr === "Pending" ? "" : dateStr;
  const isValidDate = dateValue !== "" && !isNaN(Date.parse(dateValue));
  const cardTimestamp = isValidDate ? Date.parse(dateValue) : Infinity;
  const existingMealCards = Array.from(
    mealsContainer.querySelectorAll(".meal-card"),
  );
  let mealInserted = false;

  for (const existingCard of existingMealCards) {
    const dateP = existingCard.querySelector(".date");
    const dateText = dateP ? dateP.textContent.trim() : "";
    const existingTime =
      dateText !== "" && dateText !== "Pending" && !isNaN(Date.parse(dateText))
        ? Date.parse(dateText)
        : Infinity;

    if (cardTimestamp < existingTime) {
      mealsContainer.insertBefore(mealCard, existingCard);
      mealInserted = true;
      break;
    }
  }

  if (!mealInserted) {
    mealsContainer.append(mealCard);
  }
}

// Realtime sync listener with surgical element patching and smooth animations
function setupRealtimeSync(username) {
  if (realtimeChannel) window.supabaseClient.removeChannel(realtimeChannel);

  realtimeChannel = window.supabaseClient
    .channel(`public-db-changes-${username}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "meals",
        filter: `profile_name=eq.${username}`,
      },
      (payload) => {
        if (
          !document.querySelector(`.meal-card[data-id="${payload.new.id}"]`)
        ) {
          createMealCardElement(payload.new, false);
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "meals",
      },
      (payload) => {
        const card = document.querySelector(
          `.meal-card[data-id="${payload.new.id}"]`,
        );
        if (card) {
          const normalized = normalizeMealData(payload.new);
          applyMealCardUpdate(card, normalized);
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "meals",
      },
      (payload) => {
        const card = document.querySelector(
          `.meal-card[data-id="${payload.old.id}"]`,
        );
        if (card) smoothRemove(card);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "shopping_list",
        filter: `profile_name=eq.${username}`,
      },
      (payload) => {
        if (
          !document.querySelector(
            `.shopListEntries li[data-id="${payload.new.id}"]`,
          )
        ) {
          createShopLiElement(payload.new, false);
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "shopping_list",
      },
      (payload) => {
        const li = document.querySelector(
          `.shopListEntries li[data-id="${payload.new.id}"]`,
        );
        if (li) {
          const checkbox = li.querySelector('input[type="checkbox"]');
          if (checkbox && checkbox.checked !== payload.new.checked) {
            checkbox.checked = payload.new.checked;
          }
          const label = li.querySelector("label");
          const qty =
            payload.new.quantity !== undefined && payload.new.quantity !== null
              ? payload.new.quantity
              : parseInt(li.dataset.quantity || "1", 10);
          li.dataset.quantity = qty;

          const text =
            payload.new.text !== undefined && payload.new.text !== null
              ? payload.new.text
              : label
                ? label.textContent.split("qty:")[0].trim()
                : "";

          if (label) {
            setInventoryLabelContent(label, checkbox, text, qty);
          }
          const invBtn = li.querySelector(".invTransferBtn");
          if (invBtn) {
            invBtn.disabled = !checkbox.checked;
          }
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "shopping_list",
      },
      (payload) => {
        const li = document.querySelector(
          `.shopListEntries li[data-id="${payload.old.id}"]`,
        );
        if (li) smoothRemove(li);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "inventory",
        filter: `profile_name=eq.${username}`,
      },
      (payload) => {
        if (
          !document.querySelector(
            `#inventoryContainer li[data-id="${payload.new.id}"]`,
          )
        ) {
          createInvLiElement(payload.new, false);
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "inventory",
      },
      (payload) => {
        const li = document.querySelector(
          `#inventoryContainer li[data-id="${payload.new.id}"]`,
        );
        if (li) {
          const checkbox = li.querySelector('input[type="checkbox"]');
          if (checkbox && checkbox.checked !== payload.new.checked) {
            checkbox.checked = payload.new.checked;
          }
          const label = li.querySelector("label");
          const qty =
            payload.new.quantity !== undefined && payload.new.quantity !== null
              ? payload.new.quantity
              : parseInt(li.dataset.quantity || "1", 10);
          li.dataset.quantity = qty;

          const text =
            payload.new.text !== undefined && payload.new.text !== null
              ? payload.new.text
              : label
                ? label.textContent.split("qty:")[0].trim()
                : "";

          if (label) {
            setInventoryLabelContent(label, checkbox, text, qty);
          }
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "inventory",
      },
      (payload) => {
        const li = document.querySelector(
          `#inventoryContainer li[data-id="${payload.old.id}"]`,
        );
        if (li) smoothRemove(li);
      },
    )
    .subscribe();
}

// Render saved profiles list from Supabase
async function renderProfiles() {
  if (!profileList) return;
  profileList.innerHTML = "";

  const { data: profilesData, error: profErr } = await window.supabaseClient
    .from("profiles")
    .select("name");
  if (profErr) {
    console.error("Error fetching profiles:", profErr);
    return;
  }
  const profiles = profilesData ? profilesData.map((p) => p.name) : [];

  profiles.forEach((name) => {
    const li = document.createElement("li");

    const selectBtn = document.createElement("button");
    selectBtn.textContent = name;
    selectBtn.classList.add("profile-select-btn");
    selectBtn.type = "button";
    selectBtn.addEventListener("click", () => {
      localStorage.setItem("tasty_active_user", name);
      checkSession();
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Del";
    removeBtn.classList.add("removeBtn");
    removeBtn.type = "button";
    removeBtn.dataset.action = "removeProfile";
    removeBtn.dataset.name = name;

    li.append(selectBtn, removeBtn);
    profileList.append(li);
  });
}

// Handle profile creation/login submission
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = userNameInput.value.trim();
    if (!name) return;

    const { error } = await window.supabaseClient
      .from("profiles")
      .upsert({ name }, { onConflict: "name" });

    if (error) {
      console.error("Supabase login error:", error);
      alert(`Login failed: ${error.message}`);
      return;
    }

    localStorage.setItem("tasty_active_user", name);
    userNameInput.value = "";
    checkSession();
  });
}

// Handle sub-forms to prevent keyboard enter key reloads
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (e) => e.preventDefault());
});

// Handle logout / switch user
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("tasty_active_user");
    checkSession();
  });
}

// Handle Home link click to scroll smoothly to top
if (homeLink) {
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

checkSession();

// Helper function to handle editing a meal modal popup
function showEditMealDialog(currentMeal) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirmModal");
    const h3Tag = dialog.querySelector("h3");
    const pTag = dialog.querySelector("p");
    const inputField = document.querySelector("#confirmNameInput");
    const editMealContainer = document.querySelector("#modalEditMealContainer");
    const editContainer = document.querySelector("#modalEditContainer");
    const sendInvContainer = document.querySelector(
      "#modalSendInventoryContainer",
    );
    const nameInput = document.querySelector("#modalMealName");
    const dateInput = document.querySelector("#modalMealDate");
    const descInput = document.querySelector("#modalMealDesc");
    const linkInput = document.querySelector("#modalMealLink");
    const yesBtn = document.querySelector("#confirmYes");
    const noBtn = document.querySelector("#confirmNo");

    if (!dialog || !editMealContainer) {
      const name = window.prompt("Meal name:", currentMeal.name);
      if (name === null) return resolve(null);
      const date = window.prompt("Date:", currentMeal.date);
      const description = window.prompt(
        "What's it like?",
        currentMeal.description,
      );
      const link = window.prompt("Link to recipe:", currentMeal.link);
      resolve(
        normalizeMealData({
          name: name.trim() || currentMeal.name,
          date,
          description,
          link,
        }),
      );
      return;
    }

    h3Tag.textContent = "Edit Meal";
    pTag.textContent = "";
    pTag.style.display = "none";
    inputField.style.display = "none";
    editContainer.style.display = "none";
    sendInvContainer.style.display = "none";
    editMealContainer.style.display = "block";

    nameInput.value = currentMeal.name || "";
    const parsedDate =
      currentMeal.date &&
      currentMeal.date !== "Pending" &&
      !isNaN(Date.parse(currentMeal.date))
        ? new Date(Date.parse(currentMeal.date)).toISOString().slice(0, 10)
        : "";
    dateInput.value = parsedDate;
    descInput.value =
      currentMeal.description && currentMeal.description !== "Mystery food?"
        ? currentMeal.description
        : "";
    linkInput.value = currentMeal.link || "";

    yesBtn.textContent = "Save";
    noBtn.textContent = "Cancel";
    yesBtn.style.display = "inline-block";
    noBtn.style.display = "inline-block";

    dialog.showModal();
    nameInput.focus();

    const handleSave = () => {
      const updatedName = nameInput.value.trim();
      if (!updatedName) {
        alert("Please enter a meal name.");
        nameInput.focus();
        return;
      }

      const normalized = normalizeMealData({
        name: updatedName,
        date: dateInput.value,
        description: descInput.value,
        link: linkInput.value,
      });

      cleanup();
      resolve(normalized);
    };

    const handleCancel = () => {
      cleanup();
      resolve(null);
    };

    const cleanup = () => {
      dialog.close();
      pTag.style.display = "block";
      editMealContainer.style.display = "none";
      yesBtn.removeEventListener("click", handleSave);
      noBtn.removeEventListener("click", handleCancel);
    };

    yesBtn.addEventListener("click", handleSave);
    noBtn.addEventListener("click", handleCancel);
  });
}

// Helper function to handle the standard custom <dialog> confirmation modal
function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirmModal");
    const h3Tag = dialog.querySelector("h3");
    const pTag = dialog.querySelector("p");
    const inputField = document.querySelector("#confirmNameInput");
    const editMealContainer = document.querySelector("#modalEditMealContainer");
    const editContainer = document.querySelector("#modalEditContainer");
    const sendInvContainer = document.querySelector(
      "#modalSendInventoryContainer",
    );
    const yesBtn = document.querySelector("#confirmYes");
    const noBtn = document.querySelector("#confirmNo");

    if (!dialog) {
      resolve(window.confirm(message));
      return;
    }

    h3Tag.textContent = "Yummy Food";
    pTag.textContent = message;
    pTag.style.display = "block";
    inputField.style.display = "none";
    if (editMealContainer) editMealContainer.style.display = "none";
    editContainer.style.display = "none";
    sendInvContainer.style.display = "none";
    yesBtn.textContent = "Yes";
    noBtn.textContent = "No";
    yesBtn.style.display = "inline-block";
    noBtn.style.display = "inline-block";

    dialog.showModal();

    const handleYes = () => {
      cleanup();
      resolve(true);
    };

    const handleNo = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      dialog.close();
      yesBtn.removeEventListener("click", handleYes);
      noBtn.removeEventListener("click", handleNo);
    };

    yesBtn.addEventListener("click", handleYes);
    noBtn.addEventListener("click", handleNo);
  });
}

// Helper function to handle inventory / shopping edit modal popup
function showEditInventoryDialog(currentText, currentQty) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirmModal");
    const h3Tag = dialog.querySelector("h3");
    const pTag = dialog.querySelector("p");
    const inputField = document.querySelector("#confirmNameInput");
    const editMealContainer = document.querySelector("#modalEditMealContainer");
    const editContainer = document.querySelector("#modalEditContainer");
    const sendInvContainer = document.querySelector(
      "#modalSendInventoryContainer",
    );
    const editText = document.querySelector("#modalEditText");
    const qtyDisplay = document.querySelector("#modalQtyDisplay");
    const qtyMinus = document.querySelector("#modalQtyMinus");
    const qtyPlus = document.querySelector("#modalQtyPlus");
    const yesBtn = document.querySelector("#confirmYes");
    const noBtn = document.querySelector("#confirmNo");

    if (!dialog) {
      const newText = window.prompt("Edit item text:", currentText);
      if (newText === null) {
        resolve(null);
        return;
      }
      const newQtyStr = window.prompt("Edit quantity:", currentQty);
      const newQty = parseInt(newQtyStr, 10) || 1;
      resolve({ text: newText.trim(), quantity: newQty });
      return;
    }

    h3Tag.textContent = "Edit Item";
    pTag.textContent = "";
    pTag.style.display = "none";
    inputField.style.display = "none";
    if (editMealContainer) editMealContainer.style.display = "none";
    sendInvContainer.style.display = "none";
    editContainer.style.display = "block";

    editText.value = currentText;
    let editableQty = currentQty || 1;
    qtyDisplay.textContent = editableQty;

    yesBtn.textContent = "Save";
    noBtn.textContent = "Cancel";
    yesBtn.style.display = "inline-block";
    noBtn.style.display = "inline-block";

    const handleMinus = () => {
      if (editableQty > 1) {
        editableQty--;
        qtyDisplay.textContent = editableQty;
      }
    };

    const handlePlus = () => {
      editableQty++;
      qtyDisplay.textContent = editableQty;
    };

    qtyMinus.addEventListener("click", handleMinus);
    qtyPlus.addEventListener("click", handlePlus);

    dialog.showModal();
    editText.focus();

    const handleSave = () => {
      const updatedText = editText.value.trim();
      if (!updatedText) return;
      cleanup();
      resolve({ text: updatedText, quantity: editableQty });
    };

    const handleCancel = () => {
      cleanup();
      resolve(null);
    };

    const cleanup = () => {
      dialog.close();
      pTag.style.display = "block";
      editContainer.style.display = "none";
      qtyMinus.removeEventListener("click", handleMinus);
      qtyPlus.removeEventListener("click", handlePlus);
      yesBtn.removeEventListener("click", handleSave);
      noBtn.removeEventListener("click", handleCancel);
    };

    yesBtn.addEventListener("click", handleSave);
    noBtn.addEventListener("click", handleCancel);
  });
}

// Helper function to handle sending a shopping list item to inventory modal
function showSendToInventoryDialog(itemText, initialQty) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirmModal");
    const h3Tag = dialog.querySelector("h3");
    const pTag = dialog.querySelector("p");
    const inputField = document.querySelector("#confirmNameInput");
    const editMealContainer = document.querySelector("#modalEditMealContainer");
    const editContainer = document.querySelector("#modalEditContainer");
    const sendInvContainer = document.querySelector(
      "#modalSendInventoryContainer",
    );
    const sendItemInput = document.querySelector("#modalSendItemInput");
    const yesBtn = document.querySelector("#confirmYes");
    const noBtn = document.querySelector("#confirmNo");

    if (!dialog) {
      const text = window.prompt("Item name:", itemText);
      if (text === null) return resolve(null);
      const location = window.prompt("Location (Kitchen or Downstairs):");
      const sub = window.prompt("Sub-location:");
      resolve({
        text: text.trim() || itemText,
        location,
        sub_location: sub,
        quantity: initialQty,
      });
      return;
    }

    h3Tag.textContent = "Add to Inventory";
    pTag.textContent = "";
    pTag.style.display = "none";
    inputField.style.display = "none";
    if (editMealContainer) editMealContainer.style.display = "none";
    editContainer.style.display = "none";
    sendInvContainer.style.display = "block";

    sendItemInput.value = itemText;
    modalSendQuantity = initialQty || 1;
    modalSendQtyDisplay.textContent = modalSendQuantity;

    // Reset modal radios
    document
      .querySelectorAll('input[name="modalMainLocation"]')
      .forEach((r) => (r.checked = false));
    document.querySelectorAll('input[name="modalKitchenSub"]').forEach((r) => {
      r.checked = false;
      r.required = false;
    });
    document
      .querySelectorAll('input[name="modalDownstairsSub"]')
      .forEach((r) => {
        r.checked = false;
        r.required = false;
      });
    modalKitchenSubGroup.style.display = "none";
    modalDownstairsSubGroup.style.display = "none";

    yesBtn.textContent = "Add to Inventory";
    noBtn.textContent = "Cancel";
    yesBtn.style.display = "inline-block";
    noBtn.style.display = "inline-block";

    dialog.showModal();
    sendItemInput.focus();

    const handleYes = () => {
      const updatedText = sendItemInput.value.trim();
      if (!updatedText) {
        alert("Please enter an item name.");
        sendItemInput.focus();
        return;
      }

      const selectedLoc = document.querySelector(
        'input[name="modalMainLocation"]:checked',
      );
      if (!selectedLoc) {
        alert("Please select a location (Kitchen or Downstairs).");
        return;
      }

      let selectedSub = null;
      if (selectedLoc.value === "Kitchen") {
        selectedSub = document.querySelector(
          'input[name="modalKitchenSub"]:checked',
        );
      } else if (selectedLoc.value === "Downstairs") {
        selectedSub = document.querySelector(
          'input[name="modalDownstairsSub"]:checked',
        );
      }

      if (!selectedSub) {
        alert(`Please select a sub-location for ${selectedLoc.value}.`);
        return;
      }

      cleanup();
      resolve({
        text: updatedText,
        location: selectedLoc.value,
        sub_location: selectedSub.value,
        quantity: modalSendQuantity,
      });
    };

    const handleNo = () => {
      cleanup();
      resolve(null);
    };

    const cleanup = () => {
      dialog.close();
      pTag.style.display = "block";
      sendInvContainer.style.display = "none";
      yesBtn.removeEventListener("click", handleYes);
      noBtn.removeEventListener("click", handleNo);
    };

    yesBtn.addEventListener("click", handleYes);
    noBtn.addEventListener("click", handleNo);
  });
}

// Helper function to handle strict profile deletion confirmation modal
function showDeleteProfileDialog(targetProfileName) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirmModal");
    const h3Tag = dialog.querySelector("h3");
    const pTag = dialog.querySelector("p");
    const inputField = document.querySelector("#confirmNameInput");
    const editMealContainer = document.querySelector("#modalEditMealContainer");
    const editContainer = document.querySelector("#modalEditContainer");
    const sendInvContainer = document.querySelector(
      "#modalSendInventoryContainer",
    );
    const yesBtn = document.querySelector("#confirmYes");
    const noBtn = document.querySelector("#confirmNo");

    if (!dialog) {
      const userInput = window.prompt(
        `Type the exact profile name to delete (${targetProfileName}):`,
      );
      resolve(userInput === targetProfileName);
      return;
    }

    h3Tag.textContent = "Delete Profile?";
    pTag.textContent = "Type the exact profile name to delete.";
    pTag.style.display = "block";
    if (editMealContainer) editMealContainer.style.display = "none";
    editContainer.style.display = "none";
    sendInvContainer.style.display = "none";
    inputField.style.display = "block";
    inputField.value = "";
    yesBtn.textContent = "Del";
    noBtn.textContent = "Cancel";
    yesBtn.style.display = "inline-block";
    noBtn.style.display = "inline-block";

    dialog.showModal();
    inputField.focus();

    const handleYes = () => {
      const typedValue = inputField.value.trim();
      if (typedValue === targetProfileName) {
        cleanup();
        resolve(true);
      } else {
        h3Tag.textContent = "Yummy Food";
        pTag.textContent = "Profile name didn't match.";
        inputField.style.display = "none";
        yesBtn.style.display = "none";
        noBtn.style.display = "none";

        setTimeout(() => {
          cleanup();
          resolve(false);
        }, 1500);
      }
    };

    const handleNo = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      dialog.close();
      inputField.style.display = "none";
      yesBtn.style.display = "inline-block";
      noBtn.style.display = "inline-block";
      yesBtn.removeEventListener("click", handleYes);
      noBtn.removeEventListener("click", handleNo);
    };

    yesBtn.addEventListener("click", handleYes);
    noBtn.addEventListener("click", handleNo);
  });
}

// Helper to smoothly animate element removal
function smoothRemove(element) {
  if (!element) return;
  element.classList.add("fade-out");
  setTimeout(() => {
    element.remove();
  }, 300);
}

// Element Creators with smooth mobile fade-in
function createMealCardElement(data, shouldSave = true) {
  const normalized = normalizeMealData(data);
  const mealCard = document.createElement("div");
  mealCard.classList.add("meal-card");
  mealCard.dataset.id = data.id || "";

  if (!shouldSave) {
    mealCard.style.opacity = "0";
  }

  const mealTitle = document.createElement("h2");
  mealTitle.textContent = normalized.name;

  const mealDateP = document.createElement("p");
  mealDateP.classList.add("date");
  mealDateP.textContent = normalized.date;

  const mealDescP = document.createElement("p");
  mealDescP.classList.add("meal-description");
  mealDescP.textContent = normalized.description;

  const recipeLink = document.createElement("a");
  recipeLink.href = normalized.link;
  recipeLink.target = "_blank";
  recipeLink.textContent = normalized.link.includes("odin-recipes")
    ? "Recipe Website"
    : "Link to Recipe";

  const btnWrapper = document.createElement("div");
  btnWrapper.className = "meal-btn-group";

  const editMealBtn = document.createElement("button");
  editMealBtn.className = "editBtn";
  editMealBtn.type = "button";
  editMealBtn.dataset.action = "editMealBtn";
  editMealBtn.textContent = "Edit";

  const removeMealBtn = document.createElement("button");
  removeMealBtn.className = "removeBtn";
  removeMealBtn.type = "button";
  removeMealBtn.dataset.action = "removeMealBtn";
  removeMealBtn.textContent = "Del";

  btnWrapper.append(editMealBtn, removeMealBtn);
  mealCard.append(mealTitle, mealDateP, mealDescP, recipeLink, btnWrapper);

  insertMealCardSorted(mealCard, normalized.date);

  if (!shouldSave) {
    requestAnimationFrame(() => {
      mealCard.style.opacity = "1";
    });
  }

  if (shouldSave) {
    const activeUser = localStorage.getItem("tasty_active_user");
    window.supabaseClient
      .from("meals")
      .insert([
        {
          profile_name: activeUser,
          name: normalized.name,
          date: normalized.date,
          description: normalized.description,
          link: normalized.link,
        },
      ])
      .select()
      .then(({ data: insertedData, error }) => {
        if (error) {
          console.error("Error saving meal:", error);
          return;
        }
        if (insertedData && insertedData[0]) {
          mealCard.dataset.id = insertedData[0].id;
        }
      });
  }
}

async function createShopLiElement(data, shouldSave = true) {
  const shopLi = document.createElement("li");
  shopLi.dataset.id = data.id || "";
  if (!shouldSave) {
    shopLi.style.opacity = "0";
  }

  const shopDiv = document.createElement("div");
  const shopCheck = document.createElement("input");
  const shopLabel = document.createElement("label");

  const btnGroup = document.createElement("div");
  btnGroup.className = "shop-btn-group";

  const invTransferBtn = document.createElement("button");
  invTransferBtn.className = "invTransferBtn";
  invTransferBtn.type = "button";
  invTransferBtn.dataset.action = "sendToInventoryBtn";
  invTransferBtn.textContent = "Inv";
  invTransferBtn.disabled = !data.checked;

  const editShopBtn = document.createElement("button");
  editShopBtn.className = "editBtn";
  editShopBtn.type = "button";
  editShopBtn.dataset.action = "editShopBtn";
  editShopBtn.textContent = "Edit";

  const shopRemoveBtn = document.createElement("button");
  shopRemoveBtn.className = "removeBtn";
  shopRemoveBtn.type = "button";
  shopRemoveBtn.dataset.action = "removeShopBtn";
  shopRemoveBtn.textContent = "Del";

  btnGroup.append(invTransferBtn, editShopBtn, shopRemoveBtn);

  shopCheck.type = "checkbox";
  shopCheck.checked = data.checked || false;

  const qty = data.quantity || 1;
  shopLi.dataset.quantity = qty;

  setInventoryLabelContent(shopLabel, shopCheck, data.text, qty);

  shopDiv.append(shopLabel);
  shopLi.append(shopDiv, btnGroup);

  const existingShopLis = Array.from(shopList.querySelectorAll("li"));
  let shopInserted = false;

  for (const li of existingShopLis) {
    const label = li.querySelector("label");
    const existingText = label ? label.textContent.split("qty:")[0].trim() : "";
    if (
      data.text.localeCompare(existingText, undefined, {
        sensitivity: "accent",
      }) < 0
    ) {
      shopList.insertBefore(shopLi, li);
      shopInserted = true;
      break;
    }
  }

  if (!shopInserted) {
    shopList.append(shopLi);
  }

  if (!shouldSave) {
    requestAnimationFrame(() => {
      shopLi.style.opacity = "1";
    });
  }

  shopCheck.addEventListener("change", async () => {
    invTransferBtn.disabled = !shopCheck.checked;
    if (shopLi.dataset.id) {
      const { error } = await window.supabaseClient
        .from("shopping_list")
        .update({ checked: shopCheck.checked })
        .eq("id", shopLi.dataset.id);
      if (error)
        console.error("Error updating shopping item checked state:", error);
    }
  });

  if (shouldSave) {
    const activeUser = localStorage.getItem("tasty_active_user");
    const { data: insertedData, error } = await window.supabaseClient
      .from("shopping_list")
      .insert([
        {
          profile_name: activeUser,
          text: data.text,
          quantity: qty,
          checked: Boolean(data.checked),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving shopping list item:", error);
      return shopLi;
    }

    if (insertedData && insertedData.id) {
      shopLi.dataset.id = insertedData.id;
    }
  }

  return shopLi;
}

async function createInvLiElement(data, shouldSave = true) {
  const invLi = document.createElement("li");
  invLi.dataset.id = data.id || "";
  if (!shouldSave) {
    invLi.style.opacity = "0";
  }

  const invDiv = document.createElement("div");
  const invCheck = document.createElement("input");
  const invLabel = document.createElement("label");

  const btnGroup = document.createElement("div");
  btnGroup.className = "inventory-btn-group";

  const editInvBtn = document.createElement("button");
  editInvBtn.className = "editBtn";
  editInvBtn.type = "button";
  editInvBtn.dataset.action = "editInventoryBtn";
  editInvBtn.textContent = "Edit";

  const invRemoveBtn = document.createElement("button");
  invRemoveBtn.className = "removeBtn";
  invRemoveBtn.type = "button";
  invRemoveBtn.dataset.action = "removeInventoryBtn";
  invRemoveBtn.textContent = "Del";

  btnGroup.append(editInvBtn, invRemoveBtn);

  invCheck.type = "checkbox";
  invCheck.checked = data.checked || false;

  const qty = data.quantity || 1;
  invLi.dataset.quantity = qty;

  setInventoryLabelContent(invLabel, invCheck, data.text, qty);

  invDiv.append(invLabel);
  invLi.append(invDiv, btnGroup);

  const targetUl = getInvTargetList(data.location, data.sub_location);
  const existingInvLis = Array.from(targetUl.querySelectorAll("li"));
  let invInserted = false;

  for (const li of existingInvLis) {
    const label = li.querySelector("label");
    const existingText = label ? label.textContent.split("qty:")[0].trim() : "";
    if (
      data.text.localeCompare(existingText, undefined, {
        sensitivity: "accent",
      }) < 0
    ) {
      targetUl.insertBefore(invLi, li);
      invInserted = true;
      break;
    }
  }

  if (!invInserted) {
    targetUl.append(invLi);
  }

  if (!shouldSave) {
    requestAnimationFrame(() => {
      invLi.style.opacity = "1";
    });
  }

  invCheck.addEventListener("change", async () => {
    if (invLi.dataset.id) {
      const { error } = await window.supabaseClient
        .from("inventory")
        .update({ checked: invCheck.checked })
        .eq("id", invLi.dataset.id);
      if (error)
        console.error("Error updating inventory checked state:", error);
    }
  });

  if (shouldSave) {
    const activeUser = localStorage.getItem("tasty_active_user");
    const { data: insertedData, error } = await window.supabaseClient
      .from("inventory")
      .insert([
        {
          profile_name: activeUser,
          text: data.text,
          quantity: qty,
          checked: Boolean(data.checked),
          location: data.location,
          sub_location: data.sub_location,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving inventory item:", error);
      return invLi;
    }

    if (insertedData && insertedData.id) {
      invLi.dataset.id = insertedData.id;
    }
  }

  return invLi;
}

// Global click listener on document
document.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;

  switch (action) {
    case "mealBtn": {
      e.preventDefault();
      if (!mealNameInput.value.trim()) return;

      const normalized = normalizeMealData({
        name: mealNameInput.value,
        date: mealDateInput.value,
        description: mealDescInput.value,
        link: mealLinkInput.value,
      });

      createMealCardElement(normalized, true);

      mealNameInput.value = "";
      mealDateInput.value = "";
      mealDescInput.value = "";
      mealLinkInput.value = "";
      break;
    }

    case "editMealBtn": {
      e.preventDefault();
      const mealCardToEdit = button.closest(".meal-card");
      if (!mealCardToEdit) return;

      const mealId = mealCardToEdit.dataset.id;
      const currentMeal = {
        name: mealCardToEdit.querySelector("h2")?.textContent.trim() || "",
        date:
          mealCardToEdit.querySelector(".date")?.textContent.trim() ||
          "Pending",
        description:
          mealCardToEdit
            .querySelector(".meal-description")
            ?.textContent.trim() || "Mystery food?",
        link: mealCardToEdit.querySelector("a")?.href || "",
      };

      const updatedMeal = await showEditMealDialog(currentMeal);
      if (updatedMeal) {
        applyMealCardUpdate(mealCardToEdit, updatedMeal);

        if (mealId) {
          const { error } = await window.supabaseClient
            .from("meals")
            .update({
              name: updatedMeal.name,
              date: updatedMeal.date,
              description: updatedMeal.description,
              link: updatedMeal.link,
            })
            .eq("id", mealId);
          if (error) console.error("Error updating meal:", error);
        }
      }
      break;
    }

    case "shopBtn": {
      e.preventDefault();
      const shopValue = shopInput.value.trim();
      if (!shopValue) return;

      const qtyToAdd = newShopQuantity;
      shopInput.value = "";
      newShopQuantity = 1;
      if (shopFormQtyDisplay) shopFormQtyDisplay.textContent = "1";

      await createShopLiElement(
        { text: shopValue, quantity: qtyToAdd, checked: false },
        true,
      );
      break;
    }

    case "inventoryBtn": {
      e.preventDefault();
      const invValue = inventoryInput.value.trim();
      if (!invValue) return;

      const selectedLoc = document.querySelector(
        'input[name="mainLocation"]:checked',
      );
      if (!selectedLoc) {
        alert("Please select a location (Kitchen or Downstairs).");
        return;
      }

      let selectedSub = null;
      if (selectedLoc.value === "Kitchen") {
        selectedSub = document.querySelector(
          'input[name="kitchenSub"]:checked',
        );
      } else if (selectedLoc.value === "Downstairs") {
        selectedSub = document.querySelector(
          'input[name="downstairsSub"]:checked',
        );
      }

      if (!selectedSub) {
        alert(`Please select a sub-location for ${selectedLoc.value}.`);
        return;
      }

      const qtyToAdd = newInvQuantity;
      inventoryInput.value = "";
      newInvQuantity = 1;
      if (invFormQtyDisplay) invFormQtyDisplay.textContent = "1";

      await createInvLiElement(
        {
          text: invValue,
          quantity: qtyToAdd,
          checked: false,
          location: selectedLoc.value,
          sub_location: selectedSub.value,
        },
        true,
      );
      break;
    }

    case "removeMealBtn": {
      e.preventDefault();
      const mealCardToRemove = button.closest(".meal-card");
      if (mealCardToRemove) {
        const mealTitleElement = mealCardToRemove.querySelector("h2");
        const mealName = mealTitleElement
          ? mealTitleElement.textContent
          : "this meal";

        const confirmed = await showConfirmDialog(
          `Remove this Tasty Meal? (${mealName})`,
        );
        if (confirmed) {
          const mealId = mealCardToRemove.dataset.id;
          if (mealId) {
            await window.supabaseClient.from("meals").delete().eq("id", mealId);
          }
          smoothRemove(mealCardToRemove);
        }
      }
      break;
    }

    case "removeShopBtn": {
      e.preventDefault();
      const targetShopLi = button.closest("li");
      if (targetShopLi) {
        const checkbox = targetShopLi.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          const shopId = targetShopLi.dataset.id;
          if (shopId) {
            const { error } = await window.supabaseClient
              .from("shopping_list")
              .delete()
              .eq("id", shopId);
            if (error) console.error("Error deleting shopping item:", error);
          }
          smoothRemove(targetShopLi);
        } else {
          console.log("item must be checked before it can be removed.");
        }
      }
      break;
    }

    case "editShopBtn": {
      e.preventDefault();
      const targetShopLi = button.closest("li");
      if (!targetShopLi) return;
      const shopId = targetShopLi.dataset.id;
      const currentQty = parseInt(targetShopLi.dataset.quantity || "1", 10);
      const label = targetShopLi.querySelector("label");

      const cloneLabel = label.cloneNode(true);
      const checkboxInClone = cloneLabel.querySelector("input");
      if (checkboxInClone) checkboxInClone.remove();
      const qtySpanInClone = cloneLabel.querySelector(".inv-qty-glow");
      if (qtySpanInClone) qtySpanInClone.remove();
      const rawText = cloneLabel.textContent.trim();

      const result = await showEditInventoryDialog(rawText, currentQty);
      if (result) {
        const newText = result.text;
        const newQty = result.quantity;

        targetShopLi.dataset.quantity = newQty;
        const checkbox = label.querySelector('input[type="checkbox"]');
        setInventoryLabelContent(label, checkbox, newText, newQty);

        if (shopId) {
          const { error } = await window.supabaseClient
            .from("shopping_list")
            .update({ text: newText, quantity: newQty })
            .eq("id", shopId);
          if (error) console.error("Error updating shopping item:", error);
        }
      }
      break;
    }

    case "sendToInventoryBtn": {
      e.preventDefault();
      const targetShopLi = button.closest("li");
      if (!targetShopLi) return;
      const checkbox = targetShopLi.querySelector('input[type="checkbox"]');
      if (!checkbox || !checkbox.checked) return;

      const currentQty = parseInt(targetShopLi.dataset.quantity || "1", 10);
      const label = targetShopLi.querySelector("label");

      const cloneLabel = label.cloneNode(true);
      const checkboxInClone = cloneLabel.querySelector("input");
      if (checkboxInClone) checkboxInClone.remove();
      const qtySpanInClone = cloneLabel.querySelector(".inv-qty-glow");
      if (qtySpanInClone) qtySpanInClone.remove();
      const rawText = cloneLabel.textContent.trim();

      const locResult = await showSendToInventoryDialog(rawText, currentQty);
      if (locResult) {
        await createInvLiElement(
          {
            text: locResult.text,
            quantity: locResult.quantity,
            checked: false,
            location: locResult.location,
            sub_location: locResult.sub_location,
          },
          true,
        );

        const shopId = targetShopLi.dataset.id;
        if (shopId) {
          const { error } = await window.supabaseClient
            .from("shopping_list")
            .delete()
            .eq("id", shopId);
          if (error) {
            console.error("Error deleting transferred shopping item:", error);
          }
        }
        smoothRemove(targetShopLi);
      }
      break;
    }

    case "editInventoryBtn": {
      e.preventDefault();
      const targetInvLi = button.closest("li");
      if (!targetInvLi) return;
      const invId = targetInvLi.dataset.id;
      const currentQty = parseInt(targetInvLi.dataset.quantity || "1", 10);
      const label = targetInvLi.querySelector("label");

      const cloneLabel = label.cloneNode(true);
      const checkboxInClone = cloneLabel.querySelector("input");
      if (checkboxInClone) checkboxInClone.remove();
      const qtySpanInClone = cloneLabel.querySelector(".inv-qty-glow");
      if (qtySpanInClone) qtySpanInClone.remove();
      const rawText = cloneLabel.textContent.trim();

      const result = await showEditInventoryDialog(rawText, currentQty);
      if (result) {
        const newText = result.text;
        const newQty = result.quantity;

        targetInvLi.dataset.quantity = newQty;
        const checkbox = label.querySelector('input[type="checkbox"]');
        setInventoryLabelContent(label, checkbox, newText, newQty);

        if (invId) {
          const { error } = await window.supabaseClient
            .from("inventory")
            .update({ text: newText, quantity: newQty })
            .eq("id", invId);
          if (error) console.error("Error updating inventory item:", error);
        }
      }
      break;
    }

    case "removeInventoryBtn": {
      e.preventDefault();
      const targetInvLi = button.closest("li");
      if (targetInvLi) {
        const checkbox = targetInvLi.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          const invId = targetInvLi.dataset.id;
          if (invId) {
            const { error } = await window.supabaseClient
              .from("inventory")
              .delete()
              .eq("id", invId);
            if (error) console.error("Error deleting inventory item:", error);
          }
          smoothRemove(targetInvLi);
        } else {
          console.log("item must be checked before it can be removed.");
        }
      }
      break;
    }

    case "removeProfile": {
      e.preventDefault();
      const profileName = button.dataset.name;

      const confirmed = await showDeleteProfileDialog(profileName);
      if (confirmed) {
        await window.supabaseClient
          .from("profiles")
          .delete()
          .eq("name", profileName);
        await window.supabaseClient
          .from("meals")
          .delete()
          .eq("profile_name", profileName);
        await window.supabaseClient
          .from("shopping_list")
          .delete()
          .eq("profile_name", profileName);
        await window.supabaseClient
          .from("inventory")
          .delete()
          .eq("profile_name", profileName);

        if (localStorage.getItem("tasty_active_user") === profileName) {
          localStorage.removeItem("tasty_active_user");
        }
      }
      checkSession();
      break;
    }
  }
});
