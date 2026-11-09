const mealNameInput = document.querySelector("#mealName");
const mealDateInput = document.querySelector("#mealDate");
const mealDescInput = document.querySelector("#mealDesc");
const mealLinkInput = document.querySelector("#mealLink");
const mealsContainer = document.querySelector("#meals");

const shopInput = document.querySelector("#shopListInput");
const shopList = document.querySelector(".shopListEntries");

const inventoryInput = document.querySelector("#inventoryInput");
const invList = document.querySelector(".inventoryEntries");
const buttonContainer = document.querySelector("main");

// Helper function to handle the custom <dialog> confirmation modal
function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirmModal");
    const yesBtn = document.querySelector("#confirmYes");
    const noBtn = document.querySelector("#confirmNo");

    if (!dialog) {
      // Fallback if dialog isn't found in the HTML
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

buttonContainer.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  switch (action) {
    case "mealBtn":
      e.preventDefault();
      console.log("clicked meal button");

      // Only mealName is required now
      if (!mealNameInput.value.trim()) {
        return;
      }

      const mealCard = document.createElement("div");
      mealCard.classList.add("meal-card");

      const mealTitle = document.createElement("h2");
      mealTitle.textContent = mealNameInput.value;

      // Handle Date: check if provided and valid, otherwise use "Pending"
      const mealDateP = document.createElement("p");
      mealDateP.classList.add("date");
      const dateValue = mealDateInput.value.trim();
      const isValidDate = dateValue !== "" && !isNaN(Date.parse(dateValue));
      mealDateP.textContent = isValidDate ? dateValue : "Pending";

      // Handle Description: use input value or default to "Mystery food?"
      const mealDescP = document.createElement("p");
      mealDescP.classList.add("meal-description");
      const descValue = mealDescInput.value.trim();
      mealDescP.textContent = descValue !== "" ? descValue : "Mystery food?";

      // Single link logic (uses form input if available, falls back to default)
      const recipeUrl =
        mealLinkInput.value.trim() !== ""
          ? mealLinkInput.value
          : "https://michansohanson-prog.github.io/odin-recipes/";

      const recipeLink = document.createElement("a");
      recipeLink.href = recipeUrl;
      recipeLink.target = "_blank";
      recipeLink.textContent =
        mealLinkInput.value.trim() !== "" ? "Link to Recipe" : "Recipe Website";

      const btnWrapper = document.createElement("div");
      const removeMealBtn = document.createElement("button");
      removeMealBtn.classList.add("removeBtn");
      removeMealBtn.dataset.action = "removeMealBtn";
      removeMealBtn.textContent = "Remove Meal";

      btnWrapper.append(removeMealBtn);

      mealCard.append(mealTitle, mealDateP, mealDescP, recipeLink, btnWrapper);

      // Chronological Meal Insertion Logic
      const cardTimestamp = isValidDate ? Date.parse(dateValue) : Infinity;
      const existingMealCards = Array.from(
        mealsContainer.querySelectorAll(".meal-card"),
      );
      let mealInserted = false;

      for (const existingCard of existingMealCards) {
        const dateP = existingCard.querySelector(".date");
        const dateText = dateP ? dateP.textContent.trim() : "";
        const existingTime =
          dateText !== "" &&
          dateText !== "Pending" &&
          !isNaN(Date.parse(dateText))
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

      // Clear out the form inputs
      mealNameInput.value = "";
      mealDateInput.value = "";
      mealDescInput.value = "";
      mealLinkInput.value = "";

      break;

    case "shopBtn":
      // Do nothing if input is empty or just whitespace
      const shopValue = shopInput.value.trim();
      if (!shopValue) return;

      console.log("clicked shop button");
      const shopLi = document.createElement("li");
      const shopdiv = document.createElement("div");
      const shopCheck = document.createElement("input");
      const shopLabel = document.createElement("label");
      const shopRemoveBtn = document.createElement("button");
      shopCheck.type = "checkbox";
      shopLabel.textContent = shopValue;
      shopRemoveBtn.classList = "removeBtn";
      shopRemoveBtn.dataset.action = "removeShopBtn";
      shopRemoveBtn.textContent = "Remove item";
      shopLabel.prepend(shopCheck);
      shopdiv.append(shopLabel);
      shopLi.append(shopdiv, shopRemoveBtn);

      // Alphabetical Shop List Insertion Logic
      const existingShopLis = Array.from(shopList.querySelectorAll("li"));
      let shopInserted = false;

      for (const li of existingShopLis) {
        const label = li.querySelector("label");
        const existingText = label ? label.textContent.trim() : "";
        if (
          shopValue.localeCompare(existingText, undefined, {
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

      shopInput.value = "";

      break;

    case "inventoryBtn":
      // Do nothing if input is empty or just whitespace
      const invValue = inventoryInput.value.trim();
      if (!invValue) return;

      console.log("clicked inventory button");
      const invLi = document.createElement("li");
      const invDiv = document.createElement("div");
      const invCheck = document.createElement("input");
      const invLabel = document.createElement("label");
      const invRemoveBtn = document.createElement("button");
      invCheck.type = "checkbox";
      invLabel.textContent = invValue;
      invRemoveBtn.classList = "removeBtn";
      invRemoveBtn.dataset.action = "removeInventoryBtn";
      invRemoveBtn.textContent = "Remove item";
      invLabel.prepend(invCheck);
      invDiv.append(invLabel);
      invLi.append(invDiv, invRemoveBtn);

      // Alphabetical Inventory List Insertion Logic
      const existingInvLis = Array.from(invList.querySelectorAll("li"));
      let invInserted = false;

      for (const li of existingInvLis) {
        const label = li.querySelector("label");
        const existingText = label ? label.textContent.trim() : "";
        if (
          invValue.localeCompare(existingText, undefined, {
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

      inventoryInput.value = "";

      break;

    case "removeMealBtn":
      console.log("clicked remove meal button");
      const mealCardToRemove = button.closest(".meal-card");
      if (mealCardToRemove) {
        // Extract the meal title from the h2 element inside the card
        const mealTitleElement = mealCardToRemove.querySelector("h2");
        const mealName = mealTitleElement
          ? mealTitleElement.textContent
          : "this meal";

        showConfirmDialog(`Remove this Tasty Meal? (${mealName})`).then(
          (confirmed) => {
            if (confirmed) {
              mealCardToRemove.remove();
            }
          },
        );
      }
      break;

    case "removeShopBtn":
      console.log("clicked remove shop button");
      const targetShopLi = button.closest("li");
      if (targetShopLi) {
        const checkbox = targetShopLi.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          targetShopLi.remove();
        } else {
          console.log("item must be checked before it can be removed.");
        }
      }

      break;

    case "removeInventoryBtn":
      console.log("clicked remove inventory button");
      const targetInvLi = button.closest("li");
      if (targetInvLi) {
        const checkbox = targetInvLi.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          targetInvLi.remove();
        } else {
          console.log("item must be checked before it can be removed.");
        }
      }

      break;
  }
});
