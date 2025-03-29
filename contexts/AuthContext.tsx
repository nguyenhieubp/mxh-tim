import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/configs/apis/request";
import { APIs } from "@/configs/apis/listAPI";
import { getAuthHeaders } from "@/utils/api";
import { use } from "i18next";
import { useAppDispatch } from "@/redux/configs/hooks";
import { getCurrentUser } from "@/redux/features/auth";

interface AuthContextType {
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await api.get(APIs.auth.me);
        if (response.data?.data) {
          if (pathname === "/login" || pathname === "/register") {
            router.push("/");
            return;
          }
          dispatch(getCurrentUser());
          router.push("/");
          return;
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
