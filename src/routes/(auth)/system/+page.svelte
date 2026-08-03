<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { ChevronLeftIcon } from '@lucide/svelte';
	import OrganizationTypesSection from './organization-types-section.svelte';
	import VenueTypesSection from './venue-types-section.svelte';
	import FacilitiesSection from './facilities-section.svelte';
	import EventCategorySection from './event-category-section.svelte';
	import EventTypesSection from './event-types-section.svelte';
	import { onMount } from 'svelte';
	import { nav } from '../header.svelte';

	onMount(() => {
		nav.set([{ title: 'System', url: '/system' }]);
	});
</script>

<div class="mx-auto w-full max-w-prose">
	<OrganizationTypesSection />
	<Separator />
	<VenueTypesSection />
	<Separator />
	<FacilitiesSection />
	<Separator />
	<EventTypesSection />
	<Separator />
	<EventCategorySection />
</div>
