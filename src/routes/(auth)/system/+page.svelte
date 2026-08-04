<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { onMount } from 'svelte';
	import { nav } from '../header.svelte';
	import EventCategorySection from './event-category-section.svelte';
	import EventTypesSection from './event-types-section.svelte';
	import FacilityTypesSection from './facility-types-section.svelte';
	import OrganizationTypesSection from './organization-types-section.svelte';
	import VenueTypesSection from './venue-types-section.svelte';

	onMount(() => {
		nav.set([{ title: 'System', url: '/system' }]);
	});
</script>

<div class="mx-auto w-full max-w-prose">
	<OrganizationTypesSection />
	<Separator />
	<VenueTypesSection />
	<Separator />
	<FacilityTypesSection />
	<Separator />
	<EventTypesSection />
	<Separator />
	<EventCategorySection />
</div>
