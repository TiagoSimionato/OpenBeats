import type { AxiosRequestConfig, CreateAxiosDefaults } from "axios";
import axios from "axios";

export * from "./mutations";
export * from "./queries";

export type RequestConfig<D = unknown> = Pick<
  AxiosRequestConfig<D>,
  "headers" | "params"
>;

const GenericAPI = (
  baseURL: string,
  configs?: Omit<CreateAxiosDefaults, "baseURL">,
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
        method: "delete",
      });
    },
    get<RequesReturnType>(url: string, config?: RequestConfig) {
      return this.request<RequesReturnType>({
        method: "get",
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
        method: "patch",
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
        method: "post",
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
        method: "put",
      });
    },
    async request<RequesReturnType>(
      config: Parameters<typeof axiosInstance.request>["0"],
    ) {
      return await axiosInstance
        .request<RequesReturnType>(config)
        .then((response) => response.data);
    },
  };
};

export const api = GenericAPI("/api");
export const mbApi = GenericAPI("https://musicbrainz.org/ws/2/");
