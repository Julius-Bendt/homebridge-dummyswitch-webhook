import axios, { AxiosResponse } from 'axios';
import { Logger } from 'homebridge';



export function createAxios(url: string, token: string, log: Logger) {
    const http = axios.create({
        baseURL: url.includes('http') ? url : `http://${url}`,
        timeout: 10000,
        headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Authorization': token,
            Accept: 'application/json',
        },
    });

    http.interceptors.response.use(
        (response: AxiosResponse<any, any>) => {
            return response;
        },
        (errorResponse) => {
            const error = errorResponse.toJSON();

            return { data: error, ok: false };
        },
    );

    return http;
}
