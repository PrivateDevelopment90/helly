import type { BodyInit } from 'node-fetch';

function verifyForStatusCode(endpoint: string, data: BodyInit, code: number, method: string) {
    switch (code) {
        case 400:
            throw new Error(
                `DiscordAPIError: Bad Request (400)\nEndpoint: ${endpoint}\nMethod: ${method}\nData: ${data ?? 'empty'}`,
            );
        case 401:
            throw new Error(
                `DiscordAPIError: Not Authorized (401)\nEndpoint: ${endpoint}\nMethod: ${method}\nData: ${data ?? 'empty'}`,
            );
        case 403:
            throw new Error(
                `DiscordAPIError: Missing Permissions (403)\nEndpoint: ${endpoint}\nMethod: ${method}\nData: ${data ?? 'empty'
                }`,
            );
        case 404:
            throw new Error(
                `DiscordAPIError: Not Found (404)\nEndpoint: ${endpoint}\nMethod: ${method}\nData: ${data ?? 'empty'}`,
            );
    }
}

function verifyForJSONStatusCode(jsonResponse: any, endpoint: string, data: BodyInit, method: string) {
    if (jsonResponse.code && jsonResponse.message) {
        throw new Error(
            `DiscordAPIError: ${jsonResponse.message} (${jsonResponse.code
            })\nEndpoint: ${endpoint}\nMethod: ${method}\nData: ${typeof data === 'object' ? JSON.stringify(data) : data ?? 'empty'
            }`,
        );
    }
}

export { verifyForJSONStatusCode, verifyForStatusCode };
