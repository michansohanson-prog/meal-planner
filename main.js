const mealNameInput = document.querySelector("#mealName");
const mealDateInput = document.querySelector("#mealDate");
const mealDescInput = document.querySelector("#mealDesc");
const mealLinkInput = document.querySelector("#mealLink");
const mealsContainer = document.querySelector("#meals");

const shopInput = document.querySelector("#shopListInput");
const shopList = document.querySelector(".shopListEntries");

const inventoryInput = document.querySelector("#inventoryInput");
const invList = document.querySelector(".inventoryEntries");

// Profile and View State Elements
const loginContainer = document.querySelector("#loginContainer");
const appContainer = document.querySelector("#appContainer");
const loginForm = document.querySelector("#loginForm");
const userNameInput = document.querySelector("#userNameInput");
const profileList = document.querySelector("#profileList");
const logoutBtn = document.querySelector("#logoutBtn");
const appHeaderTitle = document.querySelector("#appHeaderTitle");

// Check active session on load
function checkSession() {
  const activeUser = localStorage.getItem("tasty_active_user");
  if (activeUser) {
    if (loginContainer) loginContainer.style.display = "none";
    if (appContainer) appContainer.style.display = "block";
    if (appHeaderTitle) {
      appHeaderTitle.textContent = `${activeUser}'s Meal Planner`;
    }
    loadUserData(activeUser);
  } else {
    if (loginContainer) loginContainer.style.display = "flex";
    if (appContainer) appContainer.style.display = "none";
    if (appHeaderTitle) {
      appHeaderTitle.textContent = "Meal Planner";
    }
    // Clear DOM when logged out
    mealsContainer.innerHTML = "";
    shopList.innerHTML = "";
    invList.innerHTML = "";
  }
  renderProfiles();
}

// Load user-specific data from localStorage
function loadUserData(username) {
  mealsContainer.innerHTML = "";
  shopList.innerHTML = "";
  invList.innerHTML = "";

  // 1. Load Meals
  const meals =
    JSON.parse(localStorage.getItem(`tasty_meals_${username}`)) || [];
  meals.forEach((mealData) => createMealCardElement(mealData, false));

  // 2. Load Shop List
  const shopItems =
    JSON.parse(localStorage.getItem(`tasty_shop_${username}`)) || [];
  shopItems.forEach((itemData) => createShopLiElement(itemData, false));

  // 3. Load Inventory
  const invItems =
    JSON.parse(localStorage.getItem(`tasty_inv_${username}`)) || [];
  invItems.forEach((itemData) => createInvLiElement(itemData, false));
}

// Save current DOM state to active user's localStorage
function saveUserData() {
  const activeUser = localStorage.getItem("tasty_active_user");
  if (!activeUser) return;

  // Save Meals
  const mealCards = Array.from(mealsContainer.querySelectorAll(".meal-card"));
  const mealsData = mealCards.map((card) => ({
    name: card.querySelector("h2").textContent,
    date: card.querySelector(".date").textContent,
    description: card.querySelector(".meal-description").textContent,
    link: card.querySelector("a").href,
  }));
  localStorage.setItem(`tasty_meals_${activeUser}`, JSON.stringify(mealsData));

  // Save Shop List
  const shopLis = Array.from(shopList.querySelectorAll("li"));
  const shopData = shopLis.map((li) => ({
    text: li.querySelector("label").textContent.trim(),
    checked: li.querySelector('input[type="checkbox"]').checked,
  }));
  localStorage.setItem(`tasty_shop_${activeUser}`, JSON.stringify(shopData));

  // Save Inventory
  const invLis = Array.from(invList.querySelectorAll("li"));
  const invData = invLis.map((li) => ({
    text: li.querySelector("label").textContent.trim(),
    checked: li.querySelector('input[type="checkbox"]').checked,
  }));
  localStorage.setItem(`tasty_inv_${activeUser}`, JSON.stringify(invData));
}

// Render saved profiles list
function renderProfiles() {
  if (!profileList) return;
  profileList.innerHTML = "";
  const profiles = JSON.parse(localStorage.getItem("tasty_profiles")) || [];

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
    removeBtn.textContent = "Delete";
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
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = userNameInput.value.trim();
    if (!name) return;

    let profiles = JSON.parse(localStorage.getItem("tasty_profiles")) || [];
    if (!profiles.includes(name)) {
      profiles.push(name);
      localStorage.setItem("tasty_profiles", JSON.stringify(profiles));
    }

    localStorage.setItem("tasty_active_user", name);
    userNameInput.value = "";
    checkSession();
  });
}

// Handle logout / switch user
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("tasty_active_user");
    checkSession();
  });
}

// Run session check immediately when script loads
checkSession();

// Helper function to handle the custom <dialog> confirmation modal
function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirmModal");
    const yesBtn = document.querySelector("#confirmYes");
    const noBtn = document.querySelector("#confirmNo");

    if (!dialog) {
      resolve(window.confirm(message));
      return;
    }

    const pTag = dialog.querySelector("p");
    if (pTag) pTag.textContent = message;

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

// Element Creators (with optional save trigger)
function createMealCardElement(data, shouldSave = true) {
  const mealCard = document.createElement("div");
  mealCard.classList.add("meal-card");

  const mealTitle = document.createElement("h2");
  mealTitle.textContent = data.name;

  const mealDateP = document.createElement("p");
  mealDateP.classList.add("date");
  mealDateP.textContent = data.date;

  const mealDescP = document.createElement("p");
  mealDescP.classList.add("meal-description");
  mealDescP.textContent = data.description;

  const recipeLink = document.createElement("a");
  recipeLink.href = data.link;
  recipeLink.target = "_blank";
  recipeLink.textContent = data.link.includes("odin-recipes")
    ? "Recipe Website"
    : "Link to Recipe";

  const btnWrapper = document.createElement("div");
  const removeMealBtn = document.createElement("button");
  removeMealBtn.classList.add("removeBtn");
  removeMealBtn.dataset.action = "removeMealBtn";
  removeMealBtn.textContent = "Remove Meal";

  btnWrapper.append(removeMealBtn);
  mealCard.append(mealTitle, mealDateP, mealDescP, recipeLink, btnWrapper);

  // Chronological Insertion
  const dateValue = data.date === "Pending" ? "" : data.date;
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

  if (shouldSave) saveUserData();
}

function createShopLiElement(data, shouldSave = true) {
  const shopLi = document.createElement("li");
  const shopdiv = document.createElement("div");
  const shopCheck = document.createElement("input");
  const shopLabel = document.createElement("label");
  const shopRemoveBtn = document.createElement("button");

  shopCheck.type = "checkbox";
  shopCheck.checked = data.checked || false;
  shopLabel.textContent = data.text;
  shopRemoveBtn.classList = "removeBtn";
  shopRemoveBtn.dataset.action = "removeShopBtn";
  shopRemoveBtn.textContent = "Remove item";

  shopLabel.prepend(shopCheck);
  shopdiv.append(shopLabel);
  shopLi.append(shopdiv, shopRemoveBtn);

  // Alphabetical Insertion
  const existingShopLis = Array.from(shopList.querySelectorAll("li"));
  let shopInserted = false;

  for (const li of existingShopLis) {
    const label = li.querySelector("label");
    const existingText = label ? label.textContent.trim() : "";
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

  shopCheck.addEventListener("change", () => saveUserData());

  if (shouldSave) saveUserData();
}

function createInvLiElement(data, shouldSave = true) {
  const invLi = document.createElement("li");
  const invDiv = document.createElement("div");
  const invCheck = document.createElement("input");
  const invLabel = document.createElement("label");
  const invRemoveBtn = document.createElement("button");

  invCheck.type = "checkbox";
  invCheck.checked = data.checked || false;
  invLabel.textContent = data.text;
  invRemoveBtn.classList = "removeBtn";
  invRemoveBtn.dataset.action = "removeInventoryBtn";
  invRemoveBtn.textContent = "Remove item";

  invLabel.prepend(invCheck);
  invDiv.append(invLabel);
  invLi.append(invDiv, invRemoveBtn);

  // Alphabetical Insertion
  const existingInvLis = Array.from(invList.querySelectorAll("li"));
  let invInserted = false;

  for (const li of existingInvLis) {
    const label = li.querySelector("label");
    const existingText = label ? label.textContent.trim() : "";
    if (
      data.text.localeCompare(existingText, undefined, {
        sensitivity: "accent",
      }) < 0
    ) {
      invList.insertBefore(invLi, li);
      invInserted = true;
      break;
    }
  }

  if (!invInserted) {
    invList.append(invLi);
  }

  invCheck.addEventListener("change", () => saveUserData());

  if (shouldSave) saveUserData();
}

// Global click listener on document to capture clicks anywhere (including login screen)
document.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;

  switch (action) {
    case "mealBtn":
      e.preventDefault();
      if (!mealNameInput.value.trim()) return;

      const name = mealNameInput.value.trim();
      const dateVal = mealDateInput.value.trim();
      const isValidDate = dateVal !== "" && !isNaN(Date.parse(dateVal));
      const dateText = isValidDate ? dateVal : "Pending";
      const descVal = mealDescInput.value.trim();
      const descText = descVal !== "" ? descVal : "Mystery food?";
      const linkVal = mealLinkInput.value.trim();
      const linkText =
        linkVal !== ""
          ? linkVal
          : "https://michansohanson-prog.github.io/odin-recipes/";

      createMealCardElement(
        { name, date: dateText, description: descText, link: linkText },
        true,
      );

      mealNameInput.value = "";
      mealDateInput.value = "";
      mealDescInput.value = "";
      mealLinkInput.value = "";
      break;

    case "shopBtn":
      e.preventDefault();
      const shopValue = shopInput.value.trim();
      if (!shopValue) return;

      createShopLiElement({ text: shopValue, checked: false }, true);
      shopInput.value = "";
      break;

    case "inventoryBtn":
      e.preventDefault();
      const invValue = inventoryInput.value.trim();
      if (!invValue) return;

      createInvLiElement({ text: invValue, checked: false }, true);
      inventoryInput.value = "";
      break;

    case "removeMealBtn":
      const mealCardToRemove = button.closest(".meal-card");
      if (mealCardToRemove) {
        const mealTitleElement = mealCardToRemove.querySelector("h2");
        const mealName = mealTitleElement
          ? mealTitleElement.textContent
          : "this meal";

        showConfirmDialog(`Remove this Tasty Meal? (${mealName})`).then(
          (confirmed) => {
            if (confirmed) {
              mealCardToRemove.remove();
              saveUserData();
            }
          },
        );
      }
      break;

    case "removeShopBtn":
      const targetShopLi = button.closest("li");
      if (targetShopLi) {
        const checkbox = targetShopLi.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          targetShopLi.remove();
          saveUserData();
        } else {
          console.log("item must be checked before it can be removed.");
        }
      }
      break;

    case "removeInventoryBtn":
      const targetInvLi = button.closest("li");
      if (targetInvLi) {
        const checkbox = targetInvLi.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          targetInvLi.remove();
          saveUserData();
        } else {
          console.log("item must be checked before it can be removed.");
        }
      }
      break;

    case "removeProfile":
      const profileName = button.dataset.name;
      showConfirmDialog(`Remove profile for ${profileName}?`).then(
        (confirmed) => {
          if (confirmed) {
            let profiles =
              JSON.parse(localStorage.getItem("tasty_profiles")) || [];
            profiles = profiles.filter((p) => p !== profileName);
            localStorage.setItem("tasty_profiles", JSON.stringify(profiles));

            // Clean up data for deleted profile
            localStorage.removeItem(`tasty_meals_${profileName}`);
            localStorage.removeItem(`tasty_shop_${profileName}`);
            localStorage.removeItem(`tasty_inv_${profileName}`);

            if (localStorage.getItem("tasty_active_user") === profileName) {
              localStorage.removeItem("tasty_active_user");
            }
            checkSession();
          }
        },
      );
      break;
  }
});
