'use server'

export async function gradeSummary(passageKey: string, userSummary: string): Promise<any> {
  const key = encodeURIComponent(passageKey.replace(/ /g, ""));
  const summary = encodeURIComponent(userSummary)
  const url = `${process.env.SVC_PASSAGE}/study/grade/${key}?summary=${summary}`;

  const response = await fetch(url, { method: "GET" });

  return response.json();
}
