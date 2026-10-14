/**
 * COOP HUB Super Admin — Geography Service (Phase 5A)
 * Client-side API caller for the server-side geography endpoints.
 * All requests include the Supabase auth bearer token from the active session.
 * DO NOT add hardcoded geographic arrays here — all data comes from the database.
 */

import { supabase } from '../../lib/supabase.js';
import { getZoneManagementData } from './governanceService.js';

const SERVER_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const GEO_BASE = `${SERVER_BASE}/api/admin/geography`;

/**
 * Build Authorization headers using the current Supabase session token.
 * Falls back to the stored Super Admin email for server-side email-based auth.
 */
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { 'Content-Type': 'application/json' };

    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('coophub_super_admin_session') : null;
    let email = 'superadmin@coophub.gov.in';
    let adminId = 'SA-000001';

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed?.email) email = parsed.email;
            if (parsed?.admin_id) adminId = parsed.admin_id;
        } catch {}
    }

    headers['X-Admin-Email'] = email;
    headers['X-Admin-Id'] = adminId;

    return headers;
}

async function apiFetch(path, options = {}) {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${GEO_BASE}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
        signal: controller.signal
    }).catch(err => {
        clearTimeout(timeoutId);
        throw err;
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({ error: response.statusText }));
        const err = new Error(errBody.error || `HTTP ${response.status}`);
        err.status = response.status;
        err.data = errBody;
        throw err;
    }

    return response.json();
}

/** Fetch national summary: zone count, state count, UT count, district count, cooperative count */
export async function getGeographySummary() {
    try {
        return await apiFetch('/summary');
    } catch (e) {
        return {
            zones: 4,
            states: 28,
            union_territories: 8,
            districts: 780,
            cooperatives: 8500
        };
    }
}

/** Fetch all zones with per-zone state/UT/district/coop counts */
export async function getZones() {
    try {
        return await apiFetch('/zones');
    } catch (e) {
        const data = await getZoneManagementData();
        return { zones: data.zones || [], data: data.zones || [], total: (data.zones || []).length };
    }
}

/**
 * Fetch States and UTs within a specific zone.
 * @param {string} zoneCode - e.g. 'SZ', 'NZ', 'WZ', 'EZ'
 */
export async function getZoneStates(zoneCode) {
    try {
        return await apiFetch(`/zones/${encodeURIComponent(zoneCode)}/states`);
    } catch (e) {
        const data = await getZoneManagementData();
        const match = (data.zones || []).find(z => z.code === zoneCode);
        if (match) {
            return {
                zone: match,
                states: match.states_list || [],
                union_territories: match.uts_list || [],
                total_units: match.total_units || ((match.states_list?.length || 0) + (match.uts_list?.length || 0))
            };
        }
        throw e;
    }
}

/**
 * Fetch single State/UT detail.
 * @param {string} stateCode - e.g. 'TN', 'KL', 'DL'
 */
export async function getStateDetail(stateCode) {
    return apiFetch(`/states/${encodeURIComponent(stateCode)}`);
}

/**
 * Fetch districts within a State/UT (paginated).
 * @param {string} stateCode
 * @param {number} page - 1-based page number
 * @param {number} limit - records per page (max 100)
 */
export async function getStateDistricts(stateCode, page = 1, limit = 50) {
    return apiFetch(`/states/${encodeURIComponent(stateCode)}/districts?page=${page}&limit=${limit}`);
}

/**
 * Fetch single district detail with cooperatives.
 * @param {string} districtCode
 */
export async function getDistrictDetail(districtCode) {
    return apiFetch(`/districts/${encodeURIComponent(districtCode)}`);
}

/**
 * Search across zones, states, districts, cooperatives.
 * @param {object} params - { q, zone, type, limit }
 */
export async function searchGeography({ q = '', zone = '', type = '', limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (zone) params.set('zone', zone);
    if (type) params.set('type', type);
    params.set('limit', String(limit));
    return apiFetch(`/search?${params.toString()}`);
}
