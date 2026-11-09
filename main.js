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

const inventoryInput = document.querySelector("#inventoryInput");
const invList = document.querySelector(".inventoryEntries");

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
    invList.innerHTML = "";
    if (realtimeChannel) window.supabaseClient.removeChannel(realtimeChannel);
  }
  renderProfiles();
}

// Load user-specific data from Supabase
async function loadUserData(username) {
  mealsContainer.innerHTML = "";
  shopList.innerHTML = "";
  invList.innerHTML = "";

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

// Realtime sync listener for live updates across devices
function setupRealtimeSync(username) {
  if (realtimeChannel) window.supabaseClient.removeChannel(realtimeChannel);

  realtimeChannel = window.supabaseClient
    .channel(`public-db-changes-${username}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "meals",
        filter: `profile_name=eq.${username}`,
      },
      () => loadUserData(username),
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shopping_list",
        filter: `profile_name=eq.${username}`,
      },
      () => loadUserData(username),
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "inventory",
        filter: `profile_name=eq.${username}`,
      },
      () => loadUserData(username),
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

// Element Creators
function createMealCardElement(data, shouldSave = true) {
  const mealCard = document.createElement("div");
  mealCard.classList.add("meal-card");
  mealCard.dataset.id = data.id || "";

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

  if (shouldSave) {
    const activeUser = localStorage.getItem("tasty_active_user");
    window.supabaseClient
      .from("meals")
      .insert([
        {
          profile_name: activeUser,
          name: data.name,
          date: data.date,
          description: data.description,
          link: data.link,
        },
      ])
      .select()
      .then(({ data: insertedData }) => {
        if (insertedData && insertedData[0]) {
          mealCard.dataset.id = insertedData[0].id;
        }
      });
  }
}

function createShopLiElement(data, shouldSave = true) {
  const shopLi = document.createElement("li");
  shopLi.dataset.id = data.id || "";
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

  shopCheck.addEventListener("change", async () => {
    if (shopLi.dataset.id) {
      await window.supabaseClient
        .from("shopping_list")
        .update({ checked: shopCheck.checked })
        .eq("id", shopLi.dataset.id);
    }
  });

  if (shouldSave) {
    const activeUser = localStorage.getItem("tasty_active_user");
    window.supabaseClient
      .from("shopping_list")
      .insert([
        {
          profile_name: activeUser,
          text: data.text,
          checked: data.checked,
        },
      ])
      .select()
      .then(({ data: insertedData }) => {
        if (insertedData && insertedData[0]) {
          shopLi.dataset.id = insertedData[0].id;
        }
      });
  }
}

function createInvLiElement(data, shouldSave = true) {
  const invLi = document.createElement("li");
  invLi.dataset.id = data.id || "";
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

  invCheck.addEventListener("change", async () => {
    if (invLi.dataset.id) {
      await window.supabaseClient
        .from("inventory")
        .update({ checked: invCheck.checked })
        .eq("id", invLi.dataset.id);
    }
  });

  if (shouldSave) {
    const activeUser = localStorage.getItem("tasty_active_user");
    window.supabaseClient
      .from("inventory")
      .insert([
        {
          profile_name: activeUser,
          text: data.text,
          checked: data.checked,
        },
      ])
      .select()
      .then(({ data: insertedData }) => {
        if (insertedData && insertedData[0]) {
          invLi.dataset.id = insertedData[0].id;
        }
      });
  }
}

// Global click listener on document
document.addEventListener("click", async (e) => {
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
          async (confirmed) => {
            if (confirmed) {
              const mealId = mealCardToRemove.dataset.id;
              if (mealId) {
                await window.supabaseClient
                  .from("meals")
                  .delete()
                  .eq("id", mealId);
              }
              mealCardToRemove.remove();
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
          const shopId = targetShopLi.dataset.id;
          if (shopId) {
            await window.supabaseClient
              .from("shopping_list")
              .delete()
              .eq("id", shopId);
          }
          targetShopLi.remove();
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
          const invId = targetInvLi.dataset.id;
          if (invId) {
            await window.supabaseClient
              .from("inventory")
              .delete()
              .eq("id", invId);
          }
          targetInvLi.remove();
        } else {
          console.log("item must be checked before it can be removed.");
        }
      }
      break;

    case "removeProfile":
      const profileName = button.dataset.name;
      showConfirmDialog(`Remove profile for ${profileName}?`).then(
        async (confirmed) => {
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
            checkSession();
          }
        },
      );
      break;
  }
});
