import { createContext, useState, useContext, ReactNode } from "react";

interface UserContextType {
  user_id: number;
  name: string;
  email: string;
  nick_name: string;
  role: string;
  profile_pic: string;
  token: string;
  cover_photo: string;
  setUser: (user: Partial<UserContextType>) => void;
  clearUser: () => void;
}

const defaultUserState: UserContextType = {
  user_id: 0,
  name: "",
  email: "",
  nick_name: "",
  role: "",
  profile_pic: "",
  token: "",
  cover_photo: "",
  setUser: () => {},
  clearUser: () => {},
};

const UserContext = createContext<UserContextType>(defaultUserState);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserContextType>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : defaultUserState;
  });

  const setUser = (newUser: Partial<UserContextType>) => {
    const updatedUser = { ...user, ...newUser };
    setUserState(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const clearUser = () => {
    setUserState(defaultUserState);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ ...user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
