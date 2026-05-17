const BASE_URL = "/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async login(credentials: any) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login gagal");
    }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    // Add uid for compatibility
    if (data.user) data.user.uid = data.user.id;
    return data;
  },

  async register(data: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Registration failed");
    const result = await res.json();
    if (result) result.uid = result.id;
    return result;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Unauthorized");
    const data = await res.json();
    if (data) data.uid = data.id;
    return data;
  },

  async getProducts() {
    const res = await fetch(`${BASE_URL}/products`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  async createProduct(data: any) {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  async deleteProduct(id: string) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
  },

  async adjustStock(data: any) {
    const res = await fetch(`${BASE_URL}/stocks/adjust`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to adjust stock");
    return res.json();
  },

  async transferStock(data: any) {
    const res = await fetch(`${BASE_URL}/stocks/transfer`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to transfer stock");
    }
    return res.json();
  },

  async bulkVouchers(data: any) {
    const res = await fetch(`${BASE_URL}/voucher-sns/bulk`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save vouchers");
    return res.json();
  },

  async getBranches() {
    const res = await fetch(`${BASE_URL}/branches`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch branches");
    return res.json();
  },

  async createSale(data: any) {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create sale");
    return res.json();
  },

  async getSales(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/sales?${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch sales");
    return res.json();
  },

  async getCommissions(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/commissions?${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch commissions");
    return res.json();
  },

  async getShifts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/shifts?${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch shifts");
    return res.json();
  },

  async openShift(data: any) {
    const res = await fetch(`${BASE_URL}/shifts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to open shift");
    return res.json();
  },

  async updateShift(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/shifts/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update shift");
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    return data.map((u: any) => ({ ...u, uid: u.id }));
  },

  async updateUser(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update user");
    const result = await res.json();
    if (result) result.uid = result.id;
    return result;
  },

  async deleteUser(id: string) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete user");
    return res.json();
  },

  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },
  
  async refundSale(id: string) {
    const res = await fetch(`${BASE_URL}/sales/${id}/refund`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to refund sale");
    }
    return res.json();
  },

  async withdrawCommission(branchId: string) {
    const res = await fetch(`${BASE_URL}/commissions/withdraw`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ branchId }),
    });
    if (!res.ok) throw new Error("Failed to withdraw commissions");
    return res.json();
  },

  async getCommissionSummary(branchId?: string) {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    const res = await fetch(`${BASE_URL}/commissions/summary?${params.toString()}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch commission summary");
    return res.json();
  },

  async cleanupAdjustments() {
    const res = await fetch(`${BASE_URL}/adjustments/cleanup`, {
        method: "POST",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to cleanup adjustments");
    return res.json();
  }
};
