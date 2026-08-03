<script lang="ts">
	import {
		BuildingIcon,
		CalendarIcon,
		CircleCheck,
		CirclePileIcon,
		Home,
		Link,
		LogOut,
		MonitorCogIcon,
		NetworkIcon,
		UsersIcon
	} from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { authInfo } from '$lib/global/auth.svelte';
	import { page } from '$app/state';
	import { logout } from '$lib/api/auth';
	import { canAccessRoute } from '$lib/helpers';

	let activeUrl = $derived(page.url.pathname.split('/')[1]);
	// Menu items.
	let items = $derived.by(() => {
		const user = authInfo.get();
		if (user === null) return [];
		return user.type === 'admin'
			? [
					{
						title: 'Users',
						url: '/users',
						icon: UsersIcon
					},
					{
						title: 'Venues',
						url: '/venues',
						icon: BuildingIcon
					},
					{
						title: 'Organizations',
						url: '/organizations',
						icon: CirclePileIcon
					},
					{
						title: 'Workflow Templates',
						url: '/workflow-templates',
						icon: NetworkIcon
					},
					{
						title: 'System',
						url: '/system',
						icon: MonitorCogIcon
					}
				]
			: [
					{
						title: 'Home',
						url: '/',
						icon: Home
					},
					{
						title: 'Event Calendar',
						url: '/event-calendar',
						icon: CircleCheck
					},
					{
						title: 'Approvals',
						url: '/approvals',
						icon: CircleCheck
					},
					{
						title: 'Invitations',
						url: '/invitations',
						icon: Link
					},
					...(canAccessRoute('/users')
						? [
								{
									title: 'Users',
									url: '/users',
									icon: UsersIcon
								}
							]
						: []),
					...(canAccessRoute('/events')
						? [
								{
									title: 'Events',
									url: '/events',
									icon: CalendarIcon
								}
							]
						: []),
					...(canAccessRoute('/venues')
						? [
								{
									title: 'Venues',
									url: '/venues',
									icon: BuildingIcon
								}
							]
						: []),
					...(canAccessRoute('/organizations')
						? [
								{
									title: 'Organizations',
									url: '/organizations',
									icon: CirclePileIcon
								}
							]
						: [])
				];
	});

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root collapsible="icon" variant="sidebar">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={item.url.split('/')[1] == activeUrl}>
								{#snippet child({ props })}
									<a
										href={item.url}
										{...props}
										onclick={() => {
											if (sidebar.isMobile) sidebar.toggle();
										}}
									>
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
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<a
							href="/login"
							{...props}
							onclick={async () => {
								if (sidebar.isMobile) sidebar.toggle();
								await logout();
							}}
						>
							<LogOut />
							<span>Logout</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
