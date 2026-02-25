import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { Venue } from '$lib/types';

export async function loadVenues() {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/admin/venues`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        return [] as Array<Venue>;
    }

    const venues: Venue[] = (await res.json()).data.venues ?? [];

    return venues;
}

export async function createVenue(name: string, available: string, max_capacity: string, access: string) {
    if (!name || !available || !max_capacity || !access) {
        throw new Error('Name, Available, Max Capacity and Access are required fields');
    }

    const res = await fetch(`${PUBLIC_API_BASE_URL}/admin/venues`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fullName: name,
            available: available,
            maxCapacity: max_capacity,
            access: access
        })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        const errors: Array<any> = error.errors;
        if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
        } else {
            throw new Error(error.message);
        }
    }

    return true;
}
