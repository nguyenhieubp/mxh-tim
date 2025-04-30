import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/redux/configs/hooks";
import { getCurrentUser } from "@/redux/features/auth";

interface AuthContextType {
  isLoading: boolean;
  isUser: boolean;
  user: any | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isUser: false,
  user: null
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUser, setIsUser] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        // Nếu là route admin, không cần kiểm tra
        if (pathname.startsWith('/admin')) {
          setIsLoading(false);
          return;
        }

        // Nếu không có token và không phải trang auth (login/register)
        if (!token && pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password') {
          setIsLoading(false);
          router.replace("/login");
          return;
        }

        // Nếu không có token và là trang auth, không cần kiểm tra user
        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          // Lấy thông tin user hiện tại
          const userResult = await dispatch(getCurrentUser()).unwrap();
          const userData = userResult?.data;

          // Nếu không có user data
          if (!userData) {
            localStorage.removeItem("token");
            setIsLoading(false);
            if (pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password') {
              router.replace("/login");
            }
            return;
          }

          setUser(userData);
          
          // Kiểm tra role USER
          const hasUserRole = userData.roles?.some(
            (role: string) => role.toLowerCase() === "user"
          );
          setIsUser(hasUserRole);

          // Nếu không phải user và không phải trang auth, chuyển hướng về login
          if (!hasUserRole && pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password') {
            localStorage.removeItem("token");
            router.replace("/login");
          }

        } catch (error) {
          localStorage.removeItem("token");
          if (pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password') {
            router.replace("/login");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, dispatch]);

  return (
    <AuthContext.Provider value={{ isLoading, isUser, user }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
