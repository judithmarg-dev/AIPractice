import { createAction } from '@reduxjs/toolkit'
import type { PersistedState } from './persistence'

/** Replaces every persisted slice at once: reset to seed, or sync from another tab. */
export const replacePersisted = createAction<PersistedState>('app/replacePersisted')
