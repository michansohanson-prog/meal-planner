const shopInput = document.querySelector("#shopListInput");

const inventoryInput = document.querySelector("#inventoryInput");
const buttonContainer = document.querySelector("main");

buttonContainer.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  switch (action) {
    case "mealBtn":
      console.log("clicked meal button");
      break;
    case "shopBtn":
      console.log("clicked shop button");

      break;
    case "inventoryBtn":
      console.log("clicked inventory button");
      break;
    case "removeMealBtn":
      console.log("clicked remove meal button");
      break;
    case "removeShopBtn":
      console.log("clicked remove shop button");
      break;
    case "removeInventoryBtn":
      console.log("clicked remove inventory button");
  }
});
