import type { Venue } from '$lib/types';

export const venueAssignState = $state<{ selectedVenue: Venue | null; assignSheetOpen: boolean }>({
	selectedVenue: null,
	assignSheetOpen: false
});
