import ApplicationContainer from "@elements/autonomous/containers/application-container";

async function init() {
  await defineElements();
}

async function defineElements() {
  await ApplicationContainer.define();
}

init();