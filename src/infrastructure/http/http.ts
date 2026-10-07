import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import ApplicationError from '@/application/errors/application.error';
import { ENVIRONMENT } from '@/infrastructure/config/environment';

class Http {
  private static instance: AxiosInstance = axios.create({
    baseURL: ENVIRONMENT.API_BASE_URL,
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  public static async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request(() => this.instance.get<T>(url, config));
  }

  public static async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request(() => this.instance.post<T>(url, data, config));
  }

  public static async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request(() => this.instance.put<T>(url, data, config));
  }

  public static async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request(() => this.instance.patch<T>(url, data, config));
  }

  public static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request(() => this.instance.delete<T>(url, config));
  }

  public static setAuthToken(token: string) {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public static removeAuthToken() {
    delete this.instance.defaults.headers.common['Authorization'];
  }

  private static async request<T>(
    operation: () => Promise<AxiosResponse<T>>,
  ): Promise<AxiosResponse<T>> {
    try {
      return await operation();
    } catch (error) {
      if (
        typeof axios.isAxiosError !== 'function' ||
        !axios.isAxiosError(error)
      ) {
        throw error;
      }

      if (error.code === 'ERR_CANCELED') {
        throw new ApplicationError('cancelled', 'Request was cancelled.');
      }

      const status = error.response?.status;
      const code =
        status === 404
          ? 'not-found'
          : status === 422
            ? 'validation'
            : status === 429
              ? 'rate-limited'
              : 'unexpected';

      throw new ApplicationError(code, 'The request could not be completed.', status);
    }
  }
}

export default Http;
