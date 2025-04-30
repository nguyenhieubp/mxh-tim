import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/redux/configs/hooks";
import { getCurrentUser } from "@/redux/features/auth";

interface AdminContextType {
  isLoading: boolean;
  isAdmin: boolean;
  user: any | null;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isLoading: true,
  isAdmin: false,
  user: null,
  logout: () => { }
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem("token");

      // Nếu không phải route admin, không cần kiểm tra
      if (!pathname.startsWith('/admin')) {
        setIsLoading(false);
        return;
      }

      // Nếu không có token, chuyển hướng về trang login admin
      if (!token) {
        setIsLoading(false);
        router.replace("/admin/login");
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
          router.replace("/admin/login");
          return;
        }

        setUser(userData);
        
        // Kiểm tra role ADMIN
        const hasAdminRole = userData.roles?.some(
          (role: string) => role.toLowerCase() === "admin"
        );
        setIsAdmin(hasAdminRole);

        // Nếu không phải admin, chuyển hướng về trang login admin
        if (!hasAdminRole) {
          localStorage.removeItem("token");
          router.replace("/admin/login");
        }

      } catch (error) {
        localStorage.removeItem("token");
        router.replace("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAdmin(false);
    router.replace("/admin/login");
  };

  useEffect(() => {
    checkAdmin();
  }, [pathname]);

  return (
    <AdminContext.Provider value={{ isLoading, isAdmin, user, logout }}>
      {!isLoading && children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext); 