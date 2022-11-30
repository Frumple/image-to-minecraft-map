export function isCustomEvent(event: Event): event is CustomEvent {
  return 'detail' in event;
}