import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchDocs = async () => {
    try {
      const res = await API.get('/admin/documents');
      setDocuments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const validateDoc = async (id, status = 'validated') => {
    setActionError('');
    try {
      await API.post(`/admin/documents/${id}/validate`, { status });
      fetchDocs();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action impossible');
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="Documents">
        {loading && <div className="text-slate-600">Chargement...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {actionError && <div className="text-red-600 mb-4">{actionError}</div>}

        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Intervenant</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{d.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{d.user?.email || d.intervenant_email || 'Intervenant'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{d.type || d.label || 'Document'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 capitalize">{d.status || d.statut || 'en_attente'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 flex gap-2">
                    <button
                      onClick={() => validateDoc(d.id, 'validated')}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800"
                    >
                      <CheckCircle className="w-4 h-4" /> Valider
                    </button>
                    <button
                      onClick={() => validateDoc(d.id, 'rejected')}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4" /> Refuser
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && documents.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-500">
                    Aucun document à traiter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
