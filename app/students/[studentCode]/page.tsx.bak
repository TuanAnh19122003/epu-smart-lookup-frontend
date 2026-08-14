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
            <div className="min-h-screen bg-[#ffffff] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0064e0]" />
                    <p className="text-[14px] text-[#5d6c7b] font-medium tracking-tight">Đang tải hồ sơ sinh viên...</p>
                </div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-[#ffffff] p-8 rounded-4xl border border-[#dee3e9] text-center space-y-4 shadow-[rgba(20,22,26,0.3)_0px_1px_4px_0px]">
                    <AlertCircle className="w-10 h-10 text-[#e41e3f] mx-auto" />
                    <h2 className="text-[16px] font-bold text-[#1c1e21] tracking-tight">{error || "Không tìm thấy dữ liệu"}</h2>
                    <button
                        onClick={() => router.back()}
                        className="px-7.5 py-3.5 bg-[#000000] text-[#ffffff] rounded-[100px] text-[14px] font-bold tracking-[-0.14px] hover:bg-[#444950] transition-colors shadow-sm"
                    >
                        Quay lại tìm kiếm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#ffffff] p-4 sm:p-8 flex flex-col justify-between font-sans selection:bg-[#0064e0] selection:text-[#ffffff]">
            <div className="max-w-3xl w-full mx-auto space-y-6 flex-1 flex flex-col justify-center">

                {/* Nút quay lại */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-[14px] font-bold text-[#444950] hover:text-[#0064e0] transition-colors w-fit group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Quay lại tìm kiếm
                </button>

                {/* Card Profile Tổng thể */}
                <div className="bg-[#ffffff] rounded-4xl border border-[#dee3e9] overflow-hidden shadow-[rgba(20,22,26,0.3)_0px_1px_4px_0px]">

                    {/* Header Banner */}
                    <div className="h-32 bg-[#0a1317] relative px-8 flex items-end border-b border-[#dee3e9]">
                        <div className="absolute inset-0 bg-linear-to-r from-[#0064e0]/20 via-[#0091ff]/10 to-transparent pointer-events-none" />
                        <div className="absolute right-6 top-6 bg-[#0a1317]/80 backdrop-blur-md px-4 py-1.5 rounded-[100px] text-[#ffffff] text-[12px] font-bold flex items-center gap-2 border border-[#ffffff]/10 shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-[#0091ff]" /> Hệ thống EPU
                        </div>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="px-8 pb-8 pt-0 relative">

                        {/* Thông tin định danh & Avatar */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 mb-8">
                            <div className="flex items-end gap-5">
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-[#ffffff] bg-[#0064e0] shadow-lg shrink-0 flex items-center justify-center text-[#ffffff] text-2xl font-bold">
                                    {!student.avatar_url || imgError ? (
                                        getInitials(student.full_name)
                                    ) : (
                                        <Image
                                            src={student.avatar_url}
                                            alt={student.full_name}
                                            fill
                                            sizes="(max-width: 640px) 96px, 112px"
                                            className="object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    )}
                                </div>
                                <div className="mb-1">
                                    <h1 className="text-[28px] sm:text-[36px] font-medium text-[#1c1e21] tracking-tight leading-tight" style={{ fontFeatureSettings: '"ss01", "ss02"' }}>
                                        {student.full_name}
                                    </h1>
                                    <p className="text-[16px] text-[#0064e0] font-bold font-mono tracking-wide mt-1">{student.student_code}</p>
                                </div>
                            </div>

                            {student.status && (
                                <div className="self-start sm:self-auto">
                                    <span className={`px-4 py-1.5 rounded-[100px] text-[12px] font-bold border shadow-xs ${student.status.toLowerCase() === 'graduated'
                                            ? 'bg-[#31a24c]/10 text-[#31a24c] border-[#31a24c]/30'
                                            : 'bg-[#0064e0]/10 text-[#0064e0] border-[#0064e0]/35'
                                        }`}>
                                        {student.status}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Các ô thông tin chi tiết */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#dee3e9]">
                            <div className="flex items-center gap-4 p-4 bg-[#f1f4f7] rounded-2xl border border-[#dee3e9]">
                                <div className="w-10 h-10 rounded-xl bg-[#ffffff] flex items-center justify-center text-[#0064e0] shadow-xs shrink-0">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[#5d6c7b] text-[12px] font-bold uppercase tracking-wider">Lớp học</p>
                                    <p className="font-bold text-[16px] text-[#1c1e21] tracking-[-0.16px] mt-0.5">{student.class_name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-[#f1f4f7] rounded-2xl border border-[#dee3e9]">
                                <div className="w-10 h-10 rounded-xl bg-[#ffffff] flex items-center justify-center text-[#0064e0] shadow-xs shrink-0">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[#5d6c7b] text-[12px] font-bold uppercase tracking-wider">Chuyên ngành</p>
                                    <p className="font-bold text-[16px] text-[#1c1e21] tracking-[-0.16px] mt-0.5">{student.major_name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-[#f1f4f7] rounded-2xl border border-[#dee3e9]">
                                <div className="w-10 h-10 rounded-xl bg-[#ffffff] flex items-center justify-center text-[#0064e0] shadow-xs shrink-0">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[#5d6c7b] text-[12px] font-bold uppercase tracking-wider">Khoa</p>
                                    <p className="font-bold text-[16px] text-[#1c1e21] tracking-[-0.16px] mt-0.5">{student.faculty_name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-[#f1f4f7] rounded-2xl border border-[#dee3e9]">
                                <div className="w-10 h-10 rounded-xl bg-[#ffffff] flex items-center justify-center text-[#0064e0] shadow-xs shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[#5d6c7b] text-[12px] font-bold uppercase tracking-wider">Niên khóa / Ngày sinh</p>
                                    <p className="font-bold text-[16px] text-[#1c1e21] tracking-[-0.16px] mt-0.5">
                                        {student.academic_year || student.date_of_birth || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <footer className="mt-8 text-center text-[12px] text-[#5d6c7b] font-medium">
                © {new Date().getFullYear()} EPU Smart Lookup. All rights reserved.
            </footer>
        </main>
    );
}