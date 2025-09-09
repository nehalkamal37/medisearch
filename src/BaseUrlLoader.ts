export interface AppConfig {
    API_BASE_URL: string;
  }
  
  const BaseUrlLoader: AppConfig = {
    API_BASE_URL: ""
    
  };
  
  export const loadConfig = async (): Promise<void> => {
    try {
      const response = await fetch("/BaseUrl.json");
      const data: AppConfig = await response.json();
      Object.assign(BaseUrlLoader, data);
    } catch (error) {
      console.error("Failed to load config file", error);
    }
  };
  
  export default BaseUrlLoader;
  