export const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('adminToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'x-admin-token': token } : {}),
        ...options?.headers
    };

    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
}


export const getCompanies = () => fetchJson<any[]>('/companies');
export const createCompany = (name: string) => fetchJson<any>('/companies', {
    method: 'POST',
    body: JSON.stringify({ name })
});

// Quizzes
export const getQuizzes = () => fetchJson<any[]>('/quizzes');
export const createQuiz = (title: string, content: any, description?: string) => fetchJson<any>('/quizzes', {
    method: 'POST',
    body: JSON.stringify({ title, description, content })
});
export const generateQuiz = (text: string, context?: string) => fetchJson<any>('/generate', {
    method: 'POST',
    body: JSON.stringify({ text, context })
});

// Sessions
export const getSessions = () => fetchJson<any[]>('/sessions');
export const createSession = (companyId: number, quizId: number) => fetchJson<any>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ companyId, quizId })
});

// Public
export const getSessionBySlug = (slug: string) => fetchJson<any>(`/get-session?slug=${slug}`);
export const submitResponse = (data: any) => fetchJson<any>('/submit-response', {
    method: 'POST',
    body: JSON.stringify(data)
});
export const getResults = (sessionId: number) => fetchJson<any>(`/get-results?sessionId=${sessionId}`);

// Documents
export const getDocuments = (params?: { trainingId?: number; docType?: string }) => {
    const search = new URLSearchParams();
    if (params?.trainingId) search.set("trainingId", String(params.trainingId));
    if (params?.docType) search.set("docType", params.docType);
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return fetchJson<any[]>(`/documents${suffix}`);
};

export const generateConvention = (payload: any) => fetchJson<any>('/documents/generate/convention', {
    method: 'POST',
    body: JSON.stringify(payload)
});
