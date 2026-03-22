'use client';

import { startTransition } from 'react';

let activeTransition = null;

function isAbortLikeError(error) {
  return error?.name === 'AbortError' || error?.message === 'Transition was skipped';
}

export function runWithViewTransition(update) {
  if (typeof document === 'undefined' || typeof document.startViewTransition !== 'function') {
    update();
    return null;
  }

  if (activeTransition) {
    update();
    return null;
  }

  try {
    const transition = document.startViewTransition(update);
    const finished = transition.finished;

    activeTransition = finished
      .catch((error) => {
        if (!isAbortLikeError(error)) {
          console.error(error);
        }
      })
      .finally(() => {
        if (activeTransition === finished) {
          activeTransition = null;
        }
      });

    return transition;
  } catch (error) {
    if (!isAbortLikeError(error)) {
      console.error(error);
    }
    update();
    return null;
  }
}

export function navigateWithTransition(router, href, options = {}) {
  if (!router || !href) return;

  const { replace = false, scroll = true } = options;

  runWithViewTransition(() => {
    startTransition(() => {
      if (replace) {
        router.replace(href, { scroll });
        return;
      }

      router.push(href, { scroll });
    });
  });
}

export function dispatchNavigation(href, options = {}) {
  if (typeof window === 'undefined' || !href) return;

  window.dispatchEvent(new CustomEvent('taskflow:navigate', {
    detail: { href, ...options },
  }));
}
