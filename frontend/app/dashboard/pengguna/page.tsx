"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import api from "@/lib/axios";
import type { ApiResponse, User, Role } from "@/lib/types";
import DataTable, { type Column } from "@/components/DataTable";
import FormModal from "@/components/FormModal";
import { FiPlus } from "react-icons/fi";



export default function PenggunaPage() {
  const [data, setData] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    alamat: "", 
    no_hp: "", 
    id_role: "" 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get<ApiResponse<User[]>>("/pengguna");
      setData(res.data);
    } catch (error) { 
      console.error("Gagal mengambil data", error);
    } finally { 
      setLoading(false); 
    }
  };

  const fetchRoles = async () => {
    try {
      const { data: res } = await api.get<ApiResponse<Role[]>>("/roles");
      setRoles(res.data);
    } catch (error) {
      console.error("Gagal mengambil data role", error);
    }
  };

  useEffect(() => { 
    fetchData();
    fetchRoles();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ username: "", email: "", password: "", alamat: "", no_hp: "", id_role: "" });
    setModalOpen(true);
  };

  const openEdit = (item: User) => {
    setEditItem(item);
    setForm({ 
      username: item.username, 
      email: item.email, 
      password: "", 
      alamat: item.alamat ?? "", 
      no_hp: item.no_hp, 
      id_role: String(item.id_role) 
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { ...form, id_role: Number(form.id_role) };
    
    if (!payload.password) delete payload.password;

    try {
      if (editItem) {
        await api.put(`/pengguna/${editItem.id}`, payload);
        alert("Pengguna berhasil diperbarui.");
      } else {
        await api.post("/pengguna", payload);
        alert("Pengguna berhasil ditambahkan.");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Gagal menyimpan data pengguna. Silakan periksa kembali input Anda.";
      alert(`Error: ${msg}`);
      console.error("Gagal menyimpan data", error);
    }
  };

  const handleDelete = async (item: User) => {
    if (!confirm(`Hapus pengguna "${item.username}"?\n\nCatatan: seluruh data peminjaman milik pengguna ini juga akan ikut terhapus.`)) return;
    try {
      await api.delete(`/pengguna/${item.id}`);
      alert(`Pengguna "${item.username}" berhasil dihapus.`);
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Gagal menghapus pengguna. Silakan coba lagi.";
      alert(`Error: ${msg}`);
      console.error("Gagal menghapus data", error);
    }
  };

  const columns: Column<User>[] = [
    { key: "username", header: "Username" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (r) => (
      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary">
        {r.role?.nama_role ?? "-"}
      </span>
    )},
    { key: "no_hp", header: "No. HP" },
  ];

  const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Pengguna</h1>
          <p className="mt-1 text-sm text-gray-500">Manajemen akun pengguna sistem</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-md shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-lg">
          <FiPlus className="text-lg" /> Tambah Pengguna
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <DataTable 
          columns={columns} 
          data={data} 
          isLoading={loading} 
          showActions 
          onEdit={(row) => openEdit(row as unknown as User)} 
          onDelete={(row) => handleDelete(row as unknown as User)} 
        />
      </div>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Pengguna" : "Tambah Pengguna"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
              <input type="text" value={form.username} onChange={e => setForm(p => ({...p, username: e.target.value}))} required className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password {editItem && "(kosongkan jika tidak diubah)"}</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} {...(!editItem ? {required: true, minLength: 8} : {})} className={inputCls} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">No. HP</label>
              <input type="text" value={form.no_hp} onChange={e => setForm(p => ({...p, no_hp: e.target.value}))} required className={inputCls} />
            </div>
            
            {/* --- DROPDOWN ROLE --- */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={form.id_role}
                onChange={e => setForm(p => ({...p, id_role: e.target.value}))}
                required
                className={`${inputCls} bg-white cursor-pointer`}
              >
                <option value="" disabled>Pilih Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nama_role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Alamat</label>
            <input type="text" value={form.alamat} onChange={e => setForm(p => ({...p, alamat: e.target.value}))} required className={inputCls} />
          </div>
          
          <button type="submit" className="mt-2 w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-primary shadow-md transition-all hover:bg-accent-hover hover:shadow-lg">
            {editItem ? "Perbarui" : "Simpan"}
          </button>
        </form>
      </FormModal>
    </div>
  );
}