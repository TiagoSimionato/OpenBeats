import type { AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import axios from 'axios';

export type RequestConfig<D = unknown> = Pick<
  AxiosRequestConfig<D>,
  'headers' | 'params' | 'responseType'
>;

export const createAPI = (
  baseURL: string,
  configs?: Omit<CreateAxiosDefaults, 'baseURL'>,
) => {
  const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    ...configs,
  });

  return {
    delete<RequesReturnType>(
      url: string,
      data: unknown = null,
      config?: RequestConfig,
    ) {
      return this.request<RequesReturnType>({
        data,
        url,
        ...config,
        method: 'delete',
      });
    },
    get<RequesReturnType>(url: string, config?: RequestConfig) {
      return this.request<RequesReturnType>({
        method: 'get',
        url,
        ...config,
      });
    },
    patch<RequesReturnType>(
      url: string,
      data: unknown = null,
      config?: RequestConfig,
    ) {
      return this.request<RequesReturnType>({
        data,
        url,
        ...config,
        method: 'patch',
      });
    },
    post<RequesReturnType>(
      url: string,
      data: unknown = null,
      config?: RequestConfig,
    ) {
      return this.request<RequesReturnType>({
        data,
        url,
        ...config,
        method: 'post',
      });
    },
    put<RequesReturnType>(
      url: string,
      data: unknown = null,
      config?: RequestConfig,
    ) {
      return this.request<RequesReturnType>({
        data,
        url,
        ...config,
        method: 'put',
      });
    },
    request: async <RequesReturnType>(
      config: Parameters<typeof axiosInstance.request>['0'],
    ) => await axiosInstance
      .request<RequesReturnType>(config)
      .then(response => response.data),
  };
};
