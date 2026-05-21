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
    let res;
    try {
      res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
    } catch (e: any) {
      throw new Error("Network Error: " + e.message);
    }
    
    if (!res.ok) {
      let errTxt = "";
      try {
        errTxt = await res.text();
        const errObj = JSON.parse(errTxt);
        throw new Error(errObj.error || "Login gagal");
      } catch (e: any) {
        if (e.message.includes("Login gagal") || (errTxt && errTxt.includes("error"))) {
            throw e; // rethrow the actual parsed error
        }
        throw new Error(`Login error ${res.status}: ` + errTxt);
      }
    }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    // Add uid for compatibility
    if (data.user) data.user.uid = data.user.id;
    return data;
  },

  async loginWithGoogle(idToken: string) {
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Login Google gagal");
    }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    if (data.user) data.user.uid = data.user.id;
    return data;
  },

  async register(data: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Registration failed");
    }
    const result = await res.json();
    if (result) result.uid = result.id;
    return result;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Unauthorized: ${res.status} ${txt}`); }
    const data = await res.json();
    if (data) data.uid = data.id;
    return data;
  },

  async getProducts() {
    const res = await fetch(`${BASE_URL}/products`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch products: ${res.status} ${txt}`); }
    return res.json();
  },

  async createProduct(data: any) {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to create product: ${res.status} ${txt}`); }
    return res.json();
  },

  async deleteProduct(id: string) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to delete product: ${res.status} ${txt}`); }
    return res.json();
  },

  async adjustStock(data: any) {
    const res = await fetch(`${BASE_URL}/stocks/adjust`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to adjust stock: ${res.status} ${txt}`); }
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
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to save vouchers: ${res.status} ${txt}`); }
    return res.json();
  },

  async getBranches() {
    const res = await fetch(`${BASE_URL}/branches`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch branches: ${res.status} ${txt}`); }
    return res.json();
  },

  async createSale(data: any) {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to create sale: ${res.status} ${txt}`); }
    return res.json();
  },

  async getSales(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/transactions?${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch sales: ${res.status} ${txt}`); }
    return res.json();
  },

  async getCommissions(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/incentives?${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch commissions: ${res.status} ${txt}`); }
    return res.json();
  },

  async getShifts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/shifts?${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch shifts: ${res.status} ${txt}`); }
    return res.json();
  },

  async openShift(data: any) {
    const res = await fetch(`${BASE_URL}/shifts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to open shift: ${res.status} ${txt}`); }
    return res.json();
  },

  async updateShift(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/shifts/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to update shift: ${res.status} ${txt}`); }
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch users: ${res.status} ${txt}`); }
    const data = await res.json();
    return data.map((u: any) => ({ ...u, uid: u.id }));
  },

  async updateUser(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to update user: ${res.status} ${txt}`); }
    const result = await res.json();
    if (result) result.uid = result.id;
    return result;
  },

  async deleteUser(id: string) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to delete user: ${res.status} ${txt}`); }
    return res.json();
  },

  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },
  
  async refundSale(id: string) {
    const res = await fetch(`${BASE_URL}/transactions/${id}/refund`, {
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
    const res = await fetch(`${BASE_URL}/incentives/withdraw`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ branchId }),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to withdraw commissions: ${res.status} ${txt}`); }
    return res.json();
  },

  async getCommissionSummary(branchId?: string) {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    const res = await fetch(`${BASE_URL}/incentives/summary?${params.toString()}`, {
        headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch commission summary: ${res.status} ${txt}`); }
    return res.json();
  },

  async getAdjustments() {
    const res = await fetch(`${BASE_URL}/adjustments`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch adjustments: ${res.status} ${txt}`); }
    return res.json();
  },

  async cleanupAdjustments() {
    const res = await fetch(`${BASE_URL}/adjustments/cleanup`, {
        method: "POST",
        headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to cleanup adjustments: ${res.status} ${txt}`); }
    return res.json();
  },

  async getDailySummaries() {
    const res = await fetch(`${BASE_URL}/daily-summaries`, {
      headers: getHeaders(),
    });
    if (!res.ok) { const txt = await res.text(); throw new Error(`Failed to fetch daily summaries: ${res.status} ${txt}`); }
    return res.json();
  }
};
