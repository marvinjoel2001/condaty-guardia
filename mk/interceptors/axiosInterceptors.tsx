import AsyncStorage from "@react-native-async-storage/async-storage";
import configApp from "../../src/config/config";

const axiosInterceptors = async (instance: any) => {
  instance.interceptors.request.use(
    async (config: any) => {
      let apiToken: any = "nueva";
      try {
        apiToken = await AsyncStorage.getItem(configApp.APP_AUTH_IAM + "token");
        apiToken = apiToken != null ? JSON.parse(apiToken).token : "no existe";
      } catch (e) {
        apiToken = null;
      }

      if (apiToken) {
        config.headers = {
          Authorization: "Bearer " + apiToken,
          accept: "application/json",
        };
      }
      // console.log("config Axios", config);

      return config;
    },
    (error: any) => {
      console.error("Network error1:", error);
      return Promise.reject(error);
    }
  );

  // instance.interceptors.response.use(
  //   (response:any) => {
  //     if (response?.status === 401) {
  //       localStorage.removeItem(
  //         configApp.APP_AUTH_IAM + "token"
  //       );
  //       window.location.href = "/login";
  //     }
  //     return response;
  //   },
  //   (error) => {
  //     if (error.response?.status === 401) {
  //       localStorage.removeItem(
  //         configApp.APP_AUTH_IAM + "token"
  //       );
  //       window.location.href = "/login";
  //     }
  //     console.error("Network error:", error);
  //     return Promise.reject(error);
  //   }
  // );
};

export default axiosInterceptors;
