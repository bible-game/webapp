"use server"

/**
 * The Bible's structure (testaments, divisions, books). It rarely changes, so the response is kept in Next's data
 * cache for an hour rather than fetched on every page load
 */
export default async function getBible(): Promise<any> {
    const response = await fetch(`${process.env.SVC_PASSAGE}/config/bible`, { method: "GET", next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Bible config request failed: ${response.status}`);
    return await response.json();
}
