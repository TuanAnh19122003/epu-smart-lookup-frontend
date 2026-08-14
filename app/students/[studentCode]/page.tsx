"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Meilisearch } from "meilisearch";
import { Loader2, AlertCircle, ArrowLeft, ShieldCheck, Calendar, BookOpen, Layers, UserCheck } from "lucide-react";
import Image from "next/image";

const API_CONFIG_URL = process.env.NEXT_PUBLIC_API_CONFIG_URL || "tu_lam_ban_dau_config.json";
const DEFAULT_INDEX_NAME = process.env.NEXT_PUBLIC_DEFAULT_INDEX_NAME || "epu_smart_lookup";

interface Student {
    id: string;
    student_code: string;
    full_name: string;
    class_name: string;
    major_name?: string;
    faculty_name?: string;
    avatar_url?: string;
    date_of_birth?: string;
    academic_year?: string;
    status?: string;
}

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const studentCode = params?.studentCode as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        async function fetchStudentDetail() {
            try {
                setLoading(true);
                const res = await fetch(API_CONFIG_URL);
                if (!res.ok) throw new Error("Không thể tải cấu hình API");

                const data = await res.json();
                const msClient = new Meilisearch({
                    host: data.host,
                    apiKey: data.searchKey,
                });
                const indexName = data.indexName || DEFAULT_INDEX_NAME;
                const index = msClient.index(indexName);

                let doc: any = null;

                try {
                    const searchRes = await index.search("", {
                        filter: `student_code = '${studentCode}'`,
                        limit: 1,
                    });

                    if (searchRes.hits.length > 0) {
                        doc = searchRes.hits[0];
                    }
                } catch (err) {
                    console.error("Lỗi khi filter theo student_code:", err);
                }

                if (!doc) {
                    const fallbackRes = await index.search(studentCode, { limit: 1 });
                    if (fallbackRes.hits.length > 0 && fallbackRes.hits[0].student_code === studentCode) {
                        doc = fallbackRes.hits[0];
                    }
                }

                if (!doc) {
                    setError(`Không tìm thấy thông tin sinh viên với mã: ${studentCode}`);
                } else {
                    setStudent(doc as Student);
                }
            } catch (err) {
                console.error(err);
                setError("Đã xảy ra lỗi khi tải thông tin chi tiết.");
            } finally {
                setLoading(false);
            }
        }

        if (studentCode) {
            fetchStudentDetail();
        }
    }, [studentCode]);

    const getInitials = (fullName?: string) => {
        if (!fullName) return "SV";
        const words = fullName.trim().split(/\s+/);
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return `${words[words.length - 1].charAt(0)}${words[0].charAt(0)}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-xs text-slate-500 font-medium">Đang tải hồ sơ sinh viên...</p>
                </div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center space-y-4">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{error || "Không tìm thấy dữ liệu"}</h2>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Quay lại tìm kiếm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
            <div className="max-w-2xl w-full mx-auto space-y-4 flex-1 flex flex-col justify-center">

                {/* Nút quay lại */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại tìm kiếm
                </button>

                {/* Card Profile Tổng thể */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">

                    {/* Header Banner */}
                    <div className="h-28 bg-slate-900 dark:bg-slate-950 relative px-6 flex items-end border-b border-slate-100 dark:border-slate-800/80">
                        <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 via-indigo-600/10 to-transparent pointer-events-none" />
                        <div className="absolute right-4 top-4 bg-slate-800/80 dark:bg-slate-800/60 backdrop-blur-md px-3 py-1 rounded-full text-slate-200 text-[11px] font-medium flex items-center gap-1.5 border border-slate-700/50 shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Hệ thống EPU
                        </div>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="px-6 pb-6 pt-0 relative">

                        {/* Thông tin định danh & Avatar */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-6">
                            <div className="flex items-end gap-4">
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 bg-blue-600 shadow-md shrink-0 flex items-center justify-center text-white text-xl font-bold">
                                    {!student.avatar_url || imgError ? (
                                        getInitials(student.full_name)
                                    ) : (
                                        <Image
                                            src={student.avatar_url}
                                            alt={student.full_name}
                                            fill
                                            sizes="(max-width: 640px) 80px, 96px"
                                            className="object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    )}
                                </div>
                                <div className="mb-1">
                                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{student.full_name}</h1>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold tracking-wide mt-0.5">{student.student_code}</p>
                                </div>
                            </div>

                            {student.status && (
                                <div className="self-start sm:self-auto">
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border shadow-xs ${student.status.toLowerCase() === 'graduated'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                        }`}>
                                        {student.status}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Các ô thông tin chi tiết */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-medium">Lớp học</p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{student.class_name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-medium">Chuyên ngành</p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{student.major_name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-medium">Khoa</p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{student.faculty_name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-medium">Niên khóa / Ngày sinh</p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                                        {student.academic_year || student.date_of_birth || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <footer className="mt-6 text-center text-[11px] text-slate-400 font-medium">
                © {new Date().getFullYear()} EPU Smart Lookup. All rights reserved.
            </footer>
        </main>
    );
}