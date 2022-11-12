export function addStringToListElement(listElement: HTMLUListElement | HTMLOListElement, str: string) {
  const listItemElement = document.createElement('li');
  listItemElement.textContent = str;
  listElement.appendChild(listItemElement);
}