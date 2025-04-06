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
          if (pathname.startsWith('/admin')) {
            router.push("/login");
            return;
          }
          return;
        }

        const response = await api.get(APIs.auth.me);
        if (response.data?.data) {
          const user = response.data.data;

          // Nếu đang ở trang login/register và đã đăng nhập
          if (pathname === "/login" || pathname === "/register") {
            router.push("/");
            return;
          }

          // TODO: Uncomment this when ready to implement admin role check
          // if (pathname.startsWith('/admin') && user.role !== 'admin') {
          //   router.push("/");
          //   return;
          // }

          dispatch(getCurrentUser());
        } else {
          if (pathname.startsWith('/admin')) {
            router.push("/login");
          }
        }
      } catch (error) {
        if (pathname.startsWith('/admin')) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
