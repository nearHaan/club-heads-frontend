<script lang="ts">
	import { CirclePileIcon, UsersIcon } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	let activeTitle = $state('Users');
	// Menu items.
	const items = [
		{
			title: 'Users',
			url: '/users',
			icon: UsersIcon
		},
		{
			title: 'Organizations',
			url: '/organizations',
			icon: CirclePileIcon
		},{
			title: 'Venues',
			url: '/venues',
			icon: CirclePileIcon
		}
	];

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								onclick={() => {
									activeTitle = item.title;
									if (sidebar.isMobile) {
										sidebar.toggle();
									}
								}}
								isActive={activeTitle === item.title}
							>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
