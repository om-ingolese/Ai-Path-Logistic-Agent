import axios from "axios";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

// GET 请求示例
export const getUser = async (id: number): Promise<User> => {
  const response = await axios.get<User>(`https://api.example.com/api/users/${id}`);
  return response.data;
};

// POST 请求示例
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await axios.post<User>("https://api.example.com/api/users", data);
  return response.data;
};

// supabase 请求示例
// export const getUserById = async (id: number): Promise<User | null> => {
//   const { data, error } = await supabase
//     .from("users")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (error) return null;
//   return data as User;
// };
