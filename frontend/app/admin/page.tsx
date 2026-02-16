'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Search, MoreHorizontal, Filter, Download } from 'lucide-react';

interface Lead {
    id: number;
    role: string | null;
    years_experience: number | null;
    country: string | null;
    leads_teams: boolean | null;
    interest_level: string | null;
    score: number;
    qualification_status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await axios.get('http://localhost:8000/leads');
                setLeads(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    return (
        <div className="min-h-screen bg-gpt-dark text-gpt-text font-sans p-8">

            {/* Simple Header */}
            <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Lead Database</h1>
                    <p className="text-gpt-subtext text-sm">Manage and review incoming potential fellows.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-md text-sm hover:bg-white/5 transition-colors text-gpt-subtext">
                        <Filter size={14} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-md text-sm hover:bg-white/5 transition-colors text-gpt-subtext">
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            {/* Simple Table */}
            <div className="max-w-6xl mx-auto border border-white/10 rounded-lg overflow-hidden bg-gpt-sidebar">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#2A2A2A] border-b border-white/10 text-gray-400">
                        <tr>
                            <th className="p-4 font-medium">ID</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Score</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Experience</th>
                            <th className="p-4 font-medium">Country</th>
                            <th className="p-4 font-medium">Leadership</th>
                            <th className="p-4 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-gray-500">#{lead.id}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${lead.qualification_status === 'Qualified' ? 'bg-green-900/30 text-green-400' :
                                            lead.qualification_status === 'Potential' ? 'bg-yellow-900/30 text-yellow-400' :
                                                'bg-red-900/30 text-red-400'
                                        }`}>
                                        {lead.qualification_status}
                                    </span>
                                </td>
                                <td className="p-4 text-white font-medium">{lead.score}</td>
                                <td className="p-4 text-gray-300">{lead.role || '-'}</td>
                                <td className="p-4 text-gray-400">{lead.years_experience ? `${lead.years_experience}y` : '-'}</td>
                                <td className="p-4 text-gray-400">{lead.country || '-'}</td>
                                <td className="p-4 text-gray-400">{lead.leads_teams ? 'Yes' : 'No'}</td>
                                <td className="p-4 text-right">
                                    <button className="text-gray-500 hover:text-white">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {leads.length === 0 && !loading && (
                            <tr>
                                <td colSpan={8} className="p-10 text-center text-gray-500">
                                    <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {loading && (
                    <div className="p-20 flex justify-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
