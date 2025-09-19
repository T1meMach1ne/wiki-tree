import { WikiIndex } from '../types';

let currentIndex: WikiIndex | undefined;
let currentIndexPath: string | undefined;

export function setCurrentIndex(index: WikiIndex, indexPath?: string): void {
  currentIndex = index;
  if (indexPath) {
    currentIndexPath = indexPath;
  }
}

export function getCurrentIndex(): WikiIndex | undefined {
  return currentIndex;
}

export function getCurrentIndexPath(): string | undefined {
  return currentIndexPath;
}
