export const APIs: { [key: string]: { [key: string]: string } } = {
  auth: {
    login: "api/auth/login",
    register: "api/auth/register",
    me: "/api/v1/auth/me",
  },
  user: {
    profile: "/api/v1/user/profile",
  },
};
